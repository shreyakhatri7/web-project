# 🎓 Student Guide - Internship & Job Portal System

A beginner-friendly guide to understand and run your project.

---

## 📖 What Is This Project?

This is a **professional job portal website** where:
- **Students** can register, create profiles, and apply for jobs
- **Employers** can post jobs and find candidates
- **Admins** can manage the entire system

---

## 🏗️ Project Architecture (Simple Explanation)

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR COMPUTER                          │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   FRONTEND   │◄───────►│   BACKEND    │                │
│  │   (React)    │         │   (Node.js)  │                │
│  │              │         │              │                │
│  │ Port: 3000   │         │ Port: 5000   │                │
│  │              │         │      │       │                │
│  │ What you see │         │      ▼       │                │
│  │ in browser   │         │  ┌────────┐  │                │
│  └──────────────┘         │  │ MySQL  │  │                │
│                           │  │Database│  │                │
│                           │  └────────┘  │                │
│                           └──────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Simple Terms:
- **Frontend** = What you see (buttons, forms, colors)
- **Backend** = The brain (handles login, saves data)
- **Database** = Storage room (keeps user info, passwords)

---

## 📁 Folder Structure (What's Inside?)

```
web_project/
│
├── 📂 backend/              ← Server-side code (Node.js)
│   ├── 📂 src/
│   │   ├── 📂 config/       ← Settings (database, JWT)
│   │   ├── 📂 controllers/  ← What happens when you click a button
│   │   ├── 📂 middlewares/  ← Security guards (check if you're logged in)
│   │   ├── 📂 routes/       ← URLs (/login, /register, etc.)
│   │   ├── 📂 validators/   ← Check if data is correct
│   │   └── 📄 server.js     ← Main backend file
│   │
│   ├── 📂 prisma/
│   │   └── 📄 schema.prisma ← Database design
│   │
│   ├── 📄 .env              ← Secret settings (passwords, keys)
│   └── 📄 package.json      ← List of tools needed
│
├── 📂 frontend/             ← What you see in browser (React)
│   ├── 📂 public/
│   │   └── 📄 index.html    ← Main HTML file
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/   ← Reusable pieces (Navbar, buttons)
│   │   ├── 📂 context/      ← Share login status everywhere
│   │   ├── 📂 pages/        ← Different pages (Login, Profile, Home)
│   │   ├── 📂 services/     ← Talk to backend (send/receive data)
│   │   ├── 📄 App.js        ← Main React component
│   │   └── 📄 index.js      ← Starting point
│   │
│   └── 📄 package.json      ← List of tools needed
│
├── 📄 README.md             ← Full project explanation
├── 📄 INSTALLATION.md       ← How to install everything
├── 📄 QUICKSTART.md         ← Quick commands reference
├── 📄 API_TESTING.md        ← How to test the API
└── 📄 DELIVERY_SUMMARY.md   ← What's completed
```

---

## 🚀 Step-by-Step: How to Run

### Step 1: Install Node.js (If Not Installed)

```bash
# Open Terminal and type:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js:
brew install node

# Check if installed:
node --version
npm --version
```

### Step 2: Check MySQL

```bash
# Make sure MySQL is running:
mysql --version

# If not running, start it:
brew services start mysql
```

### Step 3: Setup Backend

```bash
# Go to backend folder:
cd /Users/rajendradahal/Desktop/web_project/backend

# Install packages (this takes a few minutes):
npm install

# Create database tables:
npm run prisma:generate
npm run prisma:migrate
# When asked for migration name, type: initial_setup

# Start backend server:
npm run dev
```

**✅ You should see:** "Server running on port 5000"

### Step 4: Setup Frontend (Open NEW Terminal)

```bash
# Go to frontend folder:
cd /Users/rajendradahal/Desktop/web_project/frontend

# Install packages:
npm install

# Start frontend server:
npm start
```

**✅ You should see:** Browser opens at http://localhost:3000

---

## 🌐 How to Use the Application

### 1️⃣ Register an Account

1. Open http://localhost:3000
2. Click "Sign Up"
3. Choose your role:
   - **Student** - if you're looking for jobs
   - **Employer** - if you're hiring
4. Fill in the form
5. Click "Create Account"

### 2️⃣ Login

1. Click "Sign In"
2. Enter your email and password
3. Click "Sign In"

### 3️⃣ View Your Profile

1. After login, click your name in the top navbar
2. Or click "View Profile" button

### 4️⃣ Edit Your Profile

1. On profile page, click "Edit Profile"
2. Update your information
3. Click "Save Changes"

---

## 🔑 Important Files to Remember

### Backend
- **server.js** - Starts the backend server
- **schema.prisma** - Database design
- **.env** - Contains passwords and secret keys

### Frontend
- **App.js** - Main application component
- **Login.js** - Login page
- **Register.js** - Registration page
- **Profile.js** - User profile page

---

## 🎨 What Each Technology Does

| Technology | Purpose | Example |
|------------|---------|---------|
| **React** | Build user interface | Buttons, forms, pages you see |
| **Node.js** | Run JavaScript on server | Handle login, save data |
| **Express** | Create API endpoints | Routes like /login, /register |
| **MySQL** | Store data | Save users, passwords, profiles |
| **Prisma** | Talk to database | Easy way to save/read data |
| **JWT** | Keep you logged in | Token that remembers you |
| **bcrypt** | Secure passwords | Encrypt passwords before saving |

---

## 🔐 How Authentication Works (Simple)

```
1. You Register
   ↓
   Password gets encrypted (no one can read it)
   ↓
   Saved in database
   
2. You Login
   ↓
   Backend checks if email exists
   ↓
   Compares encrypted passwords
   ↓
   If correct, gives you a TOKEN (like a ticket)
   
3. You Visit Profile
   ↓
   Send TOKEN with request
   ↓
   Backend checks TOKEN
   ↓
   If valid, shows your profile
```

---

## 🗄️ Database Tables Explained

### Users Table
Stores basic info about everyone:
- Email
- Password (encrypted)
- Name
- Role (Student/Employer/Admin)
- Status (Active/Inactive)

### Student Profile Table
Extra info for students:
- University
- Degree
- Major
- GPA
- Skills
- LinkedIn, GitHub links

### Employer Profile Table
Extra info for employers:
- Company name
- Industry
- Company size
- Website
- Description

---

## 🐛 Common Problems & Solutions

### Problem 1: "npm: command not found"
**Solution:** Install Node.js first (see Step 1 above)

### Problem 2: "Port 3000 already in use"
**Solution:** 
```bash
# Kill the process on port 3000:
lsof -ti:3000 | xargs kill -9

# Then try starting again:
npm start
```

### Problem 3: "Cannot connect to MySQL"
**Solution:**
```bash
# Start MySQL:
brew services start mysql

# Or check if it's running:
brew services list | grep mysql
```

### Problem 4: Backend not starting
**Solution:**
```bash
# Make sure you're in backend folder:
cd backend

# Try installing again:
npm install

# Then start:
npm run dev
```

---

## 📱 Testing Your Application

### Create Test Accounts:

**Student Account:**
- Email: `student@test.com`
- Password: `Student@123`
- Role: Student

**Employer Account:**
- Email: `employer@test.com`
- Password: `Employer@123`
- Role: Employer
- Company Name: Test Company

### Test These Features:
- ✅ Register new account
- ✅ Login with credentials
- ✅ View your profile
- ✅ Edit profile information
- ✅ Change password
- ✅ Logout

---

## 🎯 What You Can Do Now

As a **Student**, you can:
- ✅ Create an account
- ✅ Login/Logout
- ✅ View your profile
- ✅ Edit your profile
- ✅ Add academic information
- ✅ Add skills
- ✅ Add social links (LinkedIn, GitHub)

As an **Employer**, you can:
- ✅ Create company account
- ✅ Login/Logout
- ✅ View company profile
- ✅ Edit company information
- ✅ Add company details

As an **Admin**, you can:
- ✅ Login/Logout
- ✅ View all users
- ✅ Manage user status
- ✅ Search and filter users

---

## 📊 API Endpoints (Simple Explanation)

Think of these as the "commands" your frontend sends to backend:

### Authentication Commands
- `/api/auth/register` - Create new account
- `/api/auth/login` - Login to account
- `/api/auth/logout` - Logout
- `/api/auth/me` - Get my info

### User Management Commands
- `/api/users` - See all users (admin only)
- `/api/users/:id` - See specific user
- `/api/users/:id` - Update user info
- `/api/users/:id` - Delete user

---

## 🎓 Learning Resources

If you want to understand more:

**React (Frontend):**
- Official Docs: https://react.dev
- Tutorial: React basics, components, hooks

**Node.js (Backend):**
- Official Docs: https://nodejs.org
- Tutorial: Express.js, API creation

**MySQL (Database):**
- Tutorial: SQL basics, tables, queries

**Prisma (Database Tool):**
- Official Docs: https://www.prisma.io

---

## 💡 Tips for Students

1. **Start Backend First** - Always start backend before frontend
2. **Check Console** - Look at terminal for error messages
3. **Save Token** - After login, token is saved automatically
4. **Use Postman** - Test API without frontend (optional)
5. **Read Errors** - Error messages tell you what's wrong

---

## 🎉 You Did It!

You now have a working job portal with:
- ✅ User registration
- ✅ Login system
- ✅ Profile management
- ✅ Secure authentication
- ✅ Beautiful UI

**Next:** Other team members will add job posting, applications, and admin dashboard!

---

## 📞 Need Help?

1. **Check error message** in terminal
2. **Read INSTALLATION.md** for setup issues
3. **Read README.md** for detailed docs
4. **Check console** in browser (F12)
5. **Verify** both servers are running

---

**Remember:** 
- Backend runs on port **5000**
- Frontend runs on port **3000**
- Both must be running at the same time!

**Good luck with your project! 🚀**
