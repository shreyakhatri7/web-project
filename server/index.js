const express = require("express");
const cors = require("cors");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

require("./config/db");

// Import routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const employerRoutes = require('./routes/employer.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
  res.send("API running...");
});

// Routes
app.use('/api/auth', authRoutes);           // Authentication
app.use('/api/students', studentRoutes);    // Student Module
app.use('/api/jobs', jobRoutes);            // Job Routes (unified)
app.use('/api/applications', applicationRoutes); // Applications
app.use('/api/employer', employerRoutes);   // Employer Module (existing)
app.use('/api/admin', adminRoutes);         // Admin Module


// Legacy route support
app.use("/api/jobs", require("./routes/jobRoutes")); // Keep existing employer job routes
app.use("/api/employer", require("./routes/employerRoutes")); // Keep existing employer routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(process.env.PORT || 8000, () => console.log(`Server running on port ${process.env.PORT || 8000}`));
