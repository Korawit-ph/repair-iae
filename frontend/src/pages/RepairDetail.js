import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LangContext } from '../App';
import t from '../i18n';

const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', waiting_review: '#8b5cf6', returned: '#ef4444', completed: '#16a34a' };

export default function RepairDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useContext(LangContext);
  const tx = t[lang];
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
  const handleAssign = async () => { await axios.put(`/api/repairs/${id}/assign`, { assigned_to: assignTo }, { headers }); refresh(); };
  const handleClose = async () => { await axios.put(`/api/repairs/${id}/close`, {}, { headers }); refresh(); };
  const handleReturn = async () => { await axios.put(`/api/repairs/${id}/return`, { return_reason: returnReason }, { headers }); setShowReturn(false); refresh(); };
  const handleReview = async () => { await axios.put(`/api/repairs/${id}/review`, {}, { headers }); refresh(); };
  const handleDelete = async () => {
    if (!window.confirm(lang === 'th' ? 'ลบงานซ่อมนี้?' : 'Delete this repair?')) return;
    await axios.delete(`/api/repairs/${id}`, { headers });
    navigate('/repairs');
  };

  if (!repair) return <div style={{ padding: '2rem', color: '#64748b' }}>กำลังโหลด...</div>;

  const btnStyle = (bg) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' });
  const fieldStyle = { background: '#f8fafc', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#374151', marginBottom: 12 };
  const roleLabel = { snr_engineer: 'Snr.Engineer', engineer: 'Engineer', officer: 'Officer', labgm: 'LabGM' };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 700 }}>
      <button onClick={() => navigate('/repairs')} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}>{tx.back}</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{lang === 'th' ? 'งานซ่อม' : 'Repair Job'} #{repair.ticket_no}</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ background: statusColor[repair.status] + '20', color: statusColor[repair.status], padding: '5px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
            {tx[repair.status]}
          </span>
          {user.role === 'snr_engineer' && <button onClick={handleDelete} style={btnStyle('#ef4444')}>🗑 {tx.delete}</button>}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>{tx.repairDetail}</div>
        <div style={fieldStyle}><b>{tx.reporter}:</b> {repair.reporter_name || '-'}</div>
        <div style={fieldStyle}><b>{tx.email}:</b> {repair.reporter_email || '-'}</div>
        <div style={fieldStyle}><b>{tx.reportDate}:</b> {repair.report_date || '-'}</div>
        <div style={fieldStyle}><b>{tx.location}:</b> {repair.location || '-'}</div>
        <div style={fieldStyle}><b>{tx.device}:</b> {repair.device_name || '-'}</div>
        <div style={fieldStyle}><b>{tx.detail}:</b> {repair.detail || '-'}</div>
        {repair.file_url && (
          <div style={fieldStyle}>
            <b>{tx.fileAttach}:</b>{' '}
            <a href={repair.file_url} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9' }}>
              {repair.file_name || (lang === 'th' ? 'ดูไฟล์' : 'View File')}
            </a>
          </div>
        )}
        {repair.return_reason && <div style={{ ...fieldStyle, background: '#fef2f2' }}><b>{tx.returnReason2}:</b> {repair.return_reason}</div>}
      </div>

      {user.role === 'snr_engineer' && (
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>{tx.assign}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
              <option value="">{tx.assignTo}</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({roleLabel[u.role]})</option>)}
            </select>
            <button onClick={handleAssign} style={btnStyle('#0ea5e9')}>{tx.assign}</button>
          </div>
          {['in_progress', 'returned'].includes(repair.status) && (
            <button onClick={() => setShowReturn(true)} style={{ ...btnStyle('#ef4444'), marginTop: 10 }}>{tx.return}</button>
          )}
        </div>
      )}

      {['engineer', 'officer'].includes(user.role) && repair.status === 'in_progress' && (
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleClose} style={btnStyle('#16a34a')}>✅ {tx.close}</button>
            <button onClick={() => setShowReturn(true)} style={btnStyle('#ef4444')}>{tx.return}</button>
          </div>
        </div>
      )}

      {user.role === 'labgm' && repair.status === 'waiting_review' && (
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleReview} style={btnStyle('#16a34a')}>✅ {tx.review}</button>
            <button onClick={() => setShowReturn(true)} style={btnStyle('#ef4444')}>{tx.return}</button>
          </div>
        </div>
      )}

      {showReturn && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: 400 }}>
            <h3 style={{ margin: '0 0 12px' }}>{tx.return}</h3>
            <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)}
              placeholder={tx.returnReason}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, minHeight: 80, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleReturn} style={btnStyle('#ef4444')}>{tx.confirm}</button>
              <button onClick={() => setShowReturn(false)} style={btnStyle('#94a3b8')}>{tx.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
