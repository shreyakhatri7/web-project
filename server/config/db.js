
const mysql = require("mysql2");
require('dotenv').config();

// Railway.app database configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "shreya123",
  database: process.env.DB_NAME || "internship_portal",
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectTimeout: 60000
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
