import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { LangContext } from '../App';
import t from '../i18n';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { lang } = useContext(LangContext);
  const tx = t[lang];

  useEffect(() => {
    const token = localStorage.getItem('repair_token');
    axios.get('/api/reports/summary', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setStats(r.data));
  }, []);

  if (!stats) return <div style={{ padding: '2rem', color: '#64748b' }}>กำลังโหลด...</div>;

  const cards = [
    [tx.totalJobs, stats.total, '#1e293b'],
    [tx.pending, stats.pending, '#f59e0b'],
    [tx.in_progress, stats.in_progress, '#3b82f6'],
    [tx.waiting_review, stats.waiting_review, '#8b5cf6'],
    [tx.returned, stats.returned, '#ef4444'],
    [tx.completed, stats.completed, '#16a34a'],
  ];

  const maxMonthly = Math.max(...Object.values(stats.monthly || { x: 1 }));

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: 18, fontWeight: 700 }}>{tx.overview}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {cards.map(([label, value, color]) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: '1.25rem', border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>{tx.monthlyJobs}</div>
        {Object.entries(stats.monthly || {}).sort().map(([month, count]) => (
          <div key={month} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 80, fontSize: 13, color: '#64748b' }}>{month}</div>
            <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 20 }}>
              <div style={{ background: '#0ea5e9', borderRadius: 4, height: '100%', width: `${Math.min(count / maxMonthly * 100, 100)}%` }} />
            </div>
            <div style={{ width: 30, fontSize: 13, fontWeight: 600 }}>{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
