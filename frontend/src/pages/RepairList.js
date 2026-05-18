import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusLabel = { pending: 'รอดำเนินการ', in_progress: 'กำลังดำเนินการ', waiting_review: 'รอรีวิว', returned: 'ถูก Return', completed: 'เสร็จสิ้น' };
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', waiting_review: '#8b5cf6', returned: '#ef4444', completed: '#16a34a' };

export default function RepairList({ user }) {
  const [repairs, setRepairs] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const token = localStorage.getItem('repair_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    axios.get('/api/repairs', { headers }).then(r => setRepairs(r.data));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('ลบรายการนี้ออกจากระบบ?')) return;
    await axios.delete(`/api/repairs/${id}`, { headers });
    load();
  };

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
              {['เลขที่', 'ผู้แจ้ง', 'สถานที่', 'อุปกรณ์', 'รายละเอียด', 'ผู้รับผิดชอบ', 'วันที่', 'สถานะ', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => navigate(`/repairs/${r.id}`)}>
                <td style={{ padding: '12px', fontWeight: 600 }}>#{r.ticket_no}</td>
                <td style={{ padding: '12px', color: '#475569' }}>{r.reporter_name || '-'}</td>
                <td style={{ padding: '12px', color: '#475569' }}>{r.location || '-'}</td>
                <td style={{ padding: '12px', color: '#475569' }}>{r.device_name || '-'}</td>
                <td style={{ padding: '12px', color: '#475569', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.detail || '-'}</td>
                <td style={{ padding: '12px', color: '#475569' }}>{r.assigned_user?.name || '-'}</td>
                <td style={{ padding: '12px', color: '#94a3b8', fontSize: 12 }}>{r.created_at?.slice(0, 10)}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: statusColor[r.status] + '20', color: statusColor[r.status], padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
                    {statusLabel[r.status]}
                  </span>
                </td>
                <td style={{ padding: '12px' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => navigate(`/repairs/${r.id}`)}
                      style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>
                      ดู
                    </button>
                    {user.role === 'snr_engineer' && (
                      <button onClick={(e) => handleDelete(r.id, e)}
                        style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>
                        ลบ
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>ไม่มีรายการ</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
