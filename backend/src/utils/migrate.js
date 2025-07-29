const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'its_financial_tracker',
      multipleStatements: true
    });

    console.log('Connected to database');

    // Get migration files
    const migrationsDir = path.join(__dirname, '../../../database/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files`);

    // Run each migration
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await connection.execute(sql);
        console.log(`✓ Successfully ran ${file}`);
      } catch (error) {
        console.error(`✗ Error running ${file}:`, error.message);
        // Continue with next migration
      }
    }

    console.log('All migrations completed');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();