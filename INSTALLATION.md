# Installation Guide - Internship & Job Portal System

## Prerequisites Installation

### 1. Install Homebrew (macOS Package Manager)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js and npm
```bash
brew install node
```

Verify installation:
```bash
node --version
npm --version
```

### 3. Verify MySQL Installation
MySQL Workbench is already installed. Ensure MySQL server is running:
```bash
mysql --version
```

If MySQL is not running, start it:
```bash
brew services start mysql
```

Or if installed differently:
```bash
sudo /usr/local/mysql/support-files/mysql.server start
```

## Backend Setup

1. **Navigate to backend directory:**
```bash
cd /Users/rajendradahal/Desktop/web_project/backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Verify .env file is configured:**
```bash
cat .env
```
Should show:
```
DATABASE_URL="mysql://root:suvanjan@7@localhost:3306/internship_job_portal"
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production_2026"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

4. **Generate Prisma Client:**
```bash
npm run prisma:generate
```

5. **Create database and run migrations:**
```bash
npm run prisma:migrate
```
When prompted, name your migration: `initial_schema`

6. **Start the backend server:**
```bash
npm run dev
```

The backend will be available at: `http://localhost:5000`

## Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd /Users/rajendradahal/Desktop/web_project/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the frontend development server:**
```bash
npm start
```

The frontend will be available at: `http://localhost:3000`

## Testing the Setup

### 1. Test Backend Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-16T..."
}
```

### 2. Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@student.com",
    "password": "Student@123",
    "firstName": "Test",
    "lastName": "User",
    "role": "STUDENT"
  }'
```

### 3. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@student.com",
    "password": "Student@123"
  }'
```

## Troubleshooting

### MySQL Connection Issues

1. **Check if MySQL is running:**
```bash
ps aux | grep mysql
```

2. **Test MySQL connection:**
```bash
mysql -u root -p
```
Enter password: `suvanjan@7`

3. **Create database manually if needed:**
```sql
CREATE DATABASE internship_job_portal;
```

### Port Already in Use

If port 5000 or 3000 is already in use:

**Backend:**
Change `PORT` in `/Users/rajendradahal/Desktop/web_project/backend/.env`

**Frontend:**
Set `PORT=3001` before starting:
```bash
PORT=3001 npm start
```

### Prisma Issues

**Clear Prisma cache and regenerate:**
```bash
npx prisma generate --force
```

**Reset database (WARNING: Deletes all data):**
```bash
npx prisma migrate reset
```

## Quick Start (After Prerequisites)

```bash
# Terminal 1 - Backend
cd /Users/rajendradahal/Desktop/web_project/backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Terminal 2 - Frontend
cd /Users/rajendradahal/Desktop/web_project/frontend
npm install
npm start
```

## Default URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health
- **Prisma Studio:** Run `npm run prisma:studio` in backend directory

## Next Steps

1. Open http://localhost:3000 in your browser
2. Register a new user account
3. Login with your credentials
4. View and edit your profile

## Support

If you encounter any issues:
1. Check that all prerequisites are installed
2. Verify MySQL is running and accessible
3. Ensure ports 3000 and 5000 are not in use
4. Check the console for error messages
