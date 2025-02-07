import express, {Express, Request, Response} from "express";
import {promises} from "fs";
import path from "path";
import httpProxy from "http-proxy";
import {engine} from "express-handlebars";
import * as helpers from "./template_helpers"


const expressApp: Express = express();
const port = 3001;

const proxy = httpProxy.createProxy(
    {
        target: "http://localhost:5100", ws: true
    }
);

expressApp.engine("handlebars", engine());
expressApp.set("view engine", "handlebars");
expressApp.set("views", "templates/server");

expressApp.get("/dynamic/:file", (req, resp) =>
{
    resp.render(`${req.params.file}.handlebars`,
        {
            message: "Hello template", req,
            helpers: {...helpers}
        });
});

expressApp.use(express.static("static"));
expressApp.use(express.static("node_modules/bootstrap/dist"));
//expressApp.use((req, resp) => proxy.web(req, resp));

expressApp.get("/", (req: Request, res: Response) => 
{
    res.send("Hello");
});

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
expressApp.listen(port, () => 
{
    console.log(`Server is running at http://localhost:${port}`);
});




