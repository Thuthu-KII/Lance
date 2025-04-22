const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const lancers = sequelize.define('lancers', {
   lancerId: {
    type: DataTypes.STRING,
    primaryKey : true,
   },
   contactInfo: {
    type: DataTypes.STRING,
    allowNull : false,
   },
   occupation: {
    type: DataTypes.STRING,
    allowNull: false,
   }
},  {
  tableName: 'lancers', // Use lowercase for PostgreSQL
  schema: 'public', // Explicitly specify schema
  timestamps: true,
  freezeTableName: true // Prevents Sequelize from pluralizing
});

console.log(lancers === sequelize.models.lancers); // true

module.exports = lancers;