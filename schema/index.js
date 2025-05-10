const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Reuse existing sequelize instance

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models (use PascalCase for model names)
db.lncrs = require('./lancers-table')(sequelize, DataTypes);
db.client = require('./clients-table')(sequelize, DataTypes);
db.admin = require('./admin')(sequelize,DataTypes);
db.Job = require('./Jobs')(sequelize, DataTypes);
db.Application = require('./applications')(sequelize, DataTypes);






// Define associations
/*
db.Jobs.belongsTo(db.Lancers, {foreignKey: 'lancerId', as: 'lanceID', onDelete:'CASCADE'});
db.Jobs.belongsTo(db.Clients, {foreignKey: 'clientId', as: 'clientID', onDelete:'CASCADE'});

db.Lancers.hasMany(db.Jobs, {foreignKey: 'lancerId', as: 'lanceID'});
db.Clients.hasMany(db.Jobs, {foreignKey: 'clientId', as: 'clientID'})
*/


module.exports = db;
