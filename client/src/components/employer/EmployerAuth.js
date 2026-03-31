import React, { useState } from 'react';
import axios from 'axios';
import './EmployerAuth.css';

const EmployerAuth = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    
    const [registerData, setRegisterData] = useState({
        company_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact_number: '',
        address: '',
        company_description: '',
        industry: '',
        website_url: ''
    });

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegisterChange = (e) => {
        setRegisterData({
            ...registerData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/auth/login', {
                ...loginData,
                expectedRole: 'employer'
            });

            const user = response.data.user;
            const token = response.data.token;
            const employerData = {
                ...(user.profile || {}),
                email: user.email
            };

            // Keep both unified auth keys and legacy employer keys for module compatibility.
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('employerToken', token);
            localStorage.setItem('employerData', JSON.stringify(employerData));
            window.dispatchEvent(new Event('auth-change'));

            onAuthSuccess(employerData);
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                email: registerData.email,
                password: registerData.password,
                role: 'employer',
                company_name: registerData.company_name,
                company_description: registerData.company_description,
                company_location: registerData.address,
                industry: registerData.industry,
                company_website: registerData.website_url,
                contact_phone: registerData.contact_number
            };
            const response = await axios.post('http://localhost:8000/api/auth/register', payload);

            const user = response.data.user;
            const token = response.data.token;
            const employerData = {
                ...(user.profile || {}),
                email: user.email
            };

            // Keep both unified auth keys and legacy employer keys for module compatibility.
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('employerToken', token);
            localStorage.setItem('employerData', JSON.stringify(employerData));
            window.dispatchEvent(new Event('auth-change'));

            onAuthSuccess(employerData);
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="employer-auth">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Employer Portal</h1>
                    <p>Manage your job postings and find the best candidates</p>
                </div>

                <div className="auth-tabs">
                    <button 
                        className={`tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button 
                        className={`tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {isLogin ? (
                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                placeholder="Enter your company email"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="company_name">Company Name *</label>
                                <input
                                    type="text"
                                    id="company_name"
                                    name="company_name"
                                    value={registerData.company_name}
                                    onChange={handleRegisterChange}
                                    placeholder="Your company name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="industry">Industry</label>
                                <select
                                    id="industry"
                                    name="industry"
                                    value={registerData.industry}
                                    onChange={handleRegisterChange}
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Education">Education</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="reg-email">Email *</label>
                                <input
                                    type="email"
                                    id="reg-email"
                                    name="email"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    placeholder="Company email address"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact_number">Contact Number</label>
                                <input
                                    type="tel"
                                    id="contact_number"
                                    name="contact_number"
                                    value={registerData.contact_number}
                                    onChange={handleRegisterChange}
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="reg-password">Password *</label>
                                <input
                                    type="password"
                                    id="reg-password"
                                    name="password"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    placeholder="Create a password"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={registerData.confirmPassword}
                                    onChange={handleRegisterChange}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="address">Company Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={registerData.address}
                                onChange={handleRegisterChange}
                                placeholder="Company address"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="website_url">Website URL</label>
                            <input
                                type="url"
                                id="website_url"
                                name="website_url"
                                value={registerData.website_url}
                                onChange={handleRegisterChange}
                                placeholder="https://yourcompany.com"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="company_description">Company Description</label>
                            <textarea
                                id="company_description"
                                name="company_description"
                                value={registerData.company_description}
                                onChange={handleRegisterChange}
                                placeholder="Tell us about your company..."
                                rows="3"
                            ></textarea>
                        </div>
                        
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EmployerAuth;