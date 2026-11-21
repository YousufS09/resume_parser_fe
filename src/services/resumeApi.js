import axios from 'axios';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const normalizeApiBaseUrl = (value) => {
  const trimmedBase = trimTrailingSlash(value);

  if (!trimmedBase) {
    return '';
  }

  try {
    const parsedUrl = new URL(trimmedBase);
    const pathname = parsedUrl.pathname.replace(/\/+$/, '');

    if (pathname === '' || pathname === '/' || pathname === '/api' || pathname === '/api/parse') {
      return `${parsedUrl.origin}/api/parse`;
    }

    return trimmedBase;
  } catch {
    if (trimmedBase === '/api' || trimmedBase === '/api/parse') {
      return '/api/parse';
    }

    return trimmedBase;
  }
};

const getApiBaseUrl = () => {
  const configuredBase = import.meta.env.VITE_RESUME_API_BASE_URL;
  const defaultBase = 'http://localhost:3000/api/parse';

  return normalizeApiBaseUrl(configuredBase || defaultBase);
};

const getApiTimeoutMs = () => {
  const configuredTimeout = Number(import.meta.env.VITE_RESUME_API_TIMEOUT_MS);
  return Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 120000;
};

const apiBaseUrl = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: getApiTimeoutMs(),
});

const extractErrorMessage = (error) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Request failed'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
};

const withFormData = (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return formData;
};

export const resumeApi = {
  async uploadResume(file) {
    const response = await apiClient.post('/upload', withFormData(file));
    return response.data;
  },

  async parseResume(file) {
    const response = await apiClient.post('/resume', withFormData(file));
    return response.data;
  },

  async parseUploadedResume(resumeId) {
    const response = await apiClient.post(`/resumes/${resumeId}/parse`);
    return response.data;
  },

  async reparseResume(resumeId) {
    const response = await apiClient.post(`/resumes/${resumeId}/reparse`);
    return response.data;
  },

  // Without params the full list is returned; pass { limit, offset } to page through it.
  async getParsedResumes(params = {}) {
    const response = await apiClient.get('/resumes', { params });
    return response.data;
  },

  async getParsedResumeById(resumeId) {
    const response = await apiClient.get(`/resumes/${resumeId}`);
    return response.data;
  },

  async deleteResume(resumeId) {
    const response = await apiClient.delete(`/resumes/${resumeId}`);
    return response.data;
  },

  getResumeFileUrl(resumeId) {
    return `${apiBaseUrl}/resumes/${resumeId}/file`;
  },
};

export { extractErrorMessage };
