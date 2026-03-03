import React, { useState } from 'react';

const SimplePostJob = () => {
    const [jobTitle, setJobTitle] = useState('');
    
    return (
        <div style={{
            padding: '40px',
            backgroundColor: '#f8f9fa',
            minHeight: '500px',
            borderRadius: '10px',
            margin: '20px'
        }}>
            <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '30px' }}>
                📝 Post New Job
            </h1>
            
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <form>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Job Title</label>
                        <input 
                            type="text" 
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                            placeholder="Enter job title"
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
                        <textarea 
                            rows="4"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px',
                                resize: 'vertical'
                            }}
                            placeholder="Describe the job role and requirements"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 30px',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        📝 Post Job
                    </button>
                </form>
                
                <p style={{ 
                    background: '#e3f2fd', 
                    color: '#1976d2', 
                    padding: '15px',
                    borderRadius: '5px',
                    border: '1px solid #2196f3',
                    marginTop: '20px',
                    textAlign: 'center'
                }}>
                    ✅ Post Job page is working correctly!
                </p>
            </div>
        </div>
    );
};

export default SimplePostJob;