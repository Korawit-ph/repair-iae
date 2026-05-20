import React, { useContext, useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LangContext } from '../App';
import t from '../i18n';

const roleLabel = { snr_engineer: 'Snr.Engineer', engineer: 'Engineer', officer: 'Officer', labgm: 'LabGM' };

export default function Layout({ user, onLogout }) {
  const navigate = useNavigate();
  const { lang, toggleLang } = useContext(LangContext);
  const tx = t[lang];
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('repair_token');
    axios.get('/api/repairs', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        const count = r.data.filter(repair => repair.status === 'pending').length;
        setPendingCount(count);
      }).catch(() => {});
  }, []);

  const navStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1.5rem',
    fontSize: 14, color: isActive ? '#fff' : '#94a3b8', textDecoration: 'none',
    background: isActive ? '#0ea5e9' : 'none', position: 'relative'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: 220, background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0 }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #334155', marginBottom: '1rem' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>🔧 {tx.repairSystem}</div>
        </div>
        <nav style={{ flex: 1 }}>
          <NavLink to="/" end style={navStyle}>📊 {tx.dashboard}</NavLink>
          <NavLink to="/repairs" style={navStyle}>
            📋 {tx.repairs}
            {pendingCount > 0 && (
              <span style={{ position: 'absolute', right: 12, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/reports" style={navStyle}>📈 {tx.reports}</NavLink>
          {user.role === 'snr_engineer' && <NavLink to="/users" style={navStyle}>👥 {tx.users}</NavLink>}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #334155' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{user.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{roleLabel[user.role]}</div>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, marginTop: 8, padding: 0 }} onClick={onLogout}>{tx.logout}</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>TH</span>
            <div onClick={toggleLang} style={{ width: 44, height: 24, background: lang === 'en' ? '#0ea5e9' : '#cbd5e1', borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 2, left: lang === 'en' ? 22 : 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
            <span style={{ fontSize: 12, color: '#64748b' }}>EN</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
