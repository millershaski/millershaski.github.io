import { ReadFileHandler } from "./handler";
import express, {Express, Request, Response} from "express";



const port = 5000;

const server: Express = express();

server.get("", (request:Request, response:Response) =>
{
    response.send("This is the default response (nothing implemented on this page)");
});

server.get("/readFile", ReadFileHandler);

server.listen(port, () => console.log(`[Server]: Server is running at http://localhost:${port}`));
