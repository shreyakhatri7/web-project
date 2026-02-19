# Internship & Job Portal System

A comprehensive, industry-level full-stack web application for connecting students with employers for internships and job opportunities.

## 🚀 Project Overview

This is a professional-grade Internship and Job Portal System built with modern technologies, featuring complete authentication, user management, and role-based access control. The system supports three user types: Students, Employers, and Admins.

## 👥 Team Member 1 - Authentication & Core User Management (COMPLETED)

### ✅ Implemented Features

#### Backend
- ✅ User registration with role selection (Student/Employer/Admin)
- ✅ Secure login/logout with JWT authentication
- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT token generation and verification middleware
- ✅ Role-based authorization middleware
- ✅ Complete user CRUD operations
- ✅ User status management (Active/Inactive/Suspended)
- ✅ Profile management with role-specific fields
- ✅ Input validation with express-validator
- ✅ Comprehensive error handling

#### Frontend
- ✅ Beautiful responsive login page
- ✅ Multi-step signup page with role selection
- ✅ User profile view page
- ✅ Profile editing page with role-specific fields
- ✅ Protected routes with authentication
- ✅ JWT token management
- ✅ Auth context for global state
- ✅ Axios interceptors for API calls
- ✅ Form validation and error handling

#### Database
- ✅ MySQL database with Prisma ORM
- ✅ Users table with role enum (STUDENT/EMPLOYER/ADMIN)
- ✅ Student profile table (ISA pattern)
- ✅ Employer profile table (ISA pattern)
- ✅ Admin profile table (ISA pattern)
- ✅ Proper indexing for performance
- ✅ Cascade delete for referential integrity

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Password Security:** bcrypt
- **Validation:** express-validator
- **CORS:** cors middleware

### Frontend
- **Library:** React 18
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Icons:** React Icons
- **Styling:** Custom CSS with modern gradients

## 📁 Project Structure

```
web_project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── config.js           # App configuration
│   │   │   └── database.js         # Prisma client
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  # Authentication logic
│   │   │   └── user.controller.js  # User management
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js  # JWT & role verification
│   │   │   ├── error.middleware.js # Error handling
│   │   │   └── validation.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js      # Auth endpoints
│   │   │   ├── user.routes.js      # User endpoints
│   │   │   └── index.js
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   └── user.validator.js
│   │   └── server.js               # Entry point
│   ├── prisma/
│   │   └── schema.prisma           # Database schema
│   ├── .env                        # Environment variables
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Home.css
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Auth.css
│   │   │   ├── Profile.js
│   │   │   ├── EditProfile.js
│   │   │   └── Profile.css
│   │   ├── services/
│   │   │   ├── api.js              # Axios instance
│   │   │   └── authService.js      # API service layer
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── .gitignore
│
├── INSTALLATION.md
└── README.md (this file)
```

## 🚀 Getting Started

### Prerequisites

1. **Install Node.js and npm:**
   ```bash
   # Install Homebrew (if not installed)
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Node.js
   brew install node
   
   # Verify installation
   node --version
   npm --version
   ```

2. **Ensure MySQL is running:**
   ```bash
   # Check MySQL status
   mysql --version
   
   # Start MySQL (if needed)
   brew services start mysql
   # OR
   sudo /usr/local/mysql/support-files/mysql.server start
   ```

### Installation Steps

#### 1. Backend Setup

```bash
# Navigate to backend
cd /Users/rajendradahal/Desktop/web_project/backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
# When prompted, enter migration name: "initial_schema"

# Start backend server
npm run dev
```

Backend will run at: `http://localhost:5000`

#### 2. Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd /Users/rajendradahal/Desktop/web_project/frontend

# Install dependencies
npm install

# Start frontend development server
npm start
```

Frontend will run at: `http://localhost:3000`

## 📋 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/logout` | Logout user | Private |
| POST | `/api/auth/change-password` | Change password | Private |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin/Owner |
| PUT | `/api/users/:id` | Update user | Admin/Owner |
| DELETE | `/api/users/:id` | Delete user | Admin/Owner |
| PATCH | `/api/users/:id/status` | Update status | Admin |

### Request Examples

#### Register Student
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Student@123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "university": "ABC University",
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "graduationYear": 2025
  }'
```

#### Register Employer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@company.com",
    "password": "Employer@123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "EMPLOYER",
    "companyName": "Tech Corp",
    "companySize": "51-200",
    "industry": "Technology"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Student@123"
  }'
```

## 🎨 Features

### Security Features
- 🔐 JWT-based authentication with 7-day expiry
- 🔒 Password hashing with bcrypt (10 salt rounds)
- 🛡️ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- 🚫 Protected routes and API endpoints
- 🔄 Automatic token refresh on API calls
- 👤 User status management (Active/Inactive/Suspended)

### User Experience
- 📱 Fully responsive design
- 🎨 Modern gradient UI with smooth animations
- 📝 Real-time form validation
- 💬 Comprehensive error messages
- ⚡ Fast page transitions
- 🔔 Success/error notifications
- 🌐 Clean and intuitive navigation

### Database Design
- 📊 Normalized database schema
- 🔗 ISA (Is-A) relationship for role-based profiles
- 🗂️ Proper indexing for performance
- 🔄 Cascade delete for data integrity
- 📈 Scalable architecture for future features

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://root:suvanjan@7@localhost:3306/internship_job_portal"
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production_2026"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME="Internship & Job Portal"
REACT_APP_VERSION=1.0.0
```

## 🗄️ Database Schema

### Users Table
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, HASHED)
- role (ENUM: STUDENT, EMPLOYER, ADMIN)
- status (ENUM: ACTIVE, INACTIVE, SUSPENDED)
- firstName (VARCHAR)
- lastName (VARCHAR)
- phone (VARCHAR, NULLABLE)
- avatar (TEXT, NULLABLE)
- createdAt (DATETIME)
- updatedAt (DATETIME)
- lastLogin (DATETIME, NULLABLE)
```

### Student Profile (ISA)
```sql
- Academic info (university, degree, major, graduationYear, gpa)
- Professional info (skills, bio, resume, portfolio)
- Social links (linkedIn, github)
- Address information
```

### Employer Profile (ISA)
```sql
- Company info (name, size, industry, website, description, logo)
- Contact person details
- Verification status
- Address information
```

## 🧪 Testing the Application

### 1. Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### 2. Create Test Accounts

**Student Account:**
- Email: test.student@example.com
- Password: Student@123
- Role: STUDENT

**Employer Account:**
- Email: test.employer@company.com
- Password: Employer@123
- Role: EMPLOYER

### 3. Test User Flow
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create an account (Student or Employer)
4. Login with credentials
5. View and edit your profile
6. Test logout functionality

## 🔧 Development Tools

### Useful Commands

**Backend:**
```bash
npm run dev          # Start development server
npm start           # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

**Frontend:**
```bash
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
```

### Database Management
```bash
# Open Prisma Studio (Visual Database Manager)
cd backend
npm run prisma:studio

# View in browser at http://localhost:5555
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### MySQL Connection Issues
```bash
# Check if MySQL is running
ps aux | grep mysql

# Restart MySQL
brew services restart mysql

# Test connection
mysql -u root -p
# Enter password: suvanjan@7
```

### Prisma Issues
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Force regenerate Prisma Client
npx prisma generate --force
```

## 📈 Next Steps (Future Development)

### Member 2 - Job/Internship Posting System
- Job posting creation and management
- Job search and filtering
- Job categories and tags

### Member 3 - Application Management
- Student applications to jobs
- Application status tracking
- Resume/CV upload
- Employer application review

### Member 4 - Admin Dashboard & Analytics
- User management dashboard
- System analytics and reports
- Job statistics
- User activity monitoring

## 📝 Code Quality

- ✅ Clean and organized code structure
- ✅ Comprehensive comments and documentation
- ✅ Error handling at all levels
- ✅ Input validation and sanitization
- ✅ Security best practices
- ✅ RESTful API design
- ✅ Reusable components
- ✅ Responsive design

## 🤝 Contributing

This is a team project. Each member should:
1. Work on their assigned module
2. Follow the established code structure
3. Maintain consistent coding style
4. Test thoroughly before committing
5. Document their code properly

## 📄 License

This is an academic project for educational purposes.

## 👨‍💻 Developer Notes

### Important Files
- **Backend Entry:** `/backend/src/server.js`
- **Frontend Entry:** `/frontend/src/index.js`
- **Database Schema:** `/backend/prisma/schema.prisma`
- **API Routes:** `/backend/src/routes/`
- **Auth Logic:** `/backend/src/controllers/auth.controller.js`

### API Base URLs
- **Development Backend:** http://localhost:5000/api
- **Development Frontend:** http://localhost:3000

### Database
- **Database Name:** internship_job_portal
- **Username:** root
- **Password:** suvanjan@7
- **Host:** localhost:3306

## 🎯 Project Status

**Member 1 (Authentication & User Management): ✅ COMPLETED**
- All backend APIs implemented and tested
- All frontend pages created and functional
- Database schema designed and deployed
- Full authentication flow working
- Profile management operational

**Ready for Member 2, 3, and 4 to continue!**

## 📞 Support

For issues or questions:
1. Check the INSTALLATION.md file
2. Review the backend/README.md
3. Check console for error messages
4. Verify all environment variables are set
5. Ensure both servers are running

---

**Built with ❤️ for industry-level quality**
