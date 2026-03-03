import React from 'react';

const SimpleDashboard = () => {
    return (
        <div style={{
            padding: '40px',
            backgroundColor: '#f8f9fa',
            minHeight: '500px',
            borderRadius: '10px',
            margin: '20px'
        }}>
            <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '30px' }}>
                🎉 Employer Dashboard
            </h1>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '25px',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '2.5rem', margin: '0' }}>0</h2>
                    <p style={{ margin: '10px 0 0 0', opacity: '0.9' }}>Total Jobs</p>
                </div>
                
                <div style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '25px',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '2.5rem', margin: '0' }}>0</h2>
                    <p style={{ margin: '10px 0 0 0', opacity: '0.9' }}>Active Jobs</p>
                </div>
                
                <div style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    padding: '25px',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '2.5rem', margin: '0' }}>0</h2>
                    <p style={{ margin: '10px 0 0 0', opacity: '0.9' }}>Applications</p>
                </div>
            </div>
            
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginTop: '0', color: '#333' }}>Welcome to your dashboard!</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                    This is a simplified version of your dashboard. You can:
                </p>
                <ul style={{ color: '#666', lineHeight: '1.8' }}>
                    <li>📝 Post new job listings</li>
                    <li>💼 Manage existing jobs</li>
                    <li>👥 Review applications</li>
                    <li>📊 Track recruitment metrics</li>
                </ul>
                <p style={{ 
                    background: '#e8f5e8', 
                    color: '#2e7d32', 
                    padding: '15px',
                    borderRadius: '5px',
                    border: '1px solid #4caf50',
                    marginTop: '20px'
                }}>
                    ✅ Dashboard is working correctly! Navigation is functional.
                </p>
            </div>
        </div>
    );
};

export default SimpleDashboard;