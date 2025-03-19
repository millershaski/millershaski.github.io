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
{
  id:
  {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  name:
  {
      type: DataTypes.STRING,
      allowNull: false
  },
  description:
  {
      type: DataTypes.STRING,
      allowNull: false
  }
},
{
  sequelize, 
  modelName: "Category",
  tableName: 'Categories',  // this can be omitted, as the name will automatically be made the plural version of the modelName
  timestamps: false, // I don't care when the records were created or updated 
  underscored: true
}
);


export default Category; 