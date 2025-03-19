import { Request, Response } from 'express';
import Book from '../models/Book';
import Author from '../models/Author';


export const getAllAuthors = async (req: Request, res: Response) => 
{
    const allAuthors = await Author.findAll();
    const allPromises = allAuthors.map(async (author) => 
    {
        const plainAuthor = author.get({ plain: true });

        const allBooks = await Book.findAll({where: {authorId: author.id}});
        plainAuthor.bookCount = allBooks.length;
    
        return plainAuthor;
    });

    const allPlainAuthors = await Promise.all(allPromises);
    
    res.render('authors/index', { authors: allPlainAuthors,  title: "All Authors"});
};

// TODO: Implement show author details
export const getAuthor = async (req: Request, res: Response) => 
{
    // TODO: Get author with their books
};


export const newAuthorForm = async (req: Request, res: Response) => 
{    
    res.render('authors/new', {title: "New Author" }); // note that we can pass in an author so that values are automatically populated. This is the strategy used when some data is not valid (below)
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

    res.render('authors/edit', {author:plainAuthor, title: "Edit Author" }); 
};



export const createAuthor = async (req: Request, res: Response) => 
{              
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

    await Author.create(
    {
        name:name,
        bio:bio,
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

export const deleteAuthor = async (req: Request, res: Response) => 
{
    const authorId = req.params.id;

    try 
    {
        const foundAuthor = await Author.findByPk(authorId);
        if(!foundAuthor) 
            return res.status(404).render('error', { error: 'Author not found' });

        // TODO: Check if author has books and handle them (either prevent deletion or delete books)   
        const allBooks = await Book.findAll({where: {authorId: authorId}});
        console.log("Found matching books: " + allBooks.length);

        await foundAuthor.destroy();
        return res.redirect('/authors');
    } 
    catch (error) 
    {
        console.error('Error in deleteBook:', error);
        return res.status(500).render('error', { error: 'Error deleting book' });
    }
}; 