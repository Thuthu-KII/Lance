const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

const User  = require('./userModel')(sequelize, DataTypes);
const Job   = require('./jobModel')(sequelize, DataTypes);
const Admin = require('./adminModel')(sequelize, DataTypes);
const Application = require('./applicationModel')(sequelize, DataTypes);

User.hasMany(Job, { foreignKey: 'clientId' });
Job.belongsTo(User, { as: 'client' });

Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job);

User.hasMany(Application, { foreignKey: 'freelancerId' });
Application.belongsTo(User, { as: 'freelancer' });

module.exports = { sequelize, User, Job, Admin, Application };
