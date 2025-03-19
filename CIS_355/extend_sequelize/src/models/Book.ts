import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Book extends Model 
{
  [x: string]: any; // used to suppresss compiler warning for generated getAuthor method
  public id!: number;
  public title!: string;
  public authorId!: number;
  public isbn!: string;
  public publishedYear!: number;
  public description!: string;
}



Book.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    publishedYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    authorId: 
    {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: 
      {
        model: 'Authors',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'Book',
    timestamps: false, // I don't care when the records were created or updated 
    underscored: true
  }
);

export default Book; 


import Author from './Author';
import Category from './Category';

// defining all relationships at the bottom of the file, so that all can be initialized first
Book.belongsTo(Author);
Book.belongsToMany(Category, {through: "BookCategory"});
