import { Request, Response } from 'express';
import Book from '../models/Book';
import Author from '../models/Author';


export const getAllAuthors = async (req: Request, res: Response) => 
{
    // TODO: Get all authors with their book counts

    const allAuthors = await Author.findAll();
    const allPlainAuthors = allAuthors.map(author => author.get({ plain: true }));
    
    res.render('authors/index', { authors: allPlainAuthors});
};

// TODO: Implement show author details
export const getAuthor = async (req: Request, res: Response) => {
    // TODO: Get author with their books
};

export const newAuthorForm = async (req: Request, res: Response) => 
{    
    res.render('authors/new', {}); // note that we can pass in an author so that values are automatically populated. This is the strategy used when some data is not valid (below)
}; 



export const editAuthorForm = async (req: Request, res: Response) => 
{
    const id = req.params.id;
    const foundAuthor = await Author.findOne({ where: {id: id} });

    if(!foundAuthor) // unable to find author with matching ID
    {  
        return res.status(400).render('authors/new', 
        {
            error: 'Unable to find author with id of: ' + id + ". Automatically redirected to create new author.",
            author: req.body,
            title: 'Edit Author',
        });
    }

    const plainAuthor = foundAuthor.get( {plain: true} );

    res.render('authors/edit', {author:plainAuthor}); 
};



export const createAuthor = async (req: Request, res: Response) => 
{    
    console.log("Creating Author");
          
    const {name, bio, birthYear } = req.body;
    if (!name || !bio || !birthYear) // note that this is copy-pasted below, so any changes must be duplicated there
    { 
        return res.status(400).render('authors/new', 
        {
            error: 'Please fill in all required fields',
            author: req.body,
            title: 'Add New Author',
        });
    }
    
    const match = await Author.findOne({where: {name: name, birthYear:birthYear} });
    if(match) // match found, don't allow duplicate creation
    {  
        return res.status(400).render('authors/new', 
        {
            error: 'An author with this name and birth year already exists',
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


export const updateAuthor = async (req: Request, res: Response) => 
{
    const id = req.params.id;
    const foundAuthor = await Author.findOne({ where: {id: id} });
    
    if (!foundAuthor) 
        return res.status(404).render('error', { error: 'Author not found' });

    const {name, bio, birthYear } = req.body;
    if (!name || !bio || !birthYear) // this is a copy-paste from above (bad design)
    { 
        return res.status(400).render('authors/new', 
        {
            error: 'Please fill in all required fields',
            author: req.body,
            title: 'Add New Author',
        });
    }

    foundAuthor.name = name;
    foundAuthor.bio = bio;
    foundAuthor.birthYear = birthYear;
    
    await foundAuthor.save();    
    return res.redirect('/authors'); // redirect to all authors upon success
};

// TODO: Implement delete author
export const deleteAuthor = async (req: Request, res: Response) => {
 
    // TODO: Check if author has books and handle them (either prevent deletion or delete books)
   
}; 