"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const port = 5000;
const app = (0, express_1.default)();
app.get("/books", GET_Books);
app.post("/books", POST_Book);
app.put("/books/:id", PUT_UpdateBook);
app.delete("/books/:id", DELETE_Book);
app.get("", (request, response) => {
    response.send("This is the default response (nothing implemented on this page)");
});
app.listen(port, () => console.log(`[Server]: Server is running at http://localhost:${port}`));
function GET_Books(request, response) {
    var allBooks = GetAllBooks();
    if (allBooks == null)
        response.status(404).send("Unable to find books.json");
    else
        response.status(200).send(allBooks);
}
function GetAllBooks() {
    const fileName = GetBookFilePath();
    var data = fs_1.default.readFileSync(fileName);
    if (data == null)
        return null;
    else
        return JSON.parse(data.toString());
}
// Helper method, since we'll need this filepath in a few places
function GetBookFilePath() {
    return path_1.default.join(__dirname, "..", "books.json");
}
function POST_Book(request, response) {
    var allBooks = GetAllBooks();
    if (allBooks == null) {
        response.status(404).send("Unable to find books.json");
        return;
    }
    if (request.query["title"] && request.query["author"] && request.query["publicationYear"]) {
        const newTitle = request.query["title"];
        const newAuthor = request.query["author"];
        const newYear = request.query["publicationYear"];
        if (newTitle.length == 0 || newAuthor.length == 0 || newYear.length == 0) {
            response.status(400).send("Invalid parameter data");
            return;
        }
        var newID = GetNewBookId();
        allBooks.push({
            "id": newID,
            "title": newTitle,
            "author": newAuthor,
            "publicationYear": newYear
        });
        fs_1.default.writeFileSync(GetBookFilePath(), JSON.stringify(allBooks));
        response.status(200).send("Posted successfully, new book ID: " + newID);
    }
    else // invalid request
     {
        response.status(400).send("Invalid parameter data");
    }
}
// Returns a random large integer so that the chances of collisions are low
function GetNewBookId() {
    return Math.floor(Math.random() * 9999999);
}
function PUT_UpdateBook(request, response) {
    var allBooks = GetAllBooks();
    if (allBooks == null) {
        response.status(404).send("Unable to find books.json");
        return;
    }
    if (request.params.id) // can this be false?
     {
        console.log("Updating book: " + request.params.id);
        const bookId = parseInt(request.params.id.toString());
        const book = allBooks.find((book) => book.id === bookId);
        if (book == null) {
            response.status(404).send("Unable to find book with id: " + bookId);
            return;
        }
        else {
            if (request.query["title"] && request.query["author"] && request.query["publicationYear"]) {
                const newTitle = request.query["title"];
                const newAuthor = request.query["author"];
                const newYear = request.query["publicationYear"];
                if (newTitle.length == 0 || newAuthor.length == 0 || newYear.length == 0) {
                    response.status(400).send("Invalid parameter data");
                    return;
                }
                book.title = newTitle;
                book.author = newAuthor;
                book.publicationYear = newYear;
                fs_1.default.writeFileSync(GetBookFilePath(), JSON.stringify(allBooks));
                response.status(200).send("Updated book successfully: " + (bookId + 1));
            }
            else
                response.status(400).send("Invalid parameter data");
        }
    }
    else {
        response.status(400).send("Invalid parameter data");
    }
}
function DELETE_Book(request, response) {
    var allBooks = GetAllBooks();
    if (allBooks == null) {
        response.status(404).send("Unable to find books.json");
        return;
    }
    if (request.params.id) {
        console.log("Deleting book: " + request.params.id);
        const bookId = parseInt(request.params.id.toString());
        const book = allBooks.find((book) => book.id === bookId);
        if (book == null) {
            response.status(404).send("Unable to find book with id: " + bookId);
            return;
        }
        else {
            const index = allBooks.indexOf(book);
            if (index != -1) {
                allBooks.splice(index, 1);
                fs_1.default.writeFileSync(GetBookFilePath(), JSON.stringify(allBooks, (key, value) => {
                    if (value === null) // prevent null values from appearing in the JSON
                        return undefined;
                    else
                        return value;
                }));
                response.status(200).send("Deleted book successfully: " + bookId);
            }
            else // unable to find an index for the book, this shouldn't be possible, since we just retrieved it from the array
                response.status(500).send("Server error");
        }
    }
    else {
        response.status(400).send("Invalid parameter data");
    }
}
