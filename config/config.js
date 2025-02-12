require('dotenv').config();

module.exports = {
  db: {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'irctc_db',
  },
  secretKey: process.env.SECRET_KEY || 'your-hard-to-guess-secret-key',
  apiKey: process.env.API_KEY || 'your-admin-api-key',
};