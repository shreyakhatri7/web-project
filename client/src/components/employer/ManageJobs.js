import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageJobs.css';

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingJob, setEditingJob] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('employerToken');
            const response = await axios.get('http://localhost:8000/api/employer/jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(response.data.jobs);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setError('Failed to load jobs');
            setLoading(false);
        }
    };

    const handleStatusChange = async (jobId, newStatus) => {
        try {
            const token = localStorage.getItem('employerToken');
            const job = jobs.find(j => j.id === jobId);
            
            await axios.put(`http://localhost:8000/api/employer/jobs/${jobId}`, 
                { ...job, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setJobs(jobs.map(job => 
                job.id === jobId ? { ...job, status: newStatus } : job
            ));
        } catch (error) {
            console.error('Error updating job status:', error);
            alert('Failed to update job status');
        }
    };

    const handleDeleteJob = async (jobId) => {
        try {
            const token = localStorage.getItem('employerToken');
            await axios.delete(`http://localhost:8000/api/employer/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setJobs(jobs.filter(job => job.id !== jobId));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job');
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.status === filter;
    });

    if (loading) {
        return <div className="manage-jobs-loading">Loading jobs...</div>;
    }

    if (error) {
        return <div className="manage-jobs-error">{error}</div>;
    }

    return (
        <div className="manage-jobs">
            <div className="jobs-header">
                <h1>Manage Jobs</h1>
                <div className="jobs-filters">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Jobs ({jobs.length})
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Active ({jobs.filter(j => j.status === 'active').length})
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
                        onClick={() => setFilter('inactive')}
                    >
                        Inactive ({jobs.filter(j => j.status === 'inactive').length})
                    </button>
                </div>
            </div>

            {filteredJobs.length === 0 ? (
                <div className="no-jobs">
                    <h3>No jobs found</h3>
                    <p>You haven't posted any jobs yet.</p>
                </div>
            ) : (
                <div className="jobs-grid">
                    {filteredJobs.map(job => (
                        <div key={job.id} className="job-card">
                            <div className="job-header">
                                <h3>{job.title}</h3>
                                <span className={`job-status ${job.status}`}>
                                    {job.status}
                                </span>
                            </div>
                            
                            <div className="job-details">
                                <p className="job-type">{job.job_type}</p>
                                {job.location && <p className="job-location">📍 {job.location}</p>}
                                {job.salary_min && job.salary_max && (
                                    <p className="job-salary">
                                        💰 ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                                    </p>
                                )}
                                <p className="job-applications">
                                    📄 {job.application_count} applications
                                </p>
                                <p className="job-date">
                                    Posted: {new Date(job.created_at).toLocaleDateString()}
                                </p>
                                {job.application_deadline && (
                                    <p className="job-deadline">
                                        Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            <div className="job-description">
                                <p>{job.description.substring(0, 200)}...</p>
                            </div>

                            <div className="job-actions">
                                <button 
                                    className="view-applicants-btn"
                                    onClick={() => window.location.href = `/employer/jobs/${job.id}/applicants`}
                                >
                                    View Applicants ({job.application_count})
                                </button>
                                
                                <div className="job-controls">
                                    <select
                                        value={job.status}
                                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                    
                                    <button 
                                        className="edit-btn"
                                        onClick={() => setEditingJob(job)}
                                    >
                                        Edit
                                    </button>
                                    
                                    <button 
                                        className="delete-btn"
                                        onClick={() => setDeleteConfirm(job.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this job posting? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-btn"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-delete-btn"
                                onClick={() => handleDeleteJob(deleteConfirm)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageJobs;