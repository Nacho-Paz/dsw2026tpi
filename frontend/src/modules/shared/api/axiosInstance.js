import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (config) => {
    return config;
  },
  (error) => {
    if (error.response?.status === 401) {
      const pathname = window.location.pathname;

      if (
        pathname.includes('/admin/') &&
        !pathname.startsWith('/admin/login')
      ) {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
      }
    }

    return Promise.reject(error);
  }
);

export { instance };
