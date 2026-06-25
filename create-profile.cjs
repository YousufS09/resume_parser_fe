const fs = require('fs');
const path = require('path');

const files = {
  'src/App.jsx': `
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/templates/DashboardLayout';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import ParsedResults from './pages/ParsedResults';
import ViewProfile from './pages/ViewProfile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<UploadResume />} />
          <Route path="results" element={<ParsedResults />} />
          <Route path="profile/:id" element={<ViewProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
`,
  'src/pages/ParsedResults/ParsedResults.jsx': `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
                        <div className="score-bar-fill" style={{width: \`\${result.score}%\`, backgroundColor: result.score > 90 ? 'var(--color-success)' : result.score > 80 ? 'var(--color-primary)' : 'var(--color-warning)'}}></div>
                      </div>
                      <span className="score-text">{result.score}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={\`status-badge \${getStatusBadgeClass(result.status)}\`}>
                      {result.status}
                    </span>
                  </td>
                  <td>
                    <button className="text-button" onClick={() => navigate(\`/profile/\${result.id}\`)}>View Profile</button>
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
`,
  'src/pages/ViewProfile/index.jsx': `
export { default } from './ViewProfile';
`,
  'src/pages/ViewProfile/ViewProfile.jsx': `
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewProfile.css';

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data based on ID for demonstration
  const profile = {
    name: id === '1' ? 'Sarah Jenkins' : 'Michael Chen',
    role: id === '1' ? 'Frontend Engineer' : 'Full Stack Developer',
    score: id === '1' ? 94 : 88,
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/candidate',
    summary: 'Passionate and detail-oriented engineer with extensive experience in building scalable web applications. Proven ability to lead frontend architectures and mentor junior developers.',
    skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'CSS/SASS', 'Redux', 'GraphQL', 'Webpack'],
    experience: [
      {
        title: 'Senior Frontend Engineer',
        company: 'Tech Solutions Inc.',
        period: '2020 - Present',
        description: 'Led the migration of a legacy angular codebase to React, improving performance by 40%. Directed a team of 4 UI developers.'
      },
      {
        title: 'Web Developer',
        company: 'Creative Agency',
        period: '2017 - 2020',
        description: 'Developed responsive, accessible, and high-performance websites for diverse clients using modern web technologies.'
      }
    ],
    education: [
      {
        degree: 'B.S. Computer Science',
        institution: 'University of Technology',
        year: '2017'
      }
    ]
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Results
        </button>
        <div className="profile-actions">
          <button className="secondary-button">Download Original PDF</button>
          <button className="primary-button">Move to Next Stage</button>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Column: Summary Info */}
        <div className="profile-sidebar">
          <div className="card text-center profile-summary-card">
            <div className="profile-avatar-large">
              {profile.name.charAt(0)}
            </div>
            <h2>{profile.name}</h2>
            <p className="profile-role">{profile.role}</p>
            
            <div className="match-score-large">
              <div className="score-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray={\`\${profile.score}, 100\`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{profile.score}%</text>
                </svg>
              </div>
              <span>Match Score</span>
            </div>
          </div>

          <div className="card profile-info-card">
            <h3>Contact Information</h3>
            <ul className="info-list">
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {profile.email}
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                {profile.phone}
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {profile.location}
              </li>
              <li>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                <a href="#">{profile.linkedin}</a>
              </li>
            </ul>
          </div>

          <div className="card profile-skills-card">
            <h3>Extracted Skills</h3>
            <div className="tags-container">
              {profile.skills.map(skill => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Experience/Education */}
        <div className="profile-main">
          <div className="card section-card">
            <h3 className="section-title">Professional Summary</h3>
            <p className="section-content">{profile.summary}</p>
          </div>

          <div className="card section-card">
            <h3 className="section-title">Work Experience</h3>
            <div className="timeline">
              {profile.experience.map((exp, index) => (
                <div className="timeline-item" key={index}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{exp.title}</h4>
                    <div className="timeline-meta">
                      <span className="company">{exp.company}</span>
                      <span className="period">{exp.period}</span>
                    </div>
                    <p>{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card section-card">
            <h3 className="section-title">Education</h3>
            <div className="timeline">
              {profile.education.map((edu, index) => (
                <div className="timeline-item" key={index}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{edu.degree}</h4>
                    <div className="timeline-meta">
                      <span className="company">{edu.institution}</span>
                      <span className="period">{edu.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
`,
  'src/pages/ViewProfile/ViewProfile.css': `
.profile-page {
  animation: fadeIn 0.4s ease;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.back-button:hover {
  color: var(--color-primary);
}

.profile-actions {
  display: flex;
  gap: 1rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-summary-card {
  padding: 2.5rem 1.5rem;
}

.profile-avatar-large {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 auto 1rem auto;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.profile-summary-card h2 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.profile-role {
  color: var(--color-text-muted);
  margin: 0 0 1.5rem 0;
  font-weight: 500;
}

.match-score-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--color-border);
}

.match-score-large span {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-top: 0.5rem;
}

.score-circle {
  width: 100px;
  height: 100px;
}

.circular-chart {
  display: block;
  margin: 0 auto;
  max-width: 80%;
  max-height: 250px;
}

.circle-bg {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke-width: 2.8;
  stroke-linecap: round;
  stroke: var(--color-success);
  animation: progress 1s ease-out forwards;
}

@keyframes progress {
  0% { stroke-dasharray: 0 100; }
}

.percentage {
  fill: var(--color-text);
  font-family: var(--font-family-sans);
  font-weight: 700;
  font-size: 1.5rem;
  text-anchor: middle;
}

.profile-info-card, .profile-skills-card {
  padding: 1.5rem;
}

.profile-info-card h3, .profile-skills-card h3 {
  font-size: 1.125rem;
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text);
  font-size: 0.875rem;
}

.info-list svg {
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.info-list a {
  color: var(--color-primary);
  text-decoration: none;
}

.info-list a:hover {
  text-decoration: underline;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .skill-tag {
    background-color: rgba(37, 99, 235, 0.15);
  }
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-card {
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  margin: 0 0 1.5rem 0;
  color: var(--color-text);
}

.section-content {
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 0;
  left: 6px;
  width: 2px;
  background-color: var(--color-border);
}

.timeline-item {
  position: relative;
  padding-left: 2rem;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--color-surface);
  border: 3px solid var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-background);
}

.timeline-content h4 {
  font-size: 1.125rem;
  margin: 0 0 0.25rem 0;
  color: var(--color-text);
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.company {
  font-weight: 500;
  color: var(--color-primary);
}

.period {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.timeline-content p {
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim());
}
console.log('Profile page created successfully.');
