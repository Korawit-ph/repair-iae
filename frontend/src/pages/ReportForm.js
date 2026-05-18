import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ReportForm() {
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
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
    setLoading(false);
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: '#374151' };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 560, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40 }}>🔧</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 4px' }}>แจ้งซ่อม I&E</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>กรอกข้อมูลเพื่อแจ้งซ่อมอุปกรณ์</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>ผู้แจ้งซ่อม</label>
            <input style={inputStyle} value={form.reporter_name} onChange={e => setForm({ ...form, reporter_name: e.target.value })} placeholder="ชื่อ-นามสกุล" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>อีเมล</label>
            <input type="email" style={inputStyle} value={form.reporter_email} onChange={e => setForm({ ...form, reporter_email: e.target.value })} placeholder="example@email.com" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>วันที่แจ้งซ่อม</label>
            <input type="date" style={inputStyle} value={form.report_date} onChange={e => setForm({ ...form, report_date: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>สถานที่</label>
            <input style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="เช่น ห้องแล็บ, ชั้น 2, ห้องประชุม A" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>อุปกรณ์ที่เสีย</label>
            <input style={inputStyle} value={form.device_name} onChange={e => setForm({ ...form, device_name: e.target.value })} placeholder="เช่น เครื่องปรับอากาศ, คอมพิวเตอร์, เครื่องพิมพ์" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>รายละเอียดปัญหา</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} placeholder="อธิบายอาการที่พบ เช่น ไม่ติด, มีเสียงดัง, น้ำรั่ว..." />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>แนบไฟล์ (ไม่บังคับ, ไม่เกิน 10MB)</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} style={{ fontSize: 13, color: '#374151', width: '100%' }} />
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>รองรับทุกประเภทไฟล์ รูปภาพ, PDF, Word</p>
          </div>
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#94a3b8' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'กำลังส่ง...' : 'ส่งคำร้องแจ้งซ่อม'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <Link to="/track" style={{ color: '#0ea5e9' }}>ติดตามสถานะงานซ่อม →</Link>
        </div>
      </div>

      {success && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#16a34a', margin: '0 0 8px', fontSize: 22 }}>ส่งคำร้องสำเร็จ!</h2>
            <p style={{ color: '#475569', marginBottom: 16 }}>เลขที่งานของคุณคือ</p>
            <div style={{ background: '#f0fdf4', border: '2px solid #16a34a', borderRadius: 10, padding: '1rem', fontSize: 32, fontWeight: 700, color: '#16a34a', marginBottom: 16 }}>#{success}</div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>กรุณาจดเลขที่นี้ไว้เพื่อติดตามสถานะงานซ่อม</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/track" style={{ background: '#0ea5e9', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>ติดตามสถานะ</Link>
              <button onClick={() => { setSuccess(null); setForm({ reporter_name: '', reporter_email: '', report_date: new Date().toISOString().slice(0, 10), location: '', device_name: '', detail: '' }); setFile(null); }}
                style={{ background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>แจ้งซ่อมใหม่</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
