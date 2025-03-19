import { Request, Response } from 'express';
import Book from '../models/Book';
// TODO: Import related models
// import Author 
// import Category 
/*


ALL TODO'S IN THIS ARE OPTIONAL, YOU ONLY NEED TO DO THESE IF YOU WANT THE AUTHORS AND CATEGORIES TO SHOW UP IN THE FORMS AND RETURN DATA
AGAIN THIS FILE IS OPTIONAL. YOU CAN MAKE API ENDPOINTS IN THE OTHER CONTROLLERS TO TEST YOUR NEW MODELS

*/
// Get all books
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    
    // TODO: Include related models when fetching books
    
    const books = await Book.findAll();
    const plainBooks = books.map(book => book.get({ plain: true }));
    
    res.render('books/index', { books: plainBooks, title: 'All Books' });
  } catch (error) {
    console.error('Error in getAllBooks:', error);
    res.status(500).render('error', { error: 'Error fetching books' });
  }
};

// Show new book form
export const newBookForm = async (req: Request, res: Response) => {
  try {
    // TODO: Get authors and categories for dropdown menus
    
    res.render('books/new', { 
      title: 'Add New Book',
      //TODO send back a authors and categories for the form
    });
  } catch (error) {
    console.error('Error in newBookForm:', error);
    res.status(500).render('error', { error: 'Error loading form' });
  }
};

// Get a single book
export const getBook = async (req: Request, res: Response) => {
  try {
    // TODO: Include related models when fetching a single book
    
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).render('error', { error: 'Book not found' });
    
    const plainBook = book.get({ plain: true });
    res.render('books/show', { book: plainBook, title: plainBook.title });
  } catch (error) {
    console.error('Error in getBook:', error);
    res.status(500).render('error', { error: 'Error fetching book' });
  }
};

// Show edit book form
export const editBookForm = async (req: Request, res: Response) => {
  try {
    // TODO: Get the book with its related models
    
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).render('error', { error: 'Book not found' });
    
    // TODO: Get all authors and categories for form dropdowns
    
    // Get the selected category IDs for the book
    
    const plainBook = book.get({ plain: true });
    res.render('books/edit', { 
      book: plainBook, 
      title: `Edit ${plainBook.title}`,
      //TODO send back authors and categories
    });
  } catch (error) {
    console.error('Error in editBookForm:', error);
    res.status(500).render('error', { error: 'Error fetching book' });
  }
};

// Create a new book
export const createBook = async (req: Request, res: Response) => {
  try {
    // TODO: Handle authorId instead of author field
    const { title, author, isbn, publishedYear, description } = req.body;
    
    if (!title || !author || !isbn || !publishedYear) {
      // TODO: Get authors and categories for dropdown menus if validation fails
      
      return res.status(400).render('books/new', {
        error: 'Please fill in all required fields',
        book: req.body,
        title: 'Add New Book',
        //todo send back authors and categories
      });
    }

    const existingBook = await Book.findOne({ where: { isbn } });
    if (existingBook) {
      // TODO: Get authors and categories for dropdown menus if validation fails
      
      return res.status(400).render('books/new', {
        error: 'A book with this ISBN already exists. ISBN must be unique.',
        book: req.body,
        title: 'Add New Book',
        //todo send back authors and categories
      });
    }

    // TODO: Create book with authorId instead of author field
    
    const book = await Book.create({
      title,
      author,
      isbn,
      publishedYear: parseInt(publishedYear, 10),
      description: description || ''
    });
    
    // TODO: Handle many-to-many relationship with categories
    
    return res.redirect('/books');
  } catch (error) {
    console.error('Error in createBook:', error);
    
    // TODO: Get authors and categories for dropdown menus if there's an error
    
    let errorMessage = 'Error creating book. Please check your input.';
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      errorMessage = 'A book with this ISBN already exists. ISBN must be unique.';
    }
    
    return res.status(400).render('books/new', {
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