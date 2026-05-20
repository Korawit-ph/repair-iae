import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { LangContext } from '../App';
import t from '../i18n';

const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', waiting_review: '#8b5cf6', returned: '#ef4444', completed: '#16a34a' };

export default function Reports() {
  const [stats, setStats] = useState(null);
  const { lang } = useContext(LangContext);
  const tx = t[lang];

  useEffect(() => {
    const token = localStorage.getItem('repair_token');
    axios.get('/api/reports/summary', { headers: { Authorization: `Bearer ${token}` } }).then(r => setStats(r.data));
  }, []);

  if (!stats) return <div style={{ padding: '2rem', color: '#64748b' }}>กำลังโหลด...</div>;

  const maxMonthly = Math.max(...Object.values(stats.monthly || { x: 1 }));
  const today = new Date().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const statusKeys = ['pending', 'in_progress', 'waiting_review', 'returned', 'completed'];

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{lang === 'th' ? 'รายงานสรุปงานซ่อม' : 'Repair Summary Report'}</h2>
        <button onClick={() => window.print()}
          style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          🖨️ {tx.printReport}
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{lang === 'th' ? 'รายงานประจำเดือน — ระบบแจ้งซ่อม I&E' : 'Monthly Report — I&E Repair System'}</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>{lang === 'th' ? 'วันที่พิมพ์:' : 'Print date:'} {today}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[[tx.totalJobs, stats.total, '#1e293b'], [tx.pending, stats.pending, '#f59e0b'],
          [tx.in_progress, stats.in_progress, '#3b82f6'], [tx.waiting_review, stats.waiting_review, '#8b5cf6'],
          [tx.returned, stats.returned, '#ef4444'], [tx.completed, stats.completed, '#16a34a']
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>{lang === 'th' ? 'สัดส่วนตามสถานะ' : 'Status Breakdown'}</div>
        {statusKeys.map(key => {
          const val = stats[key] || 0;
          const pct = stats.total ? Math.round(val / stats.total * 100) : 0;
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 140, fontSize: 13, color: '#475569' }}>{tx[key]}</div>
              <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 20 }}>
                <div style={{ background: statusColor[key], borderRadius: 4, height: '100%', width: `${pct}%` }} />
              </div>
              <div style={{ width: 70, fontSize: 13, color: '#64748b', textAlign: 'right' }}>{val} ({pct}%)</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>{tx.monthlyJobs}</div>
        {Object.entries(stats.monthly || {}).sort().map(([month, count]) => (
          <div key={month} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 80, fontSize: 13, color: '#64748b' }}>{month}</div>
            <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 24 }}>
              <div style={{ background: '#0ea5e9', borderRadius: 4, height: '100%', width: `${Math.round(count / maxMonthly * 100)}%` }} />
            </div>
            <div style={{ width: 30, fontSize: 13, fontWeight: 600 }}>{count}</div>
          </div>
        ))}
      </div>
      <style>{`@media print { button { display: none !important; } }`}</style>
    </div>
  );
}
