import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiBriefcase,
  FiBookOpen,
} from 'react-icons/fi';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'STUDENT',
    // Student fields
    university: '',
    degree: '',
    major: '',
    graduationYear: '',
    // Employer fields
    companyName: '',
    companySize: '',
    industry: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setFieldErrors({});
  };

  const validateForm = () => {
    const errors = {};

    // Password validation
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (formData.role === 'EMPLOYER' && !formData.companyName) {
      errors.companyName = 'Company name is required for employers';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const result = await register(submitData);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Registration failed');
        if (result.errors) {
          setFieldErrors(result.errors);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join our job portal community</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selection */}
          <div className="form-group">
            <label>I am a</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${formData.role === 'STUDENT' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
              >
                <FiBookOpen />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'EMPLOYER' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'EMPLOYER' })}
              >
                <FiBriefcase />
                <span>Employer</span>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <div className="input-group">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <div className="input-group">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-group">
              <FiPhone className="input-icon" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="error-text">{fieldErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          {/* Student-specific fields */}
          {formData.role === 'STUDENT' && (
            <>
              <div className="section-divider">
                <span>Academic Information</span>
              </div>

              <div className="form-group">
                <label htmlFor="university">University</label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="Your university name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="degree">Degree</label>
                  <input
                    type="text"
                    id="degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="e.g., Bachelor of Science"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="major">Major</label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="graduationYear">Graduation Year</label>
                <input
                  type="number"
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="2025"
                  min="2000"
                  max="2050"
                />
              </div>
            </>
          )}

          {/* Employer-specific fields */}
          {formData.role === 'EMPLOYER' && (
            <>
              <div className="section-divider">
                <span>Company Information</span>
              </div>

              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your company name"
                  required
                />
                {fieldErrors.companyName && (
                  <span className="error-text">{fieldErrors.companyName}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companySize">Company Size</label>
                  <select
                    id="companySize"
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="industry">Industry</label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g., Technology"
                  />
                </div>
              </div>
            </>
          )}

          <div className="password-requirements">
            <p>Password must contain:</p>
            <ul>
              <li className={formData.password.length >= 8 ? 'valid' : ''}>
                <FiCheckCircle /> At least 8 characters
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                <FiCheckCircle /> One uppercase letter
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                <FiCheckCircle /> One lowercase letter
              </li>
              <li className={/\d/.test(formData.password) ? 'valid' : ''}>
                <FiCheckCircle /> One number
              </li>
            </ul>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
