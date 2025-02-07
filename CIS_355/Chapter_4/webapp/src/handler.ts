import { IncomingMessage, ServerResponse } from "http";
import { TLSSocket } from "tls";
import { URL } from "url";

export const isHttps = (req: IncomingMessage) =>
{
    return (req.socket instanceof TLSSocket) && req.socket.encrypted;
}

export const redirectionHandler = (req: IncomingMessage, resp: ServerResponse) =>
{
    resp.writeHead(302, {"Location": "https://localhost:5500"});
    resp.end();
};

export const notFoundHandler = (req: IncomingMessage, resp: ServerResponse) =>
{
    resp.writeHead(404, "Not Found");
    resp.end();
};


export const newUrlHandler = (req: IncomingMessage, resp: ServerResponse) =>
{
    resp.writeHead(200, "OK");
    resp.write("Hello, New URL");
    resp.end();
}

export const defaultHandler = (req: IncomingMessage, resp: ServerResponse) =>
{
    resp.writeHead(200, "OK");
    const protocol = isHttps(req) ? "https" : "http";
    const parsedURL = new URL(req.url ?? "", `${protocol}://${req.headers.host}`);

    if(parsedURL.searchParams.has("keyword") == false)
        resp.write(`Hello, ${protocol.toUpperCase()}`);
    else
        resp.write(`Hello, ${parsedURL.searchParams.get("keyword")}`);

    resp.end();
}

/*import{IncomingMessage, ServerResponse} from "http";

export const handler = async (req: IncomingMessage, resp: ServerResponse) =>
{
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

    parsedURL.searchParams.forEach((val, key) =>
    {
        console.log(`Search param: ${key}: ${val}`)
    });

    resp.end("Hello World");
    return; // to prevent additional accessing of response (just getting in the habit of doing this)
};*/



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