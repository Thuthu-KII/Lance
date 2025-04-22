const sequelize = require('./sequelize');
const Jobs = require('./schema');
const l = require('./lancers-table');
const c = require('./clients-table');
/*
async function syncDatabase() {
  try {
    // Use force: true only in development to drop and recreate tables
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
*/

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    console.log('Connecting to:', {
      database: sequelize.config.database,
      host: sequelize.config.host,
      port: sequelize.config.port
    });
    
    // Sync all models
    await sequelize.sync({ force: false }); // Use force: true only in development to drop tables
    console.log('All models were synchronized successfully.');
    
    // Or sync specific model
    // await Jobs.sync({ force: false });
    // console.log('Jobs table synchronized');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();

