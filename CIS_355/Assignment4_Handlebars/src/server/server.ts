import express, {Express, Request, Response} from "express";
import {promises} from "fs";
import path from "path";
import {engine} from "express-handlebars";


const app: Express = express();
const port = 3001;

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static("static"));
app.use(express.static("node_modules/bootstrap/dist"));

// so that we can process form data
app.use(express.urlencoded({ extended: true}));

// view all posts
app.get("/", async (req, resp) =>
{
    var allPostData = await GetAllPostData();    
    resp.render("viewAll.handlebars",
    {
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
async function GetAllPostData()
{
    try
    {
        const parsed = await LoadAndParseAllPostData();
        let finalData = [];
        
        for(let i = 0; i < parsed.length; i += 3) 
        {
            if(parsed.length <= (i+2)) // pair not found, break
                break;

            const title = parsed[i];
            const content = parsed[i+1];
            const date = parsed[i + 2];
            // console.log(`${i}: ${title}: ${content}`);

            const index = i / 3; // for whatever reason, this works. Probably a value of 1.5 automatically becomes an index value of 1
            finalData[index] = 
            {
                title: title,
                content: content,
                date: date
            };
        }

        return finalData;
    }
    catch(error)
    {
        console.error("An error occurred in CreateAllPostData: " + error);
        return {};
    }
}



// Loads post data from postData/postData.data
// Then returns an array using fileContents.split("\n")
async function LoadAndParseAllPostData()
{
    const filePath = GetPostDataFilePath();
    let fileContents = (await promises.readFile(filePath)).toString();

    return fileContents.split("\n");  // data is in pairs of title, content. Separated by newlines
}



function GetPostDataFilePath()
{
    return path.join(__dirname, "..", "postData/postData.data");
}



// view single post
app.get("/post/:id", async (req, resp) => 
{
    let postId = req.params.id;

    const allParsed = await LoadAndParseAllPostData();

    // a post id of 2 would correspond with:
    // title: id*2
    // content (id*2) + 1
    const index = parseInt(postId)*2;
    if(allParsed.length <= (index +1))
    {
        resp.render("viewSingle404.handlebars");
        return;
    }

    resp.render("viewSingle.handlebars",
        {
            title: allParsed[index],
            content: allParsed[index+1]                    
        });
});



// display form for adding new post
app.get("/add", (req, resp) =>
{
    resp.render("addPost.handlebars");
});



// handle the POST of adding a new blog post
app.post("/add", async (req, resp) =>
{
    const newTitle = req.body.title;
    const newContent = req.body.content;

    if(newTitle == null || newContent == null || newTitle.length == 0 || newContent.length == 0)
    {
        resp.status(500).send("Error: title or content was empty. Failed to save");
        return;
    }
    console.log(req.body.title + " : " + req.body.content);

    const filePath = GetPostDataFilePath();

    const newData = newTitle + "\n" + newContent + "\n" + (new Date().toLocaleString()) + "\n"; // end with a newline so that the next post starts on a new-line
    await promises.appendFile(filePath, newData);

    resp.render("postSuccess.handlebars");
});


app.listen(port, () => 
{
    console.log(`Server is running at http://localhost:${port}`);
});




