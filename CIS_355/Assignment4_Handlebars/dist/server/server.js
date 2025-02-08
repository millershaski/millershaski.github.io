"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const express_handlebars_1 = require("express-handlebars");
const app = (0, express_1.default)();
const port = 3001;
app.engine('handlebars', (0, express_handlebars_1.engine)());
app.set('view engine', 'handlebars');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static("static"));
app.use(express_1.default.static("node_modules/bootstrap/dist"));
// so that we can process form data
app.use(express_1.default.urlencoded({ extended: true }));
// view all posts
app.get("/", async (req, resp) => {
    var allPostData = await GetAllPostData();
    resp.render("viewAll.handlebars", {
        post: allPostData
    });
});
/* Data Format:
    var data =
    [
        {
            title: "Name1",
            content: "This is content1",
            date: date
        },
        {
            title: "Name2",
            content: "This is content2",
            date: date
        }
    ];
*/
async function GetAllPostData() {
    try {
        const allSplitLines = await LoadAndSplitAllPostData();
        let allFinalParsedData = [];
        for (let i = 0; i < allSplitLines.length; i++) {
            if (allSplitLines[i].length <= 1) // the parse will fail, so just skip (this is probably just a newline character)
                continue;
            try {
                const finalData = JSON.parse(allSplitLines[i]);
                finalData.index = i;
                allFinalParsedData[i] = finalData;
            }
            catch {
                // parse probably failed
            }
        }
        return allFinalParsedData;
    }
    catch (error) {
        console.error("An error occurred in CreateAllPostData: " + error);
        return {};
    }
}
// Loads post data from postData/postData.data
// Then returns an array using fileContents.split("\n")
async function LoadAndSplitAllPostData() {
    const filePath = GetPostDataFilePath();
    let fileContents = (await fs_1.promises.readFile(filePath)).toString();
    let allSplitLines = fileContents.split("\n"); // data is in json format, separated by newlines
    for (let i = allSplitLines.length - 1; i >= 0; i--) // remove any empty (or short) lines
     {
        if (allSplitLines[i].length <= 2)
            allSplitLines.splice(i, 1);
    }
    return allSplitLines;
}
function GetPostDataFilePath() {
    return path_1.default.join(__dirname, "..", "postData/postData.data");
}
// view single post
app.get("/post/:id", async (req, resp) => {
    let postId = req.params.id;
    const allSplitLines = await LoadAndSplitAllPostData();
    const index = parseInt(postId);
    if (allSplitLines.length <= index) // out-of-bounds
     {
        resp.render("viewSingle404.handlebars");
        return;
    }
    try {
        const parsedData = JSON.parse(allSplitLines[index]);
        console.log(index + " : " + allSplitLines.length);
        resp.render("viewSingle.handlebars", {
            title: parsedData.title,
            content: parsedData.content,
            date: parsedData.date,
            // the following is used for populating navigation
            hasPrevious: (index > 0),
            previousIndex: index - 1,
            hasNext: (allSplitLines.length > (index + 1)),
            nextIndex: index + 1
        });
    }
    catch {
        resp.render("viewSingle404.handlebars"); // parse failed
    }
});
// display form for adding new post
app.get("/add", (req, resp) => {
    resp.render("addPost.handlebars");
});
// handle the POST of adding a new blog post
app.post("/add", async (req, resp) => {
    const newTitle = req.body.title;
    const newContent = req.body.content;
    if (newTitle == null || newContent == null || newTitle.length == 0 || newContent.length == 0) {
        resp.status(500).send("Error: title or content was empty. Failed to save");
        return;
    }
    // console.log(req.body.title + " : " + req.body.content);
    const filePath = GetPostDataFilePath();
    const newObject = {
        title: newTitle,
        content: newContent,
        date: (new Date().toLocaleString())
    };
    await fs_1.promises.appendFile(filePath, JSON.stringify(newObject) + "\n");
    //const newData = newTitle + "\n" + newContent + "\n" + (new Date().toLocaleString()) + "\n"; // end with a newline so that the next post starts on a new-line
    // await promises.appendFile(filePath, newData);
    resp.render("postSuccess.handlebars");
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
