import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, clearAuth, loadAuth, LOGIN_URL, saveAuth, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth);
  const navigate = useNavigate();
  const location = useLocation();

  // A 401 on any request except login: the token was removed or expired, so the session ends.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuth(null);
      navigate('/login', { replace: true, state: { from: location.pathname, expired: true } });
    });
  }, [navigate, location.pathname]);

  async function login(email, password) {
    const { data } = await api.post(LOGIN_URL, { email, password });
    saveAuth(data);
    setAuth(data);
  }

  async function register(form) {
    const { data } = await api.post('/api/auth/register', form);
    saveAuth(data);
    setAuth(data);
  }

  function logout() {
    clearAuth();
    setAuth(null);
    navigate('/login');
  }

  return <AuthContext.Provider value={{ auth, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
