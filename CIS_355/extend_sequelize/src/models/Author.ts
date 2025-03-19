import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Book from './Book';


class Author extends Model 
{
    public name!: string;
    public bio!: string;
    public birthYear!: number;
}

Author.init(
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
    bio:
    {
        type: DataTypes.STRING,
        allowNull: false
    },
    birthYear:
    {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},
{
    sequelize, 
    modelName: "Author",
    tableName: 'Authors',  // this can be omitted, as the name will automatically be made the plural version of the modelName
    timestamps: false, // I don't care when the records were created or updated 
    underscored: true
}
);


export default Author; 