/**
 * Admin Dashboard Page
 * Member 4 - Admin Panel
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboard(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading admin dashboard..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <span className="welcome-text">System Overview</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.total_users || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <Link to="/admin/users" className="stat-link">Manage</Link>
        </div>
        <div className="stat-card">
          <div className="stat-icon students">🎓</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.total_students || 0}</span>
            <span className="stat-label">Students</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon employers">🏢</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.total_employers || 0}</span>
            <span className="stat-label">Employers</span>
          </div>
          <Link to="/admin/employers" className="stat-link">Verify</Link>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.pending_employers || 0}</span>
            <span className="stat-label">Pending Verification</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon jobs">💼</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.total_jobs || 0}</span>
            <span className="stat-label">Total Jobs</span>
          </div>
          <Link to="/admin/jobs" className="stat-link">Review</Link>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon pending">🔍</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.pending_jobs || 0}</span>
            <span className="stat-label">Jobs Pending Approval</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon applications">📄</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.total_applications || 0}</span>
            <span className="stat-label">Applications</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">✅</div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.stats?.active_jobs || 0}</span>
            <span className="stat-label">Active Jobs</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="recent-activity">
          <h2>Recent Activity</h2>
          {dashboard?.recent_activity?.length > 0 ? (
            <div className="activity-list">
              {dashboard.recent_activity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">{getActivityIcon(activity.action)}</span>
                  <div className="activity-details">
                    <p>{activity.description}</p>
                    <span className="activity-time">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent activity</p>
          )}
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/employers?filter=pending" className="action-card">
              <span className="action-icon">✓</span>
              <span>Verify Employers</span>
            </Link>
            <Link to="/admin/jobs?filter=pending" className="action-card">
              <span className="action-icon">📋</span>
              <span>Approve Jobs</span>
            </Link>
            <Link to="/admin/users" className="action-card">
              <span className="action-icon">👤</span>
              <span>Manage Users</span>
            </Link>
            <Link to="/admin/reports" className="action-card">
              <span className="action-icon">📊</span>
              <span>View Reports</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

// Helper function to get activity icon
const getActivityIcon = (action) => {
  const icons = {
    'user_registered': '👤',
    'job_posted': '💼',
    'application_submitted': '📄',
    'employer_verified': '✅',
    'job_approved': '✓',
    'default': '📝'
  };
  return icons[action] || icons.default;
};

export default AdminDashboard;
