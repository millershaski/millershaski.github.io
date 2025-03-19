import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Book from './Book';


// TODO: Implement the Category model
class Category extends Model{
  public id!: number;
  public name!: string;
  public description!: string;
}

// TODO: Initialize the Category model
Category.init(
);

// TODO: define relationships

export default Category; 