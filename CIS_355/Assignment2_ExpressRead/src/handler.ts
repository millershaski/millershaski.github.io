import {Request, Response} from "express";
import fs from "fs";


// sends contents of the provided file to response. Sends errors if file isn't found or provided
export const ReadFileHandler = (request : Request, response: Response) =>
{
    let fileName: string = GetFileName(request);
    if(fileName.length == 0) // no filename passed
    {
        console.log("No file name was passed as a query parameter");

        response.statusCode = 400; // this should technically be the client's fault, because they didn't pass the parameter?
        response.send("No file name was passed as a query parameter"); 

        return; // returning to prevent the response from being used later (just getting into the habit of doing this)
    }
    else
    {
        fs.readFile(fileName, (error: Error | null, data: Buffer) => 
        {
            if(error != null) // common error would be that file is not found
            {
                if(error.message.startsWith("ENOENT") == true) // error.code doesn't work, and I wasn't sure of the best fix. This works on my machine, but possibly not on other machines
                {
                    response.statusCode = 404;
                    response.send(`Unable to find file with name: ${fileName}`);
                }
                else
                {
                    response.statusCode = 500;
                    response.send(`A server error occurred: ${error.message}`);
                }
            }
            else
            {
                response.statusCode = 200;
                
                let stringValue = data.toString();
                response.send(stringValue); // I had a heck of time with issues here, until I realized that I had to clear my browser cache
            }
        });
     }
}



// Returns the value of the query parameter "fileName" (empty string if not found)
function GetFileName(request : Request) : string
{
    try
    {
        if(request.query["filename"])
            return request.query["filename"].toString();        
    }
    catch
    {
         // maybe the cast failed (doesn't really matter what the error is, because we're finally going to return an empty string)
    }
    
    return "";    
}