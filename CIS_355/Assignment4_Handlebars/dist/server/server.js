"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3001;
app.get("/", (req, res) => {
    res.send("Hello");
});
app.get("/test", (req, res) => {
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
app.get("/user/:id/:data", (req, res) => {
    let userId = req.params.id;
    let data = req.params.data;
});
app.use(express_1.default.static("node_modules/bootstrap/dist"));
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
app.listen(port, () => {
    console.log(`Server is running at http://localhost/${port}`);
});
