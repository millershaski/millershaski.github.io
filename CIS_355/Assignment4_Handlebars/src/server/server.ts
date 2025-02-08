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
        
        for(let i = 0; i < parsed.length; i++) 
        {
            if(parsed[i].length <= 1)
                continue;
            console.log(parsed[i]);
            try
            {
                const parsedLine = JSON.parse(parsed[i]);
                // console.log(`${i}: ${title}: ${content}`);

                finalData[i] = parsedLine;
            }
            catch
            {
                // parse probably failed
            }
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

    const index = parseInt(postId);
    if(allParsed.length <= index)
    {
        resp.render("viewSingle404.handlebars");
        return;
    }
 
    try
    {
        const parsedData = JSON.parse(allParsed[index]);
        resp.render("viewSingle.handlebars",
        {
            title: parsedData.title,
            content: parsedData.content,
            date: parsedData.date                  
        });
    }
    catch
    {
        resp.render("viewSingle404.handlebars"); // parse failed
    }
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
    // console.log(req.body.title + " : " + req.body.content);

    const filePath = GetPostDataFilePath();

    const newObject = 
    {
        title: newTitle,
        content: newContent,
        date: (new Date().toLocaleString())
    };

    await promises.appendFile(filePath, JSON.stringify(newObject) + "\n");
    //const newData = newTitle + "\n" + newContent + "\n" + (new Date().toLocaleString()) + "\n"; // end with a newline so that the next post starts on a new-line
    // await promises.appendFile(filePath, newData);

    resp.render("postSuccess.handlebars");
});


app.listen(port, () => 
{
    console.log(`Server is running at http://localhost:${port}`);
});




