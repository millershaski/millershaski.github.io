# Sequelize Relationships Activity

## Overview
In this activity, you will expand the Book Library application by adding:
1. **Authors** - with a one-to-many relationship to Books
2. **Categories** - with a many-to-many relationship to Books

You'll implement full CRUD functionality for these models and update the UI to support the new features.

## Learning Objectives
- Understand and implement Sequelize model relationships
- Create one-to-many relationships
- Create many-to-many relationships
- Query related data using Sequelize methods
- Display related data in Handlebars templates
- Create forms that handle related data

## Requirements

### Part 1: Author Model & Relationships
- Create an Author model with fields: name, bio, birthYear
- Set up a one-to-many relationship with Books
- Create CRUD operations for Authors
- Update Book forms to include Author selection
- Display Author information on Book pages

### Part 2: Category Model & Relationships
- Create a Category model with fields: name, description
- Set up a many-to-many relationship with Books
- Create CRUD operations for Categories
- Update Book forms to allow multiple category selection
- Implement a Book filter by Category feature

### Part 3: Advanced Queries
- Implement a search feature across Books, Authors, and Categories
- Create a dashboard page showing statistics
- Add sorting and filtering options

## Walkthrough

Look for TODO comments throughout the codebase. They will guide you through:
1. Creating the models and relationships
2. Setting up controllers and routes
3. Updating views to handle the new relationships
4. Implementing advanced features

## Getting Started
1. Review the Sequelize documentation on relationships
2. Start by implementing the Author model and its relationship
3. Update Book forms to include Author selection
4. Move on to Categories and implement the many-to-many relationship

Good luck! 