import React, { useState } from 'react';
import './ParsedResults.css';

const MOCK_RESULTS = [
  { id: 1, name: 'Sarah Jenkins', role: 'Frontend Engineer', experience: '5 years', score: 94, status: 'Matched' },
  { id: 2, name: 'Michael Chen', role: 'Full Stack Developer', experience: '3 years', score: 88, status: 'Review' },
  { id: 3, name: 'Emily Rodriguez', role: 'UX Designer', experience: '7 years', score: 96, status: 'Matched' },
  { id: 4, name: 'David Smith', role: 'Backend Engineer', experience: '2 years', score: 72, status: 'Processed' },
  { id: 5, name: 'Jessica Taylor', role: 'Product Manager', experience: '6 years', score: 91, status: 'Matched' },
];

const ParsedResults = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Matched': return 'badge-success';
      case 'Review': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  const filteredResults = MOCK_RESULTS.filter(res => 
    res.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    res.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="results-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parsed Results</h1>
          <p className="page-subtitle">View, filter, and analyze extracted candidate data.</p>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="secondary-button icon-only">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          </button>
        </div>
      </div>

      <div className="results-container card">
        <div className="table-responsive">
          <table className="results-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Target Role</th>
                <th>Experience</th>
                <th>Match Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td>
                    <div className="candidate-name-cell">
                      <div className="avatar-sm">{result.name.charAt(0)}</div>
                      <span className="font-medium">{result.name}</span>
                    </div>
                  </td>
                  <td>{result.role}</td>
                  <td>{result.experience}</td>
                  <td>
                    <div className="score-cell">
                      <div className="score-bar-bg">
                        <div className="score-bar-fill" style={{width: `${result.score}%`, backgroundColor: result.score > 90 ? 'var(--color-success)' : result.score > 80 ? 'var(--color-primary)' : 'var(--color-warning)'}}></div>
                      </div>
                      <span className="score-text">{result.score}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(result.status)}`}>
                      {result.status}
                    </span>
                  </td>
                  <td>
                    <button className="text-button">View Profile</button>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <p className="text-muted">No candidates found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer pagination">
          <span className="text-muted">Showing {filteredResults.length} of {MOCK_RESULTS.length} candidates</span>
          <div className="pagination-controls">
            <button className="icon-button disabled" disabled>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button className="icon-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParsedResults;