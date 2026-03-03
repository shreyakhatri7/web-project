import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import EmployerAuth from './EmployerAuth';
import EmployerDashboard from './EmployerDashboard';
import PostJobForm from './PostJobForm';
import ManageJobs from './ManageJobs';
import ApplicantsList from './ApplicantsList';
import './EmployerApp.css';

const EmployerApp = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [employer, setEmployer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if employer is already logged in
        const token = localStorage.getItem('employerToken');
        const employerData = localStorage.getItem('employerData');
        
        if (token && employerData) {
            setIsAuthenticated(true);
            setEmployer(JSON.parse(employerData));
        }
        setLoading(false);
    }, []);

    const handleAuthSuccess = (employerData) => {
        setIsAuthenticated(true);
        setEmployer(employerData);
    };

    const handleLogout = () => {
        localStorage.removeItem('employerToken');
        localStorage.removeItem('employerData');
        setIsAuthenticated(false);
        setEmployer(null);
    };

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <EmployerAuth onAuthSuccess={handleAuthSuccess} />;
    }

    return (
        <div className="employer-app" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <nav className="employer-navbar" style={{
                background: '#2196f3',
                padding: '15px 20px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div className="navbar-brand">
                    <h2 style={{ margin: '0', fontSize: '1.5rem' }}>📊 Employer Portal</h2>
                    <span className="company-name" style={{ fontSize: '0.9rem', opacity: '0.9' }}>
                        {employer.company_name}
                    </span>
                </div>
                
                <div className="navbar-links" style={{
                    display: 'flex',
                    gap: '20px'
                }}>
                    <Link to="/employer/dashboard" className="nav-link" style={{
                        color: 'white',
                        textDecoration: 'none',
                        padding: '8px 15px',
                        borderRadius: '5px'
                    }}>
                        🏠 Dashboard
                    </Link>
                    <Link to="/employer/post-job" className="nav-link" style={{
                        color: 'white',
                        textDecoration: 'none',
                        padding: '8px 15px',
                        borderRadius: '5px'
                    }}>
                        ➕ Post Job
                    </Link>
                    <Link to="/employer/jobs" className="nav-link" style={{
                        color: 'white',
                        textDecoration: 'none',
                        padding: '8px 15px',
                        borderRadius: '5px'
                    }}>
                        💼 Manage Jobs
                    </Link>
                    <Link to="/employer/applicants" className="nav-link" style={{
                        color: 'white',
                        textDecoration: 'none',
                        padding: '8px 15px',
                        borderRadius: '5px'
                    }}>
                        👥 Applicants
                    </Link>
                </div>
                
                <div className="navbar-user" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <span className="user-email" style={{ fontSize: '0.9rem', opacity: '0.9' }}>
                        {employer.email}
                    </span>
                    <button onClick={handleLogout} className="logout-btn" style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}>
                        🚪 Logout
                    </button>
                </div>
            </nav>

            <main className="employer-main" style={{
                minHeight: 'calc(100vh - 120px)',
                padding: '20px 0'
            }}>
                <Routes>
                    <Route path="/" element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<EmployerDashboard />} />
                    <Route path="post-job" element={<PostJobForm />} />
                    <Route path="jobs" element={<ManageJobs />} />
                    <Route path="applicants" element={<ApplicantsList />} />
                    <Route path="jobs/:jobId/applicants" element={<ApplicantsList />} />
                </Routes>
            </main>

            <footer className="employer-footer" style={{
                background: '#333',
                color: 'white',
                textAlign: 'center',
                padding: '15px'
            }}>
                <p style={{ margin: '0' }}>&copy; 2026 Internship & Job Portal System - Employer Module</p>
            </footer>
        </div>
    );
};

export default EmployerApp;