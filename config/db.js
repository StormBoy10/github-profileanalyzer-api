import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

let pool = null;

/**
 * Initialize database and create connection pool
 */
export async function initializeDatabase() {
  try {
    const dbName = DB_NAME || 'github_analyzer';

    console.log('🔄 Connecting to MySQL database...');

    // Temporary connection for database creation
    const tempConnection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      connectTimeout: 60000,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Connected to MySQL server.');

    // Create database if not exists
    await tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\``
    );

    console.log(`✅ Database "${dbName}" verified.`);

    await tempConnection.end();

    // Main connection pool
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: dbName,

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,

      connectTimeout: 60000,

      enableKeepAlive: true,
      keepAliveInitialDelay: 0,

      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ MySQL connection pool created.');

    // Create profiles table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,

        username VARCHAR(150) NOT NULL UNIQUE,
        name VARCHAR(255),
        avatar_url VARCHAR(500),
        profile_url VARCHAR(500),
        bio TEXT,

        public_repos INT DEFAULT 0,
        public_gists INT DEFAULT 0,

        followers INT DEFAULT 0,
        following INT DEFAULT 0,

        account_created_at DATETIME,

        total_stars INT DEFAULT 0,
        total_forks INT DEFAULT 0,

        top_languages VARCHAR(255),

        most_starred_repo VARCHAR(255),
        most_starred_stars INT DEFAULT 0,

        most_forked_repo VARCHAR(255),
        most_forked_forks INT DEFAULT 0,

        popularity_score INT DEFAULT 0,

        activity_score DECIMAL(10,2) DEFAULT 0.00,

        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableSQL);

    console.log('✅ Profiles table verified.');

    return pool;

  } catch (error) {
    console.error(
      '❌ Database connection or initialization error:',
      error.message
    );

    console.error(
      '⚠️ Please verify Railway MySQL credentials in Render Environment Variables.'
    );

    throw error;
  }
}

/**
 * Execute SQL query
 */
export async function query(sql, params = []) {
  if (!pool) {
    throw new Error(
      'Database pool is not initialized. Call initializeDatabase() first.'
    );
  }

  const [results] = await pool.execute(sql, params);

  return results;
}

export { pool };