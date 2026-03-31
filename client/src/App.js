import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import EmployerApp from './components/employer/EmployerApp';
import { jobsAPI } from './services/api';

// Public Pages
import StudentAuth from './pages/StudentAuth';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';

// Student Pages
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import { AdminDashboard } from './pages/admin';
import AdminLogin from './pages/admin/AdminLogin';

import './App.css';

// Shared layout with a unified header across all portals/routes
const Layout = ({ children }) => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
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

              {/* Admin routes - separate access flow */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Home page component for portal selection
function HomePage() {
  const [jobStats, setJobStats] = useState({
    totalOpenings: 0,
    fresherJobs: 0,
    internships: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchJobStats = async () => {
      try {
        setLoadingStats(true);
        const [allJobsResponse, fresherJobsResponse, internshipResponse] = await Promise.all([
          jobsAPI.getAll({ page: 1, limit: 1 }),
          jobsAPI.getAll({ page: 1, limit: 1, experience_level: 'entry' }),
          jobsAPI.getAll({ page: 1, limit: 1, job_type: 'internship' }),
        ]);

        if (!isMounted) {
          return;
        }

        setJobStats({
          totalOpenings: allJobsResponse?.data?.pagination?.total || 0,
          fresherJobs: fresherJobsResponse?.data?.pagination?.total || 0,
          internships: internshipResponse?.data?.pagination?.total || 0,
        });
      } catch (error) {
        console.error('Failed to fetch homepage job stats:', error);
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    };

    fetchJobStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCount = (count) => new Intl.NumberFormat('en-IN').format(count || 0);

  return (
    <div className="khce-homepage">
      <section className="khce-hero">
        <div className="khce-hero-shape khce-hero-shape-one" />
        <div className="khce-hero-shape khce-hero-shape-two" />

        <div className="khce-hero-content">
          <div className="khce-hero-copy">
            <h1>
              Nepal's <span>#1 platform</span>
            </h1>
            <h2>Find your dream internship &amp; job</h2>
            <p>
              Connecting students with top employers. Discover opportunities that match your skills.
            </p>

            <div className="khce-hero-cta">
              <Link to="/auth" className="khce-btn khce-btn-solid khce-btn-large">
                Candidate sign up
              </Link>
              <Link to="/employer" className="khce-btn khce-btn-glass khce-btn-large">
                Employer sign up
              </Link>
            </div>
          </div>

          <div className="khce-stat-panel" role="status" aria-live="polite">
            <div className="khce-stat-card">
              <p>Total open opportunities</p>
              <strong>{loadingStats ? '...' : formatCount(jobStats.totalOpenings)}</strong>
            </div>
            <div className="khce-stat-card">
              <p>Entry level jobs</p>
              <strong>{loadingStats ? '...' : formatCount(jobStats.fresherJobs)}</strong>
            </div>
            <div className="khce-stat-card">
              <p>Internships</p>
              <strong>{loadingStats ? '...' : formatCount(jobStats.internships)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="khce-opportunity-section">
        <div className="khce-opportunity-heading">
          <h3>What are you looking for today?</h3>
          <p>Currently available listings from the database</p>
        </div>

        <div className="khce-opportunity-grid">
          <article className="khce-opportunity-card">
            <div className="khce-card-title-row">
              <h4>Fresher Jobs</h4>
              <span className="khce-pill">Entry</span>
            </div>
            <p>Roles curated for students and recent graduates beginning their career journey.</p>
            <div className="khce-count-wrap">
              <span className="khce-count-value">{loadingStats ? 'Loading...' : formatCount(jobStats.fresherJobs)}</span>
              <span className="khce-count-label">jobs available in the database</span>
            </div>
            <Link to="/jobs?experience_level=entry" className="khce-card-link">
              Browse Fresher Jobs
            </Link>
          </article>

          <article className="khce-opportunity-card">
            <div className="khce-card-title-row">
              <h4>Internships</h4>
              <span className="khce-pill">Popular</span>
            </div>
            <p>Discover internship opportunities that help you build practical, in-demand skills.</p>
            <div className="khce-count-wrap">
              <span className="khce-count-value">{loadingStats ? 'Loading...' : formatCount(jobStats.internships)}</span>
              <span className="khce-count-label">jobs available in the database</span>
            </div>
            <Link to="/jobs?job_type=internship" className="khce-card-link">
              Browse Internships
            </Link>
          </article>
        </div>
      </section>

      <footer className="khce-footer">
        <p>&copy; 2026 KHCE Job Portal. All rights reserved.</p>
        <Link to="/admin/login">Admin Portal</Link>
      </footer>
    </div>
  );
}

export default App;
