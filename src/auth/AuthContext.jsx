import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  api,
  clearAuth,
  loadAuth,
  LOGIN_URL,
  LOGOUT_URL,
  REGISTER_URL,
  saveAuth,
  setRefreshedHandler,
  setUnauthorizedHandler,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth);
  const navigate = useNavigate();
  const location = useLocation();

  // A 401 that a refresh could not fix: the session ends.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuth(null);
      navigate('/login', { replace: true, state: { from: location.pathname, expired: true } });
    });
  }, [navigate, location.pathname]);

  // A refresh in the interceptor saved a new AuthResponse; keep the state in sync with it.
  useEffect(() => {
    setRefreshedHandler(setAuth);
  }, []);

  async function login(email, password) {
    const { data } = await api.post(LOGIN_URL, { email, password });
    saveAuth(data);
    setAuth(data);
  }

  async function register(form) {
    const { data } = await api.post(REGISTER_URL, form);
    saveAuth(data);
    setAuth(data);
  }

  // The server revokes the refresh token. If the request fails (e.g. no network), the tokens are removed anyway.
  async function logout() {
    const refreshToken = loadAuth()?.refreshToken;
    try {
      if (refreshToken) await api.post(LOGOUT_URL, { refreshToken });
    } catch {
      // Logging out locally is enough here.
    }
    clearAuth();
    setAuth(null);
    navigate('/login');
  }

  return <AuthContext.Provider value={{ auth, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
