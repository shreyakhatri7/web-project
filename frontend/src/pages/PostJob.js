import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PostJob = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role !== 'EMPLOYER') {
    return (
      <div className="page">
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h1 className="h1">Post a Job</h1>
              <p className="muted">This page is available for employer accounts.</p>
            </div>
            <div className="card-body">
              <Link className="btn btn-secondary" to="/">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="h1">Create a Job Posting</h1>
            <p className="muted">
              Employer job posting is not implemented yet. We can add a professional flow (draft → publish)
              and connect it to Prisma + MySQL.
            </p>
          </div>
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-title">Posting flow coming next</div>
              <div className="empty-subtitle">
                Tell me which fields you want (title, stipend/salary, location, skills, openings, deadline, etc.).
              </div>
              <Link className="btn btn-primary" to="/profile">
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
