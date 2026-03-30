import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/authService';
import { FiSave, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './Profile.css';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    // Student fields
    university: '',
    degree: '',
    major: '',
    graduationYear: '',
    gpa: '',
    skills: '',
    bio: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    // Employer fields
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
    description: '',
    contactPerson: '',
    position: '',
    // Address
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserById(user.id);
      if (response.success) {
        const userData = response.data.user;
        const profile =
          userData.role === 'STUDENT'
            ? userData.studentProfile
            : userData.employerProfile;

        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          // Student fields
          university: profile?.university || '',
          degree: profile?.degree || '',
          major: profile?.major || '',
          graduationYear: profile?.graduationYear || '',
          gpa: profile?.gpa || '',
          skills: profile?.skills
            ? JSON.parse(profile.skills).join(', ')
            : '',
          bio: profile?.bio || '',
          linkedIn: profile?.linkedIn || '',
          github: profile?.github || '',
          portfolio: profile?.portfolio || '',
          // Employer fields
          companyName: profile?.companyName || '',
          companySize: profile?.companySize || '',
          industry: profile?.industry || '',
          website: profile?.website || '',
          description: profile?.description || '',
          contactPerson: profile?.contactPerson || '',
          position: profile?.position || '',
          // Address
          address: profile?.address || '',
          city: profile?.city || '',
          state: profile?.state || '',
          country: profile?.country || '',
          zipCode: profile?.zipCode || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Process skills if student
      const submitData = { ...formData };
      if (user.role === 'STUDENT' && formData.skills) {
        const skillsArray = formData.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter((skill) => skill);
        submitData.skills = JSON.stringify(skillsArray);
      }

      const response = await userService.updateUser(user.id, submitData);

      if (response.success) {
        updateUser(response.data.user);
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        });
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to update profile',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const isStudent = user.role === 'STUDENT';
  const isEmployer = user.role === 'EMPLOYER';

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <h1>Edit Profile</h1>
        <button className="btn-cancel" onClick={() => navigate('/profile')}>
          <FiX /> Cancel
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-profile-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Student-specific fields */}
        {isStudent && (
          <>
            <div className="form-section">
              <h2>Academic Information</h2>
              <div className="form-group">
                <label htmlFor="university">University</label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
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
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="graduationYear">Graduation Year</label>
                  <input
                    type="number"
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    min="2000"
                    max="2050"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gpa">GPA</label>
                  <input
                    type="number"
                    id="gpa"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="4.0"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Professional Information</h2>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills (comma-separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="JavaScript, React, Node.js, Python"
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkedIn">LinkedIn URL</label>
                <input
                  type="url"
                  id="linkedIn"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="form-group">
                <label htmlFor="github">GitHub URL</label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolio">Portfolio URL</label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </>
        )}

        {/* Employer-specific fields */}
        {isEmployer && (
          <>
            <div className="form-section">
              <h2>Company Information</h2>
              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
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
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="website">Company Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://company.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Company Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about your company..."
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Contact Person</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactPerson">Contact Person Name</label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Address Section (for both) */}
        <div className="form-section">
          <h2>Address</h2>
          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State/Province</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="zipCode">ZIP/Postal Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <FiSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
