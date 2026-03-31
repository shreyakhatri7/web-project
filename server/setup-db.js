const fs = require('fs');
const path = require('path');
const mysql = require("mysql2");
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbName = process.env.DB_NAME || 'internship_portal';
const shouldReset = process.env.RESET_DB === 'true';

// Create connection for setup
const setupConnection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "shreya123",
  multipleStatements: true
});

const schemaPath = path.join(__dirname, 'database', 'schema.sql');
let schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Force schema to the configured database name for local consistency.
schemaSql = schemaSql
    .replace(/CREATE DATABASE IF NOT EXISTS\s+(job_portal|internship_portal);/i, `CREATE DATABASE IF NOT EXISTS ${dbName};`)
    .replace(/USE\s+(job_portal|internship_portal);/i, `USE ${dbName};`);

// Optional reset for clean local installs. By default, preserve existing data.
const resetSql = shouldReset
    ? `
CREATE DATABASE IF NOT EXISTS ${dbName};
USE ${dbName};
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications, activity_logs, applications, jobs, admins, students, employers, users;
SET FOREIGN_KEY_CHECKS = 1;
`
    : `
CREATE DATABASE IF NOT EXISTS ${dbName};
USE ${dbName};
`;

const setupQueries = `${resetSql}\n${schemaSql}`;

// Run setup
console.log(`Setting up unified RBAC schema for database: ${dbName}`);
if (shouldReset) {
    console.log('Reset mode enabled (RESET_DB=true): existing tables will be dropped.');
} else {
    console.log('Preserve mode enabled: existing tables/data will be kept where possible.');
}

setupConnection.query(setupQueries, (error) => {
    if (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }

    const enumMigrationSql = `
USE ${dbName};
ALTER TABLE jobs
MODIFY COLUMN status ENUM('active', 'inactive', 'expired', 'closed', 'draft', 'pending', 'pending_review') DEFAULT 'pending_review';

ALTER TABLE applications
MODIFY COLUMN status ENUM('pending', 'pending_review', 'approved', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending_review';
`;

    setupConnection.query(enumMigrationSql, (migrationError) => {
        if (migrationError) {
            console.error('Schema enum migration failed:', migrationError);
            process.exit(1);
        }

        console.log('Database and tables created successfully.');

        // Test by showing tables
        setupConnection.query(`USE ${dbName}; SHOW TABLES;`, (showError, results) => {
        if (showError) {
            console.error('Error showing tables:', showError);
        } else {
            console.log('Tables in database:');
            results[1].forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
        }
        
        setupConnection.end();
        console.log('Setup complete. You can now run your application.');
    });
    });
});

setupConnection.on('error', (error) => {
    console.error('Database connection error:', error);
    if (error.code === 'ECONNREFUSED') {
        console.log('\nMySQL server is not running. Please start MySQL first.');
    }
    process.exit(1);
});