const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Reuse existing sequelize instance

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models (use PascalCase for model names)
db.Jobs = require('./Jobs')(sequelize, DataTypes);
db.Applications = require('./applications')(sequelize, DataTypes);
db.Clients = require('./clients-table')(sequelize, DataTypes);
db.Lancers = require('./lancers-table')(sequelize, DataTypes);

// Define associations
db.Jobs.belongsTo(db.Lancers, {foreignKey: 'lancerId', as: 'lanceID', onDelete:'CASCADE'});
db.Jobs.belongsTo(db.Clients, {foreignKey: 'clientId', as: 'clientID', onDelete:'CASCADE'});

db.Lancers.hasMany(db.Jobs, {foreignKey: 'lancerId', as: 'lanceID'});
db.Clients.hasMany(db.Jobs, {foreignKey: 'clientId', as: 'clientID'})


module.exports = db;
