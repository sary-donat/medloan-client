import axios from 'axios';

const TOKEN_KEY = 'medloan.auth';
export const LOGIN_URL = '/api/auth/login';
export const REGISTER_URL = '/api/auth/register';
export const LOGOUT_URL = '/api/auth/logout';
const REFRESH_URL = '/api/auth/refresh';

// A 401 from these is not an expired access token, so no refresh is tried (11.13).
const NO_REFRESH_URLS = [LOGIN_URL, REGISTER_URL, REFRESH_URL];

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// The saved AuthResponse: { token, expiresAt, refreshToken, refreshTokenExpiresAt, memberId, fullName, role }.
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

// Set by AuthProvider, which can navigate and hold state; the interceptor itself is outside React.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

let onRefreshed = () => {};
export function setRefreshedHandler(handler) {
  onRefreshed = handler;
}

api.interceptors.request.use((config) => {
  const auth = loadAuth();
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
  return config;
});

// One refresh request at a time: requests that fail together all wait for the same one.
// The server rotates the refresh token, so a second parallel refresh would look like reuse.
let refreshing = null;
function refreshSession() {
  if (!refreshing) {
    const refreshToken = loadAuth()?.refreshToken;
    refreshing = (refreshToken ? api.post(REFRESH_URL, { refreshToken }) : Promise.reject(new Error('No refresh token')))
      .then(({ data }) => {
        saveAuth(data);
        onRefreshed(data);
        return data;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    // A 401 from login means wrong credentials and is shown in the form, not a lost session.
    if (response?.status !== 401 || !config || NO_REFRESH_URLS.includes(config.url)) {
      return Promise.reject(error);
    }

    // One refresh attempt per request. A 401 on the retried request comes back here with _retried set,
    // and ends the session.
    if (!config._retried) {
      const auth = await refreshSession().catch(() => null);
      if (auth) {
        config._retried = true;
        config.headers.Authorization = `Bearer ${auth.token}`;
        return api(config);
      }
    }

    clearAuth();
    onUnauthorized();
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

// For admin forms: a 400 with errors is split by field. Keys come as "Name", "$.name" or "CategoryId",
// so they are matched to the form's field names without case and without "$.".
// Unmatched keys, and any error without errors (409, 400 with detail only), go under _form.
export function fieldErrors(error, fields) {
  const errors = error.response?.status === 400 ? error.response.data?.errors : null;
  if (!errors) return { _form: errorMessage(error) };

  const byKey = Object.fromEntries(fields.map((f) => [f.toLowerCase(), f]));
  const result = {};
  for (const [key, messages] of Object.entries(errors)) {
    const name = byKey[key.replace(/^\$\./, '').toLowerCase()] ?? '_form';
    const text = [].concat(messages).join(' ');
    result[name] = result[name] ? `${result[name]} ${text}` : text;
  }
  return result;
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('he-IL') : '';
}
