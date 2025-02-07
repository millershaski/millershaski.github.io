"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadFileHandler = void 0;
const fs = require("fs");
const ReadFileHandler = (request, response) => {
    let fileName = GetFileName(request);
    if (fileName.length == 0) // no filename passed
     {
        console.log("No file name was passed as a query parameter");
        response.statusCode = 400;
        response.send("No file name was passed as a query parameter"); // duplicate text, but might change later
        return; // returning to prevent the response from being used later (just getting into the habit of doing this)
    }
    else {
        fs.readFile(fileName, "utf8", (error, data) => {
            if (error != null) // common error would be that file is not found
             {
                console.log(`Error: ${error.message}`);
                response.statusCode = 500;
                response.send(`Unable to find file with name: ${fileName}`);
            }
            else {
                response.statusCode = 200;
                let stringValue = data.toString();
                response.send(stringValue);
            }
        });
    }
};
exports.ReadFileHandler = ReadFileHandler;
// Parses the url from incoming, and then returns the value of the query parameter "fileName" (null if not found)
function GetFileName(request) {
    try {
        if (request.query["filename"]) {
            let returnValue = request.query["filename"].toString();
            return returnValue;
        }
    }
    catch {
        return ""; // maybe the cast failed
    }
    return "";
}
