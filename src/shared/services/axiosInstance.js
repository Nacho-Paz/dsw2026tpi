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
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? '';
    const isLoginRequest = /api\/auth\/(admin|patient)\/login/i.test(
      requestUrl
    );

    if (error.response?.status === 401 && !isLoginRequest) {
      const role = localStorage.getItem('role');
      const isAdminArea = window.location.pathname.startsWith('/admin');
      const loginPath =
        role === 'Administrador' || isAdminArea ? '/admin/login' : '/login';

      localStorage.removeItem('token');
      localStorage.removeItem('role');
      sessionStorage.removeItem('patientDni');

      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);

export { instance };
