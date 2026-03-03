import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import Loading from '../components/common/Loading';
import './Jobs.css';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    job_types: [],
    experience_levels: [],
    locations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedJobType, setSelectedJobType] = useState(searchParams.get('job_type') || '');
  const [selectedExperience, setSelectedExperience] = useState(searchParams.get('experience_level') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const fetchFilters = async () => {
    try {
      const response = await jobsAPI.getFilters();
      setFilters(response.data.filters);
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams.entries());
      const response = await jobsAPI.getAll(params);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedJobType) params.set('job_type', selectedJobType);
    if (selectedExperience) params.set('experience_level', selectedExperience);
    if (selectedLocation) params.set('location', selectedLocation);
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedJobType('');
    setSelectedExperience('');
    setSelectedLocation('');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="jobs-header">
          <h1>Browse Jobs</h1>
          <p>Find your next opportunity from {pagination.total} available jobs</p>
        </div>

        {/* Search and Filters */}
        <div className="jobs-filters card">
          <form onSubmit={handleSearch} className="filters-form">
            <div className="search-box">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs by title, company, or keywords..."
                className="form-input search-input"
              />
              <button type="submit" className="btn btn-primary search-btn">
                🔍 Search
              </button>
            </div>

            <div className="filters-row">
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="form-select"
              >
                <option value="">All Job Types</option>
                {filters.job_types.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="form-select"
              >
                <option value="">All Experience Levels</option>
                {filters.experience_levels.map((level) => (
                  <option key={level} value={level}>
                    {level.replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="form-select"
              >
                <option value="">All Locations</option>
                {filters.locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <button type="button" onClick={clearFilters} className="btn btn-outline">
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <Loading text="Loading jobs..." />
        ) : jobs.length > 0 ? (
          <>
            {/* Jobs List */}
            <div className="jobs-list">
              {jobs.map((job) => (
                <Link to={`/jobs/${job.id}`} key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div className="job-company-logo">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company_name} />
                      ) : (
                        <div className="logo-placeholder">
                          {job.company_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="job-card-info">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-company">{job.company_name}</p>
                    </div>
                    <span className={`badge badge-${job.job_type}`}>
                      {job.job_type?.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="job-description">
                    {job.description?.substring(0, 200)}
                    {job.description?.length > 200 ? '...' : ''}
                  </p>

                  <div className="job-card-footer">
                    <div className="job-meta">
                      <span className="job-meta-item">
                        📍 {job.location || 'Not specified'}
                      </span>
                      <span className="job-meta-item">
                        💰 {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                      <span className="job-meta-item">
                        📊 {job.experience_level || 'Not specified'}
                      </span>
                    </div>
                    <span className="job-posted">
                      {formatDate(job.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
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
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No jobs found</div>
            <div className="empty-state-text">
              Try adjusting your search criteria or clearing filters
            </div>
            <button onClick={clearFilters} className="btn btn-primary mt-3">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
