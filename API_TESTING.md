# API Testing Guide

Complete guide for testing all API endpoints using curl, Postman, or any HTTP client.

## Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /auth/register`

**Student Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@student.com",
    "password": "Student@123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "STUDENT",
    "university": "Stanford University",
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "graduationYear": 2025
  }'
```

**Employer Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@techcorp.com",
    "password": "Employer@123",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1987654321",
    "role": "EMPLOYER",
    "companyName": "Tech Corp Inc",
    "companySize": "51-200",
    "industry": "Technology"
  }'
```

**Admin Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@portal.com",
    "password": "Admin@123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@student.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "status": "ACTIVE",
      "createdAt": "2026-02-16T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

**Endpoint:** `POST /auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@student.com",
    "password": "Student@123"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@student.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "status": "ACTIVE",
      "studentProfile": { ... }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User

**Endpoint:** `GET /auth/me`

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@student.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "avatar": null,
      "role": "STUDENT",
      "status": "ACTIVE",
      "createdAt": "2026-02-16T...",
      "updatedAt": "2026-02-16T...",
      "lastLogin": "2026-02-16T...",
      "studentProfile": {
        "university": "Stanford University",
        "degree": "Bachelor of Science",
        "major": "Computer Science",
        "graduationYear": 2025,
        "gpa": null,
        "skills": null,
        "bio": null,
        "resume": null,
        "portfolio": null,
        "linkedIn": null,
        "github": null,
        "address": null,
        "city": null,
        "state": null,
        "country": null,
        "zipCode": null
      }
    }
  }
}
```

### 4. Logout

**Endpoint:** `POST /auth/logout`

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful."
}
```

### 5. Change Password

**Endpoint:** `POST /auth/change-password`

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Student@123",
    "newPassword": "NewPassword@123"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

## 👥 User Management Endpoints

### 6. Get All Users (Admin Only)

**Endpoint:** `GET /users`

```bash
# Get all users
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# With filters
curl -X GET "http://localhost:5000/api/users?role=STUDENT&status=ACTIVE&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/users?search=john" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Query Parameters:**
- `role` - Filter by role (STUDENT, EMPLOYER, ADMIN)
- `status` - Filter by status (ACTIVE, INACTIVE, SUSPENDED)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in email, firstName, lastName

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "john.doe@student.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "role": "STUDENT",
        "status": "ACTIVE",
        "createdAt": "2026-02-16T...",
        "lastLogin": "2026-02-16T..."
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### 7. Get User by ID

**Endpoint:** `GET /users/:id`

```bash
curl -X GET http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@student.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "avatar": null,
      "role": "STUDENT",
      "status": "ACTIVE",
      "createdAt": "2026-02-16T...",
      "updatedAt": "2026-02-16T...",
      "lastLogin": "2026-02-16T...",
      "studentProfile": { ... }
    }
  }
}
```

### 8. Update User Profile

**Endpoint:** `PUT /users/:id`

**Update Student Profile:**
```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "university": "MIT",
    "degree": "Master of Science",
    "major": "Artificial Intelligence",
    "graduationYear": 2026,
    "gpa": 3.8,
    "skills": "[\"JavaScript\", \"Python\", \"React\", \"Node.js\", \"Machine Learning\"]",
    "bio": "Passionate software developer with focus on AI and web technologies",
    "linkedIn": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.dev",
    "city": "San Francisco",
    "state": "California",
    "country": "USA",
    "zipCode": "94105"
  }'
```

**Update Employer Profile:**
```bash
curl -X PUT http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1987654321",
    "companyName": "Tech Corp Inc",
    "companySize": "201-500",
    "industry": "Software Development",
    "website": "https://techcorp.com",
    "description": "Leading software company specializing in enterprise solutions",
    "contactPerson": "Jane Smith",
    "position": "HR Manager",
    "city": "New York",
    "state": "New York",
    "country": "USA",
    "zipCode": "10001"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "user": { ... }
  }
}
```

### 9. Delete User

**Endpoint:** `DELETE /users/:id`

```bash
curl -X DELETE http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

### 10. Update User Status (Admin Only)

**Endpoint:** `PATCH /users/:id/status`

```bash
# Suspend user
curl -X PATCH http://localhost:5000/api/users/1/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUSPENDED"
  }'

# Reactivate user
curl -X PATCH http://localhost:5000/api/users/1/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACTIVE"
  }'
```

**Valid Status Values:**
- `ACTIVE` - User can login and use the system
- `INACTIVE` - User cannot login
- `SUSPENDED` - User account is suspended

**Success Response (200):**
```json
{
  "success": true,
  "message": "User status updated successfully.",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@student.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "SUSPENDED"
    }
  }
}
```

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Please provide a valid email address",
    "password": "Password must be at least 8 characters long"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

```json
{
  "success": false,
  "message": "Invalid token."
}
```

```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource."
}
```

```json
{
  "success": false,
  "message": "Account is not active. Please contact support."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found."
}
```

```json
{
  "success": false,
  "message": "Route not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 🧪 Testing Workflow

### Complete User Journey Test

1. **Register as Student**
2. **Login**
3. **Get Current User Info**
4. **Update Profile**
5. **Change Password**
6. **Logout**

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@student.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User",
    "role": "STUDENT"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"

# 2. Get profile
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Update profile
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "bio": "This is my updated bio"
  }'

# 4. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Postman Collection

Import this collection into Postman for easy testing:

1. Open Postman
2. Click "Import"
3. Create new collection: "Internship Portal API"
4. Add requests for each endpoint above
5. Set up environment variables:
   - `baseUrl`: http://localhost:5000/api
   - `token`: (automatically set after login)

## 🔑 Authorization Header

For all protected endpoints, include the JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 💡 Tips

1. **Save the token** after login/register for subsequent requests
2. **Check token expiry** - tokens expire after 7 days
3. **Use Postman environments** for different users (student, employer, admin)
4. **Test error cases** - invalid tokens, missing fields, wrong permissions
5. **Monitor backend console** for detailed error logs

## 🐛 Common Issues

**Invalid Token:**
- Make sure to include "Bearer " prefix
- Check token hasn't expired
- Verify you're using the correct token

**403 Forbidden:**
- Check user has correct role for the endpoint
- Verify user status is ACTIVE

**Validation Errors:**
- Review required fields
- Check password requirements
- Verify email format

---

**Happy Testing! 🚀**
