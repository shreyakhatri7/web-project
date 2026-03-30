import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiBriefcase, 
  FiUsers, 
  FiTarget, 
  FiAward, 
  FiSearch,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiStar,
  FiArrowRight,
  FiCheck,
  FiTrendingUp,
  FiCode,
  FiShield
} from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Featured Jobs Data (mock data for demonstration)
  const featuredJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "TechCorp Solutions",
      location: "San Francisco, CA",
      salary: "$70,000 - $90,000",
      type: "Full-time",
      logo: "https://ui-avatars.com/api/?name=TC&background=0ea5e9&color=fff&size=48",
      featured: true,
      remote: true
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "DesignHub Inc",
      location: "New York, NY",
      salary: "$60,000 - $80,000",
      type: "Full-time",
      logo: "https://ui-avatars.com/api/?name=DH&background=10b981&color=fff&size=48",
      featured: true,
      remote: false
    },
    {
      id: 3,
      title: "Data Analyst",
      company: "DataViz Pro",
      location: "Austin, TX",
      salary: "$55,000 - $75,000",
      type: "Full-time",
      logo: "https://ui-avatars.com/api/?name=DV&background=f59e0b&color=fff&size=48",
      featured: true,
      remote: true
    }
  ];

  const categories = [
    { icon: FiCode, name: "Technology", count: "2,500+ jobs", color: "bg-blue-500" },
    { icon: FiTarget, name: "Design", count: "1,200+ jobs", color: "bg-purple-500" },
    { icon: FiTrendingUp, name: "Marketing", count: "800+ jobs", color: "bg-green-500" },
    { icon: FiBriefcase, name: "Business", count: "1,500+ jobs", color: "bg-orange-500" },
    { icon: FiSearch, name: "Remote", count: "3,000+ jobs", color: "bg-indigo-500" },
    { icon: FiShield, name: "Healthcare", count: "900+ jobs", color: "bg-red-500" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      image: "https://ui-avatars.com/api/?name=SJ&background=0ea5e9&color=fff&size=64",
      quote: "Found my dream job through CareerHub! The platform made it so easy to connect with top employers."
    },
    {
      name: "Michael Chen",
      role: "Product Designer at Adobe",
      image: "https://ui-avatars.com/api/?name=MC&background=10b981&color=fff&size=64",
      quote: "The quality of opportunities here is outstanding. Highly recommend for serious job seekers."
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist at Microsoft",
      image: "https://ui-avatars.com/api/?name=ER&background=f59e0b&color=fff&size=64",
      quote: "CareerHub helped me transition into data science. The resources and connections are invaluable."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to jobs page with search params
    window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`;
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <FiTrendingUp className="hero-badge-icon" />
              <span>Join 50,000+ job seekers finding their dream careers</span>
            </div>
            <h1 className="hero-title">
              {isAuthenticated 
                ? `Welcome back, ${user.firstName}!` 
                : 'Find Your Dream Career Today'
              }
            </h1>
            <p className="hero-subtitle">
              {isAuthenticated
                ? `Ready to explore new opportunities? Browse thousands of jobs from top companies.`
                : 'Connect with leading companies and discover opportunities that match your skills and aspirations.'
              }
            </p>
            
            {!isAuthenticated && (
              <form className="hero-search" onSubmit={handleSearch}>
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
                <button type="submit" className="search-button">
                  <FiSearch />
                  <span>Search Jobs</span>
                </button>
              </form>
            )}

            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/jobs" className="btn btn-primary btn-lg">
                    <FiSearch />
                    <span>Browse Jobs</span>
                  </Link>
                  <Link to="/profile" className="btn btn-secondary btn-lg">
                    <FiUsers />
                    <span>View Profile</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <span>Get Started Free</span>
                    <FiArrowRight />
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Jobs</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Companies</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Job Seekers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse Jobs by Category</h2>
            <p className="section-subtitle">Explore opportunities in your field of interest</p>
          </div>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link key={index} to={`/jobs?category=${category.name.toLowerCase()}`} className="category-card">
                <div className={`category-icon ${category.color}`}>
                  <category.icon size={24} />
                </div>
                <div className="category-content">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-count">{category.count}</p>
                </div>
                <FiArrowRight className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Opportunities</h2>
            <p className="section-subtitle">Hand-picked jobs from top companies</p>
            <Link to="/jobs" className="btn btn-outline">
              <span>View All Jobs</span>
              <FiArrowRight />
            </Link>
          </div>
          <div className="jobs-grid">
            {featuredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <img src={job.logo} alt={job.company} className="company-logo" />
                  <div className="job-meta">
                    {job.featured && <span className="job-badge featured">Featured</span>}
                    {job.remote && <span className="job-badge remote">Remote</span>}
                  </div>
                </div>
                <div className="job-content">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-company">{job.company}</p>
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
                </div>
                <div className="job-actions">
                  <button className="btn btn-primary w-full">
                    <span>Apply Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose CareerHub?</h2>
            <p className="section-subtitle">The professional platform trusted by thousands</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon primary">
                <FiBriefcase size={32} />
              </div>
              <h3 className="feature-title">Quality Opportunities</h3>
              <p className="feature-description">
                Access verified jobs and internships from top companies across various industries worldwide.
              </p>
              <div className="feature-stats">
                <FiCheck size={16} />
                <span>All positions verified</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon secondary">
                <FiUsers size={32} />
              </div>
              <h3 className="feature-title">Direct Connections</h3>
              <p className="feature-description">
                Connect directly with hiring managers and decision makers without third-party interference.
              </p>
              <div className="feature-stats">
                <FiCheck size={16} />
                <span>Direct employer contact</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon accent">
                <FiTarget size={32} />
              </div>
              <h3 className="feature-title">Smart Matching</h3>
              <p className="feature-description">
                Our AI-powered system matches you with opportunities that align with your skills and career goals.
              </p>
              <div className="feature-stats">
                <FiCheck size={16} />
                <span>AI-powered recommendations</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon warning">
                <FiAward size={32} />
              </div>
              <h3 className="feature-title">Career Growth</h3>
              <p className="feature-description">
                Access resources, mentorship, and tools to accelerate your professional development.
              </p>
              <div className="feature-stats">
                <FiCheck size={16} />
                <span>Professional development</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Success Stories</h2>
            <p className="section-subtitle">Hear from professionals who found their dream careers</p>
          </div>
          <div className="testimonials-container">
            <div className="testimonials-slider">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`testimonial-card ${index === currentSlide ? 'active' : ''}`}
                >
                  <div className="testimonial-content">
                    <div className="testimonial-stars">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={16} className="star-filled" />
                      ))}
                    </div>
                    <blockquote className="testimonial-quote">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="testimonial-author">
                      <img src={testimonial.image} alt={testimonial.name} className="author-avatar" />
                      <div className="author-info">
                        <div className="author-name">{testimonial.name}</div>
                        <div className="author-role">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="testimonials-navigation">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`nav-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Career Journey?</h2>
            <p className="cta-subtitle">
              Join thousands of professionals who have found their dream careers through CareerHub
            </p>
            <div className="cta-actions">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <span>Create Free Account</span>
                    <FiArrowRight />
                  </Link>
                  <Link to="/jobs" className="btn btn-outline btn-lg">
                    <span>Browse Jobs</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/jobs" className="btn btn-primary btn-lg">
                    <span>Find Your Next Role</span>
                    <FiArrowRight />
                  </Link>
                  <Link to="/profile" className="btn btn-outline btn-lg">
                    <span>Complete Profile</span>
                  </Link>
                </>
              )}
            </div>
            <div className="cta-features">
              <div className="cta-feature">
                <FiCheck size={20} />
                <span>100% Free to use</span>
              </div>
              <div className="cta-feature">
                <FiCheck size={20} />
                <span>No hidden fees</span>
              </div>
              <div className="cta-feature">
                <FiCheck size={20} />
                <span>Direct employer contact</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;