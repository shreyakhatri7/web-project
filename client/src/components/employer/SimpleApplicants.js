import React from 'react';

const SimpleApplicants = () => {
    const sampleApplicants = [
        { id: 1, name: 'John Doe', job: 'Frontend Developer', status: 'Pending' },
        { id: 2, name: 'Jane Smith', job: 'Backend Engineer', status: 'Reviewed' },
        { id: 3, name: 'Bob Johnson', job: 'Full Stack Developer', status: 'Pending' }
    ];
    
    return (
        <div style={{
            padding: '40px',
            backgroundColor: '#f8f9fa',
            minHeight: '500px',
            borderRadius: '10px',
            margin: '20px'
        }}>
            <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '30px' }}>
                👥 Job Applicants
            </h1>
            
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'grid',
                    gap: '15px'
                }}>
                    {sampleApplicants.map(applicant => (
                        <div key={applicant.id} style={{
                            border: '1px solid #eee',
                            borderRadius: '8px',
                            padding: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{applicant.name}</h4>
                                <p style={{ margin: '0', color: '#666' }}>Applied for: {applicant.job}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    background: applicant.status === 'Pending' ? '#fff3e0' : '#e3f2fd',
                                    color: applicant.status === 'Pending' ? '#f57c00' : '#1976d2'
                                }}>
                                    {applicant.status}
                                </span>
                                <button style={{
                                    padding: '8px 16px',
                                    background: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>
                                    Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <p style={{ 
                    background: '#f3e5f5', 
                    color: '#7b1fa2', 
                    padding: '15px',
                    borderRadius: '5px',
                    border: '1px solid #9c27b0',
                    marginTop: '20px',
                    textAlign: 'center'
                }}>
                    ✅ Applicants page is working correctly!
                </p>
            </div>
        </div>
    );
};

export default SimpleApplicants;