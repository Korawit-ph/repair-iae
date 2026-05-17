import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const statusLabel = { pending: 'รอดำเนินการ', in_progress: 'กำลังดำเนินการ', waiting_review: 'รอ LabGM รีวิว', returned: 'ถูก Return', completed: 'เสร็จสิ้น' };
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', waiting_review: '#8b5cf6', returned: '#ef4444', completed: '#16a34a' };

export default function TrackStatus() {
  const [ticketNo, setTicketNo] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await axios.get(`/api/repairs/track/${ticketNo}`);
      setData(res.data);
    } catch {
      setError('ไม่พบเลขที่งานนี้ กรุณาตรวจสอบอีกครั้ง');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2.5rem', width: '100%', maxWidth: 480, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40 }}>🔍</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '8px 0 4px' }}>ติดตามสถานะงานซ่อม</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>กรอกเลขที่งานที่ได้รับหลังแจ้งซ่อม</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <input value={ticketNo} onChange={e => setTicketNo(e.target.value)} placeholder="เลขที่งาน เช่น 1"
            style={{ flex: 1, padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
          <button type="submit" disabled={loading}
            style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? '...' : 'ค้นหา'}
          </button>
        </form>
        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        {data && (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>#{data.ticket_no}</span>
              <span style={{ background: statusColor[data.status] + '20', color: statusColor[data.status], padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 500 }}>
                {statusLabel[data.status]}
              </span>
            </div>
            <div style={{ fontSize: 14, color: '#475569', lineHeight: 2 }}>
              <div><b>ผู้แจ้ง:</b> {data.reporter_name || '-'}</div>
              <div><b>รายละเอียด:</b> {data.detail || '-'}</div>
              <div><b>วันที่แจ้ง:</b> {data.created_at?.slice(0, 10)}</div>
              <div><b>อัปเดตล่าสุด:</b> {data.updated_at?.slice(0, 10)}</div>
            </div>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <Link to="/report" style={{ color: '#0ea5e9' }}>← แจ้งซ่อมใหม่</Link>
        </div>
      </div>
    </div>
  );
}
