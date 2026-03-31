const path = require('path');
const mysql = require("mysql2");
const mysqlPromise = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Railway.app database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "shreya123",
  database: process.env.DB_NAME || "internship_portal",
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectTimeout: 60000
};

// Legacy callback-based connection used by older route handlers
const db = mysql.createConnection(dbConfig);

// Promise-based pool used by unified controllers
const pool = mysqlPromise.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection with retry logic
const connectWithRetry = () => {
  db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err.message);
      console.log("Retrying connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log("Connected to the database successfully!");
      console.log(`Database: ${process.env.DB_NAME || "internship_portal"}`);
    }
  });
};

connectWithRetry();

module.exports = db;
module.exports.db = db;
module.exports.pool = pool;
