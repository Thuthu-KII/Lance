const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../../sequelize'); // Reuse existing sequelize instance
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models
db.Jobs = require('./Jobs')(sequelize, DataTypes);
db.Applications = require('./applications')(sequelize,DataTypes);



module.exports = db;