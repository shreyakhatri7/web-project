import React from 'react';
import './Loading.css';

const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default Loading;
