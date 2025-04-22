const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const clients = sequelize.define('clients', {
   clientId: {
    type: DataTypes.STRING,
    primaryKey : true,
   },
   contactInfo: {
    type: DataTypes.STRING,
    allowNull : false,
   },
},  {
  tableName: 'clients', // Use lowercase for PostgreSQL
  schema: 'public', // Explicitly specify schema
  timestamps: true,
  freezeTableName: true // Prevents Sequelize from pluralizing
});

console.log(clients === sequelize.models.clients); // true

module.exports = clients;