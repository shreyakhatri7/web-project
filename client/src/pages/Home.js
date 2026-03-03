import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Dream <span className="highlight">Internship</span> & <span className="highlight">Job</span>
          </h1>
          <p className="hero-subtitle">
            Connecting students with top employers. Discover opportunities that match your skills and kickstart your career.
          </p>
          <div className="hero-buttons">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth" className="btn btn-primary btn-lg">
                  Login
                </Link>
                <Link to="/auth?mode=register" className="btn btn-secondary btn-lg">
                  Register
                </Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Active Jobs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">200+</span>
              <span className="stat-label">Companies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-illustration">
            <div className="illustration-card card-1">
              <div className="card-icon">💼</div>
              <span>New Jobs Daily</span>
            </div>
            <div className="illustration-card card-2">
              <div className="card-icon">🎓</div>
              <span>Student Friendly</span>
            </div>
            <div className="illustration-card card-3">
              <div className="card-icon">🚀</div>
              <span>Quick Apply</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Simple steps to find your perfect opportunity</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Create Profile</h3>
            <p>Sign up and build your professional profile. Upload your resume and showcase your skills.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Search Jobs</h3>
            <p>Browse through hundreds of internship and job opportunities. Filter by location, type, and more.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h3>Apply Easily</h3>
            <p>Apply to multiple positions with just a few clicks. Track all your applications in one place.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Get Hired</h3>
            <p>Connect with employers directly. Receive updates on your application status in real-time.</p>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="user-types-section">
        <h2 className="section-title">Who Can Use This Portal?</h2>
        
        <div className="user-types-grid">
          <div className="user-type-card student-card">
            <div className="user-type-icon">🎓</div>
            <h3>Students</h3>
            <p>Search and apply for internships and entry-level jobs. Build your career from day one.</p>
            <ul className="user-type-features">
              <li>Create professional profile</li>
              <li>Upload resume</li>
              <li>Track applications</li>
              <li>Get notified on updates</li>
            </ul>
          </div>
          
          <div className="user-type-card employer-card">
            <div className="user-type-icon">🏢</div>
            <h3>Employers</h3>
            <p>Post job opportunities and find the best talent from top institutions.</p>
            <ul className="user-type-features">
              <li>Post job listings</li>
              <li>Review applications</li>
              <li>Shortlist candidates</li>
              <li>Manage hiring process</li>
            </ul>
          </div>
          
          <div className="user-type-card admin-card">
            <div className="user-type-icon">⚙️</div>
            <h3>Administrators</h3>
            <p>Manage the platform, verify users, and ensure quality job postings.</p>
            <ul className="user-type-features">
              <li>Approve job postings</li>
              <li>Verify employers</li>
              <li>Manage users</li>
              <li>Monitor activities</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Career Journey?</h2>
          <p>Join thousands of students who have found their dream internships and jobs through our platform.</p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started - It's Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Internship & Job Portal</h4>
            <p>Connecting students with opportunities since 2024</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/auth">Login</Link>
            <Link to="/auth?mode=register">Register</Link>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Khwopa College of Engineering</p>
            <p>Libali, Bhaktapur</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Internship and Job Portal System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
