import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/authService';
import {
  FiEdit,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiBriefcase,
  FiBookOpen,
  FiCalendar,
  FiAward,
  FiGithub,
  FiLinkedin,
  FiGlobe,
} from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserById(user.id);
      if (response.success) {
        setProfileData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return <div className="error-container">Failed to load profile</div>;
  }

  const isStudent = profileData.role === 'STUDENT';
  const isEmployer = profileData.role === 'EMPLOYER';
  const profile = isStudent ? profileData.studentProfile : profileData.employerProfile;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt={profileData.firstName} />
            ) : (
              <div className="avatar-placeholder">
                {profileData.firstName[0]}
                {profileData.lastName[0]}
              </div>
            )}
          </div>
          <div className="profile-header-info">
            <h1>
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="profile-role">{profileData.role}</p>
            {isEmployer && profile && (
              <p className="company-name">
                <FiBriefcase /> {profile.companyName}
              </p>
            )}
          </div>
          <button className="btn-edit" onClick={() => navigate('/profile/edit')}>
            <FiEdit /> Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-content">
        {/* Contact Information */}
        <div className="profile-section">
          <h2>Contact Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <FiMail className="info-icon" />
              <div>
                <label>Email</label>
                <p>{profileData.email}</p>
              </div>
            </div>
            {profileData.phone && (
              <div className="info-item">
                <FiPhone className="info-icon" />
                <div>
                  <label>Phone</label>
                  <p>{profileData.phone}</p>
                </div>
              </div>
            )}
            {profile?.city && (
              <div className="info-item">
                <FiMapPin className="info-icon" />
                <div>
                  <label>Location</label>
                  <p>
                    {profile.city}
                    {profile.state && `, ${profile.state}`}
                    {profile.country && `, ${profile.country}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student-specific information */}
        {isStudent && profile && (
          <>
            {/* Academic Information */}
            {(profile.university || profile.degree || profile.major) && (
              <div className="profile-section">
                <h2>
                  <FiBookOpen /> Academic Information
                </h2>
                <div className="info-grid">
                  {profile.university && (
                    <div className="info-item">
                      <div>
                        <label>University</label>
                        <p>{profile.university}</p>
                      </div>
                    </div>
                  )}
                  {profile.degree && (
                    <div className="info-item">
                      <div>
                        <label>Degree</label>
                        <p>{profile.degree}</p>
                      </div>
                    </div>
                  )}
                  {profile.major && (
                    <div className="info-item">
                      <div>
                        <label>Major</label>
                        <p>{profile.major}</p>
                      </div>
                    </div>
                  )}
                  {profile.graduationYear && (
                    <div className="info-item">
                      <FiCalendar className="info-icon" />
                      <div>
                        <label>Graduation Year</label>
                        <p>{profile.graduationYear}</p>
                      </div>
                    </div>
                  )}
                  {profile.gpa && (
                    <div className="info-item">
                      <FiAward className="info-icon" />
                      <div>
                        <label>GPA</label>
                        <p>{profile.gpa}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="profile-section">
                <h2>About Me</h2>
                <p className="bio-text">{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && (
              <div className="profile-section">
                <h2>Skills</h2>
                <div className="skills-container">
                  {JSON.parse(profile.skills || '[]').map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(profile.linkedIn || profile.github || profile.portfolio) && (
              <div className="profile-section">
                <h2>Links</h2>
                <div className="links-container">
                  {profile.linkedIn && (
                    <a
                      href={profile.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-link"
                    >
                      <FiLinkedin /> LinkedIn
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-link"
                    >
                      <FiGithub /> GitHub
                    </a>
                  )}
                  {profile.portfolio && (
                    <a
                      href={profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-link"
                    >
                      <FiGlobe /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Employer-specific information */}
        {isEmployer && profile && (
          <>
            {/* Company Information */}
            <div className="profile-section">
              <h2>
                <FiBriefcase /> Company Information
              </h2>
              <div className="info-grid">
                {profile.industry && (
                  <div className="info-item">
                    <div>
                      <label>Industry</label>
                      <p>{profile.industry}</p>
                    </div>
                  </div>
                )}
                {profile.companySize && (
                  <div className="info-item">
                    <div>
                      <label>Company Size</label>
                      <p>{profile.companySize} employees</p>
                    </div>
                  </div>
                )}
                {profile.website && (
                  <div className="info-item">
                    <FiGlobe className="info-icon" />
                    <div>
                      <label>Website</label>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Description */}
            {profile.description && (
              <div className="profile-section">
                <h2>About Company</h2>
                <p className="bio-text">{profile.description}</p>
              </div>
            )}

            {/* Contact Person */}
            {(profile.contactPerson || profile.position) && (
              <div className="profile-section">
                <h2>Contact Person</h2>
                <div className="info-grid">
                  {profile.contactPerson && (
                    <div className="info-item">
                      <FiUser className="info-icon" />
                      <div>
                        <label>Name</label>
                        <p>{profile.contactPerson}</p>
                      </div>
                    </div>
                  )}
                  {profile.position && (
                    <div className="info-item">
                      <div>
                        <label>Position</label>
                        <p>{profile.position}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
