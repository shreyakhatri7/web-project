import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiMenu, FiX, FiBriefcase, FiSearch, FiHome, FiFileText } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <FiBriefcase size={24} />
          </div>
          <span className="logo-text">
            <span className="logo-main">CareerHub</span>
            <span className="logo-tagline">Find Your Dream Career</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          <Link to="/" className="nav-link">
            <FiHome size={18} />
            <span>Home</span>
          </Link>
          
          {user ? (
            <>
              {user.role === 'STUDENT' && (
                <>
                  <Link to="/jobs" className="nav-link">
                    <FiSearch size={18} />
                    <span>Browse Jobs</span>
                  </Link>
                  <Link to="/profile" className="nav-link">
                    <FiFileText size={18} />
                    <span>My Profile</span>
                  </Link>
                </>
              )}
              
              {user.role === 'EMPLOYER' && (
                <>
                  <Link to="/post-job" className="nav-link">
                    <span>Post a Job</span>
                  </Link>
                  <Link to="/profile" className="nav-link">
                    <span>Company Profile</span>
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <Link to="/admin/users" className="nav-link">
                  <span>Manage Users</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/jobs" className="nav-link">
                <FiSearch size={18} />
                <span>Browse Jobs</span>
              </Link>
              <Link to="/register" className="nav-link">
                <span>For Employers</span>
              </Link>
            </>
          )}
        </div>

        {/* User Menu / Auth Buttons */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0ea5e9&color=fff&size=32&rounded=true`} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="avatar-img"
                />
                <div className="user-info">
                  <span className="user-name">{user.firstName} {user.lastName}</span>
                  <span className="user-role">{user.role.toLowerCase()}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn" title="Sign out">
                  <FiLogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-content">
            <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <FiHome size={20} />
              <span>Home</span>
            </Link>
            
            {user ? (
              <>
                {user.role === 'STUDENT' && (
                  <>
                    <Link to="/jobs" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <FiSearch size={20} />
                      <span>Browse Jobs</span>
                    </Link>
                    <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <FiFileText size={20} />
                      <span>My Profile</span>
                    </Link>
                  </>
                )}
                
                {user.role === 'EMPLOYER' && (
                  <>
                    <Link to="/post-job" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <span>Post a Job</span>
                    </Link>
                    <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <span>Company Profile</span>
                    </Link>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <Link to="/admin/users" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <span>Manage Users</span>
                  </Link>
                )}

                <div className="mobile-user-info">
                  <div className="mobile-user-details">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0ea5e9&color=fff&size=40&rounded=true`} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="mobile-avatar"
                    />
                    <div>
                      <span className="mobile-user-name">{user.firstName} {user.lastName}</span>
                      <span className="mobile-user-role">{user.role.toLowerCase()}</span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="btn btn-outline w-full mt-4">
                    <FiLogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/jobs" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <FiSearch size={20} />
                  <span>Browse Jobs</span>
                </Link>
                <Link to="/register" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <span>For Employers</span>
                </Link>
                <div className="mobile-auth-buttons">
                  <Link to="/login" className="btn btn-ghost w-full" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />}
      </div>
    </nav>
  );
};

export default Navbar;