import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { LangContext } from '../App';
import t from '../i18n';

const roleLabel = { snr_engineer: 'Snr.Engineer', engineer: 'Engineer', officer: 'Officer', labgm: 'LabGM' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'engineer', password: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { lang } = useContext(LangContext);
  const tx = t[lang];
  const token = localStorage.getItem('repair_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => axios.get('/api/users', { headers }).then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post('/api/users', form, { headers });
    setShowAdd(false);
    setForm({ name: '', email: '', role: 'engineer', password: '' });
    load();
  };

  const handleEdit = async (id) => {
    await axios.put(`/api/users/${id}`, editForm, { headers });
    setEditId(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang === 'th' ? 'ลบผู้ใช้นี้?' : 'Delete this user?')) return;
    await axios.delete(`/api/users/${id}`, { headers });
    load();
  };

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 };
  const btnStyle = (bg) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' });

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{tx.manageUsers}</h2>
        <button onClick={() => setShowAdd(true)} style={btnStyle('#0ea5e9')}>{tx.addUser}</button>
      </div>

      {showAdd && (
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 16px' }}>{tx.addUser}</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{tx.name}</label><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{tx.email}</label><input type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{tx.password}</label><input type="password" style={inputStyle} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div><label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{tx.role}</label>
                <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {Object.entries(roleLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={btnStyle('#16a34a')}>{tx.save}</button>
              <button type="button" onClick={() => setShowAdd(false)} style={btnStyle('#94a3b8')}>{tx.cancel}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {[tx.name, tx.email, tx.role, ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px' }}>
                  {editId === u.id ? <input style={{ ...inputStyle, width: 120 }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /> : u.name}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>
                  {editId === u.id ? <input style={{ ...inputStyle, width: 180 }} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /> : u.email}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {editId === u.id
                    ? <select style={{ ...inputStyle, width: 130 }} value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                        {Object.entries(roleLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    : <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: 999, fontSize: 12 }}>{roleLabel[u.role]}</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {editId === u.id
                      ? <><button onClick={() => handleEdit(u.id)} style={btnStyle('#16a34a')}>{tx.save}</button><button onClick={() => setEditId(null)} style={btnStyle('#94a3b8')}>{tx.cancel}</button></>
                      : <><button onClick={() => { setEditId(u.id); setEditForm({ name: u.name, email: u.email, role: u.role }); }} style={btnStyle('#0ea5e9')}>{tx.edit}</button>
                         <button onClick={() => handleDelete(u.id)} style={btnStyle('#ef4444')}>{tx.delete}</button></>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
