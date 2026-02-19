import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiSearch, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiStar,
  FiFilter,
  FiX,
  FiChevronDown,
  FiBriefcase,
  FiHeart,
  FiEye,
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
  FiGlobe
} from 'react-icons/fi';
import './Jobs.css';

const Jobs = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedSalary, setSelectedSalary] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [savedJobs, setSavedJobs] = useState(new Set());

  // Mock job data - in real app, this would come from API
  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechFlow Inc",
      companyLogo: "https://ui-avatars.com/api/?name=TF&background=0ea5e9&color=fff&size=56",
      location: "San Francisco, CA",
      salary: "$90,000 - $130,000",
      type: "Full-time",
      remote: true,
      featured: true,
      posted: "2 days ago",
      applicants: 24,
      description: "We're looking for a Senior Frontend Developer to join our growing team. You'll work with React, TypeScript, and modern web technologies.",
      requirements: ["5+ years React experience", "TypeScript proficiency", "Modern CSS frameworks"],
      tags: ["React", "TypeScript", "CSS", "JavaScript"],
      category: "technology",
      experience: "Senior",
      companySize: "100-500",
      industry: "Technology"
    },
    {
      id: 2,
      title: "UX/UI Designer",
      company: "DesignCraft Studio",
      companyLogo: "https://ui-avatars.com/api/?name=DC&background=10b981&color=fff&size=56",
      location: "New York, NY",
      salary: "$70,000 - $95,000",
      type: "Full-time",
      remote: false,
      featured: true,
      posted: "1 day ago",
      applicants: 18,
      description: "Join our design team to create beautiful, user-centered experiences for our clients across various industries.",
      requirements: ["3+ years UI/UX experience", "Figma proficiency", "User research skills"],
      tags: ["Figma", "UI Design", "UX Research", "Prototyping"],
      category: "design",
      experience: "Mid-level",
      companySize: "10-50",
      industry: "Design"
    },
    {
      id: 3,
      title: "Data Scientist",
      company: "DataViz Analytics",
      companyLogo: "https://ui-avatars.com/api/?name=DV&background=f59e0b&color=fff&size=56",
      location: "Austin, TX",
      salary: "$85,000 - $115,000",
      type: "Full-time",
      remote: true,
      featured: false,
      posted: "3 days ago",
      applicants: 32,
      description: "Analyze complex datasets and build machine learning models to drive business insights and decisions.",
      requirements: ["Python proficiency", "Machine Learning experience", "Statistical analysis"],
      tags: ["Python", "Machine Learning", "SQL", "Statistics"],
      category: "technology",
      experience: "Mid-level",
      companySize: "50-100",
      industry: "Analytics"
    },
    {
      id: 4,
      title: "Marketing Manager",
      company: "Growth Marketing Co",
      companyLogo: "https://ui-avatars.com/api/?name=GM&background=ef4444&color=fff&size=56",
      location: "Los Angeles, CA",
      salary: "$65,000 - $85,000",
      type: "Full-time",
      remote: true,
      featured: false,
      posted: "1 week ago",
      applicants: 41,
      description: "Lead our marketing efforts across digital channels to drive growth and brand awareness.",
      requirements: ["5+ years marketing experience", "Digital marketing expertise", "Analytics skills"],
      tags: ["Digital Marketing", "SEO", "Analytics", "Content Marketing"],
      category: "marketing",
      experience: "Senior",
      companySize: "100-500",
      industry: "Marketing"
    },
    {
      id: 5,
      title: "Backend Developer",
      company: "ServerTech Solutions",
      companyLogo: "https://ui-avatars.com/api/?name=ST&background=8b5cf6&color=fff&size=56",
      location: "Seattle, WA",
      salary: "$80,000 - $110,000",
      type: "Full-time",
      remote: true,
      featured: false,
      posted: "4 days ago",
      applicants: 28,
      description: "Build scalable backend systems and APIs using Node.js, PostgreSQL, and cloud technologies.",
      requirements: ["Node.js experience", "Database design", "Cloud platforms"],
      tags: ["Node.js", "PostgreSQL", "AWS", "API Development"],
      category: "technology",
      experience: "Mid-level",
      companySize: "50-100",
      industry: "Technology"
    },
    {
      id: 6,
      title: "Product Manager",
      company: "InnovateNow",
      companyLogo: "https://ui-avatars.com/api/?name=IN&background=06b6d4&color=fff&size=56",
      location: "Boston, MA",
      salary: "$95,000 - $125,000",
      type: "Full-time",
      remote: false,
      featured: true,
      posted: "2 days ago",
      applicants: 19,
      description: "Drive product strategy and execution for our flagship SaaS platform serving thousands of customers.",
      requirements: ["Product management experience", "Agile methodologies", "User research"],
      tags: ["Product Strategy", "Agile", "Analytics", "User Research"],
      category: "business",
      experience: "Senior",
      companySize: "500+",
      industry: "Technology"
    }
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Business' },
    { value: 'healthcare', label: 'Healthcare' }
  ];

  const jobTypes = [
    { value: '', label: 'All Types' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' }
  ];

  const salaryRanges = [
    { value: '', label: 'Any Salary' },
    { value: '0-50000', label: '$0 - $50,000' },
    { value: '50000-75000', label: '$50,000 - $75,000' },
    { value: '75000-100000', label: '$75,000 - $100,000' },
    { value: '100000+', label: '$100,000+' }
  ];

  // Filter jobs based on search criteria
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = !locationQuery ||
      job.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
      (job.remote && locationQuery.toLowerCase().includes('remote'));
    
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
    const matchesJobType = !selectedJobType || job.type === selectedJobType;
    
    return matchesSearch && matchesLocation && matchesCategory && matchesJobType;
  });

  const handleSaveJob = (jobId) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
    } else {
      newSavedJobs.add(jobId);
    }
    setSavedJobs(newSavedJobs);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would update the URL and trigger a new search
    console.log('Searching for:', { searchQuery, locationQuery, selectedCategory });
  };

  if (!user || user.role === 'EMPLOYER') {
    return (
      <div className="jobs-container">
        <div className="container section">
          <div className="jobs-hero">
            <h1 className="jobs-title">Explore Career Opportunities</h1>
            <p className="jobs-subtitle">
              Discover thousands of job opportunities from top companies worldwide
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      {/* Search Section */}
      <section className="jobs-search-section">
        <div className="container">
          <div className="jobs-hero">
            <h1 className="jobs-title">Find Your Dream Job</h1>
            <p className="jobs-subtitle">
              {filteredJobs.length} opportunities waiting for you
            </p>
          </div>

          <form className="jobs-search-form" onSubmit={handleSearch}>
            <div className="search-inputs">
              <div className="search-input-group">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-input-group">
                <FiMapPin className="search-icon" />
                <input
                  type="text"
                  placeholder="Location or remote"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="search-input-group">
                <FiBriefcase className="search-icon" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="search-select"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="select-arrow" />
              </div>
              <button type="submit" className="search-submit-btn">
                <FiSearch />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Jobs Content */}
      <section className="jobs-content-section section">
        <div className="container">
          <div className="jobs-content">
            {/* Filters Sidebar */}
            <aside className={`jobs-filters ${showFilters ? 'active' : ''}`}>
              <div className="filters-header">
                <h3 className="filters-title">Filters</h3>
                <button 
                  className="filters-close"
                  onClick={() => setShowFilters(false)}
                >
                  <FiX />
                </button>
              </div>

              <div className="filter-group">
                <label className="filter-label">Job Type</label>
                <div className="filter-options">
                  {jobTypes.map(type => (
                    <label key={type.value} className="filter-option">
                      <input
                        type="radio"
                        name="jobType"
                        value={type.value}
                        checked={selectedJobType === type.value}
                        onChange={(e) => setSelectedJobType(e.target.value)}
                      />
                      <span className="filter-option-text">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Salary Range</label>
                <div className="filter-options">
                  {salaryRanges.map(range => (
                    <label key={range.value} className="filter-option">
                      <input
                        type="radio"
                        name="salary"
                        value={range.value}
                        checked={selectedSalary === range.value}
                        onChange={(e) => setSelectedSalary(e.target.value)}
                      />
                      <span className="filter-option-text">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Remote Work</label>
                <div className="filter-options">
                  <label className="filter-option">
                    <input type="checkbox" />
                    <span className="filter-option-text">Remote Friendly</span>
                  </label>
                  <label className="filter-option">
                    <input type="checkbox" />
                    <span className="filter-option-text">Fully Remote</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="jobs-main">
              {/* Results Header */}
              <div className="jobs-results-header">
                <div className="results-info">
                  <h2 className="results-count">
                    {filteredJobs.length} Jobs Found
                  </h2>
                  <p className="results-description">
                    Based on your search criteria
                  </p>
                </div>
                <div className="results-controls">
                  <button 
                    className="filters-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FiFilter />
                    <span>Filters</span>
                  </button>
                  <div className="view-toggle">
                    <button 
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      Grid
                    </button>
                    <button 
                      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {/* Jobs Grid/List */}
              <div className={`jobs-grid ${viewMode}`}>
                {filteredJobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-card-header">
                      <div className="job-company-info">
                        <img 
                          src={job.companyLogo} 
                          alt={job.company}
                          className="job-company-logo"
                        />
                        <div className="job-meta-badges">
                          {job.featured && (
                            <span className="job-badge featured">
                              <FiStar size={12} />
                              Featured
                            </span>
                          )}
                          {job.remote && (
                            <span className="job-badge remote">
                              <FiGlobe size={12} />
                              Remote
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        className={`save-job-btn ${savedJobs.has(job.id) ? 'saved' : ''}`}
                        onClick={() => handleSaveJob(job.id)}
                      >
                        <FiHeart size={18} />
                      </button>
                    </div>

                    <div className="job-card-content">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-company">{job.company}</p>
                      <p className="job-description">{job.description}</p>
                      
                      <div className="job-tags">
                        {job.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="job-tag">{tag}</span>
                        ))}
                        {job.tags.length > 3 && (
                          <span className="job-tag-more">+{job.tags.length - 3}</span>
                        )}
                      </div>

                      <div className="job-details">
                        <div className="job-detail">
                          <FiMapPin size={16} />
                          <span>{job.location}</span>
                        </div>
                        <div className="job-detail">
                          <FiDollarSign size={16} />
                          <span>{job.salary}</span>
                        </div>
                        <div className="job-detail">
                          <FiClock size={16} />
                          <span>{job.type}</span>
                        </div>
                      </div>

                      <div className="job-stats">
                        <div className="job-stat">
                          <FiCalendar size={14} />
                          <span>{job.posted}</span>
                        </div>
                        <div className="job-stat">
                          <FiUsers size={14} />
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>
                    </div>

                    <div className="job-card-actions">
                      <button className="btn btn-primary job-apply-btn">
                        <span>Apply Now</span>
                        <FiArrowRight size={16} />
                      </button>
                      <button className="btn btn-ghost job-view-btn">
                        <FiEye size={16} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {filteredJobs.length >= 6 && (
                <div className="jobs-load-more">
                  <button className="btn btn-outline btn-lg">
                    <span>Load More Jobs</span>
                    <FiTrendingUp />
                  </button>
                </div>
              )}

              {/* No Results */}
              {filteredJobs.length === 0 && (
                <div className="no-results">
                  <div className="no-results-icon">
                    <FiSearch size={48} />
                  </div>
                  <h3 className="no-results-title">No jobs found</h3>
                  <p className="no-results-text">
                    Try adjusting your search criteria or browse all available positions.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setSearchQuery('');
                      setLocationQuery('');
                      setSelectedCategory('');
                      setSelectedJobType('');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Filters Overlay for Mobile */}
      {showFilters && (
        <div 
          className="filters-overlay"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default Jobs;
