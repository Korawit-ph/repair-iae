import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const s = {
  app: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 220, background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column', padding: '1.5rem 0' },
  logo: { padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #334155', marginBottom: '1rem' },
  logoTitle: { fontSize: 16, fontWeight: 700, color: '#fff' },
  logoSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  nav: { flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1.5rem', fontSize: 14, color: '#94a3b8', textDecoration: 'none', cursor: 'pointer' },
  navActive: { background: '#0ea5e9', color: '#fff', borderRadius: 0 },
  user: { padding: '1rem 1.5rem', borderTop: '1px solid #334155', fontSize: 13 },
  userName: { color: '#fff', fontWeight: 500 },
  userRole: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  logoutBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, marginTop: 8, padding: 0 },
  main: { flex: 1, overflow: 'auto' },
  topbar: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem', fontWeight: 600, fontSize: 16 },
  content: { padding: '1.5rem' }
};

const roleLabel = { snr_engineer: 'Snr.Engineer', engineer: 'Engineer', officer: 'Officer', labgm: 'LabGM' };

export default function Layout({ user, onLogout }) {
  const navigate = useNavigate();
  const navStyle = ({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navActive : {}) });

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoTitle}>🔧 ระบบแจ้งซ่อม I&E</div>
          <div style={s.logoSub}>Infrastructure & Equipment</div>
        </div>
        <nav style={s.nav}>
          <NavLink to="/" end style={navStyle}>📊 ภาพรวม</NavLink>
          <NavLink to="/repairs" style={navStyle}>📋 รายการซ่อม</NavLink>
          <NavLink to="/reports" style={navStyle}>📈 รายงาน</NavLink>
          {user.role === 'snr_engineer' && <NavLink to="/users" style={navStyle}>👥 จัดการผู้ใช้</NavLink>}
        </nav>
        <div style={s.user}>
          <div style={s.userName}>{user.name}</div>
          <div style={s.userRole}>{roleLabel[user.role]}</div>
          <button style={s.logoutBtn} onClick={onLogout}>ออกจากระบบ</button>
        </div>
      </div>
      <div style={s.main}>
        <Outlet />
      </div>
    </div>
  );
}
