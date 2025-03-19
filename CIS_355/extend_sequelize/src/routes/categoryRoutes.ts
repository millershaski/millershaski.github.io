import { Router } from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  newCategoryForm,
  editCategoryForm
} from '../controllers/categoryController';

const router = Router();

// TODO: Implement category routes

// HTML routes
router.get('/', getAllCategories);
router.get('/new', newCategoryForm);
router.get('/:id', getCategory);
router.get('/:id/edit', editCategoryForm);

// Data manipulation routes
router.post('/', createCategory);
router.post('/:id', updateCategory);
router.post('/:id/delete', deleteCategory);

export default router; 