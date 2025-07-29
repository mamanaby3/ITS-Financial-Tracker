const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'its_financial_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion à MySQL réussie');
    connection.release();
  } catch (error) {
    console.error('❌ Erreur de connexion à MySQL:', error.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };