# KCE Job Portal - Team Integration Guide

## Project Structure Overview

This document provides a guide for all 4 team members to understand the shared codebase structure and how to extend their respective modules without conflicts.

---

## Database Schema (`server/database/schema.sql`)

Use `server/database/schema.sql` as the source of truth for DB setup.

### Central Authentication (ISA Pattern)
```
users (central auth table)
├── students (extends users via user_id)
├── employers (extends users via user_id)
└── admins (extends users via user_id)
```

### Key Relationships
- **jobs** → references `employer_id` (FK to employers)
- **applications** → references `student_id` + `job_id`
- **activity_logs** → tracks all system actions

### Setup Database
```sql
-- Run in MySQL
SOURCE server/database/schema.sql;
```

---

## Backend Structure

### Shared Configuration
- `config/db.js` - Database connection pool
- `middleware/auth.middleware.js` - JWT authentication & role checks

### Controllers by Module
| File | Owner | Purpose |
|------|-------|---------|
| `auth.controller.js` | Member 1 | Register, login, token management |
| `student.controller.js` | Member 2 | Student profile management |
| `job.controller.js` | Member 2 | Public job browsing |
| `application.controller.js` | Member 2 | Student job applications |
| `employer.controller.js` | Member 3 | Employer dashboard, job posting |
| `admin.controller.js` | Member 4 | Admin panel, approvals, reports |

### API Routes
| Prefix | Owner | Auth Required |
|--------|-------|---------------|
| `/api/auth` | Member 1 | No (except /me) |
| `/api/students` | Member 2 | Yes (student) |
| `/api/jobs` | Member 2 | No (public) |
| `/api/applications` | Member 2 | Yes (student) |
| `/api/employer` | Member 3 | Yes (employer) |
| `/api/admin` | Member 4 | Yes (admin) |

### Middleware Usage
```javascript
// Require authentication
router.get('/profile', authenticateToken, controller);

// Require specific role
router.get('/dashboard', authenticateToken, isStudent, controller);
router.post('/jobs', authenticateToken, isEmployer, controller);
router.get('/users', authenticateToken, isAdmin, controller);
```

---

## Frontend Structure

### Shared Components (`src/components/common/`)
- `Navbar.js` - Role-based navigation
- `ProtectedRoute.js` - Route guards with role checking
- `Loading.js` - Loading spinner

### API Service (`src/services/api.js`)
All API calls are centralized:
```javascript
import { authAPI, studentAPI, jobsAPI, applicationsAPI, employerAPI, adminAPI } from '../services/api';

// Examples
await authAPI.login({ email, password });
await studentAPI.getProfile();
await employerAPI.createJob(jobData);
await adminAPI.approveJob(jobId);
```

### Auth Context (`src/context/AuthContext.js`)
```javascript
const { 
  user,           // Current user object
  login,          // Login function
  register,       // Register function
  logout,         // Logout function
  isAuthenticated,// Boolean
  isStudent,      // Function: isStudent()
  isEmployer,     // Function: isEmployer()
  isAdmin,        // Function: isAdmin()
  getDashboardPath // Returns appropriate dashboard URL
} = useAuth();
```

### Pages by Module
| Path | Owner | Component |
|------|-------|-----------|
| `/` | Shared | Home |
| `/login`, `/register` | Member 1 | Login, Register |
| `/dashboard` | Member 2 | Student Dashboard |
| `/jobs`, `/jobs/:id` | Member 2 | Jobs, JobDetails |
| `/applications` | Member 2 | Applications |
| `/profile` | Member 2 | Profile |
| `/employer/*` | Member 3 | Employer pages |
| `/admin/*` | Member 4 | Admin pages |

### Adding New Routes (App.js)
```jsx
// For protected routes with role restriction
<Route
  path="/employer/jobs/new"
  element={
    <ProtectedRoute allowedRoles={['employer']}>
      <CreateJob />
    </ProtectedRoute>
  }
/>
```

---

## Member-Specific Tasks

### Member 1: User Authentication
**Completed:**
- ✅ User registration (student/employer)
- ✅ Login with JWT
- ✅ Password update

**TODO:**
- [ ] Forgot password
- [ ] Email verification
- [ ] Profile picture upload

### Member 2: Student Module
**Completed:**
- ✅ Student dashboard
- ✅ Profile management
- ✅ Job browsing
- ✅ Job applications

**TODO:**
- [ ] Resume upload integration
- [ ] Advanced job filters
- [ ] Application tracking UI

### Member 3: Employer Module
**Completed:**
- ✅ Backend controllers
- ✅ API endpoints
- ✅ Dashboard page (basic)

**TODO:**
- [ ] `/employer/profile` - Company profile page
- [ ] `/employer/jobs` - List posted jobs
- [ ] `/employer/jobs/new` - Create job form
- [ ] `/employer/jobs/:id` - Edit job
- [ ] `/employer/jobs/:id/applications` - View applicants

### Member 4: Admin Panel
**Completed:**
- ✅ Backend controllers
- ✅ API endpoints
- ✅ Dashboard page (basic)

**TODO:**
- [ ] `/admin/users` - User management table
- [ ] `/admin/employers` - Employer verification
- [ ] `/admin/jobs` - Job approval queue
- [ ] `/admin/reports` - Analytics dashboard

---

## Running the Project

### Backend
```bash
cd backend
npm install
npm start  # Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

### Environment Variables
Create `backend/.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=internship_portal
JWT_SECRET=your_jwt_secret_key
```

---

## Git Workflow Recommendations

1. **Each member works on their module folder**
2. **Avoid modifying shared files without team discussion:**
   - `App.js` - Add routes only
   - `api.js` - Add new API methods only
   - `AuthContext.js` - Do not modify
   - `Navbar.js` - Do not modify directly

3. **Branch naming:**
   - `feature/member1-auth-forgot-password`
   - `feature/member2-job-filters`
   - `feature/member3-job-form`
   - `feature/member4-user-management`

---

## Contact Points

- **Auth Issues:** Member 1
- **Database Schema:** Member 1 (coordinate changes)
- **Student/Jobs Issues:** Member 2
- **Employer Issues:** Member 3
- **Admin Issues:** Member 4
