import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LangContext } from '../App';
import t from '../i18n';

export default function ReportForm() {
  const { lang, toggleLang } = useContext(LangContext);
  const tx = t[lang];
  const [form, setForm] = useState({ reporter_name: '', reporter_email: '', report_date: new Date().toISOString().slice(0, 10), location: '', device_name: '', detail: '' });
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (file) formData.append('file', file);
      const res = await axios.post('/api/repairs/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 });
      setSuccess(res.data.ticket_no);
    } catch (err) {
      setError(lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Error occurred. Please try again.');
    }
    setLoading(false);
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: '#374151' };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 560, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
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
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 4px' }}>{tx.reportRepair}</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{lang === 'th' ? 'กรอกข้อมูลเพื่อแจ้งซ่อมอุปกรณ์' : 'Fill in the form to report a repair'}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{tx.reporter}</label>
            <input style={inputStyle} value={form.reporter_name} onChange={e => setForm({ ...form, reporter_name: e.target.value })} placeholder={lang === 'th' ? 'ชื่อ-นามสกุล' : 'Full name'} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{tx.email}</label>
            <input type="email" style={inputStyle} value={form.reporter_email} onChange={e => setForm({ ...form, reporter_email: e.target.value })} placeholder="example@email.com" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{tx.reportDate}</label>
            <input type="date" style={inputStyle} value={form.report_date} onChange={e => setForm({ ...form, report_date: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{tx.location}</label>
            <input style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder={lang === 'th' ? 'เช่น ห้องแล็บ, ชั้น 2' : 'e.g. Lab room, Floor 2'} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{tx.device}</label>
            <input style={inputStyle} value={form.device_name} onChange={e => setForm({ ...form, device_name: e.target.value })} placeholder={lang === 'th' ? 'เช่น แอร์, คอมพิวเตอร์' : 'e.g. Air conditioner, Computer'} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{tx.detail}</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} placeholder={lang === 'th' ? 'อธิบายอาการที่พบ...' : 'Describe the problem...'} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>{tx.attachFile} ({lang === 'th' ? 'ไม่บังคับ, ไม่เกิน 10MB' : 'Optional, max 10MB'})</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} style={{ fontSize: 13, color: '#374151', width: '100%' }} />
          </div>
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#94a3b8' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? tx.sending : tx.submit}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <Link to="/track" style={{ color: '#0ea5e9' }}>{tx.trackStatus} →</Link>
        </div>
      </div>

      {success && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', maxWidth: 400, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#16a34a', margin: '0 0 8px', fontSize: 22 }}>{tx.submitSuccess}</h2>
            <p style={{ color: '#475569', marginBottom: 16 }}>{tx.ticketNo}</p>
            <div style={{ background: '#f0fdf4', border: '2px solid #16a34a', borderRadius: 10, padding: '1rem', fontSize: 32, fontWeight: 700, color: '#16a34a', marginBottom: 16 }}>#{success}</div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>{lang === 'th' ? 'กรุณาจดเลขที่นี้ไว้เพื่อติดตามสถานะ' : 'Please note this number to track your repair status'}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/track" style={{ background: '#0ea5e9', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{tx.trackStatus}</Link>
              <button onClick={() => { setSuccess(null); setForm({ reporter_name: '', reporter_email: '', report_date: new Date().toISOString().slice(0, 10), location: '', device_name: '', detail: '' }); setFile(null); }}
                style={{ background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                {lang === 'th' ? 'แจ้งซ่อมใหม่' : 'New Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
