# Unified Job Portal System

## Project Overview
This is a comprehensive Job Portal System that combines Student, Employer, and Admin modules into a unified application.

## Project Structure

```
web_project/
├── client/                     # React Frontend (Unified)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Shared components (Navbar, Loading, etc.)
│   │   │   └── employer/       # Employer-specific components
│   │   ├── pages/              # All pages (Student, Employer, Admin)
│   │   ├── context/            # React Context providers
│   │   ├── services/           # API service functions
│   │   └── styles/             # Global styles
│   └── package.json
├── server/                     # Node.js Backend (Unified)
│   ├── routes/                 # All API routes
│   ├── controllers/            # All controllers
│   ├── middleware/             # Authentication & other middleware
│   ├── database/               # Database schema and setup
│   ├── uploads/                # File upload directory
│   └── package.json
└── student_module/             # Original student module (backup)
```

## Features

### Student Portal
- User authentication and registration
- Job browsing and searching
- Job application management
- Profile management with resume upload
- Dashboard with application tracking

### Employer Portal
- Employer authentication and registration
- Job posting and management
- Application review and management
- Candidate shortlisting
- Dashboard with job statistics

### Admin Portal
- System administration
- User management
- Job moderation
- System analytics

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

### Installation

1. **Clone and setup the project:**
   ```bash
   cd /Users/shreyakhatri/Desktop/web_project
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Database Setup:**
   ```bash
   # Create MySQL database using the schema in server/database/schema.sql
   mysql -u root -p < server/database/schema.sql
   ```

5. **Environment Configuration:**
   Create a `.env` file in the server directory with:
   ```
   PORT=8000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=internship_portal
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

   Create a `.env` file in the client directory with:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev  # For development with nodemon
   # or
   npm start   # For production
   ```

2. **Start the frontend client:**
   ```bash
   cd client
   npm start
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Student Routes (`/api/students`)
- `GET /` - Get all students
- `GET /:id` - Get student by ID
- `PUT /:id` - Update student profile

### Job Routes (`/api/jobs`)
- `GET /` - Get all jobs
- `GET /:id` - Get job by ID
- `POST /` - Create new job (employers only)
- `PUT /:id` - Update job (employers only)
- `DELETE /:id` - Delete job (employers only)

### Application Routes (`/api/applications`)
- `GET /` - Get applications (filtered by user role)
- `POST /` - Submit job application
- `PUT /:id` - Update application status

### Employer Routes (`/api/employer`)
- `GET /jobs` - Get employer's jobs
- `GET /applications` - Get applications for employer's jobs

### Admin Routes (`/api/admin`)
- `GET /users` - Get all users
- `GET /statistics` - Get system statistics

## Database Schema

The unified database includes:
- `users` - Central authentication table
- `students` - Student profile information
- `employers` - Employer profile information  
- `jobs` - Job postings
- `applications` - Job applications
- `admins` - Admin user information

## Technology Stack

### Frontend
- React 19.2.4
- React Router DOM 7.13.0
- Axios for API calls
- CSS3 for styling

### Backend
- Node.js with Express 5.2.1
- MySQL 2 for database
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- CORS for cross-origin requests

## Contributing

This project is structured to support team collaboration:
- Student Module: Member 2
- Employer Module: Member 3  
- Admin Module: Member 4
- Authentication & Core: Member 1

## Deployment

For production deployment:
1. Build the React frontend: `cd client && npm run build`
2. Set NODE_ENV=production in server environment
3. Use PM2 or similar process manager for the Node.js server
4. Set up MySQL database with proper credentials
5. Configure reverse proxy (nginx) if needed

## License

This project is for educational purposes as part of Web Application Programming course.