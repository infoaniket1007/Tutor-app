import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tutor-app-backend-6o6w.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error') {
      console.error('Server is not running or not accessible');
    }
    return Promise.reject(error);
  }
);

export default api; 
