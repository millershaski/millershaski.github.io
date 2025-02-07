Returns the contents of a server file (if found)

Server's port is 5000

You must use route "/readFile"
You must pass the filename as a query parameter, using key "filename".

Example: localhost:5000/readFile?filename=myFile.txt

No other pages/routes are implemented, and will return a default response


(There are 2 files: handler.ts and server.ts. You must compile and run the code, using npm start, or however you want to)