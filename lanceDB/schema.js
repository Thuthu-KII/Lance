const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Jobs = sequelize.define('Jobs', {
  jobID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 2
    }
  }, 
  /*Wage: { //adding wage for a specific job to the DB table
    type: DataTypes.INTEGER, 
    defaultValue: 0,
    allowNull : false,

  } */

},  {
  tableName: 'jobs', // Use lowercase for PostgreSQL
  schema: 'public', // Explicitly specify schema
  timestamps: true,
  freezeTableName: true // Prevents Sequelize from pluralizing
});

console.log(Jobs === sequelize.models.Jobs); // true

module.exports = Jobs;