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

    if (pathname === '' || pathname === '/') {
      return `${parsedUrl.origin}/api/parse`;
    }

    if (pathname === '/api') {
      return `${parsedUrl.origin}/api/parse`;
    }

    if (pathname === '/api/parse') {
      return `${parsedUrl.origin}/api/parse`;
    }

    return trimmedBase;
  } catch (error) {
    if (trimmedBase === '/api') {
      return '/api/parse';
    }

    if (trimmedBase === '/api/parse') {
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

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
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
    const response = await apiClient.post('/upload', withFormData(file), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async parseResume(file) {
    const response = await apiClient.post('/resume', withFormData(file), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async parseUploadedResume(resumeId) {
    const response = await apiClient.post(`/resumes/${resumeId}/parse`);
    return response.data;
  },

  async getParsedResumes() {
    const response = await apiClient.get('/resumes');
    return response.data;
  },

  async getParsedResumeById(resumeId) {
    const response = await apiClient.get(`/resumes/${resumeId}`);
    return response.data;
  },
};

export { extractErrorMessage };
