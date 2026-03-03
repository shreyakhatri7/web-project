const mysql = require("mysql2");
require('dotenv').config();

// Create connection for setup
const setupConnection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "shreya123",
  multipleStatements: true
});

// SQL queries to create database and tables
const setupQueries = `
CREATE DATABASE IF NOT EXISTS internship_portal;
USE internship_portal;

CREATE TABLE IF NOT EXISTS employers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    address TEXT,
    company_description TEXT,
    industry VARCHAR(100),
    website_url VARCHAR(255),
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    job_type ENUM('full-time', 'part-time', 'internship', 'contract') DEFAULT 'full-time',
    location VARCHAR(255),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    requirements TEXT,
    benefits TEXT,
    application_deadline DATE,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20),
    resume_url VARCHAR(255),
    cover_letter TEXT,
    application_status ENUM('pending', 'accepted', 'rejected', 'shortlisted') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
`;

// Run setup
console.log('Setting up database and tables...');

setupConnection.query(setupQueries, (error, results) => {
    if (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
    
    console.log('✅ Database and tables created successfully!');
    
    // Test by showing tables
    setupConnection.query('USE internship_portal; SHOW TABLES;', (error, results) => {
        if (error) {
            console.error('Error showing tables:', error);
        } else {
            console.log('📋 Tables in database:');
            results[1].forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
        }
        
        setupConnection.end();
        console.log('✨ Setup complete! You can now run your application.');
    });
});

setupConnection.on('error', (error) => {
    console.error('Database connection error:', error);
    if (error.code === 'ECONNREFUSED') {
        console.log('\n❌ MySQL server is not running. Please start MySQL server first.');
        console.log('💡 Try: brew services start mysql (on macOS)');
        console.log('💡 Or: sudo systemctl start mysql (on Linux)');
    }
    process.exit(1);
});