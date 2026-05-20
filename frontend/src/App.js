import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import ReportForm from './pages/ReportForm';
import TrackStatus from './pages/TrackStatus';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RepairList from './pages/RepairList';
import RepairDetail from './pages/RepairDetail';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Layout from './components/Layout';

axios.defaults.baseURL = 'https://repair-iae-backend-2.onrender.com';

export const LangContext = createContext();

export default function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'th');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('repair_user');
      const token = localStorage.getItem('repair_token');
      if (saved && saved !== 'undefined' && token) {
        setUser(JSON.parse(saved));
      }
    } catch(e) {
      localStorage.removeItem('repair_user');
      localStorage.removeItem('repair_token');
    }
    setLoading(false);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'th' ? 'en' : 'th';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const login = (userData, token) => {
    localStorage.setItem('repair_user', JSON.stringify(userData));
    localStorage.setItem('repair_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('repair_user');
    localStorage.removeItem('repair_token');
    setUser(null);
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 16, color: '#64748b' }}>กำลังโหลด...</div>;

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      <BrowserRouter>
        <Routes>
          <Route path="/report" element={<ReportForm />} />
          <Route path="/track" element={<TrackStatus />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={login} />} />
          {user ? (
            <Route path="/" element={<Layout user={user} onLogout={logout} />}>
              <Route index element={<Dashboard />} />
              <Route path="repairs" element={<RepairList user={user} />} />
              <Route path="repairs/:id" element={<RepairDetail user={user} />} />
              <Route path="reports" element={<Reports />} />
              {user.role === 'snr_engineer' && <Route path="users" element={<Users />} />}
            </Route>
          ) : (
            <Route path="/*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </BrowserRouter>
    </LangContext.Provider>
  );
}
