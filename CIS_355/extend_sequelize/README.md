# Book Library Management System

A simple book library management system built with Node.js, Express, Sequelize, TypeScript, and Handlebars.

## Features

- Add new books
- View all books
- Update existing books
- Delete books
- RESTful API design
- Server-side rendering with Handlebars

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Sequelize (SQLite)
- Handlebars (Template Engine)

## Project Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start production server:
   ```bash
   npm start
   ```

## Project Structure

```
.
├── src/
│   ├── config/         # Database and other configurations
│   ├── models/         # Sequelize models
│   ├── routes/         # Express routes
│   ├── controllers/    # Route controllers
│   ├── views/          # Handlebars templates
│   └── public/         # Static files
└── package.json
```

## API Endpoints

- GET /books - List all books
- GET /books/:id - Get a specific book
- POST /books - Create a new book
- PUT /books/:id - Update a book
- DELETE /books/:id - Delete a book 