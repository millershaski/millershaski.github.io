import { Router } from 'express';
import {
  getAllAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  newAuthorForm,
  editAuthorForm
} from '../controllers/authorController';

const router = Router();

// TODO: Implement author routes

// HTML routes
router.get('/', getAllAuthors);
router.get('/new', newAuthorForm);
router.get('/:id', getAuthor);
router.get('/:id/edit', editAuthorForm);

// Data manipulation routes
router.post('/', createAuthor);
router.post('/:id', updateAuthor);
router.post('/:id/delete', deleteAuthor);

export default router; 