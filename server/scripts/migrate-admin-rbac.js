const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dbName = process.env.DB_NAME || 'internship_portal';

const toSingleLine = (value) => (value || '').toString().replace(/\s+/g, ' ').trim();

const columnExists = async (connection, tableName, columnName) => {
  const [rows] = await connection.query(
    `SELECT 1
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
     LIMIT 1`,
    [dbName, tableName, columnName]
  );
  return rows.length > 0;
};

const tableExists = async (connection, tableName) => {
  const [rows] = await connection.query(
    `SELECT 1
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
     LIMIT 1`,
    [dbName, tableName]
  );
  return rows.length > 0;
};

const addColumnIfMissing = async (connection, tableName, columnName, definition) => {
  if (!(await columnExists(connection, tableName, columnName))) {
    await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    console.log(`Added ${tableName}.${columnName}`);
  }
};

const createCoreTables = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('student', 'employer', 'admin') NOT NULL DEFAULT 'student',
      status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_role (role),
      INDEX idx_status (status)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE,
      first_name VARCHAR(100) NOT NULL DEFAULT 'Student',
      last_name VARCHAR(100) NOT NULL DEFAULT 'User',
      phone VARCHAR(20),
      university VARCHAR(255),
      major VARCHAR(255),
      graduation_year VARCHAR(4),
      gpa DECIMAL(3,2),
      bio TEXT,
      education JSON,
      skills JSON,
      resume_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      permissions JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_is_read (is_read),
      INDEX idx_created_at (created_at)
    )
  `);
};

const upgradeEmployersTable = async (connection) => {
  if (!(await tableExists(connection, 'employers'))) {
    await connection.query(`
      CREATE TABLE employers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        company_description TEXT,
        company_logo VARCHAR(500),
        company_website VARCHAR(255),
        company_location VARCHAR(255),
        industry VARCHAR(100),
        company_size VARCHAR(50),
        contact_name VARCHAR(200),
        contact_phone VARCHAR(20),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      )
    `);
    console.log('Created employers table');
    return;
  }

  await addColumnIfMissing(connection, 'employers', 'user_id', 'INT NULL');
  await addColumnIfMissing(connection, 'employers', 'is_verified', 'BOOLEAN DEFAULT FALSE');
  await addColumnIfMissing(connection, 'employers', 'company_location', 'VARCHAR(255)');
  await addColumnIfMissing(connection, 'employers', 'company_size', 'VARCHAR(50)');
  await addColumnIfMissing(connection, 'employers', 'contact_name', 'VARCHAR(200)');
  await addColumnIfMissing(connection, 'employers', 'contact_phone', 'VARCHAR(20)');
};

const upgradeJobsTable = async (connection) => {
  if (!(await tableExists(connection, 'jobs'))) {
    await connection.query(`
      CREATE TABLE jobs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employer_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255),
        job_type ENUM('full-time', 'part-time', 'contract', 'internship', 'remote') DEFAULT 'full-time',
        experience_level ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive') DEFAULT 'entry',
        salary_min DECIMAL(10, 2),
        salary_max DECIMAL(10, 2),
        requirements JSON,
        responsibilities JSON,
        benefits JSON,
        skills_required JSON,
        deadline DATE,
        vacancies INT DEFAULT 1,
        status ENUM('active', 'inactive', 'expired', 'closed', 'draft', 'pending', 'pending_review') DEFAULT 'pending_review',
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_employer (employer_id)
      )
    `);
    console.log('Created jobs table');
    return;
  }

  await addColumnIfMissing(connection, 'jobs', 'experience_level', "ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive') DEFAULT 'entry'");
  await addColumnIfMissing(connection, 'jobs', 'responsibilities', 'JSON');
  await addColumnIfMissing(connection, 'jobs', 'skills_required', 'JSON');
  await addColumnIfMissing(connection, 'jobs', 'deadline', 'DATE');
  await addColumnIfMissing(connection, 'jobs', 'vacancies', 'INT DEFAULT 1');
  await addColumnIfMissing(connection, 'jobs', 'is_approved', 'BOOLEAN DEFAULT FALSE');

  if (await columnExists(connection, 'jobs', 'application_deadline')) {
    await connection.query('UPDATE jobs SET deadline = application_deadline WHERE deadline IS NULL');
  }

  const [statusColumnRows] = await connection.query(
    `SELECT COLUMN_TYPE
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'jobs' AND COLUMN_NAME = 'status'`,
    [dbName]
  );

  if (statusColumnRows.length > 0) {
    const statusType = toSingleLine(statusColumnRows[0].COLUMN_TYPE);
    const requiredStatuses = ['active', 'inactive', 'expired', 'closed', 'draft', 'pending', 'pending_review'];
    const missingStatus = requiredStatuses.find((status) => !statusType.includes(`'${status}'`));
    if (missingStatus) {
      await connection.query(
        `ALTER TABLE jobs MODIFY COLUMN status
         ENUM('active', 'inactive', 'expired', 'closed', 'draft', 'pending', 'pending_review') DEFAULT 'pending_review'`
      );
      console.log('Expanded jobs.status enum for admin workflow');
    }
  }
};

const upgradeApplicationsTable = async (connection) => {
  if (!(await tableExists(connection, 'applications'))) {
    await connection.query(`
      CREATE TABLE applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        job_id INT NOT NULL,
        student_id INT,
        cover_letter TEXT,
        resume_url VARCHAR(500),
        status ENUM('pending', 'pending_review', 'approved', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending_review',
        employer_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_job_id (job_id),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status)
      )
    `);
    console.log('Created applications table');
    return;
  }

  await addColumnIfMissing(connection, 'applications', 'student_id', 'INT NULL');
  await addColumnIfMissing(connection, 'applications', 'status', "ENUM('pending', 'pending_review', 'approved', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending_review'");
  await addColumnIfMissing(connection, 'applications', 'employer_notes', 'TEXT');
  await addColumnIfMissing(connection, 'applications', 'created_at', 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP');
  await addColumnIfMissing(connection, 'applications', 'updated_at', 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  const [statusColumnRows] = await connection.query(
    `SELECT COLUMN_TYPE
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'applications' AND COLUMN_NAME = 'status'`,
    [dbName]
  );

  if (statusColumnRows.length > 0) {
    const statusType = toSingleLine(statusColumnRows[0].COLUMN_TYPE);
    const requiredStatuses = ['pending', 'pending_review', 'approved', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];
    const missingStatus = requiredStatuses.find((status) => !statusType.includes(`'${status}'`));
    if (missingStatus) {
      await connection.query(
        `ALTER TABLE applications MODIFY COLUMN status
         ENUM('pending', 'pending_review', 'approved', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending_review'`
      );
      console.log('Expanded applications.status enum for admin review workflow');
    }
  }

  if (await columnExists(connection, 'applications', 'application_status')) {
    await connection.query(`
      UPDATE applications
      SET status = CASE application_status
          WHEN 'pending' THEN 'pending_review'
          WHEN 'shortlisted' THEN 'shortlisted'
          WHEN 'accepted' THEN 'accepted'
          WHEN 'rejected' THEN 'rejected'
          ELSE status
        END
      WHERE status IS NULL OR status = 'pending'
    `);
  }

  if (await columnExists(connection, 'applications', 'applied_at')) {
    await connection.query('UPDATE applications SET created_at = applied_at WHERE created_at IS NULL');
  }

  if (await columnExists(connection, 'applications', 'status_updated_at')) {
    await connection.query('UPDATE applications SET updated_at = status_updated_at WHERE updated_at IS NULL');
  }
};

const migrateEmployerUsers = async (connection) => {
  const hasEmail = await columnExists(connection, 'employers', 'email');
  const hasPassword = await columnExists(connection, 'employers', 'password');
  const hasUserId = await columnExists(connection, 'employers', 'user_id');

  if (!hasEmail || !hasPassword || !hasUserId) {
    console.log('Skipped employer-user migration (required legacy columns missing).');
    return;
  }

  const [rows] = await connection.query(
    `SELECT id, email, password, company_name
     FROM employers
     WHERE (user_id IS NULL OR user_id = 0) AND email IS NOT NULL AND email <> ''`
  );

  for (const employer of rows) {
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [employer.email]
    );

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      const fallbackPassword = await bcrypt.hash('Employer@123', 10);
      const passwordToUse = employer.password || fallbackPassword;

      const [insertResult] = await connection.query(
        'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
        [employer.email, passwordToUse, 'employer', 'active']
      );
      userId = insertResult.insertId;
    }

    await connection.query('UPDATE employers SET user_id = ? WHERE id = ?', [userId, employer.id]);
  }

  console.log(`Linked ${rows.length} employer account(s) to users table.`);
};

const ensureAdminIndexes = async (connection) => {
  await connection.query('CREATE INDEX idx_employers_user_id ON employers (user_id)');
};

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'shreya123',
    database: dbName,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    multipleStatements: true
  });

  try {
    console.log(`Migrating database ${dbName} for RBAC admin support...`);

    await connection.beginTransaction();

    await createCoreTables(connection);
    await upgradeEmployersTable(connection);
    await upgradeJobsTable(connection);
    await upgradeApplicationsTable(connection);
    await migrateEmployerUsers(connection);

    await connection.commit();
    console.log('RBAC admin migration completed successfully.');
    console.log('Next step: run npm run seed:admin to create a pre-defined admin account.');
  } catch (error) {
    await connection.rollback();
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
};

run();