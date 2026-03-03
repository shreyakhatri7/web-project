# 🚂 Railway.app Database Setup Guide

Follow these steps to set up your MySQL database on Railway.app for team sharing:

## Step 1: Create Railway.app Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Create a new project

## Step 2: Add MySQL Database
1. In your Railway project dashboard
2. Click "New Service" → "Database" → "MySQL"
3. Wait for deployment (usually 1-2 minutes)

## Step 3: Get Database Credentials
1. Click on your MySQL service
2. Go to "Variables" tab
3. Copy the following values:
   - `MYSQL_HOST` (or similar)
   - `MYSQL_PORT` 
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

## Step 4: Update Your .env File
Replace the values in `/server/.env` with your Railway credentials:

```env
# Railway.app Database Configuration
DB_HOST=your-mysql-host.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-generated-password
DB_NAME=railway
DB_SSL=true

JWT_SECRET=your-super-secret-jwt-key
PORT=8000
```

## Step 5: Import Database Schema
1. Download a MySQL client like [MySQL Workbench](https://www.mysql.com/products/workbench/)
2. Connect using your Railway database credentials
3. Run the SQL from `/server/database/schema.sql`

**OR** Use Railway's built-in query editor:
1. Go to your MySQL service → "Query" tab
2. Copy and paste the contents of `/server/database/schema.sql`
3. Execute the queries

## Step 6: Share with Team
1. In Railway project settings
2. Go to "Members" tab
3. Add team members' emails
4. They can access the same database

## Step 7: Environment Variables (Optional)
For production deployment, you can set environment variables directly in Railway:
1. Go to your Node.js service (if deployed)
2. "Variables" tab
3. Add all your environment variables

## Database Connection String Format
```
mysql://username:password@host:port/database
```

Example:
```
mysql://root:password123@containers-us-west-xyz.railway.app:3306/railway
```

## Troubleshooting
- **Connection timeout**: Increase timeout values in db.js
- **SSL errors**: Make sure `DB_SSL=true` for Railway
- **Port issues**: Railway MySQL usually uses port 3306
- **Database name**: Railway often uses 'railway' as the default database name

Your database will be accessible 24/7 and can be shared with your entire team!