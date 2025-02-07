"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handler_1 = require("./handler");
const express_1 = __importDefault(require("express"));
const port = 5000;
const server = (0, express_1.default)();
server.get("", (request, response) => {
    response.send("This is the default response (nothing implemented on this page)");
});
server.get("/readFile", handler_1.ReadFileHandler);
server.listen(port, () => console.log(`[Server]: Server is running at http://localhost:${port}`));
