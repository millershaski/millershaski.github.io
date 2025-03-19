import { Router } from 'express';
import {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  newBookForm,
  editBookForm
} from '../controllers/bookController';

const router = Router();

// HTML routes
router.get('/', getAllBooks);
router.get('/new', newBookForm);
router.get('/view/:id', getBook);
router.get('/:id/edit', editBookForm);

// Data manipulation routes
router.post('/', createBook);
router.post('/:id', updateBook);
router.post('/:id/delete', deleteBook);

export default router; 