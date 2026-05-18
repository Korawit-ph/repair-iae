import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('repair_user');
      if (saved && saved !== 'undefined') setUser(JSON.parse(saved));
    } catch(e) {
      localStorage.removeItem('repair_user');
    }
  }, []);

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/report" element={<ReportForm />} />
        <Route path="/track" element={<TrackStatus />} />
        <Route path="/login" element={<Login onLogin={login} />} />
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
  );
}
