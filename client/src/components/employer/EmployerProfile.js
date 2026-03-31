import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './EmployerProfile.css';

const EmployerProfile = ({ employer }) => {
    const { user } = useAuth();
    const profile = user?.profile || {};

    const companyName = employer?.company_name || profile.company_name || 'Employer Account';
    const email = employer?.email || user?.email || 'Not available';
    const industry = employer?.industry || profile.industry || 'Not specified';
    const website = employer?.company_website || employer?.website_url || profile.company_website || 'Not specified';
    const location = employer?.company_location || employer?.address || profile.company_location || 'Not specified';
    const contactName = employer?.contact_name || profile.contact_name || 'Not specified';
    const contactPhone = employer?.contact_phone || employer?.contact_number || profile.contact_phone || 'Not specified';

    return (
        <div className="employer-profile-page">
            <div className="employer-profile-card">
                <div className="profile-header">
                    <h1>Employer Profile</h1>
                    <p>Company details used across your job postings and applications.</p>
                </div>

                <div className="profile-grid">
                    <div className="profile-item">
                        <span className="profile-label">Company Name</span>
                        <span className="profile-value">{companyName}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Industry</span>
                        <span className="profile-value">{industry}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Email</span>
                        <span className="profile-value">{email}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Website</span>
                        <span className="profile-value">{website}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Location</span>
                        <span className="profile-value">{location}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Contact Person</span>
                        <span className="profile-value">{contactName}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Contact Number</span>
                        <span className="profile-value">{contactPhone}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerProfile;
