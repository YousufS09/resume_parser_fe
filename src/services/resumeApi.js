import axios from 'axios';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getApiBaseUrl = () => {
  const configuredBase = import.meta.env.VITE_RESUME_API_BASE_URL;
  const defaultBase = 'http://localhost:3000/api/parse';

  return trimTrailingSlash(configuredBase || defaultBase);
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
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
