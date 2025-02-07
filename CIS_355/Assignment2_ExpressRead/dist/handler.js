"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadFileHandler = void 0;
const fs_1 = __importDefault(require("fs"));
// sends contents of the provided file to response. Sends errors if file isn't found or provided
const ReadFileHandler = (request, response) => {
    let fileName = GetFileName(request);
    if (fileName.length == 0) // no filename passed
     {
        console.log("No file name was passed as a query parameter");
        response.statusCode = 400; // this should technically be the client's fault, because they didn't pass the parameter?
        response.send("No file name was passed as a query parameter");
        return; // returning to prevent the response from being used later (just getting into the habit of doing this)
    }
    else {
        fs_1.default.readFile(fileName, (error, data) => {
            if (error != null) // common error would be that file is not found
             {
                if (error.message.startsWith("ENOENT") == true) // error.code doesn't work, and I wasn't sure of the best fix. This works on my machine, but possibly not on other machines
                 {
                    response.statusCode = 404;
                    response.send(`Unable to find file with name: ${fileName}`);
                }
                else {
                    response.statusCode = 500;
                    response.send(`A server error occurred: ${error.message}`);
                }
            }
            else {
                response.statusCode = 200;
                let stringValue = data.toString();
                response.send(stringValue); // I had a heck of time with issues here, until I realized that I had to clear my browser cache
            }
        });
    }
};
exports.ReadFileHandler = ReadFileHandler;
// Returns the value of the query parameter "fileName" (empty string if not found)
function GetFileName(request) {
    try {
        if (request.query["filename"])
            return request.query["filename"].toString();
    }
    catch {
        // maybe the cast failed (doesn't really matter what the error is, because we're finally going to return an empty string)
    }
    return "";
}
