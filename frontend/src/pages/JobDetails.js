import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationError, setApplicationError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getById(id);
      setJob(response.data.job);
    } catch (err) {
      setError('Failed to load job details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    try {
      setApplying(true);
      setApplicationError('');
      
      await applicationsAPI.apply({
        job_id: parseInt(id),
        cover_letter: coverLetter,
      });

      setApplicationSuccess(true);
      setShowApplicationForm(false);
      setJob({ ...job, hasApplied: true, applicationStatus: 'pending' });
    } catch (err) {
      setApplicationError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <Loading text="Loading job details..." />;
  }

  if (error || !job) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state card">
            <div className="empty-state-icon">😕</div>
            <div className="empty-state-title">Job Not Found</div>
            <div className="empty-state-text">
              {error || 'This job may have been removed or is no longer available'}
            </div>
            <Link to="/jobs" className="btn btn-primary mt-3">
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/jobs">← Back to Jobs</Link>
        </div>

        <div className="job-details-layout">
          {/* Main Content */}
          <div className="job-details-main">
            {/* Header Card */}
            <div className="card job-header-card">
              <div className="job-header">
                <div className="job-company-logo-lg">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={job.company_name} />
                  ) : (
                    <div className="logo-placeholder-lg">
                      {job.company_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="job-header-info">
                  <h1 className="job-details-title">{job.title}</h1>
                  <p className="job-details-company">{job.company_name}</p>
                  <div className="job-tags">
                    <span className={`badge badge-${job.job_type}`}>
                      {job.job_type?.replace('-', ' ')}
                    </span>
                    <span className="badge badge-active">{job.experience_level}</span>
                  </div>
                </div>
              </div>

              <div className="job-quick-info">
                <div className="quick-info-item">
                  <span className="quick-info-icon">📍</span>
                  <div>
                    <span className="quick-info-label">Location</span>
                    <span className="quick-info-value">{job.location || 'Not specified'}</span>
                  </div>
                </div>
                <div className="quick-info-item">
                  <span className="quick-info-icon">💰</span>
                  <div>
                    <span className="quick-info-label">Salary</span>
                    <span className="quick-info-value">{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                </div>
                <div className="quick-info-item">
                  <span className="quick-info-icon">📅</span>
                  <div>
                    <span className="quick-info-label">Posted</span>
                    <span className="quick-info-value">{formatDate(job.created_at)}</span>
                  </div>
                </div>
                {job.deadline && (
                  <div className="quick-info-item">
                    <span className="quick-info-icon">⏰</span>
                    <div>
                      <span className="quick-info-label">Deadline</span>
                      <span className="quick-info-value">{formatDate(job.deadline)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="section-title">Job Description</h2>
              <div className="job-description-content">
                <p>{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="card">
                <h2 className="section-title">Requirements</h2>
                <ul className="job-list-items">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="card">
                <h2 className="section-title">Responsibilities</h2>
                <ul className="job-list-items">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="card">
                <h2 className="section-title">Benefits</h2>
                <div className="benefits-grid">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {job.skills_required && job.skills_required.length > 0 && (
              <div className="card">
                <h2 className="section-title">Required Skills</h2>
                <div className="skills-list">
                  {job.skills_required.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="job-details-sidebar">
            {/* Apply Card */}
            <div className="card apply-card">
              {applicationSuccess ? (
                <div className="application-success">
                  <div className="success-icon">✅</div>
                  <h3>Application Submitted!</h3>
                  <p>Your application has been sent successfully. Check "My Applications" to track its status.</p>
                  <Link to="/applications" className="btn btn-primary">
                    View My Applications
                  </Link>
                </div>
              ) : job.hasApplied ? (
                <div className="already-applied">
                  <div className="applied-icon">📝</div>
                  <h3>Already Applied</h3>
                  <p>Status: <span className={`badge badge-${job.applicationStatus}`}>{job.applicationStatus}</span></p>
                  <Link to="/applications" className="btn btn-outline">
                    View My Applications
                  </Link>
                </div>
              ) : showApplicationForm ? (
                <form onSubmit={handleApply} className="application-form">
                  <h3>Apply for this position</h3>
                  
                  {applicationError && (
                    <div className="alert alert-error">
                      <span>⚠️</span>
                      <span>{applicationError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Cover Letter (Optional)</label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="form-textarea"
                      placeholder="Tell the employer why you're a great fit for this role..."
                      rows={6}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={applying}
                    >
                      {applying ? (
                        <>
                          <span className="spinner spinner-sm"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3>Interested in this job?</h3>
                  <p className="apply-text">
                    Submit your application and the employer will review your profile.
                  </p>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="btn btn-primary btn-lg apply-btn"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-primary btn-lg apply-btn">
                      Login to Apply
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Company Info */}
            {job.company_name && (
              <div className="card company-card">
                <h3>About the Company</h3>
                <div className="company-info">
                  <div className="company-logo-sm">
                    {job.company_logo ? (
                      <img src={job.company_logo} alt={job.company_name} />
                    ) : (
                      <div className="logo-placeholder">
                        {job.company_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4>{job.company_name}</h4>
                    {job.company_location && (
                      <p className="company-location">📍 {job.company_location}</p>
                    )}
                  </div>
                </div>
                {job.company_description && (
                  <p className="company-description">{job.company_description}</p>
                )}
                {job.company_website && (
                  <a
                    href={job.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm mt-3"
                  >
                    Visit Website ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
