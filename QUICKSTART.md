# Internship & Job Portal - Quick Reference

## 🚀 Quick Start

### First Time Setup
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh

# Run database migrations
cd backend
npm run prisma:migrate
# Enter migration name: initial_schema
```

### Daily Development

**Option 1: Manual Start (Recommended for Development)**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

**Option 2: Automatic Start**
```bash
# Make start script executable (first time only)
chmod +x start.sh

# Run both servers
./start.sh
```

## 📋 Common Commands

### Backend
```bash
cd backend

# Development
npm run dev                  # Start with auto-reload
npm start                    # Start production

# Database
npm run prisma:generate      # Generate Prisma Client
npm run prisma:migrate       # Run migrations
npm run prisma:studio        # Open database GUI (localhost:5555)

# Check status
curl http://localhost:5000/api/health
```

### Frontend
```bash
cd frontend

# Development
npm start                    # Start dev server (localhost:3000)
npm run build               # Build for production
```

## 🧪 Test Accounts

Create these test accounts to test all features:

### Student Account
```json
{
  "email": "student@test.com",
  "password": "Student@123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "university": "Test University",
  "major": "Computer Science"
}
```

### Employer Account
```json
{
  "email": "employer@test.com",
  "password": "Employer@123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "EMPLOYER",
  "companyName": "Test Company Inc"
}
```

### Admin Account
```json
{
  "email": "admin@test.com",
  "password": "Admin@123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN"
}
```

## 🔧 Troubleshooting

### MySQL Not Running
```bash
# Start MySQL
brew services start mysql

# Check status
brew services list | grep mysql
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Clear and Rebuild
```bash
# Backend
cd backend
rm -rf node_modules
npm install
npm run prisma:generate

# Frontend
cd frontend
rm -rf node_modules
npm install
```

### Database Reset (WARNING: Deletes all data!)
```bash
cd backend
npx prisma migrate reset
npm run prisma:migrate
```

## 📝 API Quick Test

```bash
# Health Check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","firstName":"Test","lastName":"User","role":"STUDENT"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

## 🎯 User Flows to Test

### Student Flow
1. Register as Student → Login → View Profile → Edit Profile → Add Skills → Logout

### Employer Flow
1. Register as Employer → Login → View Profile → Edit Company Info → Logout

### Admin Flow
1. Register as Admin → Login → View All Users → Manage User Status → Logout

## 🔗 Important URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Health:** http://localhost:5000/api/health
- **Prisma Studio:** http://localhost:5555 (after running `npm run prisma:studio`)

## 📚 Project Structure Quick Reference

```
backend/src/
  ├── controllers/     # Business logic
  ├── middlewares/     # Auth, validation, errors
  ├── routes/          # API endpoints
  ├── validators/      # Input validation rules
  └── config/          # Configuration

frontend/src/
  ├── components/      # Reusable UI components
  ├── pages/           # Page components
  ├── context/         # React Context (Auth)
  └── services/        # API service layer
```

## ⚡ Performance Tips

1. Keep both servers running during development
2. Use Prisma Studio for quick database checks
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. Use React DevTools for component debugging

## 🎨 UI Features

- Modern gradient design
- Fully responsive (mobile, tablet, desktop)
- Smooth animations
- Real-time form validation
- Toast notifications
- Loading states
- Error handling

## 🔐 Security Notes

- Passwords are hashed with bcrypt
- JWT tokens expire in 7 days
- Protected routes require authentication
- Role-based access control
- Input validation on all endpoints
- SQL injection protection via Prisma

## 📞 Need Help?

1. Check README.md for full documentation
2. Check INSTALLATION.md for setup issues
3. Check backend/README.md for API details
4. Review error messages in console
5. Verify environment variables in .env files

---

**Last Updated:** February 16, 2026
**Status:** Member 1 Complete ✅
