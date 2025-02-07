"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const http_proxy_1 = __importDefault(require("http-proxy"));
const express_handlebars_1 = require("express-handlebars");
const helpers = __importStar(require("./template_helpers"));
const expressApp = (0, express_1.default)();
const port = 3001;
const proxy = http_proxy_1.default.createProxy({
    target: "http://localhost:5100", ws: true
});
expressApp.engine("handlebars", (0, express_handlebars_1.engine)());
expressApp.set("view engine", "handlebars");
expressApp.set("views", "templates/server");
expressApp.get("/dynamic/:file", (req, resp) => {
    resp.render(`${req.params.file}.handlebars`, {
        message: "Hello template", req,
        helpers: { ...helpers }
    });
});
expressApp.use(express_1.default.static("static"));
expressApp.use(express_1.default.static("node_modules/bootstrap/dist"));
//expressApp.use((req, resp) => proxy.web(req, resp));
expressApp.get("/", (req, res) => {
    res.send("Hello");
});
expressApp.get("/test", (req, res) => {
    OpenFile().then((value) => {
        if (value == null) {
            res.status(404).send("Unable to find file");
            console.log("File was null!");
        }
        else {
            console.log(value);
            res.send(value);
        }
    });
});
async function OpenFile() {
    const filePath = path_1.default.join(__dirname, "..", "sample.txt");
    let data = await fs_1.promises.readFile(filePath, "utf-8");
    return data;
}
expressApp.get("/user/:id/:data", (req, res) => {
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
expressApp.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
