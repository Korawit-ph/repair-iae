import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusLabel = { pending: 'รอดำเนินการ', in_progress: 'กำลังดำเนินการ', waiting_review: 'รอรีวิว', returned: 'ถูก Return', completed: 'เสร็จสิ้น' };
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', waiting_review: '#8b5cf6', returned: '#ef4444', completed: '#16a34a' };

export default function RepairList({ user }) {
  const [repairs, setRepairs] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('repair_token');
    axios.get('/api/repairs', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setRepairs(r.data));
  }, []);

  const filtered = filter === 'all' ? repairs : repairs.filter(r => r.status === filter);

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: 18, fontWeight: 700 }}>รายการงานซ่อมทั้งหมด</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'pending', 'in_progress', 'waiting_review', 'returned', 'completed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: filter === s ? '#0ea5e9' : '#f1f5f9', color: filter === s ? '#fff' : '#475569' }}>
            {s === 'all' ? 'ทั้งหมด' : statusLabel[s]}
          </button>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['เลขที่', 'ผู้แจ้ง', 'รายละเอียด', 'ผู้รับผิดชอบ', 'วันที่', 'สถานะ', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>#{r.ticket_no}</td>
                <td style={{ padding: '12px', color: '#475569' }}>{r.reporter_name || '-'}</td>
                <td style={{ padding: '12px', color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.detail || '-'}</td>
                <td style={{ padding: '12px', color: '#475569' }}>{r.assigned_user?.name || '-'}</td>
                <td style={{ padding: '12px', color: '#94a3b8', fontSize: 12 }}>{r.created_at?.slice(0, 10)}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: statusColor[r.status] + '20', color: statusColor[r.status], padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
                    {statusLabel[r.status]}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => navigate(`/repairs/${r.id}`)}
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
                    ดูรายละเอียด
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>ไม่มีรายการ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
