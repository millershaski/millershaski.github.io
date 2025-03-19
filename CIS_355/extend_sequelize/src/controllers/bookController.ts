import { Request, Response } from 'express';
import Book from '../models/Book';
import Author from '../models/Author';
import Category from '../models/Category';


/*
ALL TODO'S IN THIS ARE OPTIONAL, YOU ONLY NEED TO DO THESE IF YOU WANT THE AUTHORS AND CATEGORIES TO SHOW UP IN THE FORMS AND RETURN DATA
AGAIN THIS FILE IS OPTIONAL. YOU CAN MAKE API ENDPOINTS IN THE OTHER CONTROLLERS TO TEST YOUR NEW MODELS
*/


// Get all books
export const getAllBooks = async (req: Request, res: Response) => 
{
  try 
  {   
    // TODO: Include related models when fetching books
    
    const books = await Book.findAll();
    const allPromises = books.map(async (book) => 
    {
		const plainBook = book.get({ plain: true })

		const author = await book.getAuthor();
		if(author != null)
			plainBook.author = author.name;		
		else
			plainBook.author = "Unknown"; // probably should throw an error if author can't be found
		
		return plainBook;
    });
    
    const plainBooks = await Promise.all(allPromises);
    res.render('books/index', { books: plainBooks, title: 'All Books' });
  } 
  catch (error) 
  {
    console.error('Error in getAllBooks:', error);
    res.status(500).render('error', { error: 'Error fetching books' });
  }
};

// Show new book form
export const newBookForm = async (req: Request, res: Response) => 
{
	try 
	{
		const allAuthors = await Author.findAll();
		const allPlainAuthors = allAuthors.map(author => author.get({ plain: true }));

		const allCategories = await Category.findAll();
		const allPlainCategories = allCategories.map(category => category.get({plain: true}));

		res.render('books/new', 
		{ 
			title: 'Add New Book',
			authors: allPlainAuthors,
			categories: allPlainCategories
		});
  	} 
	catch (error) 
	{
		console.error('Error in newBookForm:', error);
		res.status(500).render('error', { error: 'Error loading form' });
	}
};



// Get a single book
export const getBook = async (req: Request, res: Response) => {
  try {    
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).render('error', { error: 'Book not found' });
    
	const allPlainAuthors = await GetAllPlainAuthorsFor(book);
	const allPlainCategories = await GetAllPlainCategoriesFor(book);

    const plainBook = book.get({ plain: true });	
    res.render('books/show', 
	{ 
		book: plainBook, 
		title: plainBook.title,
		authors: allPlainAuthors,
		categories: allPlainCategories
	});

  } catch (error) {
    console.error('Error in getBook:', error);
    res.status(500).render('error', { error: 'Error fetching book' });
  }
};

// Show edit book form
export const editBookForm = async (req: Request, res: Response) => 
{
	try 
  	{    
		const book = await Book.findByPk(req.params.id);
		if(!book) 
			return res.status(404).render('error', { error: 'Book not found' });

		const allPlainAuthors = await GetAllPlainAuthorsFor(book);
		const allPlainCategories = await GetAllPlainCategoriesFor(book);

		const plainBook = book.get({ plain: true });
		res.render('books/edit', { 
			book: plainBook, 
			title: `Edit ${plainBook.title}`,
			authors: allPlainAuthors,
			categories: allPlainCategories
		});
	} 
	catch (error) 
	{
		console.error('Error in editBookForm:', error);
		res.status(500).render('error', { error: 'Error fetching book' });
  	}
};



async function GetAllPlainAuthorsFor(book: any) : Promise<any>
{
	let myAuthor = null;
	if(book != null)
		myAuthor = await book.getAuthor();

	const allAuthors = await Author.findAll();
	const allPlainAuthors = allAuthors.map((author) => 
	{
		const plainAuthor = author.get({ plain: true });
		if(myAuthor != null && book != null)
			plainAuthor.selected = myAuthor.id == author.id;

		return plainAuthor;
	});

	return allPlainAuthors;
}



async function GetAllPlainCategoriesFor(book: any) : Promise<any>
{
	let myCategories = null;
	if(book !== null)
		myCategories = await book.getCategories();

	const allCategories = await Category.findAll();
	const allPlainCategories = allCategories.map((category) => 
	{
		const plainCategory = category.get({ plain: true });			
		plainCategory.selected = IsCategoryIncluded(myCategories, category);
		return plainCategory;
	});

	return allPlainCategories;
}



function IsCategoryIncluded(myCategories: any[], category: any) : boolean
{
	if(category == null || myCategories == null)
		return false;

	for(let someCategory of myCategories)
	{
		if(someCategory.id == category.id)
			return true;
	}

	return false;
}



// Create a new book
export const createBook = async (req: Request, res: Response) => 
{
	try 
	{    
    	const { title, authorId, isbn, publishedYear, description, categoryIds } = req.body;
    
		if (!title || !authorId || !isbn || !publishedYear || !categoryIds) 
		{
			const allPlainAuthors = await GetAllPlainAuthorsFor(null);
			const allPlainCategories = await GetAllPlainCategoriesFor(null);
			
			return res.status(400).render('books/new', 
			{
				error: 'Please fill in all required fields',
				book: req.body,
				authors: allPlainAuthors,
				categories: allPlainCategories,
				title: 'Add New Book',
			});
		}

		const existingBook = await Book.findOne({ where: { isbn } });
		if (existingBook) 
		{			
			const allPlainAuthors = await GetAllPlainAuthorsFor(null);
			const allPlainCategories = await GetAllPlainCategoriesFor(null);
			
			return res.status(400).render('books/new', 
			{
				error: 'A book with this ISBN already exists. ISBN must be unique.',
				book: req.body,
				title: 'Add New Book',
				authors: allPlainAuthors,
				categories: allPlainCategories,
			});
		}

		const book = await Book.create({
			title:title,
			authorId:authorId,
			isbn,
			publishedYear: parseInt(publishedYear, 10),
			description: description || ''
		});

		for(let categoryId of categoryIds)
		{
			const foundCategory = await Category.findByPk(categoryId);
			if(foundCategory)
				book.addCategory(foundCategory);
		}
		await book.save(); // not sure if we need to save the newly added categories, so just being safe 

		return res.redirect('/books');
	} 
	catch (error) 
	{
		console.error('Error in createBook:', error);

		// TODO: Get authors and categories for dropdown menus if there's an error

		let errorMessage = 'Error creating book. Please check your input.';
		if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
		errorMessage = 'A book with this ISBN already exists. ISBN must be unique.';
		}

		return res.status(400).render('books/new', 
		{
			error: errorMessage,
			book: req.body,
			title: 'Add New Book',
			//todo send back authors and categories
		});
	}
};

// Update a book
export const updateBook = async (req: Request, res: Response) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).render('error', { error: 'Book not found' });
    
    // TODO: Handle authorId instead of author field
    const { title, author, isbn, publishedYear, description } = req.body;
    
    // TODO: Update book with authorId instead of author field
    
    await book.update({
      title,
      author,
      isbn,
      publishedYear: parseInt(publishedYear, 10),
      description: description || ''
    });
    
    // TODO: Handle many-to-many relationship with categories
    
    return res.redirect('/books');
  } catch (error) {
    console.error('Error in updateBook:', error);
    
    // TODO: Get all authors and categories for form dropdowns if there's an error
    
    return res.status(400).render('books/edit', { 
      error: 'Error updating book. Please check your input.',
      book: { ...req.body, id: req.params.id },
      title: 'Edit Book',

        //todo send back authors and categories
    });
  }
};

// Delete a book
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).render('error', { error: 'Book not found' });
    
    // TODO: Before deleting, remove associations with categories
    
    await book.destroy();
    return res.redirect('/books');
  } catch (error) {
    console.error('Error in deleteBook:', error);
    return res.status(500).render('error', { error: 'Error deleting book' });
  }
}; 