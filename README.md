# Internship & Job Portal System - Employer Module

This project implements a complete Employer Module for an Internship and Job Portal System with both backend and frontend components.

## 🚀 Features Implemented

### Backend Features
- ✅ Employer Authentication (Login/Register)
- ✅ JWT-based authentication middleware
- ✅ Post, edit, and delete job postings
- ✅ Manage job vacancies and status
- ✅ View all applicants for jobs
- ✅ Accept/Reject applications (status management)
- ✅ Employer profile management
- ✅ Dashboard with statistics
- ✅ Complete CRUD operations for jobs table
- ✅ Application status updates

### Frontend Features
- ✅ Employer Dashboard with statistics
- ✅ Post Job Form with validation
- ✅ Manage Jobs page with filtering
- ✅ Applicants list with status management
- ✅ Status update buttons for applications
- ✅ Responsive design for all screen sizes
- ✅ Professional UI with modern styling

### Database Schema
- ✅ Employers table with company information
- ✅ Jobs table with full job details
- ✅ Applications table with applicant information
- ✅ Proper foreign key relationships
- ✅ Sample data included

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Database Setup

1. Start your MySQL server
2. Create a database named `internship_portal`
3. Update database credentials in `/server/config/db.js`
4. Run the schema file:
   ```bash
   mysql -u root -p internship_portal < server/database/schema.sql
   ```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm start
# or for development with auto-restart
npm run dev
```

The server will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the React development server
npm start
```

The client will run on `http://localhost:3000`

## 🎯 Usage Guide

### 1. Access the Application
- Open `http://localhost:3000` in your browser
- Click "Enter Employer Portal"

### 2. Employer Registration/Login
- **Register**: Create a new employer account with company details
- **Login**: Use existing credentials to access the dashboard

### 3. Dashboard Features
- View statistics (total jobs, active jobs, applications, pending reviews)
- Quick overview of recent job posts and applications

### 4. Job Management
- **Post Job**: Create new job postings with detailed information
- **Manage Jobs**: View, edit, delete, and update job status
- **Filter Jobs**: Filter by status (All, Active, Inactive)

### 5. Applicant Management
- View all applications across all jobs
- Filter by job and application status
- Update application status (Pending, Shortlisted, Accepted, Rejected)
- Contact applicants directly via email

## 🗂️ Project Structure

```
web_project/
├── server/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   └── employerController.js # All employer-related logic
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication
│   ├── routes/
│   │   └── employerRoutes.js     # API endpoints
│   ├── database/
│   │   └── schema.sql            # Database schema & sample data
│   ├── package.json
│   └── index.js                  # Server entry point
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── employer/
│   │   │       ├── EmployerApp.js       # Main employer application
│   │   │       ├── EmployerAuth.js      # Login/Register component
│   │   │       ├── EmployerDashboard.js # Dashboard with stats
│   │   │       ├── PostJobForm.js       # Job posting form
│   │   │       ├── ManageJobs.js        # Job management
│   │   │       ├── ApplicantsList.js    # Applicant management
│   │   │       └── *.css                # Component styles
│   │   ├── App.js                # Main app with routing
│   │   └── App.css               # Global styles
│   └── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/employer/register` - Register new employer
- `POST /api/employer/login` - Employer login

### Profile Management
- `GET /api/employer/profile` - Get employer profile
- `PUT /api/employer/profile` - Update employer profile

### Job Management
- `POST /api/employer/jobs` - Create new job
- `GET /api/employer/jobs` - Get all employer's jobs
- `GET /api/employer/jobs/:jobId` - Get specific job details
- `PUT /api/employer/jobs/:jobId` - Update job
- `DELETE /api/employer/jobs/:jobId` - Delete job

### Application Management
- `GET /api/employer/applicants` - Get all applications
- `GET /api/employer/jobs/:jobId/applicants` - Get job-specific applicants
- `PUT /api/employer/applications/:applicationId/status` - Update application status

### Dashboard
- `GET /api/employer/dashboard/stats` - Get dashboard statistics

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, smooth transitions, and animations
- **Status Indicators**: Color-coded status for jobs and applications
- **Loading States**: User-friendly loading and error messages
- **Form Validation**: Client-side and server-side validation
- **Navigation**: Intuitive navigation with active link highlighting

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- Input validation and sanitization
- CORS configuration for cross-origin requests

## 📊 Sample Data

The database comes with sample data including:
- 2 sample employer accounts
- 3 sample job postings
- 4 sample job applications

## 🚧 Future Enhancements

- Email notifications for application status changes
- File upload for company logos and applicant resumes
- Advanced filtering and search capabilities
- Analytics and reporting features
- Real-time notifications
- Bulk operations for managing applications

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `server/config/db.js`
   - Verify database exists

2. **Port Already in Use**
   - Backend: Change port in `server/index.js`
   - Frontend: Kill existing process or use different port

3. **CORS Issues**
   - Ensure CORS is configured in `server/index.js`
   - Check API base URLs in frontend components

4. **Authentication Issues**
   - Clear localStorage and refresh
   - Check JWT_SECRET configuration
   - Verify token format in requests

## 📝 Testing

### Manual Testing Steps

1. **Registration Flow**
   - Register new employer account
   - Verify all fields save correctly

2. **Job Management**
   - Post new job with all details
   - Edit existing job
   - Change job status
   - Delete job (with confirmation)

3. **Application Management**
   - View applicants list
   - Filter by job and status
   - Update application status
   - Contact applicant functionality

4. **Dashboard**
   - Verify statistics accuracy
   - Check recent items display
   - Test navigation links

## 👨‍💻 Developer Notes

- All components are fully functional and tested
- Code follows React best practices and hooks
- CSS uses modern features like Grid and Flexbox
- API responses include proper error handling
- Database schema includes proper constraints and relationships

---

**Project by**: Member 3 - Employer Module Implementation  
**Date**: February 2026  
**Status**: Complete ✅