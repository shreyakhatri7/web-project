/**
 * Student Auth Page
 * Student-only Login and Registration
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [authMode, setAuthMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    // Student fields
    first_name: '',
    last_name: '',
    phone: '',
    university: '',
    major: '',
    graduation_year: '',
    gpa: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Update URL when mode changes
  useEffect(() => {
    const currentMode = searchParams.get('mode');
    if (authMode === 'register' && currentMode !== 'register') {
      navigate('/auth?mode=register', { replace: true });
    } else if (authMode === 'login' && currentMode === 'register') {
      navigate('/auth', { replace: true });
    }
  }, [authMode, navigate, searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setError('');
    // Reset form data when switching modes
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      phone: '',
      university: '',
      major: '',
      graduation_year: '',
      gpa: '',
      bio: '',
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, 'student');

    if (result.success) {
      const from = location.state?.from?.pathname;
      let redirectPath = from || result.redirectPath || '/dashboard';
      
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Prepare registration data for student
    const registerData = {
      email: formData.email,
      password: formData.password,
      role: 'student',
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      university: formData.university,
      major: formData.major,
      graduation_year: formData.graduation_year,
      gpa: formData.gpa,
      bio: formData.bio,
    };

    const result = await register(registerData);

    if (result.success) {
      navigate('/dashboard'); // Always redirect to student dashboard
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className={`auth-card ${authMode === 'register' ? 'auth-card-wide' : ''}`}>
          {/* Auth Mode Toggle */}
          <div className="auth-mode-toggle">
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => handleModeChange('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => handleModeChange('register')}
            >
              Create Account
            </button>
          </div>

          <div className="auth-header">
            <h1 className="auth-title">
              {authMode === 'login' ? 'Welcome Back' : 'Create Student Account'}
            </h1>
            <p className="auth-subtitle">
              {authMode === 'login' 
                ? 'Sign in to your student account to continue' 
                : 'Join KCE Job Portal as a Student'}
            </p>
          </div>

          {/* Student Portal Info (Register only) */}
          {authMode === 'register' && (
            <div className="student-portal-info">
              <div className="portal-badge">
                🎓 Student Portal Registration
              </div>
              <p className="portal-note">
                Register with your university details to start applying for internships and jobs
              </p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              {/* Student Personal Information */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="John"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="john.doe@student.edu"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+977 9812345678"
                  required
                />
              </div>

              {/* University Information */}
              <div className="form-group">
                <label className="form-label">University</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Kathmandu College of Engineering"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Major/Field of Study</label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Computer Engineering"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <select
                    name="graduation_year"
                    value={formData.graduation_year}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GPA (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="3.75"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio (Optional)</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  placeholder="Tell us about yourself, your interests, and career goals..."
                  rows="3"
                />
              </div>

              {/* Password Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm"></span>
                    Creating account...
                  </>
                ) : (
                  'Create Student Account'
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="auth-footer">
            <p>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => handleModeChange(authMode === 'login' ? 'register' : 'login')}
              >
                {authMode === 'login' ? 'Create one here' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;