import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const analyzeBrand = async ({ brand, subreddits, limit = 100 }) => {
  const { data } = await api.post('/api/analyze', { brand, subreddits, limit });
  return data;
};

export const getDefaultSubreddits = async () => {
  const { data } = await api.get('/api/subreddits');
  return data.subreddits;
};

export const healthCheck = async () => {
  const { data } = await api.get('/api/health');
  return data;
};

export default api;
