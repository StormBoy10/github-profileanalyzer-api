import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

let pool = null;

/**
 * Initializes the database connection pool.
 * It first connects to the MySQL server without selecting a database
 * to ensure that the database and profiles table exist before starting the server.
 */
export async function initializeDatabase() {
  try {
    const dbName = DB_NAME || 'github_analyzer';
    
    // 1. Establish a temporary connection to verify and create the database if missing
    const tempConnection = await mysql.createConnection({
      host: DB_HOST || 'localhost',
      port: parseInt(DB_PORT || '3306'),
      user: DB_USER || 'root',
      password: DB_PASSWORD || ''
    });

    console.log('Successfully connected to MySQL server for pre-flight check.');
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database "${dbName}" verified or created.`);
    await tempConnection.end();

    // 2. Initialize the standard connection pool
    pool = mysql.createPool({
      host: DB_HOST || 'localhost',
      port: parseInt(DB_PORT || '3306'),
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });

    // 3. Ensure the profiles table is created
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`profiles\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(150) NOT NULL UNIQUE,
        \`name\` VARCHAR(255),
        \`avatar_url\` VARCHAR(500),
        \`profile_url\` VARCHAR(500),
        \`bio\` TEXT,
        \`public_repos\` INT DEFAULT 0,
        \`public_gists\` INT DEFAULT 0,
        \`followers\` INT DEFAULT 0,
        \`following\` INT DEFAULT 0,
        \`account_created_at\` DATETIME,
        \`total_stars\` INT DEFAULT 0,
        \`total_forks\` INT DEFAULT 0,
        \`top_languages\` VARCHAR(255),
        \`most_starred_repo\` VARCHAR(255),
        \`most_starred_stars\` INT DEFAULT 0,
        \`most_forked_repo\` VARCHAR(255),
        \`most_forked_forks\` INT DEFAULT 0,
        \`popularity_score\` INT DEFAULT 0,
        \`activity_score\` DECIMAL(10, 2) DEFAULT 0.00,
        \`analyzed_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableSQL);
    console.log('Database table "profiles" verified or created.');
    return pool;
  } catch (error) {
    console.error('❌ Database connection or initialization error:', error.message);
    console.error('Please verify that MySQL is running and credentials in .env are correct.');
    throw error;
  }
}

/**
 * Execute custom SQL queries using the connection pool.
 */
export async function query(sql, params) {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initializeDatabase() first.');
  }
  const [results] = await pool.execute(sql, params);
  return results;
}

export { pool };
