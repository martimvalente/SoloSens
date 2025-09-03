import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback
} from 'react';
import axios from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access_token');
    return token ? jwtDecode(token) : null;
  });

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

const fetchUser = async () => {
  const res = await axios.get('/api/v1/me/');
  setUser(res.data);
};

const login = async (username, password) => {
  const res = await axios.post('/api/token/', { username, password });
  const { access, refresh } = res.data;

  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

  await fetchUser(); // 🔍 fetch user info
};

const refreshToken = useCallback(async () => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    const res = await axios.post('/api/token/refresh/', { refresh });
    const { access } = res.data;

    localStorage.setItem('access_token', access);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

    await fetchUser(); // 🔄 refresh user info
  } catch (err) {
    logout();
  }
}, [logout]);

useEffect(() => {
  const access = localStorage.getItem('access_token');
  if (access) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    fetchUser(); // 🔁 auto-load user if already logged in
  }

  const interval = setInterval(() => {
    refreshToken();
  }, 4.5 * 60 * 1000);

  return () => clearInterval(interval);
}, [refreshToken]);


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
