/**
 * Employer Dashboard Page
 * Member 3 - Employer Module
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employerAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './EmployerDashboard.css';

const EmployerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await employerAPI.getDashboard();
      setDashboard(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="employer-dashboard">
      <div className="dashboard-header">
        <h1>Employer Dashboard</h1>
        <Link to="/employer/jobs/new" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.active_jobs || 0}</span>
            <span className="stat-label">Active Jobs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.total_applications || 0}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.pending_applications || 0}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.accepted_applications || 0}</span>
            <span className="stat-label">Accepted</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="recent-jobs">
          <h2>Recent Jobs</h2>
          {dashboard?.recent_jobs?.length > 0 ? (
            <div className="jobs-list">
              {dashboard.recent_jobs.map((job) => (
                <div key={job.id} className="job-item">
                  <div className="job-info">
                    <h3>{job.title}</h3>
                    <span className={`status status-${job.status}`}>{job.status}</span>
                  </div>
                  <div className="job-meta">
                    <span>{job.applications_count || 0} applications</span>
                    <Link to={`/employer/jobs/${job.id}`}>View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No jobs posted yet. <Link to="/employer/jobs/new">Post your first job!</Link></p>
          )}
        </section>

        <section className="recent-applications">
          <h2>Recent Applications</h2>
          {dashboard?.recent_applications?.length > 0 ? (
            <div className="applications-list">
              {dashboard.recent_applications.map((app) => (
                <div key={app.id} className="application-item">
                  <div className="applicant-info">
                    <strong>{app.student_name}</strong>
                    <span>applied for {app.job_title}</span>
                  </div>
                  <div className="application-meta">
                    <span className={`status status-${app.status}`}>{app.status}</span>
                    <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No applications received yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default EmployerDashboard;
