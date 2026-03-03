import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployerDashboard.css';

const EmployerDashboard = () => {
    console.log('EmployerDashboard component loaded');
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingApplications: 0
    });
    const [recentJobs, setRecentJobs] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            
            if (!token) {
                setError('No authentication token found. Please login again.');
                setLoading(false);
                return;
            }
            
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch dashboard stats
            try {
                const statsResponse = await axios.get('http://localhost:8000/api/employer/dashboard/stats', { headers });
                setStats(statsResponse.data.stats || {
                    totalJobs: 0,
                    activeJobs: 0,
                    totalApplications: 0,
                    pendingApplications: 0
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
                setStats({
                    totalJobs: 0,
                    activeJobs: 0,
                    totalApplications: 0,
                    pendingApplications: 0
                });
            }

            // Fetch recent jobs
            try {
                const jobsResponse = await axios.get('http://localhost:8000/api/employer/jobs', { headers });
                setRecentJobs(jobsResponse.data.jobs ? jobsResponse.data.jobs.slice(0, 5) : []);
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setRecentJobs([]);
            }

            // Fetch recent applications
            try {
                const applicationsResponse = await axios.get('http://localhost:8000/api/employer/applicants', { headers });
                setRecentApplications(applicationsResponse.data.applicants ? applicationsResponse.data.applicants.slice(0, 5) : []);
            } catch (err) {
                console.error('Error fetching applications:', err);
                setRecentApplications([]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Some features may be limited.');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading" style={{
                padding: '50px',
                textAlign: 'center',
                fontSize: '18px',
                color: '#666'
            }}>
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error" style={{
                padding: '50px',
                textAlign: 'center',
                fontSize: '18px',
                color: '#d32f2f',
                background: '#ffebee',
                border: '1px solid #f5c6cb',
                borderRadius: '5px',
                margin: '20px'
            }}>
                {error}
            </div>
        );
    }

    return (
        <div className="employer-dashboard" style={{
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div className="dashboard-header" style={{
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                <h1 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '10px' }}>
                    Employer Dashboard
                </h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                    Welcome back! Here's an overview of your recruitment activities.
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <div className="stat-card" style={{
                    background: '#fff',
                    padding: '25px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div className="stat-icon" style={{ fontSize: '2.5rem', marginRight: '15px' }}>💼</div>
                    <div className="stat-info">
                        <h3 style={{ fontSize: '2rem', margin: '0', color: '#333' }}>{stats.totalJobs}</h3>
                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Total Jobs Posted</p>
                    </div>
                </div>
                <div className="stat-card" style={{
                    background: '#fff',
                    padding: '25px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div className="stat-icon" style={{ fontSize: '2.5rem', marginRight: '15px' }}>✅</div>
                    <div className="stat-info">
                        <h3 style={{ fontSize: '2rem', margin: '0', color: '#333' }}>{stats.activeJobs}</h3>
                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Active Jobs</p>
                    </div>
                </div>
                <div className="stat-card" style={{
                    background: '#fff',
                    padding: '25px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div className="stat-icon" style={{ fontSize: '2.5rem', marginRight: '15px' }}>📄</div>
                    <div className="stat-info">
                        <h3 style={{ fontSize: '2rem', margin: '0', color: '#333' }}>{stats.totalApplications}</h3>
                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Total Applications</p>
                    </div>
                </div>
                <div className="stat-card" style={{
                    background: '#fff',
                    padding: '25px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <div className="stat-icon" style={{ fontSize: '2.5rem', marginRight: '15px' }}>⏳</div>
                    <div className="stat-info">
                        <h3 style={{ fontSize: '2rem', margin: '0', color: '#333' }}>{stats.pendingApplications}</h3>
                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Pending Reviews</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Recent Jobs */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recent Job Posts</h2>
                        <a href="/employer/jobs" className="view-all-btn">View All</a>
                    </div>
                    <div className="jobs-list">
                        {recentJobs.length === 0 ? (
                            <p className="no-data">No jobs posted yet.</p>
                        ) : (
                            recentJobs.map(job => (
                                <div key={job.id} className="job-item">
                                    <div className="job-info">
                                        <h4>{job.title}</h4>
                                        <p className="job-meta">
                                            {job.job_type} • {job.location} • {job.application_count} applications
                                        </p>
                                        <span className={`job-status ${job.status}`}>{job.status}</span>
                                    </div>
                                    <div className="job-date">
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recent Applications</h2>
                        <a href="/employer/applicants" className="view-all-btn">View All</a>
                    </div>
                    <div className="applications-list">
                        {recentApplications.length === 0 ? (
                            <p className="no-data">No applications received yet.</p>
                        ) : (
                            recentApplications.map(application => (
                                <div key={application.id} className="application-item">
                                    <div className="applicant-info">
                                        <h4>{application.applicant_name}</h4>
                                        <p className="application-meta">
                                            Applied for: {application.job_title}
                                        </p>
                                        <span className={`application-status ${application.application_status}`}>
                                            {application.application_status}
                                        </span>
                                    </div>
                                    <div className="application-date">
                                        {new Date(application.applied_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerDashboard;