import express, {Express, Request, Response} from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from "./routes/categoryRoutes";
import authorRoutes from "./routes/authorRoutes";
import sequelize from './config/database';

// TODO: Import new route files

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', 'src/views');

console.log(path.join(__dirname, 'views'));


// logging middle-ware (placing at the top so that it's always invoked)
app.use((req: Request, resp: Response, next) =>
{
    // note that duplicates are probably because of the favicon.ico request
    console.log("A request was received: " + req.method + " for " + req.url);
    next(); // without a next, this request will die here
});
  

// Routes
app.use('/books', bookRoutes);
app.use('/categories', categoryRoutes);
app.use('/authors', authorRoutes);


// TODO: Add route for dashboard

app.get('/', (req, res) => {
  res.redirect('/books');
});

// Database sync and server start
const startServer = async () => {
  try 
  {
    // TODO: Update sync options for development/production
    // Development: Force sync to recreate tables
    // await sequelize.sync({ force: true });
    
    // Production: Don't force sync, just sync what's needed
    await sequelize.sync();
    
    console.log('Database synced successfully');
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};


startServer(); 