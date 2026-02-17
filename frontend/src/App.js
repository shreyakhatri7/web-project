/**
 * App.js - Main Application Router
 * Shared by: All Team Members
 * 
 * Route Structure:
 * - Public: /, /auth, /jobs, /jobs/:id
 * - Student: /dashboard, /applications, /profile
 * - Employer: /employer/*
 * - Admin: /admin/*
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';

// Student Pages (Member 2)
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Profile from './pages/Profile';

// Employer Pages (Member 3)
import { EmployerDashboard } from './pages/employer';

// Admin Pages (Member 4)
import { AdminDashboard } from './pages/admin';

import './styles/global.css';

// Layout component that conditionally shows Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ['/auth'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "main-content" : "main-content full-height"}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* ================================ */}
            {/* Public Routes */}
            {/* ================================ */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            {/* Redirect old routes to new auth page */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
              
            {/* ================================ */}
            {/* Student Routes (Member 2) */}
            {/* ================================ */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
              
            {/* ================================ */}
            {/* Employer Routes (Member 3) */}
            {/* ================================ */}
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            {/* TODO: Member 3 - Add more employer routes */}
            {/* <Route path="/employer/profile" element={<ProtectedRoute allowedRoles={['employer']}><EmployerProfile /></ProtectedRoute>} /> */}
            {/* <Route path="/employer/jobs" element={<ProtectedRoute allowedRoles={['employer']}><EmployerJobs /></ProtectedRoute>} /> */}
            {/* <Route path="/employer/jobs/new" element={<ProtectedRoute allowedRoles={['employer']}><CreateJob /></ProtectedRoute>} /> */}
            {/* <Route path="/employer/jobs/:id" element={<ProtectedRoute allowedRoles={['employer']}><EditJob /></ProtectedRoute>} /> */}
            {/* <Route path="/employer/jobs/:id/applications" element={<ProtectedRoute allowedRoles={['employer']}><JobApplications /></ProtectedRoute>} /> */}
              
            {/* ================================ */}
            {/* Admin Routes (Member 4) */}
            {/* ================================ */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* TODO: Member 4 - Add more admin routes */}
            {/* <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} /> */}
            {/* <Route path="/admin/employers" element={<ProtectedRoute allowedRoles={['admin']}><AdminEmployers /></ProtectedRoute>} /> */}
            {/* <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobs /></ProtectedRoute>} /> */}
            {/* <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} /> */}
              
            {/* Default Redirect for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
