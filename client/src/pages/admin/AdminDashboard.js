/**
 * Admin Dashboard Page
 * Member 4 - Admin Panel
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import './AdminDashboard.css';

const SECTION_PATHS = {
  dashboard: '/admin/dashboard',
  students: '/admin/students',
  employers: '/admin/employers',
  jobs: '/admin/jobs',
  applications: '/admin/applications',
  admins: '/admin/admins',
};

const resolveActiveSection = (pathname) => {
  if (pathname.startsWith('/admin/students')) return 'students';
  if (pathname.startsWith('/admin/employers')) return 'employers';
  if (pathname.startsWith('/admin/jobs')) return 'jobs';
  if (pathname.startsWith('/admin/applications')) return 'applications';
  if (pathname.startsWith('/admin/admins')) return 'admins';
  return 'dashboard';
};

const SECTION_DESCRIPTIONS = {
  dashboard: 'Overview with recent records and system counts',
  students: 'Full student records',
  employers: 'Full employer records',
  jobs: 'Full job verification queue',
  applications: 'Full application review queue',
  admins: 'Admin account management',
};

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = useMemo(() => resolveActiveSection(location.pathname), [location.pathname]);

  const [dashboard, setDashboard] = useState(null);
  const [studentTotal, setStudentTotal] = useState(0);
  const [employerTotal, setEmployerTotal] = useState(0);
  const [adminTotal, setAdminTotal] = useState(0);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentEmployers, setRecentEmployers] = useState([]);
  const [students, setStudents] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [adminForm, setAdminForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    permissions: 'manage_users, manage_jobs, manage_employers, view_reports',
  });

  const [jobDecisions, setJobDecisions] = useState({});
  const [jobReasons, setJobReasons] = useState({});
  const [applicationDecisions, setApplicationDecisions] = useState({});
  const [applicationReasons, setApplicationReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [processingTarget, setProcessingTarget] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');
  const [error, setError] = useState(null);

  const getErrorMessage = (err, fallback) => err.response?.data?.message || fallback;

  const fetchAllPaginatedRecords = useCallback(async (fetchPage, listKey) => {
    let currentPage = 1;
    let totalPages = 1;
    let total = 0;
    const records = [];

    do {
      const response = await fetchPage(currentPage);
      const pageItems = response.data?.[listKey] || [];
      const pagination = response.data?.pagination || {};

      records.push(...pageItems);
      total = Number(pagination.total || total || records.length);
      totalPages = Number(pagination.pages || 1);

      currentPage += 1;
    } while (currentPage <= totalPages);

    return {
      records,
      total: total || records.length,
    };
  }, []);

  const loadDashboardData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);

      const [
        dashboardResult,
        studentsResult,
        employersResult,
        pendingJobsResult,
        pendingApplicationsResult,
        adminsResult,
      ] = await Promise.allSettled([
        adminAPI.getDashboard(),
        fetchAllPaginatedRecords((page) => adminAPI.getAllStudents({ page, limit: 100 }), 'students'),
        fetchAllPaginatedRecords((page) => adminAPI.getAllEmployers({ page, limit: 100 }), 'employers'),
        adminAPI.getPendingJobs(),
        adminAPI.getPendingApplications(),
        adminAPI.getAdmins(),
      ]);

      if (dashboardResult.status === 'fulfilled') {
        setDashboard(dashboardResult.value.data);
      }

      if (studentsResult.status === 'fulfilled') {
        setStudents(studentsResult.value.records);
        setStudentTotal(studentsResult.value.total);
        setRecentStudents(studentsResult.value.records.slice(0, 2));
      } else {
        setStudents([]);
        setStudentTotal(0);
        setRecentStudents([]);
      }

      if (employersResult.status === 'fulfilled') {
        setEmployers(employersResult.value.records);
        setEmployerTotal(employersResult.value.total);
        setRecentEmployers(employersResult.value.records.slice(0, 2));
      } else {
        setEmployers([]);
        setEmployerTotal(0);
        setRecentEmployers([]);
      }

      if (pendingJobsResult.status === 'fulfilled') {
        setPendingJobs(pendingJobsResult.value.data?.jobs || []);
      } else {
        setPendingJobs([]);
      }

      if (pendingApplicationsResult.status === 'fulfilled') {
        setPendingApplications(pendingApplicationsResult.value.data?.applications || []);
      } else {
        setPendingApplications([]);
      }

      if (adminsResult.status === 'fulfilled') {
        const adminRecords = adminsResult.value.data?.admins || [];
        setAdmins(adminRecords);
        setAdminTotal(Number(adminsResult.value.data?.total || adminRecords.length));
      } else {
        setAdmins([]);
        setAdminTotal(0);
      }

      const coreResults = [
        dashboardResult,
        studentsResult,
        employersResult,
        pendingJobsResult,
        pendingApplicationsResult,
      ];
      const hasCoreSuccess = coreResults.some((result) => result.status === 'fulfilled');

      if (!hasCoreSuccess) {
        const firstError = coreResults.find((result) => result.status === 'rejected');
        setError(getErrorMessage(firstError?.reason, 'Failed to load admin dashboard'));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load admin dashboard')); 
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [fetchAllPaginatedRecords]);

  useEffect(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  useEffect(() => {
    if (location.pathname === '/admin/profile') {
      navigate('/admin/admins', { replace: true });
    }
  }, [location.pathname, navigate]);

  const sectionCounts = useMemo(() => ({
    dashboard: Number(dashboard?.stats?.total_users || 0),
    students: studentTotal,
    employers: employerTotal,
    jobs: pendingJobs.length,
    applications: pendingApplications.length,
    admins: adminTotal,
  }), [dashboard, studentTotal, employerTotal, pendingJobs.length, pendingApplications.length, adminTotal]);

  const sectionTabs = useMemo(() => ([
    { key: 'dashboard', label: 'Dashboard', path: SECTION_PATHS.dashboard },
    { key: 'students', label: 'Student Records', path: SECTION_PATHS.students },
    { key: 'employers', label: 'Employer Records', path: SECTION_PATHS.employers },
    { key: 'jobs', label: 'Job Verification', path: SECTION_PATHS.jobs },
    { key: 'applications', label: 'Application Review', path: SECTION_PATHS.applications },
    { key: 'admins', label: 'Admin', path: SECTION_PATHS.admins },
  ]), []);

  const clearJobForm = (jobId) => {
    setJobDecisions((prev) => {
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
    setJobReasons((prev) => {
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
  };

  const clearApplicationForm = (applicationId) => {
    setApplicationDecisions((prev) => {
      const next = { ...prev };
      delete next[applicationId];
      return next;
    });
    setApplicationReasons((prev) => {
      const next = { ...prev };
      delete next[applicationId];
      return next;
    });
  };

  const toggleJobDecision = (jobId, decision) => {
    setJobDecisions((prev) => ({
      ...prev,
      [jobId]: prev[jobId] === decision ? '' : decision,
    }));
  };

  const toggleApplicationDecision = (applicationId, decision) => {
    setApplicationDecisions((prev) => ({
      ...prev,
      [applicationId]: prev[applicationId] === decision ? '' : decision,
    }));
  };

  const handleDeleteStudent = async (student) => {
    const fullName = `${student.first_name} ${student.last_name}`.trim();
    const confirmDelete = window.confirm(
      `Delete student record for ${fullName || student.email}? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setActionLoading(true);
      setProcessingTarget(`student-${student.user_id}`);
      await adminAPI.deleteStudentRecord(student.user_id);
      setActionFeedback(`Student record deleted: ${fullName || student.email}`);
      await loadDashboardData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete student record'));
    } finally {
      setActionLoading(false);
      setProcessingTarget('');
    }
  };

  const handleDeleteEmployer = async (employer) => {
    const confirmDelete = window.confirm(
      `Delete employer record for ${employer.company_name}? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setActionLoading(true);
      setProcessingTarget(`employer-${employer.user_id}`);
      await adminAPI.deleteEmployerRecord(employer.user_id);
      setActionFeedback(`Employer record deleted: ${employer.company_name}`);
      await loadDashboardData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete employer record'));
    } finally {
      setActionLoading(false);
      setProcessingTarget('');
    }
  };

  const handleReviewJob = async (job) => {
    const decision = jobDecisions[job.id];
    if (!decision) {
      setError('Select either accept or reject before submitting job review.');
      return;
    }

    if (decision === 'reject' && !(jobReasons[job.id] || '').trim()) {
      setError('Rejection reason is required when rejecting a job posting.');
      return;
    }

    try {
      setActionLoading(true);
      setProcessingTarget(`job-${job.id}`);
      setError(null);

      await adminAPI.reviewJob(job.id, {
        decision,
        reason: (jobReasons[job.id] || '').trim() || undefined,
      });

      setActionFeedback(`Job ${decision === 'accept' ? 'approved' : 'rejected'}: ${job.title}`);
      clearJobForm(job.id);
      await loadDashboardData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to review job posting'));
    } finally {
      setActionLoading(false);
      setProcessingTarget('');
    }
  };

  const handleReviewApplication = async (application) => {
    const decision = applicationDecisions[application.id];
    if (!decision) {
      setError('Select either accept or reject before submitting application review.');
      return;
    }

    if (decision === 'reject' && !(applicationReasons[application.id] || '').trim()) {
      setError('Rejection reason is required when rejecting an application.');
      return;
    }

    try {
      setActionLoading(true);
      setProcessingTarget(`application-${application.id}`);
      setError(null);

      await adminAPI.reviewApplication(application.id, {
        decision,
        reason: (applicationReasons[application.id] || '').trim() || undefined,
      });

      setActionFeedback(
        `Application ${decision === 'accept' ? 'approved' : 'rejected'}: ${application.first_name} ${application.last_name}`
      );
      clearApplicationForm(application.id);
      await loadDashboardData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to review application'));
    } finally {
      setActionLoading(false);
      setProcessingTarget('');
    }
  };

  const handleAdminFormChange = (event) => {
    const { name, value } = event.target;
    setAdminForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetAdminForm = () => {
    setAdminForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      permissions: 'manage_users, manage_jobs, manage_employers, view_reports',
    });
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setError(null);
    setActionFeedback('');

    if (adminForm.password !== adminForm.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    try {
      setCreatingAdmin(true);

      const permissions = adminForm.permissions
        .split(',')
        .map((permission) => permission.trim())
        .filter(Boolean);

      await adminAPI.createAdmin({
        first_name: adminForm.first_name,
        last_name: adminForm.last_name,
        email: adminForm.email,
        phone: adminForm.phone,
        password: adminForm.password,
        permissions,
      });

      setActionFeedback(`Admin account created for ${adminForm.email}.`);
      resetAdminForm();
      await loadDashboardData(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create admin account'));
    } finally {
      setCreatingAdmin(false);
    }
  };

  const isProcessing = (target) => actionLoading && processingTarget === target;

  if (loading) return <Loading message="Loading admin dashboard..." />;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <span className="welcome-text">{SECTION_DESCRIPTIONS[activeSection]}</span>
        </div>
        <button
          className="refresh-button"
          onClick={() => loadDashboardData(false)}
          disabled={actionLoading}
        >
          Refresh
        </button>
      </div>

      <nav className="admin-section-nav" aria-label="Admin dashboard sections">
        {sectionTabs.map((tab) => (
          <Link
            key={tab.key}
            to={tab.path}
            className={`section-nav-link ${activeSection === tab.key ? 'active' : ''}`}
          >
            <span>{tab.label}</span>
            <span className="section-nav-count">{sectionCounts[tab.key]}</span>
          </Link>
        ))}
      </nav>

      {error && <div className="error-message">{error}</div>}
      {actionFeedback && <div className="success-message">{actionFeedback}</div>}

      {activeSection === 'dashboard' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">👥</div>
              <div className="stat-info">
                <span className="stat-value">{dashboard?.stats?.total_users || 0}</span>
                <span className="stat-label">Total Users</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon students">🎓</div>
              <div className="stat-info">
                <span className="stat-value">{studentTotal}</span>
                <span className="stat-label">Student Records</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon employers">🏢</div>
              <div className="stat-info">
                <span className="stat-value">{employerTotal}</span>
                <span className="stat-label">Employer Records</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon jobs">💼</div>
              <div className="stat-info">
                <span className="stat-value">{pendingJobs.length}</span>
                <span className="stat-label">Jobs Pending Verification</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon applications">📄</div>
              <div className="stat-info">
                <span className="stat-value">{pendingApplications.length}</span>
                <span className="stat-label">Applications Pending Review</span>
              </div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-icon active">🛡️</div>
              <div className="stat-info">
                <span className="stat-value">{adminTotal}</span>
                <span className="stat-label">Admin Accounts</span>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <section>
              <div className="section-header">
                <Link className="section-title-link" to={SECTION_PATHS.students}>Student Records</Link>
                <span className="badge-count">{studentTotal}</span>
              </div>
              {recentStudents.length > 0 ? (
                <div className="record-list compact-list">
                  {recentStudents.map((student) => (
                    <div key={student.student_id} className="record-card">
                      <div>
                        <h3>{student.first_name} {student.last_name}</h3>
                        <p>{student.email}</p>
                        <small>{student.university || 'University not set'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No student records found.</p>
              )}
              <Link className="view-all-link" to={SECTION_PATHS.students}>View all student records</Link>
            </section>

            <section>
              <div className="section-header">
                <Link className="section-title-link" to={SECTION_PATHS.employers}>Employer Records</Link>
                <span className="badge-count">{employerTotal}</span>
              </div>
              {recentEmployers.length > 0 ? (
                <div className="record-list compact-list">
                  {recentEmployers.map((employer) => (
                    <div key={employer.id} className="record-card">
                      <div>
                        <h3>{employer.company_name}</h3>
                        <p>{employer.email}</p>
                        <small>{employer.is_verified ? 'Verified employer' : 'Unverified employer'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No employer records found.</p>
              )}
              <Link className="view-all-link" to={SECTION_PATHS.employers}>View all employer records</Link>
            </section>

            <section>
              <div className="section-header">
                <Link className="section-title-link" to={SECTION_PATHS.jobs}>Job Verification</Link>
                <span className="badge-count">{pendingJobs.length}</span>
              </div>
              {pendingJobs.slice(0, 2).length > 0 ? (
                <div className="review-list compact-list">
                  {pendingJobs.slice(0, 2).map((job) => (
                    <div key={job.id} className="review-card">
                      <div className="review-title-row">
                        <h3>{job.title}</h3>
                        <span className="review-meta">{job.company_name}</span>
                      </div>
                      <p className="review-subtext">
                        {job.location || 'Location not specified'} | {job.job_type || 'job'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No pending job reviews.</p>
              )}
              <Link className="view-all-link" to={SECTION_PATHS.jobs}>View full job verification queue</Link>
            </section>

            <section>
              <div className="section-header">
                <Link className="section-title-link" to={SECTION_PATHS.applications}>Application Review</Link>
                <span className="badge-count">{pendingApplications.length}</span>
              </div>
              {pendingApplications.slice(0, 2).length > 0 ? (
                <div className="review-list compact-list">
                  {pendingApplications.slice(0, 2).map((application) => (
                    <div key={application.id} className="review-card">
                      <div className="review-title-row">
                        <h3>{application.first_name} {application.last_name}</h3>
                        <span className="review-meta">{application.job_title}</span>
                      </div>
                      <p className="review-subtext">
                        {application.student_email} | {application.university || 'University not set'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No pending application reviews.</p>
              )}
              <Link className="view-all-link" to={SECTION_PATHS.applications}>View full application review queue</Link>
            </section>
          </div>
        </>
      )}

      {activeSection === 'jobs' && (
        <section className="full-records-panel">
          <div className="section-header">
            <h2>Job Posting Reviews</h2>
            <span className="badge-count">{pendingJobs.length}</span>
          </div>
          {pendingJobs.length > 0 ? (
            <div className="review-list">
              {pendingJobs.map((job) => (
                <div key={job.id} className="review-card">
                  <div className="review-title-row">
                    <h3>{job.title}</h3>
                    <span className="review-meta">{job.company_name}</span>
                  </div>
                  <p className="review-subtext">
                    {job.location || 'Location not specified'} | {job.job_type || 'job'}
                  </p>
                  <div className="decision-row">
                    <label className="decision-option">
                      <input
                        type="checkbox"
                        checked={jobDecisions[job.id] === 'accept'}
                        onChange={() => toggleJobDecision(job.id, 'accept')}
                        disabled={actionLoading}
                      />
                      Accept
                    </label>
                    <label className="decision-option reject">
                      <input
                        type="checkbox"
                        checked={jobDecisions[job.id] === 'reject'}
                        onChange={() => toggleJobDecision(job.id, 'reject')}
                        disabled={actionLoading}
                      />
                      Reject
                    </label>
                  </div>
                  <textarea
                    className="reason-input"
                    rows={2}
                    placeholder="Reason (required for reject, optional for accept)"
                    value={jobReasons[job.id] || ''}
                    onChange={(event) =>
                      setJobReasons((prev) => ({
                        ...prev,
                        [job.id]: event.target.value,
                      }))
                    }
                    disabled={actionLoading}
                  />
                  <button
                    className="primary-button"
                    onClick={() => handleReviewJob(job)}
                    disabled={actionLoading}
                  >
                    {isProcessing(`job-${job.id}`) ? 'Submitting...' : 'Submit Decision'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No pending job reviews.</p>
          )}
        </section>
      )}

      {activeSection === 'applications' && (
        <section className="full-records-panel">
          <div className="section-header">
            <h2>Application Reviews</h2>
            <span className="badge-count">{pendingApplications.length}</span>
          </div>
          {pendingApplications.length > 0 ? (
            <div className="review-list">
              {pendingApplications.map((application) => (
                <div key={application.id} className="review-card">
                  <div className="review-title-row">
                    <h3>{application.first_name} {application.last_name}</h3>
                    <span className="review-meta">{application.job_title}</span>
                  </div>
                  <p className="review-subtext">
                    {application.student_email} | {application.university || 'University not set'}
                  </p>
                  <div className="decision-row">
                    <label className="decision-option">
                      <input
                        type="checkbox"
                        checked={applicationDecisions[application.id] === 'accept'}
                        onChange={() => toggleApplicationDecision(application.id, 'accept')}
                        disabled={actionLoading}
                      />
                      Accept
                    </label>
                    <label className="decision-option reject">
                      <input
                        type="checkbox"
                        checked={applicationDecisions[application.id] === 'reject'}
                        onChange={() => toggleApplicationDecision(application.id, 'reject')}
                        disabled={actionLoading}
                      />
                      Reject
                    </label>
                  </div>
                  <textarea
                    className="reason-input"
                    rows={2}
                    placeholder="Reason (required for reject, optional for accept)"
                    value={applicationReasons[application.id] || ''}
                    onChange={(event) =>
                      setApplicationReasons((prev) => ({
                        ...prev,
                        [application.id]: event.target.value,
                      }))
                    }
                    disabled={actionLoading}
                  />
                  <button
                    className="primary-button"
                    onClick={() => handleReviewApplication(application)}
                    disabled={actionLoading}
                  >
                    {isProcessing(`application-${application.id}`) ? 'Submitting...' : 'Submit Decision'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No pending application reviews.</p>
          )}
        </section>
      )}

      {activeSection === 'students' && (
        <section className="full-records-panel">
          <div className="section-header">
            <h2>Student Records</h2>
            <span className="badge-count">{studentTotal}</span>
          </div>
          {students.length > 0 ? (
            <div className="record-list">
              {students.map((student) => (
                <div key={student.student_id} className="record-card">
                  <div>
                    <h3>{student.first_name} {student.last_name}</h3>
                    <p>{student.email}</p>
                    <small>{student.university || 'University not set'}</small>
                  </div>
                  <button
                    className="danger-button"
                    onClick={() => handleDeleteStudent(student)}
                    disabled={actionLoading}
                  >
                    {isProcessing(`student-${student.user_id}`) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No student records found.</p>
          )}
        </section>
      )}

      {activeSection === 'employers' && (
        <section className="full-records-panel">
          <div className="section-header">
            <h2>Employer Records</h2>
            <span className="badge-count">{employerTotal}</span>
          </div>
          {employers.length > 0 ? (
            <div className="record-list">
              {employers.map((employer) => (
                <div key={employer.id} className="record-card">
                  <div>
                    <h3>{employer.company_name}</h3>
                    <p>{employer.email}</p>
                    <small>{employer.is_verified ? 'Verified employer' : 'Unverified employer'}</small>
                  </div>
                  <button
                    className="danger-button"
                    onClick={() => handleDeleteEmployer(employer)}
                    disabled={actionLoading}
                  >
                    {isProcessing(`employer-${employer.user_id}`) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No employer records found.</p>
          )}
        </section>
      )}

      {activeSection === 'admins' && (
        <div className="admin-management-grid">
          <section className="admin-create-card">
            <h2>Add New Admin</h2>
            <p className="form-subtext">Create another administrator for platform control.</p>

            <form className="admin-form" onSubmit={handleCreateAdmin}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={adminForm.first_name}
                    onChange={handleAdminFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={adminForm.last_name}
                    onChange={handleAdminFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Admin Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={adminForm.email}
                  onChange={handleAdminFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone (Optional)</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={adminForm.phone}
                  onChange={handleAdminFormChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={adminForm.password}
                    onChange={handleAdminFormChange}
                    minLength={6}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={adminForm.confirmPassword}
                    onChange={handleAdminFormChange}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="permissions">Permissions (comma separated)</label>
                <input
                  id="permissions"
                  name="permissions"
                  type="text"
                  value={adminForm.permissions}
                  onChange={handleAdminFormChange}
                />
              </div>

              <button className="primary-button" type="submit" disabled={creatingAdmin}>
                {creatingAdmin ? 'Creating Admin...' : 'Create Admin'}
              </button>
            </form>
          </section>

          <section className="admin-list-card">
            <div className="section-header">
              <h2>Existing Admins</h2>
              <span className="badge-count">{adminTotal}</span>
            </div>

            {admins.length > 0 ? (
              <div className="record-list">
                {admins.map((admin) => (
                  <div key={admin.id} className="record-card">
                    <div>
                      <h3>{admin.first_name} {admin.last_name}</h3>
                      <p>{admin.email}</p>
                      <small>
                        Permissions: {(admin.permissions || []).length > 0
                          ? admin.permissions.join(', ')
                          : 'No explicit permissions'}
                      </small>
                    </div>
                    <span className={`admin-status ${admin.status === 'active' ? 'active' : 'inactive'}`}>
                      {admin.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No admin accounts found.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
