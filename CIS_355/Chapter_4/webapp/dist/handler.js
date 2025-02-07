"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (req, resp) => {
    console.log("\n");
    console.log(`---- HTTP Method: ${req.method}, URL: ${req.url}`);
    // console.log(`host: ${req.headers.host}`);
    // console.log(`accept: ${req.headers.accept}`);
    // console.log(`user-agent: ${req.headers["user-agent"]}`);
    const parsedURL = new URL(req.url ?? "", `http://${req.headers.host}`);
    console.log(`protocol: ${parsedURL.protocol}`);
    console.log(`hostname: ${parsedURL.hostname}`);
    console.log(`port: ${parsedURL.port}`);
    console.log(`pathname: ${parsedURL.pathname}`);
    parsedURL.searchParams.forEach((val, key) => {
        console.log(`Search param: ${key}: ${val}`);
    });
    resp.end("Hello World");
    return; // to prevent additional accessing of response (just getting in the habit of doing this)
};
exports.handler = handler;
/*
import {IncomingMessage, ServerResponse} from "http";
//import {readFile} from "fs";
import {readFile} from "fs/promises";
*/
/*export const handler = (req: IncomingMessage, res: ServerResponse) =>
{
    readFile("data.json", (err: Error | null, data: Buffer) =>
    {
        if(err == null)
        {
            res.end(data, () => console.log("File sent"));
        }
        else
        {
            console.log(`Error: ${err.message}`);
            res.statusCode = 500;
            res.end();
        }
    });
};*/
/*export const handler = (req: IncomingMessage, res: ServerResponse) =>
{
    const p: Promise<Buffer> = readFile("data.json");
    p.then( (data: Buffer) => res.end(data, () => console.log("File sent")));
    p.catch((err: Error) =>
    {
        console.log(`Error: ${err.message}`);
        res.statusCode = 500;
        res.end();
    });
};*/
/*export const handler = async (req: IncomingMessage, res: ServerResponse) =>
{
    try
    {
        const data: Buffer = await readFile("data.json");
        res.end(data, () => console.log("File sent");
    }
    catch(err: any)
    {
        console.log(`Error: ${err?.message ?? err}`);
        res.statusCode = 500;
        res.end();
    }
};*/ 
