import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LangContext } from '../App';
import t from '../i18n';

export default function Login({ onLogin }) {
  const { lang, toggleLang } = useContext(LangContext);
  const tx = t[lang];
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', form);
      onLogin(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || (lang === 'th' ? 'เข้าสู่ระบบไม่สำเร็จ' : 'Login failed'));
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>TH</span>
            <div onClick={toggleLang} style={{ width: 44, height: 24, background: lang === 'en' ? '#0ea5e9' : '#cbd5e1', borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 2, left: lang === 'en' ? 22 : 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#64748b' }}>EN</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40 }}>🔧</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 4px' }}>{tx.repairSystem}</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{tx.teamOnly}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>{tx.email}</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>{tx.password}</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? '...' : tx.login}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
          <Link to="/report" style={{ color: '#0ea5e9' }}>→ {tx.reportRepair}</Link>
        </div>
      </div>
    </div>
  );
}
