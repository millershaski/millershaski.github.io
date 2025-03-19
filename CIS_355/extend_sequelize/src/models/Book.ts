import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Author from './Author';
import Category from './Category';


class Book extends Model 
{
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
  }
);


// defining all relationships here, so that all can be initialized first
Book.belongsTo(Author);

Book.belongsToMany(Category, {through: "BridgeTable"});
Category.belongsToMany(Book, {through: "BridgeTable"});

Author.hasMany(Book);

export default Book; 