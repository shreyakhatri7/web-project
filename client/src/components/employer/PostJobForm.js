import React, { useState } from 'react';
import axios from 'axios';
import './PostJobForm.css';

const PostJobForm = ({ onJobPosted }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        job_type: 'full-time',
        location: '',
        salary_min: '',
        salary_max: '',
        requirements: '',
        benefits: '',
        application_deadline: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('employerToken');
            const response = await axios.post(
                'http://localhost:8000/api/employer/jobs',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess('Job posted successfully!');
            setFormData({
                title: '',
                description: '',
                job_type: 'full-time',
                location: '',
                salary_min: '',
                salary_max: '',
                requirements: '',
                benefits: '',
                application_deadline: ''
            });

            if (onJobPosted) {
                onJobPosted();
            }

            // Auto-hide success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error posting job:', error);
            setError(error.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-job-form" style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div className="form-header" style={{
                textAlign: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '10px' }}>
                    Post a New Job
                </h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                    Fill out the details below to create a new job posting
                </p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="job-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="title">Job Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Senior Software Engineer"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="job_type">Job Type *</label>
                        <select
                            id="job_type"
                            name="job_type"
                            value={formData.job_type}
                            onChange={handleChange}
                            required
                        >
                            <option value="full-time">Full Time</option>
                            <option value="part-time">Part Time</option>
                            <option value="internship">Internship</option>
                            <option value="contract">Contract</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., New York, NY or Remote"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="application_deadline">Application Deadline</label>
                        <input
                            type="date"
                            id="application_deadline"
                            name="application_deadline"
                            value={formData.application_deadline}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="salary_min">Minimum Salary</label>
                        <input
                            type="number"
                            id="salary_min"
                            name="salary_min"
                            value={formData.salary_min}
                            onChange={handleChange}
                            placeholder="e.g., 50000"
                            min="0"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="salary_max">Maximum Salary</label>
                        <input
                            type="number"
                            id="salary_max"
                            name="salary_max"
                            value={formData.salary_max}
                            onChange={handleChange}
                            placeholder="e.g., 80000"
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Job Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide a detailed description of the role, responsibilities, and what you're looking for..."
                        rows="6"
                        required
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="requirements">Requirements</label>
                    <textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        placeholder="List the skills, experience, and qualifications required for this role..."
                        rows="4"
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="benefits">Benefits & Perks</label>
                    <textarea
                        id="benefits"
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleChange}
                        placeholder="Describe the benefits, perks, and what makes your company great to work for..."
                        rows="4"
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Posting Job...' : 'Post Job'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostJobForm;