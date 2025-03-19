import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
// TODO: Import related models
// import Author from './Author';
// import Category from './Category';


class Book extends Model {
  public id!: number;
  public title!: string;
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
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Authors',
        key: 'id'
      }
    },
  },
  {
    sequelize,
    modelName: 'Book',
  }
);

// TODO: Define Book -> Author association (belongs to)

// TODO: Define Book -> Category association (many-to-many)

export default Book; 