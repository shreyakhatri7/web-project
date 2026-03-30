# Internship & Job Portal - Backend

Industry-level backend API for Internship and Job Portal System with authentication and user management.

## Tech Stack

- **Node.js** with Express.js
- **MySQL** Database
- **Prisma ORM** for database management
- **JWT** for authentication
- **Bcrypt** for password hashing

## Features

### Authentication System
- ✅ User registration (Student/Employer/Admin roles)
- ✅ Login with JWT tokens
- ✅ Logout functionality
- ✅ Password hashing with bcrypt
- ✅ Change password
- ✅ Get current user profile

### User Management
- ✅ CRUD operations for user profiles
- ✅ Role-based access control (RBAC)
- ✅ User status management (Active/Inactive/Suspended)
- ✅ Profile updates based on user role
- ✅ Admin user management

### Security
- ✅ JWT authentication middleware
- ✅ Role-based authorization
- ✅ Password strength validation
- ✅ Input validation with express-validator
- ✅ Error handling middleware

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js           # Application configuration
│   │   └── database.js         # Prisma client initialization
│   ├── controllers/
│   │   ├── auth.controller.js  # Authentication logic
│   │   └── user.controller.js  # User management logic
│   ├── middlewares/
│   │   ├── auth.middleware.js  # JWT & role verification
│   │   ├── error.middleware.js # Error handling
│   │   └── validation.middleware.js # Request validation
│   ├── routes/
│   │   ├── auth.routes.js      # Auth endpoints
│   │   ├── user.routes.js      # User endpoints
│   │   └── index.js            # Route aggregator
│   ├── validators/
│   │   ├── auth.validator.js   # Auth validation rules
│   │   └── user.validator.js   # User validation rules
│   └── server.js               # Application entry point
├── prisma/
│   └── schema.prisma           # Database schema
├── .env                        # Environment variables
├── .env.example                # Environment template
├── .gitignore
└── package.json
```

## Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update database credentials:
     ```
     DATABASE_URL="mysql://root:suvanjan@7@localhost:3306/internship_job_portal"
     ```

3. **Setup database with Prisma**
```bash
# Generate Prisma Client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

4. **Start the server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| POST | `/logout` | Logout user | Private |
| POST | `/change-password` | Change password | Private |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all users | Admin |
| GET | `/:id` | Get user by ID | Admin/Owner |
| PUT | `/:id` | Update user profile | Admin/Owner |
| DELETE | `/:id` | Delete user | Admin/Owner |
| PATCH | `/:id/status` | Update user status | Admin |

## Request Examples

### Register User

**Student Registration:**
```json
POST /api/auth/register
{
  "email": "student@example.com",
  "password": "Student@123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "STUDENT",
  "university": "ABC University",
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "graduationYear": 2025
}
```

**Employer Registration:**
```json
POST /api/auth/register
{
  "email": "employer@company.com",
  "password": "Employer@123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "role": "EMPLOYER",
  "companyName": "Tech Corp",
  "companySize": "51-200",
  "industry": "Technology"
}
```

### Login

```json
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "Student@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "email": "student@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "status": "ACTIVE"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Update Profile

```json
PUT /api/users/1
Headers: Authorization: Bearer <token>

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "university": "XYZ University",
  "bio": "Passionate software developer",
  "skills": "[\"JavaScript\", \"React\", \"Node.js\"]",
  "linkedIn": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe"
}
```

## Database Schema

### Users Table
- Basic user information (email, password, name, phone)
- Role: STUDENT, EMPLOYER, ADMIN
- Status: ACTIVE, INACTIVE, SUSPENDED
- Timestamps and last login tracking

### Student Profile
- Academic information (university, degree, major, GPA)
- Professional details (skills, bio, resume, portfolio)
- Social links (LinkedIn, GitHub)
- Address information

### Employer Profile
- Company details (name, size, industry, website)
- Contact information
- Verification status
- Address information

### Admin Profile
- Department and permissions

## Security Features

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

2. **JWT Token:**
   - Expires in 7 days (configurable)
   - Stored in client (localStorage/cookies)
   - Validated on protected routes

3. **Role-Based Access:**
   - Student: Own profile access
   - Employer: Own profile access
   - Admin: Full system access

## Error Handling

All errors return consistent format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {} // Validation errors if applicable
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

### Environment Variables

```env
DATABASE_URL="mysql://root:password@localhost:3306/internship_job_portal"
JWT_SECRET="your_super_secret_jwt_key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## Testing API

Use tools like:
- **Postman** or **Insomnia** for API testing
- **Prisma Studio** for database visualization
- **Thunder Client** (VS Code extension)

## Next Steps

After Member 1 (Authentication & User Management), the system can be extended with:
- Member 2: Job/Internship Posting System
- Member 3: Application Management
- Member 4: Admin Dashboard & Analytics

## Support

For issues or questions, refer to the project documentation or contact the development team.
