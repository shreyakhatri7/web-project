import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, 'admin');

    if (result.success) {
      const from = location.state?.from?.pathname;
      const redirectPath =
        from && from.startsWith('/admin')
          ? from
          : result.redirectPath || '/admin/dashboard';

      navigate(redirectPath, { replace: true });
    } else {
      setError(result.message || 'Admin login failed');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Admin Portal</h1>
            <p className="auth-subtitle">Sign in with your pre-approved administrator account</p>
          </div>

          <div className="student-portal-info">
            <div className="portal-badge">Restricted Access</div>
            <p className="portal-note">
              Admin accounts are created manually in the database. Self-registration is disabled.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="admin@jobportal.com"
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
                placeholder="Enter admin password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Student login: <Link to="/auth" className="auth-link">Open Student Portal</Link>
            </p>
            <p>
              Employer login: <Link to="/employer" className="auth-link">Open Employer Portal</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
