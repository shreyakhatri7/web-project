const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const requiredEnv = ['ADMIN_EMAIL', 'ADMIN_PASSWORD'];

const getMissingEnv = () => {
  return requiredEnv.filter((key) => !process.env[key]);
};

const buildPermissions = () => {
  if (!process.env.ADMIN_PERMISSIONS) {
    return [
      'manage_users',
      'manage_jobs',
      'manage_employers',
      'view_reports'
    ];
  }

  return process.env.ADMIN_PERMISSIONS
    .split(',')
    .map((permission) => permission.trim())
    .filter(Boolean);
};

const seedAdmin = async () => {
  const missingEnv = getMissingEnv();
  if (missingEnv.length > 0) {
    console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'shreya123',
    database: process.env.DB_NAME || 'internship_portal',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const firstName = process.env.ADMIN_FIRST_NAME || 'System';
    const lastName = process.env.ADMIN_LAST_NAME || 'Admin';
    const phone = process.env.ADMIN_PHONE || null;
    const permissions = JSON.stringify(buildPermissions());

    await connection.beginTransaction();

    const [existingUsers] = await connection.query(
      'SELECT id, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    let userId;

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      if (existingUser.role !== 'admin') {
        throw new Error(`Email ${email} already exists with role ${existingUser.role}. Cannot promote automatically.`);
      }

      await connection.query(
        'UPDATE users SET password = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, 'active', existingUser.id]
      );

      userId = existingUser.id;
    } else {
      const [userResult] = await connection.query(
        'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, 'admin', 'active']
      );

      userId = userResult.insertId;
    }

    const [adminProfiles] = await connection.query(
      'SELECT id FROM admins WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (adminProfiles.length > 0) {
      await connection.query(
        `UPDATE admins
         SET first_name = ?, last_name = ?, phone = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [firstName, lastName, phone, permissions, userId]
      );
    } else {
      await connection.query(
        'INSERT INTO admins (user_id, first_name, last_name, phone, permissions) VALUES (?, ?, ?, ?, ?)',
        [userId, firstName, lastName, phone, permissions]
      );
    }

    await connection.commit();

    console.log('Admin account seeded successfully.');
    console.log(`Email: ${email}`);
    console.log('Role: admin');
    console.log(`Dashboard: ${process.env.CLIENT_ADMIN_DASHBOARD || '/admin/dashboard'}`);
  } catch (error) {
    await connection.rollback();
    console.error('Failed to seed admin account:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
};

seedAdmin();
