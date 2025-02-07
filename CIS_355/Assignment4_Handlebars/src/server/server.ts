import express, {Express, Request, Response} from "express";
import {promises} from "fs";
import path from "path";
import httpProxy from "http-proxy";
import {engine} from "express-handlebars";
import * as helpers from "./template_helpers"


const app: Express = express();
const port = 3001;

const proxy = httpProxy.createProxy(
    {
        target: "http://localhost:5100", ws: true
    }
);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

/*app.get("/", (req, res) => 
{
    res.render('home');
});*/

/*app.get("/dynamic/:file", (req, resp) =>
{
    resp.render(`${req.params.file}.handlebars`,
        {
            message: "Hello template", req,
            helpers: {...helpers}
        });
});*/

//app.use((req, resp) => proxy.web(req, resp));

app.use(express.static("static"));
app.use(express.static("node_modules/bootstrap/dist"));

// so that we can process form data
app.use(express.urlencoded({ extended: true}));

// blog post format:
// Title
// Body
app.get("/", async (req, resp) =>
{
    var allPostData = await CreateAllPostData();

    console.log("Found the following post data: " + allPostData);

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
async function CreateAllPostData()
{
    try
    {
        const parsed = await LoadAndParseAllPostData();
        let finalData = [];
        
        for(let i = 0; i < parsed.length; i += 2) 
        {
            if(parsed.length <= (i+1)) // pair not found, break
                break;

            const title = parsed[i];
            const content = parsed[i+1];
            // console.log(`${i}: ${title}: ${content}`);

            const index = i / 2; // for whatever reason, this works. Probably a value of 1.5 automatically becomes an index value of 1
            finalData[index] = 
            {
                title: title,
                content: content
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
        resp.status(404).send("404: Unable to find blog post: " + postId);
        return;
    }

    resp.render("viewSingle.handlebars",
        {
            title: allParsed[index],
            content: allParsed[index+1]                    
        });
});



app.get("/add", (req, resp) =>
{
    resp.render("addPost.handlebars");
});



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

    resp.status(200).send("Post successfully added");
});


app.listen(port, () => 
    {
        console.log(`Server is running at http://localhost:${port}`);
    });


/*
expressApp.get("/test", (req: Request, res: Response) =>
{
    OpenFile().then((value) =>
    {
        if(value == null)
        {
            res.status(404).send("Unable to find file");
            console.log("File was null!");
        }
        else
        {        
            console.log(value)
            res.send(value);
        }
    });
});



async function OpenFile() : Promise<string | null>
{
    const filePath = path.join(__dirname, "..", "sample.txt");
    
    let data = await promises.readFile(filePath, "utf-8");
    return data;
}



expressApp.get("/user/:id/:data", (req: Request, res: Response) =>
{
    let userId = req.params.id;
    let data = req.params.data;
});


/*app.get("/read-file", (req: Request, res: Response) =>
{
    const filePath = path.join(__dirname, "..", "sample.txt");

    fs.readFile(filePath, "utf-8", (err, data) =>
    {
        if(err)
        {
            res.status(500).send("Error reading file");
        }
        else
        {
            res.send(data);
        }
    });
});*/




