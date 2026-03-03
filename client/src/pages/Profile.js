import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import Loading from '../components/common/Loading';
import './Profile.css';

const Profile = () => {
  const { student, setStudent } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('basic');

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
  });

  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getProfile();
      const profile = response.data.profile;

      setBasicInfo({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      });

      setEducation(profile.education || []);
      setSkills(profile.skills || []);
      setResumeUrl(profile.resume_url || '');
    } catch (err) {
      showMessage('error', 'Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Basic Info handlers
  const handleBasicInfoChange = (e) => {
    setBasicInfo({
      ...basicInfo,
      [e.target.name]: e.target.value,
    });
  };

  const saveBasicInfo = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await studentAPI.updateProfile(basicInfo);
      setStudent({ ...student, ...basicInfo });
      showMessage('success', 'Profile updated successfully');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Education handlers
  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now(),
        institution: '',
        degree: '',
        field: '',
        start_year: '',
        end_year: '',
        current: false,
      },
    ]);
  };

  const updateEducation = (id, field, value) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const saveEducation = async () => {
    try {
      setSaving(true);
      await studentAPI.updateEducation({ education });
      showMessage('success', 'Education updated successfully');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update education');
    } finally {
      setSaving(false);
    }
  };

  // Skills handlers
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const saveSkills = async () => {
    try {
      setSaving(true);
      await studentAPI.updateSkills({ skills });
      showMessage('success', 'Skills updated successfully');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update skills');
    } finally {
      setSaving(false);
    }
  };

  // Resume handlers
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Only PDF, DOC, and DOCX files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const response = await studentAPI.uploadResume(file);
      setResumeUrl(response.data.resume_url);
      showMessage('success', 'Resume uploaded successfully');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const deleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;

    try {
      setUploading(true);
      await studentAPI.deleteResume();
      setResumeUrl('');
      showMessage('success', 'Resume deleted successfully');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to delete resume');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading profile..." />;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and resume</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{message.text}</span>
          </div>
        )}

        <div className="profile-layout">
          {/* Sidebar Tabs */}
          <div className="profile-sidebar">
            <button
              onClick={() => setActiveTab('basic')}
              className={`profile-tab ${activeTab === 'basic' ? 'active' : ''}`}
            >
              <span>👤</span> Basic Info
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`profile-tab ${activeTab === 'education' ? 'active' : ''}`}
            >
              <span>🎓</span> Education
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`profile-tab ${activeTab === 'skills' ? 'active' : ''}`}
            >
              <span>💡</span> Skills
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`profile-tab ${activeTab === 'resume' ? 'active' : ''}`}
            >
              <span>📄</span> Resume
            </button>
          </div>

          {/* Main Content */}
          <div className="profile-content">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="card">
                <h2 className="card-title">Basic Information</h2>
                <form onSubmit={saveBasicInfo}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={basicInfo.first_name}
                        onChange={handleBasicInfoChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={basicInfo.last_name}
                        onChange={handleBasicInfoChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={basicInfo.phone}
                      onChange={handleBasicInfoChange}
                      className="form-input"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      value={basicInfo.bio}
                      onChange={handleBasicInfoChange}
                      className="form-textarea"
                      rows={4}
                      placeholder="Tell employers about yourself..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner spinner-sm"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Education</h2>
                  <button onClick={addEducation} className="btn btn-outline btn-sm">
                    + Add Education
                  </button>
                </div>

                {education.length > 0 ? (
                  <div className="education-list">
                    {education.map((edu, index) => (
                      <div key={edu.id} className="education-item">
                        <div className="education-item-header">
                          <span className="education-number">#{index + 1}</span>
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Institution</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              className="form-input"
                              placeholder="University/College name"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Degree</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              className="form-input"
                              placeholder="Bachelor's, Master's, etc."
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Field of Study</label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            className="form-input"
                            placeholder="Computer Science, Business, etc."
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">Start Year</label>
                            <input
                              type="number"
                              value={edu.start_year}
                              onChange={(e) => updateEducation(edu.id, 'start_year', e.target.value)}
                              className="form-input"
                              placeholder="2020"
                              min="1950"
                              max="2030"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">End Year</label>
                            <input
                              type="number"
                              value={edu.end_year}
                              onChange={(e) => updateEducation(edu.id, 'end_year', e.target.value)}
                              className="form-input"
                              placeholder="2024"
                              min="1950"
                              max="2030"
                              disabled={edu.current}
                            />
                          </div>
                        </div>

                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={edu.current}
                            onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                          />
                          Currently studying here
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No education added yet</p>
                  </div>
                )}

                <button
                  onClick={saveEducation}
                  className="btn btn-primary mt-4"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner spinner-sm"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Education'
                  )}
                </button>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="card">
                <h2 className="card-title">Skills</h2>

                <div className="skill-input-group">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="form-input"
                    placeholder="Add a skill (e.g., JavaScript, Python)"
                  />
                  <button onClick={addSkill} className="btn btn-outline">
                    Add
                  </button>
                </div>

                {skills.length > 0 ? (
                  <div className="skills-grid">
                    {skills.map((skill, index) => (
                      <div key={index} className="skill-item">
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="skill-remove"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No skills added yet</p>
                  </div>
                )}

                <button
                  onClick={saveSkills}
                  className="btn btn-primary mt-4"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner spinner-sm"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Skills'
                  )}
                </button>
              </div>
            )}

            {/* Resume Tab */}
            {activeTab === 'resume' && (
              <div className="card">
                <h2 className="card-title">Resume</h2>

                <div className="resume-section">
                  {resumeUrl ? (
                    <div className="resume-uploaded">
                      <div className="resume-file">
                        <span className="resume-icon">📄</span>
                        <div className="resume-info">
                          <span className="resume-name">
                            {resumeUrl.split('/').pop()}
                          </span>
                          <span className="resume-status">Uploaded successfully</span>
                        </div>
                      </div>
                      <div className="resume-actions">
                        <a
                          href={`http://localhost:5000${resumeUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          View Resume
                        </a>
                        <button
                          onClick={deleteResume}
                          className="btn btn-danger btn-sm"
                          disabled={uploading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="resume-upload">
                      <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        <span className="upload-icon">📤</span>
                        <p className="upload-text">
                          {uploading ? 'Uploading...' : 'Click to upload your resume'}
                        </p>
                        <p className="upload-hint">PDF, DOC, or DOCX (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleResumeUpload}
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        hidden
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
