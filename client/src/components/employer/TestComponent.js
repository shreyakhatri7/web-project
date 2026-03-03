import React from 'react';

const TestComponent = () => {
    return (
        <div style={{
            padding: '50px',
            textAlign: 'center',
            backgroundColor: '#f0f0f0',
            border: '2px solid #007bff',
            borderRadius: '10px',
            margin: '20px'
        }}>
            <h1>✅ TEST COMPONENT WORKING!</h1>
            <p>This proves that routing is working correctly.</p>
            <p>Current time: {new Date().toLocaleTimeString()}</p>
        </div>
    );
};

export default TestComponent;