import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import Loading from '../components/common/Loading';
import './Applications.css';

const Applications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawing, setWithdrawing] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams.entries());
      const [applicationsRes, statsRes] = await Promise.all([
        applicationsAPI.getAll(params),
        applicationsAPI.getStats(),
      ]);
      
      setApplications(applicationsRes.data.applications);
      setPagination(applicationsRes.data.pagination);
      setStats(statsRes.data.stats);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      setWithdrawing(id);
      await applicationsAPI.withdraw(id);
      
      // Update the application in the list
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: 'withdrawn' } : app
      ));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          pending: stats.pending - 1,
          withdrawn: stats.withdrawn + 1,
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(null);
    }
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { emoji: '⏳', text: 'Under Review' },
      reviewed: { emoji: '👀', text: 'Reviewed' },
      shortlisted: { emoji: '⭐', text: 'Shortlisted' },
      accepted: { emoji: '🎉', text: 'Accepted' },
      rejected: { emoji: '❌', text: 'Not Selected' },
      withdrawn: { emoji: '↩️', text: 'Withdrawn' },
    };
    return statusMap[status] || { emoji: '📝', text: status };
  };

  const canWithdraw = (status) => {
    return ['pending', 'reviewed'].includes(status);
  };

  const statusTabs = [
    { key: '', label: 'All', count: stats?.total || 0 },
    { key: 'pending', label: 'Pending', count: stats?.pending || 0 },
    { key: 'reviewed', label: 'Reviewed', count: stats?.reviewed || 0 },
    { key: 'shortlisted', label: 'Shortlisted', count: stats?.shortlisted || 0 },
    { key: 'accepted', label: 'Accepted', count: stats?.accepted || 0 },
    { key: 'rejected', label: 'Rejected', count: stats?.rejected || 0 },
  ];

  if (loading && applications.length === 0) {
    return <Loading text="Loading applications..." />;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="applications-header">
          <div>
            <h1>My Applications</h1>
            <p>Track and manage your job applications</p>
          </div>
          <Link to="/jobs" className="btn btn-primary">
            Browse More Jobs
          </Link>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Status Tabs */}
        <div className="status-tabs">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusFilter(tab.key)}
              className={`status-tab ${statusFilter === tab.key ? 'active' : ''}`}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Applications List */}
        {applications.length > 0 ? (
          <>
            <div className="applications-list">
              {applications.map((app) => {
                const statusInfo = getStatusInfo(app.status);
                return (
                  <div key={app.id} className="application-card">
                    <div className="application-card-header">
                      <div className="application-company-logo">
                        {app.company_logo ? (
                          <img src={app.company_logo} alt={app.company_name} />
                        ) : (
                          <div className="logo-placeholder">
                            {app.company_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="application-info">
                        <h3 className="application-title">{app.job_title}</h3>
                        <p className="application-company">{app.company_name}</p>
                        <div className="application-meta">
                          <span>📍 {app.job_location || 'Not specified'}</span>
                          <span>💼 {app.job_type?.replace('-', ' ')}</span>
                          <span>💰 {formatSalary(app.salary_min, app.salary_max)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="application-card-body">
                      <div className="application-status-section">
                        <div className={`application-status status-${app.status}`}>
                          <span className="status-emoji">{statusInfo.emoji}</span>
                          <div>
                            <span className="status-label">Status</span>
                            <span className="status-value">{statusInfo.text}</span>
                          </div>
                        </div>
                        <div className="application-date">
                          <span className="date-label">Applied on</span>
                          <span className="date-value">{formatDate(app.created_at)}</span>
                        </div>
                      </div>

                      {app.cover_letter && (
                        <div className="cover-letter-preview">
                          <strong>Cover Letter:</strong>
                          <p>{app.cover_letter.substring(0, 150)}
                            {app.cover_letter.length > 150 ? '...' : ''}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="application-card-footer">
                      <Link to={`/jobs/${app.job_id}`} className="btn btn-outline btn-sm">
                        View Job
                      </Link>
                      {canWithdraw(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          disabled={withdrawing === app.id}
                          className="btn btn-danger btn-sm"
                        >
                          {withdrawing === app.id ? (
                            <>
                              <span className="spinner spinner-sm"></span>
                              Withdrawing...
                            </>
                          ) : (
                            'Withdraw'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-outline btn-sm"
                >
                  ← Previous
                </button>
                
                <div className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-outline btn-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state card">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">
              {statusFilter ? `No ${statusFilter} applications` : 'No applications yet'}
            </div>
            <div className="empty-state-text">
              {statusFilter 
                ? 'Try selecting a different status filter'
                : 'Start applying to jobs to see your applications here'
              }
            </div>
            {!statusFilter && (
              <Link to="/jobs" className="btn btn-primary mt-3">
                Browse Jobs
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
