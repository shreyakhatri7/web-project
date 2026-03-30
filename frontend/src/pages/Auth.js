/**
 * Auth Page
 * Combined Login and Register with tabs
 * Member 1 - User Authentication
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [authMode, setAuthMode] = useState(initialMode); // 'login' or 'register'
  const [userType, setUserType] = useState('student'); // 'student' or 'employer'
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    // Student fields
    first_name: '',
    last_name: '',
    phone: '',
    // Employer fields
    company_name: '',
    industry: '',
    website: '',
    description: '',
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
      company_name: '',
      industry: '',
      website: '',
      description: '',
    });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const from = location.state?.from?.pathname;
      let redirectPath = from;
      
      if (!from) {
        switch (result.user?.role) {
          case 'employer':
            redirectPath = '/employer/dashboard';
            break;
          case 'admin':
            redirectPath = '/admin/dashboard';
            break;
          default:
            redirectPath = '/dashboard';
        }
      }
      
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

    // Prepare registration data based on user type
    const registerData = {
      email: formData.email,
      password: formData.password,
      role: userType,
    };

    if (userType === 'student') {
      registerData.first_name = formData.first_name;
      registerData.last_name = formData.last_name;
      registerData.phone = formData.phone;
    } else {
      registerData.company_name = formData.company_name;
      registerData.industry = formData.industry;
      registerData.website = formData.website;
      registerData.description = formData.description;
    }

    const result = await register(registerData);

    if (result.success) {
      navigate(userType === 'employer' ? '/employer/dashboard' : '/dashboard');
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
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="auth-subtitle">
              {authMode === 'login' 
                ? 'Sign in to your account to continue' 
                : 'Join KCE Job Portal'}
            </p>
          </div>

          {/* User Type Toggle (Register only) */}
          {authMode === 'register' && (
            <div className="user-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${userType === 'student' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('student')}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className={`toggle-btn ${userType === 'employer' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('employer')}
              >
                🏢 Employer
              </button>
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
              {/* Student Fields */}
              {userType === 'student' && (
                <>
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
                    <label className="form-label">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+977 9812345678"
                    />
                  </div>
                </>
              )}

              {/* Employer Fields */}
              {userType === 'employer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Your Company Ltd."
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Website (Optional)</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Description (Optional)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="form-input form-textarea"
                      placeholder="Brief description of your company..."
                      rows="3"
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="email@example.com"
                  required
                />
              </div>

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
                  `Create ${userType === 'employer' ? 'Employer' : 'Student'} Account`
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
