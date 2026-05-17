import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusLabel = { pending: 'รอดำเนินการ', in_progress: 'กำลังดำเนินการ', waiting_review: 'รอ LabGM รีวิว', returned: 'ถูก Return', completed: 'เสร็จสิ้น' };
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', waiting_review: '#8b5cf6', returned: '#ef4444', completed: '#16a34a' };

export default function RepairDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [users, setUsers] = useState([]);
  const [assignTo, setAssignTo] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [showReturn, setShowReturn] = useState(false);
  const token = localStorage.getItem('repair_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`/api/repairs/${id}`, { headers }).then(r => { setRepair(r.data); setAssignTo(r.data.assigned_to || ''); });
    axios.get('/api/users', { headers }).then(r => setUsers(r.data));
  }, [id]);

  const refresh = () => axios.get(`/api/repairs/${id}`, { headers }).then(r => setRepair(r.data));

  const handleAssign = async () => {
    await axios.put(`/api/repairs/${id}/assign`, { assigned_to: assignTo }, { headers });
    refresh();
  };

  const handleClose = async () => {
    await axios.put(`/api/repairs/${id}/close`, {}, { headers });
    refresh();
  };

  const handleReturn = async () => {
    await axios.put(`/api/repairs/${id}/return`, { return_reason: returnReason }, { headers });
    setShowReturn(false);
    refresh();
  };

  const handleReview = async () => {
    await axios.put(`/api/repairs/${id}/review`, {}, { headers });
    refresh();
  };

  if (!repair) return <div style={{ padding: '2rem' }}>กำลังโหลด...</div>;

  const btnStyle = (bg) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' });
  const fieldStyle = { background: '#f8fafc', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#374151', marginBottom: 12 };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 700 }}>
      <button onClick={() => navigate('/repairs')} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>← กลับ</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>งานซ่อม #{repair.ticket_no}</h2>
        <span style={{ background: statusColor[repair.status] + '20', color: statusColor[repair.status], padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
          {statusLabel[repair.status]}
        </span>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>ข้อมูลการแจ้งซ่อม</div>
        <div style={fieldStyle}><b>ผู้แจ้ง:</b> {repair.reporter_name || '-'}</div>
        <div style={fieldStyle}><b>อีเมล:</b> {repair.reporter_email || '-'}</div>
        <div style={fieldStyle}><b>วันที่แจ้ง:</b> {repair.report_date || '-'}</div>
        <div style={fieldStyle}><b>รายละเอียด:</b> {repair.detail || '-'}</div>
        {repair.file_url && <div style={fieldStyle}><b>ไฟล์แนบ:</b> <a href={repair.file_url} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>ดูไฟล์</a></div>}
        {repair.return_reason && <div style={{ ...fieldStyle, background: '#fef2f2' }}><b>เหตุผล Return:</b> {repair.return_reason}</div>}
      </div>

      {/* Snr.Engineer Actions */}
      {user.role === 'snr_engineer' && (
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>มอบหมายงาน</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
              <option value="">เลือกผู้รับผิดชอบ</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
            <button onClick={handleAssign} style={btnStyle('#0ea5e9')}>Assign</button>
          </div>
          {['in_progress', 'returned'].includes(repair.status) && (
            <button onClick={() => setShowReturn(true)} style={{ ...btnStyle('#ef4444'), marginTop: 10 }}>Return งาน</button>
          )}
        </div>
      )}

      {/* Engineer/Officer Actions */}
      {['engineer', 'officer'].includes(user.role) && repair.status === 'in_progress' && (
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleClose} style={btnStyle('#16a34a')}>✅ ปิดงาน</button>
            <button onClick={() => setShowReturn(true)} style={btnStyle('#ef4444')}>Return งาน</button>
          </div>
        </div>
      )}

      {/* LabGM Actions */}
      {user.role === 'labgm' && repair.status === 'waiting_review' && (
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleReview} style={btnStyle('#16a34a')}>✅ อนุมัติ & ปิดงาน</button>
            <button onClick={() => setShowReturn(true)} style={btnStyle('#ef4444')}>Return งาน</button>
          </div>
        </div>
      )}

      {/* Return modal */}
      {showReturn && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 400 }}>
            <h3 style={{ margin: '0 0 12px' }}>Return งาน</h3>
            <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)}
              placeholder="ระบุเหตุผล (ไม่บังคับ)"
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, minHeight: 80, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleReturn} style={btnStyle('#ef4444')}>ยืนยัน Return</button>
              <button onClick={() => setShowReturn(false)} style={{ ...btnStyle('#94a3b8') }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
