// Display helpers shared by the dashboard, results, and profile pages.

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const formatDateTime = (value) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return dateTimeFormatter.format(date);
};

export const getCandidateName = (resume) =>
  resume?.data?.personalInfo?.name || resume?.originalName || 'Unnamed resume';

export const getInitials = (name) =>
  (name || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

// Returns the confidence score as a number, or null when the resume has none.
export const getConfidence = (resume) => {
  const value = resume?.data?.confidenceScore;
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const formatPercent = (value) => (value === null || value === undefined ? 'N/A' : `${Math.round(value * 100)}%`);

export const sortByMostRecent = (resumes) =>
  [...resumes].sort(
    (left, right) =>
      new Date(right.parsedAt || right.uploadedAt || 0).getTime() -
      new Date(left.parsedAt || left.uploadedAt || 0).getTime()
  );

// Only http(s) links are rendered as anchors, so parsed text can never inject javascript: URLs.
export const toSafeUrl = (value) => {
  if (!value) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};

// Upload rules, kept in line with the backend (Resume_parser_service/src/middlewares/uploadMiddleware.js)
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

export const validateResumeFile = (file) => {
  const name = (file?.name || '').toLowerCase();

  if (!ALLOWED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return 'Only PDF and DOCX files are supported.';
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return 'File is larger than the 5 MB limit.';
  }

  return null;
};
