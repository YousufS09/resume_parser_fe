import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractErrorMessage, resumeApi } from '../../services/resumeApi';
import './ParsedResults.css';

const formatDateTime = (value) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getCandidateName = (resume) => resume?.data?.personalInfo?.name || resume?.originalName || 'Unnamed resume';

const getExperienceSummary = (resume) => {
  const experience = resume?.data?.experience;
  if (!Array.isArray(experience) || experience.length === 0) {
    return 'No experience entries';
  }

  return `${experience.length} role${experience.length === 1 ? '' : 's'} extracted`;
};

const ParsedResults = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadResumes = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = await resumeApi.getParsedResumes();
      const sortedResumes = [...(response.data || [])].sort((a, b) => {
        const left = new Date(b.parsedAt || b.uploadedAt || 0).getTime();
        const right = new Date(a.parsedAt || a.uploadedAt || 0).getTime();
        return left - right;
      });

      setResumes(sortedResumes);
    } catch (requestError) {
      setError(extractErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const filteredResumes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return resumes;
    }

    return resumes.filter((resume) => {
      const name = getCandidateName(resume).toLowerCase();
      const email = (resume.data?.personalInfo?.email || '').toLowerCase();
      const skills = Array.isArray(resume.data?.skills) ? resume.data.skills.join(' ').toLowerCase() : '';
      const originalName = (resume.originalName || '').toLowerCase();
      return [name, email, skills, originalName].some((value) => value.includes(term));
    });
  }, [resumes, searchTerm]);

  const totalSkills = resumes.reduce((count, resume) => {
    const skills = Array.isArray(resume.data?.skills) ? resume.data.skills.length : 0;
    return count + skills;
  }, 0);

  return (
    <div className="results-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parsed Results</h1>
          <p className="page-subtitle">
            Browse parsed resumes and open a dedicated profile view for each candidate.
          </p>
        </div>
        <div className="header-controls">
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, skill, or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="secondary-button icon-only" onClick={() => loadResumes(true)} disabled={isRefreshing}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8 8 0 004.582 9m0 0H9m11 11v-5h-.581m0 0A8 8 0 0119.418 15m0 0H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="results-summary">
        <span className="summary-chip">Total parsed: {resumes.length}</span>
        <span className="summary-chip">Displayed: {filteredResumes.length}</span>
        <span className="summary-chip">Total skills extracted: {totalSkills}</span>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      <div className="results-container card">
        <div className="table-responsive">
          <table className="results-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Experience</th>
                <th>Skills</th>
                <th>Parsed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && filteredResumes.map((resume) => (
                <tr key={resume.id}>
                  <td>
                    <div className="candidate-name-cell">
                      <div className="avatar-sm">{getCandidateName(resume).charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="font-medium">{getCandidateName(resume)}</div>
                        <div className="candidate-file">{resume.originalName || 'Uploaded resume'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{resume.data?.personalInfo?.email || 'Not provided'}</td>
                  <td>{getExperienceSummary(resume)}</td>
                  <td>{Array.isArray(resume.data?.skills) ? resume.data.skills.length : 0}</td>
                  <td>{formatDateTime(resume.parsedAt || resume.uploadedAt)}</td>
                  <td>
                    <button className="text-button" onClick={() => navigate(`/results/${resume.id}`)}>
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredResumes.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <p className="text-muted">
                      {searchTerm ? 'No parsed resumes match your search.' : 'No parsed resumes have been saved yet.'}
                    </p>
                  </td>
                </tr>
              )}

              {isLoading && (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <p className="text-muted">Loading parsed resumes from the service...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer pagination">
          <span className="text-muted">
            {isRefreshing ? 'Refreshing from service...' : `Showing ${filteredResumes.length} of ${resumes.length} parsed resumes`}
          </span>
          <div className="pagination-controls">
            <button className="icon-button" onClick={() => loadResumes(true)} disabled={isRefreshing}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8 8 0 004.582 9m0 0H9m11 11v-5h-.581m0 0A8 8 0 0119.418 15m0 0H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParsedResults;
