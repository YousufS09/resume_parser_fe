import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { extractErrorMessage, resumeApi } from '../../services/resumeApi';
import './ViewProfile.css';

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

const fieldValue = (value) => {
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'Not available';
  }

  if (value === null || value === undefined || value === '') {
    return 'Not available';
  }

  return value;
};

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResume = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await resumeApi.getParsedResumeById(id);
        setResume(response.data);
      } catch (requestError) {
        setError(extractErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [id]);

  const parsedSkills = useMemo(() => {
    return Array.isArray(resume?.data?.skills) ? resume.data.skills : [];
  }, [resume]);

  const parsedExperience = useMemo(() => {
    return Array.isArray(resume?.data?.experience) ? resume.data.experience : [];
  }, [resume]);

  const parsedEducation = useMemo(() => {
    return Array.isArray(resume?.data?.education) ? resume.data.education : [];
  }, [resume]);

  const parsedProjects = useMemo(() => {
    return Array.isArray(resume?.data?.projects) ? resume.data.projects : [];
  }, [resume]);

  const parsedCertifications = useMemo(() => {
    return Array.isArray(resume?.data?.certifications) ? resume.data.certifications : [];
  }, [resume]);

  const candidateName = getCandidateName(resume);

  if (isLoading) {
    return (
      <div className="view-profile-page">
        <div className="profile-shell">
          <div className="profile-card loading-state card">Loading parsed resume...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-profile-page">
        <div className="profile-shell">
          <div className="profile-card card error-state">
            <h1 className="page-title">Profile unavailable</h1>
            <p className="page-subtitle">{error}</p>
            <div className="profile-actions">
              <button className="secondary-button" onClick={() => navigate('/results')}>
                Back to results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="view-profile-page">
        <div className="profile-shell">
          <div className="profile-card card error-state">
            <h1 className="page-title">Profile not found</h1>
            <p className="page-subtitle">The parsed resume could not be loaded.</p>
            <div className="profile-actions">
              <button className="secondary-button" onClick={() => navigate('/results')}>
                Back to results
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-profile-page">
      <div className="profile-shell">
        <div className="profile-hero card">
          <div className="profile-hero-top">
            <button className="secondary-button back-button" onClick={() => navigate('/results')}>
              Back
            </button>
            <span className="profile-id-badge">Resume ID {resume.id}</span>
          </div>

          <div className="profile-header">
            <div className="profile-avatar">{getInitials(candidateName)}</div>
            <div className="profile-heading">
              <h1 className="page-title">{candidateName}</h1>
              <p className="page-subtitle">
                {resume.data?.personalInfo?.summary || 'Parsed candidate profile from the resume service.'}
              </p>
            </div>
          </div>

          <div className="profile-meta-grid">
            <div className="meta-card">
              <span className="meta-label">Email</span>
              <span className="meta-value">{fieldValue(resume.data?.personalInfo?.email)}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Phone</span>
              <span className="meta-value">{fieldValue(resume.data?.personalInfo?.phone)}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Location</span>
              <span className="meta-value">{fieldValue(resume.data?.personalInfo?.location)}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Parsed At</span>
              <span className="meta-value">{formatDateTime(resume.parsedAt || resume.uploadedAt)}</span>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          <section className="profile-card card">
            <div className="section-header">
              <h2>Contact & Links</h2>
            </div>
            <div className="detail-list">
              <div className="detail-row">
                <span className="detail-label">LinkedIn</span>
                <span className="detail-value break">{fieldValue(resume.data?.personalInfo?.linkedin)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">GitHub</span>
                <span className="detail-value break">{fieldValue(resume.data?.personalInfo?.github)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Portfolio</span>
                <span className="detail-value break">{fieldValue(resume.data?.personalInfo?.portfolio)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Source File</span>
                <span className="detail-value break">{fieldValue(resume.originalName)}</span>
              </div>
            </div>
          </section>

          <section className="profile-card card">
            <div className="section-header">
              <h2>Skills</h2>
              <span className="section-count">{parsedSkills.length}</span>
            </div>
            <div className="pill-wrap">
              {parsedSkills.length > 0 ? (
                parsedSkills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="skill-pill">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="empty-copy">No skills were extracted.</p>
              )}
            </div>
          </section>
        </div>

        <section className="profile-card card">
          <div className="section-header">
            <h2>Experience</h2>
            <span className="section-count">{parsedExperience.length}</span>
          </div>
          <div className="stack-list">
            {parsedExperience.length > 0 ? (
              parsedExperience.map((experience, index) => (
                <article key={`${resume.id}-exp-${index}`} className="stack-card">
                  <div className="stack-title">{experience.job_title || experience.role || 'Role not provided'}</div>
                  <div className="stack-subtitle">{experience.company_name || experience.company || 'Company not provided'}</div>
                  <div className="stack-meta">
                    {fieldValue(experience.start_date || experience.years || experience.startYear)}
                    {experience.end_date || experience.currently_working
                      ? ` - ${experience.currently_working ? 'Present' : fieldValue(experience.end_date)}`
                      : ''}
                  </div>
                  {experience.description && <p className="stack-description">{experience.description}</p>}
                </article>
              ))
            ) : (
              <p className="empty-copy">No experience entries were extracted.</p>
            )}
          </div>
        </section>

        <div className="profile-grid">
          <section className="profile-card card">
            <div className="section-header">
              <h2>Education</h2>
              <span className="section-count">{parsedEducation.length}</span>
            </div>
            <div className="stack-list">
              {parsedEducation.length > 0 ? (
                parsedEducation.map((education, index) => (
                  <article key={`${resume.id}-edu-${index}`} className="stack-card">
                    <div className="stack-title">{education.institution_name || 'Institution not provided'}</div>
                    <div className="stack-subtitle">{education.degree || 'Degree not provided'}</div>
                    <div className="stack-meta">
                      {education.start_year || 'N/A'}
                      {education.end_year ? ` - ${education.end_year}` : ''}
                      {education.cgpa ? ` | CGPA ${education.cgpa}` : ''}
                    </div>
                    {education.specialization && <p className="stack-description">{education.specialization}</p>}
                  </article>
                ))
              ) : (
                <p className="empty-copy">No education entries were extracted.</p>
              )}
            </div>
          </section>

          <section className="profile-card card">
            <div className="section-header">
              <h2>Certifications</h2>
              <span className="section-count">{parsedCertifications.length}</span>
            </div>
            <div className="stack-list">
              {parsedCertifications.length > 0 ? (
                parsedCertifications.map((certification, index) => (
                  <article key={`${resume.id}-cert-${index}`} className="stack-card">
                    <div className="stack-title">{certification.certification_name || 'Certification not provided'}</div>
                    <div className="stack-subtitle">{certification.issuing_organization || 'Issuer not provided'}</div>
                    <div className="stack-meta">
                      {certification.issue_date || 'Issue date not available'}
                      {certification.expiry_date ? ` - ${certification.expiry_date}` : ''}
                    </div>
                    {certification.credential_id && <p className="stack-description">Credential ID: {certification.credential_id}</p>}
                  </article>
                ))
              ) : (
                <p className="empty-copy">No certification entries were extracted.</p>
              )}
            </div>
          </section>
        </div>

        <section className="profile-card card">
          <div className="section-header">
            <h2>Projects</h2>
            <span className="section-count">{parsedProjects.length}</span>
          </div>
          <div className="stack-list">
            {parsedProjects.length > 0 ? (
              parsedProjects.map((project, index) => (
                <article key={`${resume.id}-project-${index}`} className="stack-card">
                  <div className="stack-title">{project.project_name || project.name || 'Project not provided'}</div>
                  <div className="stack-subtitle">{fieldValue(project.technologies_used)}</div>
                  {project.project_description && <p className="stack-description">{project.project_description}</p>}
                  <div className="stack-meta">
                    {project.github_link || project.project_link ? 'Links available' : 'No links extracted'}
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-copy">No project entries were extracted.</p>
            )}
          </div>
        </section>

        <section className="profile-card card">
          <div className="section-header">
            <h2>Raw Parsed Data</h2>
          </div>
          <pre className="json-preview profile-json">{JSON.stringify(resume.data || {}, null, 2)}</pre>
        </section>
      </div>
    </div>
  );
};

export default ViewProfile;
