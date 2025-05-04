const sequelize = require('./sequelize');
const db = require('./schema');


async function syncDatabase() {
  try {
    
    //connects yo the db server on azure 
    await sequelize.authenticate();
    // Sync all schemas
    await sequelize.sync({ alter: true }); // Use force: true only in development to drop tables
    console.log('All models were synchronized successfully.');
    
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }/* finally {
    await sequelize.close();
  }*/
}

syncDatabase();

