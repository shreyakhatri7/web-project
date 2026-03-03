import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicantsList.css';

const ApplicantsList = () => {
    const [applicants, setApplicants] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedJob, setSelectedJob] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [applicantsResponse, jobsResponse] = await Promise.all([
                axios.get('http://localhost:8000/api/employer/applicants', { headers }),
                axios.get('http://localhost:8000/api/employer/jobs', { headers })
            ]);
            
            setApplicants(applicantsResponse.data.applicants);
            setJobs(jobsResponse.data.jobs);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load applicants data');
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            const token = localStorage.getItem('employerToken');
            await axios.put(
                `http://localhost:8000/api/employer/applications/${applicationId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setApplicants(applicants.map(app => 
                app.id === applicationId 
                    ? { ...app, application_status: newStatus }
                    : app
            ));
        } catch (error) {
            console.error('Error updating application status:', error);
            alert('Failed to update application status');
        }
    };

    const filteredApplicants = applicants.filter(applicant => {
        if (selectedJob !== 'all' && applicant.job_id !== parseInt(selectedJob)) {
            return false;
        }
        if (selectedStatus !== 'all' && applicant.application_status !== selectedStatus) {
            return false;
        }
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#ffc107';
            case 'accepted': return '#28a745';
            case 'rejected': return '#dc3545';
            case 'shortlisted': return '#007bff';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return <div className="applicants-loading">Loading applicants...</div>;
    }

    if (error) {
        return <div className="applicants-error">{error}</div>;
    }

    return (
        <div className="applicants-list">
            <div className="applicants-header">
                <h1>Applicant Management</h1>
                <p>Review and manage applications for your job postings</p>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <label htmlFor="job-filter">Filter by Job:</label>
                    <select
                        id="job-filter"
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Jobs</option>
                        {jobs.map(job => (
                            <option key={job.id} value={job.id}>
                                {job.title} ({applicants.filter(a => a.job_id === job.id).length} applicants)
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="status-filter">Filter by Status:</label>
                    <select
                        id="status-filter"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="applicants-stats">
                <div className="stat-item">
                    <span className="stat-number">{filteredApplicants.length}</span>
                    <span className="stat-label">Total Applicants</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {filteredApplicants.filter(a => a.application_status === 'pending').length}
                    </span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {filteredApplicants.filter(a => a.application_status === 'shortlisted').length}
                    </span>
                    <span className="stat-label">Shortlisted</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {filteredApplicants.filter(a => a.application_status === 'accepted').length}
                    </span>
                    <span className="stat-label">Accepted</span>
                </div>
            </div>

            {filteredApplicants.length === 0 ? (
                <div className="no-applicants">
                    <h3>No applicants found</h3>
                    <p>No applications match your current filters.</p>
                </div>
            ) : (
                <div className="applicants-grid">
                    {filteredApplicants.map(applicant => (
                        <div key={applicant.id} className="applicant-card">
                            <div className="applicant-header">
                                <div className="applicant-info">
                                    <h3>{applicant.applicant_name}</h3>
                                    <p className="applicant-email">{applicant.applicant_email}</p>
                                    {applicant.applicant_phone && (
                                        <p className="applicant-phone">📞 {applicant.applicant_phone}</p>
                                    )}
                                </div>
                                <div className="application-status-indicator">
                                    <span 
                                        className="status-dot"
                                        style={{ backgroundColor: getStatusColor(applicant.application_status) }}
                                    ></span>
                                </div>
                            </div>

                            <div className="job-info">
                                <h4>Applied for: {applicant.job_title}</h4>
                                <p className="application-date">
                                    Applied on: {new Date(applicant.applied_at).toLocaleDateString()}
                                </p>
                            </div>

                            {applicant.cover_letter && (
                                <div className="cover-letter">
                                    <h5>Cover Letter:</h5>
                                    <p>{applicant.cover_letter.substring(0, 200)}...</p>
                                </div>
                            )}

                            <div className="applicant-actions">
                                <div className="status-controls">
                                    <label htmlFor={`status-${applicant.id}`}>Update Status:</label>
                                    <select
                                        id={`status-${applicant.id}`}
                                        value={applicant.application_status}
                                        onChange={(e) => handleStatusUpdate(applicant.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                <div className="action-buttons">
                                    {applicant.resume_url && (
                                        <a 
                                            href={applicant.resume_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="resume-btn"
                                        >
                                            📄 View Resume
                                        </a>
                                    )}
                                    <button 
                                        className="contact-btn"
                                        onClick={() => window.location.href = `mailto:${applicant.applicant_email}`}
                                    >
                                        ✉️ Contact
                                    </button>
                                </div>
                            </div>

                            <div className="applicant-footer">
                                <span className={`current-status ${applicant.application_status}`}>
                                    {applicant.application_status}
                                </span>
                                {applicant.status_updated_at !== applicant.applied_at && (
                                    <span className="last-updated">
                                        Status updated: {new Date(applicant.status_updated_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApplicantsList;