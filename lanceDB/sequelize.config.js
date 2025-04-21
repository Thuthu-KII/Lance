require('dotenv').config(); // Load environment variables

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // For Azure PostgreSQL, you often need this
      }
    },
    logging: console.log // Optional: enable logging
  },
  production: {
    // Similar to development but with production credentials(i.e db credetials and settingd for production environment)
  }
};