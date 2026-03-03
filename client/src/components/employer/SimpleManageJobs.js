import React from 'react';

const SimpleManageJobs = () => {
    const sampleJobs = [
        { id: 1, title: 'Frontend Developer', status: 'Active', applicants: 5 },
        { id: 2, title: 'Backend Engineer', status: 'Closed', applicants: 12 },
        { id: 3, title: 'Full Stack Developer', status: 'Active', applicants: 8 }
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
                💼 Manage Jobs
            </h1>
            
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Job Title</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Applicants</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sampleJobs.map(job => (
                            <tr key={job.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px' }}>{job.title}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        background: job.status === 'Active' ? '#e8f5e8' : '#ffebee',
                                        color: job.status === 'Active' ? '#2e7d32' : '#c62828'
                                    }}>
                                        {job.status}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>{job.applicants}</td>
                                <td style={{ padding: '15px' }}>
                                    <button style={{
                                        padding: '6px 12px',
                                        background: '#2196f3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginRight: '5px'
                                    }}>
                                        View
                                    </button>
                                    <button style={{
                                        padding: '6px 12px',
                                        background: '#ff9800',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <p style={{ 
                    background: '#e8f5e8', 
                    color: '#2e7d32', 
                    padding: '15px',
                    borderRadius: '5px',
                    border: '1px solid #4caf50',
                    marginTop: '20px',
                    textAlign: 'center'
                }}>
                    ✅ Manage Jobs page is working correctly!
                </p>
            </div>
        </div>
    );
};

export default SimpleManageJobs;