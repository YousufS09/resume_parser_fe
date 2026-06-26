import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractErrorMessage, resumeApi } from '../../services/resumeApi';
import './Dashboard.css';

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

const getInitials = (name) =>
  (name || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const Dashboard = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await resumeApi.getParsedResumes();
        const sorted = [...(response.data || [])].sort((left, right) => {
          const leftTime = new Date(right.parsedAt || right.uploadedAt || 0).getTime();
          const rightTime = new Date(left.parsedAt || left.uploadedAt || 0).getTime();
          return leftTime - rightTime;
        });

        setResumes(sorted);
      } catch (requestError) {
        setError(extractErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const dashboardStats = useMemo(() => {
    const totalResumes = resumes.length;
    const totalSkills = resumes.reduce((count, resume) => {
      const skills = Array.isArray(resume.data?.skills) ? resume.data.skills.length : 0;
      return count + skills;
    }, 0);
    const candidatesWithEmail = resumes.filter((resume) => Boolean(resume.data?.personalInfo?.email)).length;
    const confidenceValues = resumes
      .map((resume) => Number(resume.data?.confidenceScore ?? 0))
      .filter((value) => Number.isFinite(value));
    const averageConfidence = confidenceValues.length
      ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
      : 0;
    const highConfidence = resumes.filter((resume) => Number(resume.data?.confidenceScore ?? 0) >= 0.85).length;

    return {
      totalResumes,
      totalSkills,
      candidatesWithEmail,
      averageConfidence,
      highConfidence,
      latestParsedAt: resumes[0]?.parsedAt || resumes[0]?.uploadedAt || null,
      latestCandidate: resumes[0] || null,
    };
  }, [resumes]);

  const topSkills = useMemo(() => {
    const counts = new Map();

    for (const resume of resumes) {
      const skills = Array.isArray(resume.data?.skills) ? resume.data.skills : [];
      for (const skill of skills) {
        const normalized = String(skill || '').trim();
        if (!normalized) {
          continue;
        }

        const key = normalized.toLowerCase();
        const current = counts.get(key) || { label: normalized, count: 0 };
        counts.set(key, { label: current.label, count: current.count + 1 });
      }
    }

    return [...counts.values()].sort((left, right) => right.count - left.count).slice(0, 6);
  }, [resumes]);

  const recentResumes = useMemo(() => resumes.slice(0, 5), [resumes]);

  const confidenceBuckets = useMemo(() => {
    const buckets = [
      { label: '0.90 - 1.00', min: 0.9, max: 1, count: 0 },
      { label: '0.75 - 0.89', min: 0.75, max: 0.89, count: 0 },
      { label: 'Below 0.75', min: 0, max: 0.749, count: 0 },
    ];

    for (const resume of resumes) {
      const score = Number(resume.data?.confidenceScore ?? 0);
      const bucket = buckets.find((entry) => score >= entry.min && score <= entry.max);
      if (bucket) {
        bucket.count += 1;
      }
    }

    return buckets;
  }, [resumes]);

  const formatPercent = (value) => `${Math.round(value * 100)}%`;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow">Workspace overview</span>
          <h1>Resume operations at a glance</h1>
          <p>
            Live parsing metrics, candidate activity, and data quality signals from the resume service.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate('/upload')}>
              Upload resume
            </button>
            <button className="secondary-button" onClick={() => navigate('/results')}>
              Open parsed results
            </button>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-card">
            <span className="panel-label">Latest parse</span>
            <strong>{dashboardStats.latestCandidate ? getCandidateName(dashboardStats.latestCandidate) : 'No parsed resumes yet'}</strong>
            <span>{formatDateTime(dashboardStats.latestParsedAt)}</span>
          </div>
          <div className="hero-panel-card">
            <span className="panel-label">Average confidence</span>
            <strong>{dashboardStats.totalResumes ? formatPercent(dashboardStats.averageConfidence) : '0%'}</strong>
            <span>{dashboardStats.highConfidence} high-confidence parses</span>
          </div>
          <div className="hero-panel-card">
            <span className="panel-label">Contact coverage</span>
            <strong>{dashboardStats.totalResumes ? formatPercent(dashboardStats.candidatesWithEmail / dashboardStats.totalResumes) : '0%'}</strong>
            <span>Email extracted from parsed resumes</span>
          </div>
        </div>
      </section>

      <section className="stats-grid metrics-grid">
        <article className="stat-card">
          <div className="stat-icon resumes">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Parsed resumes</h3>
            <div className="stat-value">{dashboardStats.totalResumes}</div>
            <div className="stat-trend positive">Records currently stored in the service</div>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon parsed">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Average confidence</h3>
            <div className="stat-value">{dashboardStats.totalResumes ? formatPercent(dashboardStats.averageConfidence) : '0%'}</div>
            <div className="stat-trend positive">Quality across parsed output</div>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon pending">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>High confidence parses</h3>
            <div className="stat-value">{dashboardStats.highConfidence}</div>
            <div className="stat-trend positive">Confidence at or above 85%</div>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon resumes">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V5m0 14v-3m6-4a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total skills extracted</h3>
            <div className="stat-value">{dashboardStats.totalSkills}</div>
            <div className="stat-trend positive">Across all parsed candidate profiles</div>
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel card">
          <div className="card-header">
            <div>
              <h2>Recent parsed resumes</h2>
              <p className="panel-subtitle">Latest candidate records flowing into the parser pipeline.</p>
            </div>
            <button className="text-button" onClick={() => navigate('/results')}>
              View all
            </button>
          </div>
          <div className="card-body">
            {isLoading ? (
              <div className="panel-empty">Loading parsed resumes...</div>
            ) : error ? (
              <div className="panel-empty error-state">
                <p>{error}</p>
                <button className="secondary-button" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            ) : recentResumes.length > 0 ? (
              <div className="recent-list">
                {recentResumes.map((resume) => (
                  <article key={resume.id} className="recent-row">
                    <div className="recent-avatar">{getInitials(getCandidateName(resume))}</div>
                    <div className="recent-main">
                      <div className="recent-title-row">
                        <h3>{getCandidateName(resume)}</h3>
                        <span className="detail-badge">{formatPercent(Number(resume.data?.confidenceScore ?? 0))}</span>
                      </div>
                      <div className="recent-meta">
                        <span>{resume.data?.personalInfo?.email || 'Email not extracted'}</span>
                        <span>{Array.isArray(resume.data?.skills) ? `${resume.data.skills.length} skills` : '0 skills'}</span>
                        <span>{formatDateTime(resume.parsedAt || resume.uploadedAt)}</span>
                      </div>
                    </div>
                    <button className="text-button" onClick={() => navigate(`/results/${resume.id}`)}>
                      Profile
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel-empty">
                <h3>No parsed resumes yet</h3>
                <p>Upload a resume to populate the dashboard with live candidate data.</p>
                <button className="primary-button" onClick={() => navigate('/upload')}>
                  Upload first resume
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-panel card">
          <div className="card-header">
            <div>
              <h2>Top extracted skills</h2>
              <p className="panel-subtitle">Most common skills detected across stored resumes.</p>
            </div>
          </div>
          <div className="card-body">
            {topSkills.length > 0 ? (
              <div className="skill-bars">
                {topSkills.map((skill) => (
                  <div key={skill.label} className="skill-bar-row">
                    <div className="skill-bar-head">
                      <span className="skill-name">{skill.label}</span>
                      <span className="skill-count">{skill.count}</span>
                    </div>
                    <div className="skill-track">
                      <div
                        className="skill-fill"
                        style={{ width: `${Math.max(8, Math.round((skill.count / dashboardStats.totalResumes) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel-empty">
                <p>No skills extracted yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-grid dashboard-grid-bottom">
        <div className="dashboard-panel card">
          <div className="card-header">
            <div>
              <h2>Confidence distribution</h2>
              <p className="panel-subtitle">How the parsed resumes spread across quality bands.</p>
            </div>
          </div>
          <div className="card-body">
            <div className="bucket-list">
              {confidenceBuckets.map((bucket) => (
                <div key={bucket.label} className="bucket-row">
                  <div className="bucket-label">{bucket.label}</div>
                  <div className="bucket-track">
                    <div
                      className="bucket-fill"
                      style={{ width: `${dashboardStats.totalResumes ? Math.max(8, Math.round((bucket.count / dashboardStats.totalResumes) * 100)) : 0}%` }}
                    />
                  </div>
                  <div className="bucket-count">{bucket.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-panel card">
          <div className="card-header">
            <div>
              <h2>Quick actions</h2>
              <p className="panel-subtitle">Primary paths for adding and reviewing candidate data.</p>
            </div>
          </div>
          <div className="card-body quick-actions">
            <button className="secondary-button quick-action" onClick={() => navigate('/upload')}>
              Upload and parse resumes
            </button>
            <button className="secondary-button quick-action" onClick={() => navigate('/results')}>
              Review parsed results
            </button>
            <button className="secondary-button quick-action" onClick={() => navigate('/results')}>
              Open candidate profiles
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
