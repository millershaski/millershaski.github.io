"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const handler_1 = require("./handler");
const port = 5000;
const server = (0, http_1.createServer)(handler_1.handler);
server.listen(port, () => {
    console.log(`(Event) Server listening on port ${port}`);
});
/*import {createServer} from "http";
import {handler} from "./handler";

const port = 5000;

const server = createServer();
server.on("request", handler);

server.listen(port);
server.on("listening", () =>
{
    console.log(`Server listening on port ${port}`);
});*/ 
