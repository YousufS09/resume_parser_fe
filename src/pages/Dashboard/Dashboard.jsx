import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back, here's what's happening with your candidate pool.</p>
        </div>
        <button className="primary-button">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18" style={{marginRight: '8px'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Upload Resume
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon resumes">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div className="stat-content">
            <h3>Total Resumes</h3>
            <div className="stat-value">1,284</div>
            <div className="stat-trend positive">+12% this week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon parsed">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div className="stat-content">
            <h3>Successfully Parsed</h3>
            <div className="stat-value">1,240</div>
            <div className="stat-trend positive">96.5% success rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="stat-content">
            <h3>Pending Review</h3>
            <div className="stat-value">44</div>
            <div className="stat-trend negative">Requires attention</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="main-panel card">
          <div className="card-header">
            <h2>Recent Uploads</h2>
            <button className="text-button">View All</button>
          </div>
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              </div>
              <h3>No resumes uploaded yet</h3>
              <p>Drag and drop resumes here or click to browse files.</p>
              <button className="secondary-button">Browse Files</button>
            </div>
          </div>
        </div>
        <div className="side-panel card">
          <div className="card-header">
            <h2>Top Skills Extracted</h2>
          </div>
          <div className="card-body">
            <ul className="skills-list">
              <li>
                <span className="skill-name">JavaScript / React</span>
                <span className="skill-count">482</span>
              </li>
              <li>
                <span className="skill-name">Python / Django</span>
                <span className="skill-count">351</span>
              </li>
              <li>
                <span className="skill-name">UI/UX Design</span>
                <span className="skill-count">204</span>
              </li>
              <li>
                <span className="skill-name">Project Management</span>
                <span className="skill-count">198</span>
              </li>
              <li>
                <span className="skill-name">Data Analysis</span>
                <span className="skill-count">156</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;