/**
 * Navbar Component
 * Role-based navigation menu
 * Shared by: All Team Members
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const {
    user,
    logout,
    isAuthenticated,
    isStudent,
    isEmployer,
    isAdmin,
    getDashboardPath,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMainDashboard = location.pathname === '/';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMainDashboard) {
      setIsScrolled(false);
      return undefined;
    }

    let frameRequested = false;
    let debounceTimer = null;

    const updateStickyState = () => {
      setIsScrolled(window.scrollY > 0);
      frameRequested = false;
    };

    const onScroll = () => {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }

      debounceTimer = window.setTimeout(() => {
        if (!frameRequested) {
          frameRequested = true;
          window.requestAnimationFrame(updateStickyState);
        }
      }, 16);
    };

    updateStickyState();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      window.removeEventListener('scroll', onScroll);
    };
  }, [isMainDashboard, location.pathname]);

  const handleLogout = () => {
    const redirectPath = user?.role === 'admin'
      ? '/admin/login'
      : user?.role === 'employer'
        ? '/employer'
        : '/auth';
    logout();
    setMobileMenuOpen(false);
    navigate(redirectPath, { replace: true });
  };

  const isActive = (paths) => {
    const pathList = Array.isArray(paths) ? paths : [paths];
    const isMatch = pathList.some((path) => {
      if (path === '/') {
        return location.pathname === '/';
      }
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
    });
    return isMatch ? 'nav-link active' : 'nav-link';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const getBrandRedirect = () => {
    if (isAuthenticated) {
      return getDashboardPath();
    }

    const isLoginPortalRoute =
      location.pathname.startsWith('/auth') ||
      location.pathname === '/admin' ||
      location.pathname.startsWith('/admin/login') ||
      location.pathname === '/employer' ||
      location.pathname === '/employer/';

    return isLoginPortalRoute ? '/' : '/auth';
  };

  const portalLabel = useMemo(() => {
    if (location.pathname === '/') return 'Main Dashboard';
    if (location.pathname.startsWith('/auth')) return 'Student Login';
    if (location.pathname.startsWith('/admin/login') || location.pathname === '/admin') return 'Admin Login';
    if (location.pathname === '/jobs' || location.pathname.startsWith('/jobs/')) {
      if (isStudent()) return 'Student Dashboard';
      if (isEmployer()) return 'Employer Dashboard';
      if (isAdmin()) return 'Admin Dashboard';
      return 'Opportunity Board';
    }
    if (location.pathname.startsWith('/admin')) return 'Admin Dashboard';
    if (location.pathname.startsWith('/employer')) {
      return isAuthenticated ? 'Employer Dashboard' : 'Employer Login';
    }
    if (isStudent()) return 'Student Dashboard';
    if (isEmployer()) return 'Employer Dashboard';
    if (isAdmin()) return 'Admin Dashboard';
    return 'Student Dashboard';
  }, [location.pathname, isAuthenticated, isStudent, isEmployer, isAdmin]);

  // Get user display name based on role and available profile fields
  const getUserName = () => {
    if (!user) return 'User';

    const profile = user.profile || {};
    const firstName = user.first_name || profile.first_name;
    const lastName = user.last_name || profile.last_name;
    const companyName = user.company_name || profile.company_name;

    if (firstName && lastName) return `${firstName} ${lastName}`.trim();
    if (firstName) return firstName;
    if (companyName) return companyName;
    return user.email?.split('@')[0] || 'User';
  };

  const getEmployerName = () => {
    if (!isEmployer()) return null;
    const profile = user?.profile || {};
    return user?.company_name || profile.company_name || null;
  };

  const getRoleNavigation = () => {
    if (isStudent()) {
      return [
        { to: '/dashboard', label: 'Dashboard', active: ['/dashboard'] },
        { to: '/jobs', label: 'Browse Jobs', active: ['/jobs'] },
        { to: '/applications', label: 'My Applications', active: ['/applications'] },
        { to: '/profile', label: 'Profile', active: ['/profile'] },
      ];
    }

    if (isEmployer()) {
      return [
        { to: '/employer/dashboard', label: 'Dashboard', active: ['/employer/dashboard'] },
        { to: '/employer/post-job', label: 'Post Job', active: ['/employer/post-job'] },
        { to: '/employer/jobs', label: 'Posted Jobs', active: ['/employer/jobs'] },
        { to: '/employer/applicants', label: 'Applications Received', active: ['/employer/applicants'] },
        { to: '/employer/profile', label: 'Profile', active: ['/employer/profile'] },
      ];
    }

    if (isAdmin()) {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', active: ['/admin/dashboard'] },
        { to: '/admin/students', label: 'Student Records', active: ['/admin/students'] },
        { to: '/admin/employers', label: 'Employer Records', active: ['/admin/employers'] },
        { to: '/admin/jobs', label: 'Job Verification', active: ['/admin/jobs'] },
        { to: '/admin/applications', label: 'Application Review', active: ['/admin/applications'] },
        { to: '/admin/admins', label: 'Admin', active: ['/admin/admins'] },
      ];
    }

    return [
      { to: '/', label: 'Main Dashboard', active: ['/'] },
      { to: '/jobs', label: 'Browse Jobs', active: ['/jobs'] },
      { to: '/employer', label: 'Employer Login', active: ['/employer'] },
    ];
  };

  const roleNavigation = getRoleNavigation();
  const navbarClassName = [
    'navbar',
    isMainDashboard ? 'navbar--always-sticky' : isScrolled ? 'navbar--scrolled' : 'navbar--at-top',
  ].join(' ');

  return (
    <nav className={navbarClassName}>
      <div className="navbar-container">
        <div className="navbar-brand-group">
          <Link to={getBrandRedirect()} className="navbar-brand" aria-label="KHCE Job Portal Home">
            <span className="brand-icon" aria-hidden="true">🎓</span>
            <span className="brand-text">KHCE Job Portal</span>
          </Link>
          <span className="dashboard-label">{portalLabel}</span>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {roleNavigation.map((item) => (
            <Link key={item.to} to={item.to} className={isActive(item.active)}>
              {item.label}
            </Link>
          ))}
          
          {isAuthenticated ? (
            <div className="navbar-user">
              <span className="user-greeting">
                <span className="user-name">{getUserName()}</span>
                {getEmployerName() && <span className="user-company">{getEmployerName()}</span>}
                <span className="user-role">{user?.role}</span>
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
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
