import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Category from '../models/Category';
// TODO: Import Book model

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    // TODO: Get all categories with their book counts
   
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).render('error', { error: 'Error fetching categories' });
  }
};

// Get a single category with its books
export const getCategory = async (req: Request, res: Response) => {
  try {
    // TODO: Get category with its books
  
  } catch (error) {
    console.error('Error in getCategory:', error);
    res.status(500).render('error', { error: 'Error fetching category' });
  }
};

// Show form to create a new category
export const newCategoryForm = (req: Request, res: Response) => {
  res.render('categories/new', { title: 'Add New Category' });
};

// Show form to edit a category
export const editCategoryForm = async (req: Request, res: Response) => {
  try {
   
    //todo show edit form for category 
  } catch (error) {
    console.error('Error in editCategoryForm:', error);
    res.status(500).render('error', { error: 'Error fetching category' });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
   //todo create new category 
  } catch (error) {
    console.error('Error in createCategory:', error);
    return res.status(400).render('categories/new', {
      error: 'Error creating category. Please check your input.',
      category: req.body,
      title: 'Add New Category'
    });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    
    //todo implement update category
  } catch (error) {
    console.error('Error in updateCategory:', error);
    return res.status(400).render('categories/edit', { 
      error: 'Error updating category. Please check your input.',
      category: { ...req.body, id: req.params.id },
      title: 'Edit Category'
    });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    //todo implement delete
   
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return res.status(500).render('error', { error: 'Error deleting category' });
  }
}; 