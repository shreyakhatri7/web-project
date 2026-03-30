/**
 * Navbar Component
 * Role-based navigation menu
 * Shared by: All Team Members
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isStudent, isEmployer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user display name based on role
  const getUserName = () => {
    if (!user) return 'User';
    if (user.first_name) return user.first_name;
    if (user.company_name) return user.company_name;
    return user.email?.split('@')[0] || 'User';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💼</span>
          <span className="brand-text">KCE JobPortal</span>
        </Link>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          ☰
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
          
          {/* Student Navigation */}
          {isStudent() && (
            <>
              <Link to="/jobs" className={isActive('/jobs')}>
                Browse Jobs
              </Link>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/applications" className={isActive('/applications')}>
                My Applications
              </Link>
              <Link to="/profile" className={isActive('/profile')}>
                Profile
              </Link>
            </>
          )}

          {/* Employer Navigation */}
          {isEmployer() && (
            <>
              <Link to="/employer/dashboard" className={isActive('/employer/dashboard')}>
                Dashboard
              </Link>
              <Link to="/employer/jobs" className={isActive('/employer/jobs')}>
                My Jobs
              </Link>
              <Link to="/employer/jobs/new" className={isActive('/employer/jobs/new')}>
                Post Job
              </Link>
              <Link to="/employer/profile" className={isActive('/employer/profile')}>
                Company Profile
              </Link>
            </>
          )}

          {/* Admin Navigation */}
          {isAdmin() && (
            <>
              <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>
                Dashboard
              </Link>
              <Link to="/admin/users" className={isActive('/admin/users')}>
                Users
              </Link>
              <Link to="/admin/employers" className={isActive('/admin/employers')}>
                Employers
              </Link>
              <Link to="/admin/jobs" className={isActive('/admin/jobs')}>
                Jobs
              </Link>
              <Link to="/admin/reports" className={isActive('/admin/reports')}>
                Reports
              </Link>
            </>
          )}

          {/* Guest Navigation */}
          {!isAuthenticated && (
            <Link to="/jobs" className={isActive('/jobs')}>
              Browse Jobs
            </Link>
          )}
          
          {isAuthenticated ? (
            <div className="navbar-user">
              <span className="user-greeting">
                Hi, {getUserName()}
                <span className="user-role">({user?.role})</span>
              </span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/auth" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/auth?mode=register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
