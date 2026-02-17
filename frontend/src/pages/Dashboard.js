import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsAPI, jobsAPI } from '../services/api';
import Loading from '../components/common/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const { student } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, jobsRes, applicationsRes] = await Promise.all([
        applicationsAPI.getStats(),
        jobsAPI.getAll({ limit: 5 }),
        applicationsAPI.getAll({ limit: 5 }),
      ]);

      setStats(statsRes.data.stats);
      setRecentJobs(jobsRes.data.jobs);
      setRecentApplications(applicationsRes.data.applications);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  return (
    <div className="page">
      <div className="container">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h1>Welcome back, {student?.first_name}! 👋</h1>
            <p>Here's an overview of your job search progress</p>
          </div>
          <div className="welcome-actions">
            <Link to="/jobs" className="btn btn-primary">
              Browse Jobs
            </Link>
            <Link to="/profile" className="btn btn-outline">
              Edit Profile
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-total">📊</div>
            <div className="stat-content">
              <span className="stat-value">{stats?.total || 0}</span>
              <span className="stat-label">Total Applications</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-pending">⏳</div>
            <div className="stat-content">
              <span className="stat-value">{stats?.pending || 0}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-shortlisted">⭐</div>
            <div className="stat-content">
              <span className="stat-value">{stats?.shortlisted || 0}</span>
              <span className="stat-label">Shortlisted</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-accepted">✅</div>
            <div className="stat-content">
              <span className="stat-value">{stats?.accepted || 0}</span>
              <span className="stat-label">Accepted</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Jobs */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Latest Jobs</h2>
              <Link to="/jobs" className="btn btn-sm btn-outline">
                View All
              </Link>
            </div>
            {recentJobs.length > 0 ? (
              <div className="job-list">
                {recentJobs.map((job) => (
                  <Link to={`/jobs/${job.id}`} key={job.id} className="job-item">
                    <div className="job-item-logo">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company_name} />
                      ) : (
                        <div className="logo-placeholder">
                          {job.company_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="job-item-content">
                      <h3 className="job-item-title">{job.title}</h3>
                      <p className="job-item-company">{job.company_name}</p>
                      <div className="job-item-meta">
                        <span>📍 {job.location}</span>
                        <span>💰 {formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                    </div>
                    <span className={`badge badge-${job.job_type}`}>{job.job_type}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No jobs available at the moment</p>
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Recent Applications</h2>
              <Link to="/applications" className="btn btn-sm btn-outline">
                View All
              </Link>
            </div>
            {recentApplications.length > 0 ? (
              <div className="application-list">
                {recentApplications.map((app) => (
                  <Link
                    to={`/applications/${app.id}`}
                    key={app.id}
                    className="application-item"
                  >
                    <div className="application-item-content">
                      <h3 className="application-item-title">{app.job_title}</h3>
                      <p className="application-item-company">{app.company_name}</p>
                      <p className="application-item-date">
                        Applied on {formatDate(app.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't applied to any jobs yet</p>
                <Link to="/jobs" className="btn btn-primary btn-sm mt-3">
                  Browse Jobs
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion */}
        <div className="card profile-completion-card">
          <div className="card-header">
            <h2 className="card-title">Complete Your Profile</h2>
          </div>
          <p className="text-muted mb-3">
            A complete profile increases your chances of getting hired!
          </p>
          <div className="completion-items">
            <div className={`completion-item ${student?.bio ? 'completed' : ''}`}>
              <span className="completion-icon">{student?.bio ? '✅' : '⬜'}</span>
              <span>Add your bio</span>
            </div>
            <div className={`completion-item ${student?.education ? 'completed' : ''}`}>
              <span className="completion-icon">{student?.education ? '✅' : '⬜'}</span>
              <span>Add your education</span>
            </div>
            <div className={`completion-item ${student?.skills ? 'completed' : ''}`}>
              <span className="completion-icon">{student?.skills ? '✅' : '⬜'}</span>
              <span>Add your skills</span>
            </div>
            <div className={`completion-item ${student?.resume_url ? 'completed' : ''}`}>
              <span className="completion-icon">{student?.resume_url ? '✅' : '⬜'}</span>
              <span>Upload your resume</span>
            </div>
          </div>
          <Link to="/profile" className="btn btn-primary mt-4">
            Complete Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
