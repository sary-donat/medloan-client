import axios from 'axios';

const TOKEN_KEY = 'medloan.auth';
export const LOGIN_URL = '/api/auth/login';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// The saved AuthResponse: { token, expiresAt, memberId, fullName, role }.
export function loadAuth() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
}

// Set by AuthProvider, which can navigate; the interceptor itself is outside React.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const auth = loadAuth();
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 from login means wrong credentials and is shown in the form, not a lost session.
    if (error.response?.status === 401 && error.config?.url !== LOGIN_URL) {
      clearAuth();
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

// The server returns ProblemDetails: detail is the message; validation errors come in errors.
export function errorMessage(error) {
  const data = error.response?.data;
  if (data?.detail) return data.detail;
  if (data?.errors) return Object.values(data.errors).flat().join(' ');
  if (!error.response) return 'אין חיבור לשרת';
  return data?.title ?? 'אירעה שגיאה';
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('he-IL') : '';
}
