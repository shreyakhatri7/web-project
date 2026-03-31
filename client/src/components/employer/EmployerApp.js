import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EmployerAuth from './EmployerAuth';
import EmployerDashboard from './EmployerDashboard';
import PostJobForm from './PostJobForm';
import ManageJobs from './ManageJobs';
import ApplicantsList from './ApplicantsList';
import EmployerProfile from './EmployerProfile';
import './EmployerApp.css';

const EmployerApp = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [employer, setEmployer] = useState(null);
    const [loading, setLoading] = useState(true);

    const syncEmployerAuth = useCallback(() => {
        const token = localStorage.getItem('employerToken') || localStorage.getItem('token');
        const employerData = localStorage.getItem('employerData');
        const userData = localStorage.getItem('user');

        if (!token) {
            setIsAuthenticated(false);
            setEmployer(null);
            setLoading(false);
            return;
        }

        setIsAuthenticated(true);

        try {
            if (employerData) {
                setEmployer(JSON.parse(employerData));
            } else if (userData) {
                const parsedUser = JSON.parse(userData);
                const profile = parsedUser.profile || {};
                setEmployer({
                    ...profile,
                    email: parsedUser.email,
                });
            } else {
                setEmployer(null);
            }
        } catch (parseError) {
            setEmployer(null);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        syncEmployerAuth();

        window.addEventListener('auth-change', syncEmployerAuth);
        window.addEventListener('storage', syncEmployerAuth);

        return () => {
            window.removeEventListener('auth-change', syncEmployerAuth);
            window.removeEventListener('storage', syncEmployerAuth);
        };
    }, [syncEmployerAuth]);

    const handleAuthSuccess = (employerData) => {
        setIsAuthenticated(true);
        setEmployer(employerData);
    };

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <EmployerAuth onAuthSuccess={handleAuthSuccess} />;
    }

    return (
        <div className="employer-app" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            

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
                    <Route path="profile" element={<EmployerProfile employer={employer} />} />
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