import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Category from '../models/Category';
import Book from '../models/Book';


// Get all categories
export const getAllCategories = async (req: Request, res: Response) => 
{
	try 
	{
		const allCategories = await Category.findAll();
		const allPromises = allCategories.map(async (category) => 
		{
			const plainCategory = category.get({ plain: true });

			const allBooks = await category.getBooks();
			plainCategory.bookCount = allBooks.length;

			return plainCategory;
		});

		const allPlainCategories = await Promise.all(allPromises);
		
		res.render('categories/index', { categories: allPlainCategories, title: 'All Categories' });   
	} 
	catch (error) 
	{
		console.error('Error in getAllCategories:', error);
		res.status(500).render('error', { error: 'Error fetching categories', title: "Categories" });
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
export const newCategoryForm = (req: Request, res: Response) => 
{
	res.render('categories/new', { title: 'Add New Category' });
};



// Show form to edit a category
export const editCategoryForm = async (req: Request, res: Response) => 
{
	try 
	{
		const category = await Category.findByPk(req.params.id);
		if(!category) 
			return res.status(404).render('error', { error: 'Category not found' });

		const plainCategory = category.get({ plain: true });
		res.render('categories/edit', { 
			category: plainCategory, 
			title: `Edit ${category.name}`,
		});
  	} 
	catch (error) 
	{
		console.error('Error in editCategoryForm:', error);
		res.status(500).render('error', { error: 'Error fetching category' });
  	}
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => 
{
	try 
	{ 
		const {name, description } = req.body;
		if(!name || !description) // note that this is copy-pasted below, so any changes must be duplicated there
		{ 
			return res.status(400).render('categories/new', 
			{
				error: 'Please fill in all required fields',
				author: req.body,
				title: 'Add New Category',
			});
		}
		const match = await Category.findOne({where: {name: name} });
		if(match) // match found, don't allow duplicate creation
		{  
			return res.status(400).render('categories/new', 
			{
				error: 'A category with this name already exists',
				author: req.body,
				title: 'Add New Category',
			});
		}

		await Category.create(
		{
			name:name,
			description:description
		});

		return res.redirect("/categories"); // show all categories upon success
	} 
	catch (error) 
	{
		console.error('Error in createCategory:', error);
		return res.status(400).render('categories/new', 
		{
			error: 'Error creating category. Please check your input.',
			category: req.body,
			title: 'Add New Category'
		});
	}
};



// Update a category
export const updateCategory = async (req: Request, res: Response) => 
{
	try 
	{ 
		const category = await Category.findByPk(req.params.id);
		if (!category) return res.status(404).render('error', { error: 'Category not found' });
		
		const { name, description } = req.body;
				
		await category.update({
		  name,
		  description: description || ''
		});
				
		return res.redirect('/categories');
  	} 
	catch (error) 
	{
		console.error('Error in updateCategory:', error);
		return res.status(400).render('categories/edit', { 
		error: 'Error updating category. Please check your input.',
		category: { ...req.body, id: req.params.id },
		title: 'Edit Category'
	});
  	}
};



// Delete a category
export const deleteCategory = async (req: Request, res: Response) => 
{
    const id = req.params.id;

	try 
	{ 
		const foundCategory = await Category.findByPk(id);
        if(!foundCategory) 
            return res.status(404).render('error', { error: 'Category not found' });

        await foundCategory.destroy();
        return res.redirect('/categories');
	} 
	catch (error) 
	{
		console.error('Error in deleteCategory:', error);
		return res.status(500).render('error', { error: 'Error deleting category' });
	}
}; 