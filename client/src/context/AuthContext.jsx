import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then((r) => setUser(r.data)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    setUser(data);
    return data;
  };

  const uploadKB = async (formData) => {
    const { data } = await api.post('/kb/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  };

  const getKB = async () => {
    const { data } = await api.get('/kb');
    return data;
  };

  const triageTicket = async (ticketId) => {
    const { data } = await api.post('/ai/triage', { ticketId });
    return data;
  };

  const chatAI = async (ticketId, query) => {
    const { data } = await api.post('/ai/chat', { ticketId, query });
    return data;
  };

  const draftReply = async (ticketId) => {
    const { data } = await api.post('/ai/draft-reply', { ticketId });
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout, uploadKB, getKB, triageTicket, chatAI, draftReply }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
