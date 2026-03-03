import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import EmployerApp from './components/employer/EmployerApp';

// Public Pages
import StudentAuth from './pages/StudentAuth';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';

// Student Pages
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Profile from './pages/Profile';

import './App.css';

// Layout component that conditionally shows Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ['/auth', '/'];
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
        <div className="App">
          <Layout>
            <Routes>
              {/* Default route - Main portal selection */}
              <Route path="/" element={<HomePage />} />
              
              {/* Public routes */}
              <Route path="/auth" element={<StudentAuth />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              
              {/* Student routes - Protected */}
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
              
              {/* Employer routes */}
              <Route path="/employer/*" element={<EmployerApp />} />
              
              {/* Admin functionality removed for now */}
            </Routes>
          </Layout>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Home page component for portal selection
function HomePage() {
  return (
    <div className="home-page">
      <div className="container">
        <header className="header">
          <h1>🎓 Internship & Job Portal System</h1>
          <p>Connect employers with talented candidates</p>
        </header>

        <div className="portal-selection">
          <div className="portal-card">
            <div className="portal-icon">👥</div>
            <h3>Job Seekers</h3>
            <p>Find your dream internship or job opportunity</p>
            <Link to="/auth" className="portal-btn">
              Enter Student Portal
            </Link>
          </div>

          <div className="portal-card">
            <div className="portal-icon">🏢</div>
            <h3>Employers</h3>
            <p>Post jobs, manage applications, and find the best talent</p>
            <Link to="/employer" className="portal-btn">
              Enter Employer Portal
            </Link>
          </div>

          {/* Admin portal removed for now */}
        </div>

        <footer className="footer">
          <p>&copy; 2026 Internship & Job Portal System. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
