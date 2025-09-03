import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token'); // <-- make sure this key matches your login storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        const t = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh });
        localStorage.setItem('access_token', t.data.access);
        original.headers.Authorization = `Bearer ${t.data.access}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
