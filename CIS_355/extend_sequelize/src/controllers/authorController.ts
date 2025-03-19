import { Request, Response } from 'express';
import Book from '../models/Book';
import Author from '../models/Author';


export const getAllAuthors = async (req: Request, res: Response) => 
{
    // TODO: Get all authors with their book counts

    const allAuthors = await Author.findAll();
    const plainAuthors = allAuthors.map(author => author.get({ plain: true }));
    
    res.render('authors/index', { authors: plainAuthors});
};

// TODO: Implement show author details
export const getAuthor = async (req: Request, res: Response) => {
    // TODO: Get author with their books
};

export const newAuthorForm = async (req: Request, res: Response) => 
{    
    res.render('authors/new', {}); // note that we can pass in an author so that values are automatically populated. This is the strategy used when some data is not valid (below)
}; 


// TODO: Implement edit author form
export const editAuthorForm = async (req: Request, res: Response) => {
  
};

// TODO: Implement create author
export const createAuthor = async (req: Request, res: Response) => 
{    
    console.log("Creating Author");
          
    const {name, bio, birthYear } = req.body;

    if (!name || !bio || !birthYear) 
    { 
        return res.status(400).render('authors/new', 
        {
            error: 'Please fill in all required fields',
            author: req.body,
            title: 'Add New Author',
        });
    }
    
    const match = await Author.findOne({where: {name: name} });
    if(match) // match found, don't allow duplicate creation
    {  
        return res.status(400).render('authors/new', 
        {
            error: 'An author with this name already exists',
            author: req.body,
            title: 'Add New Author',
        });
    }

    const newAuthor = Author.create(
    {
        name,
        bio,
        birthYear: parseInt(birthYear, 10)
    });    
    
    return res.redirect('/authors'); // show all authors upon success
};


// TODO: Implement update author
export const updateAuthor = async (req: Request, res: Response) => {
 
};

// TODO: Implement delete author
export const deleteAuthor = async (req: Request, res: Response) => {
 
    // TODO: Check if author has books and handle them (either prevent deletion or delete books)
   
}; 