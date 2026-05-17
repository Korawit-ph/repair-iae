import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const statusLabel = { pending: 'รอดำเนินการ', in_progress: 'กำลังดำเนินการ', waiting_review: 'รอรีวิว', returned: 'ถูก Return', completed: 'เสร็จสิ้น' };
const statusColor = { pending: '#f59e0b', in_progress: '#3b82f6', waiting_review: '#8b5cf6', returned: '#ef4444', completed: '#16a34a' };

export default function Reports() {
  const [stats, setStats] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('repair_token');
    axios.get('/api/reports/summary', { headers: { Authorization: `Bearer ${token}` } }).then(r => setStats(r.data));
  }, []);

  const handlePrint = () => window.print();

  if (!stats) return <div style={{ padding: '2rem' }}>กำลังโหลด...</div>;

  const maxMonthly = Math.max(...Object.values(stats.monthly || { x: 1 }));
  const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>รายงานสรุปงานซ่อม</h2>
        <button onClick={handlePrint}
          style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          🖨️ พิมพ์ / Export PDF
        </button>
      </div>

      <div ref={printRef}>
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>รายงานประจำเดือน — ระบบแจ้งซ่อม I&E</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>วันที่พิมพ์: {today}</div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            ['งานทั้งหมด', stats.total, '#1e293b'],
            ['รอดำเนินการ', stats.pending, '#f59e0b'],
            ['กำลังดำเนินการ', stats.in_progress, '#3b82f6'],
            ['รอรีวิว', stats.waiting_review, '#8b5cf6'],
            ['ถูก Return', stats.returned, '#ef4444'],
            ['เสร็จสิ้น', stats.completed, '#16a34a'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>สัดส่วนตามสถานะ</div>
          {Object.entries(statusLabel).map(([key, label]) => {
            const val = stats[key] || 0;
            const pct = stats.total ? Math.round(val / stats.total * 100) : 0;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 120, fontSize: 13, color: '#475569' }}>{label}</div>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 20, position: 'relative' }}>
                  <div style={{ background: statusColor[key], borderRadius: 4, height: '100%', width: `${pct}%`, transition: 'width 0.5s' }} />
                </div>
                <div style={{ width: 60, fontSize: 13, color: '#64748b', textAlign: 'right' }}>{val} ({pct}%)</div>
              </div>
            );
          })}
        </div>

        {/* Monthly chart */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>งานแต่ละเดือน</div>
          {Object.entries(stats.monthly || {}).sort().map(([month, count]) => (
            <div key={month} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 80, fontSize: 13, color: '#64748b' }}>{month}</div>
              <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 24, position: 'relative' }}>
                <div style={{ background: '#0ea5e9', borderRadius: 4, height: '100%', width: `${Math.round(count / maxMonthly * 100)}%` }} />
              </div>
              <div style={{ width: 30, fontSize: 13, fontWeight: 600 }}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media print { button { display: none !important; } }`}</style>
    </div>
  );
}
