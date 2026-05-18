require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const multerStorage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: multerStorage, limits: { fileSize: 10 * 1024 * 1024 } });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'repair-iae-secret-2024';

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
  } catch (e) {
    console.log('Email error:', e.message);
  }
}

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ==================== AUTH ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
  if (!user) return res.status(401).json({ error: 'ไม่พบผู้ใช้งาน' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

// ==================== USERS ====================

// Get all users
app.get('/api/users', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('users').select('id, email, name, role, created_at');
  res.json(data);
});

// Create user (admin only)
app.post('/api/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'snr_engineer') return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  const { email, name, role, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert({ email, name, role, password: hashed }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Update user role
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'snr_engineer') return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  const { name, role, email } = req.body;
  const { data, error } = await supabase.from('users').update({ name, role, email }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete user
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'snr_engineer') return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  await supabase.from('users').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// ==================== REPAIRS ====================

// Public: Submit repair request
app.post('/api/repairs/submit', upload.single('file'), async (req, res) => {
  const { reporter_name, reporter_email, report_date, detail } = req.body;
  const file_url = req.file ? `/uploads/${req.file.filename}` : null;

  const { data, error } = await supabase.from('repairs').insert({
    reporter_name, reporter_email, report_date, detail, file_url, status: 'pending'
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });

  // แจ้งเตือน Snr.Engineer
  const { data: snrList } = await supabase.from('users').select('email').eq('role', 'snr_engineer');
  if (snrList?.length) {
    const emails = snrList.map(u => u.email).join(',');
    await sendEmail(emails, '🔧 มีงานแจ้งซ่อมใหม่เข้ามา - ระบบแจ้งซ่อม I&E',
      `<h2>มีงานแจ้งซ่อมใหม่</h2>
      <p><b>ผู้แจ้ง:</b> ${reporter_name || '-'}</p>
      <p><b>อีเมล:</b> ${reporter_email || '-'}</p>
      <p><b>รายละเอียด:</b> ${detail || '-'}</p>
      <p><b>เลขที่งาน:</b> ${data.ticket_no}</p>`
    );
  }

  res.json({ success: true, ticket_no: data.ticket_no, id: data.id });
});

// Public: Track repair status
app.get('/api/repairs/track/:ticket_no', async (req, res) => {
  const { data } = await supabase.from('repairs')
    .select('ticket_no, status, reporter_name, detail, created_at, assigned_to, updated_at')
    .eq('ticket_no', req.params.ticket_no).single();
  if (!data) return res.status(404).json({ error: 'ไม่พบงานซ่อมนี้' });
  res.json(data);
});

// Get all repairs (team)
app.get('/api/repairs', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('repairs')
    .select('*, assigned_user:users!repairs_assigned_to_fkey(name, email)')
    .order('created_at', { ascending: false });
  res.json(data);
});

// Get single repair
app.get('/api/repairs/:id', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('repairs')
    .select('*, assigned_user:users!repairs_assigned_to_fkey(name, email)')
    .eq('id', req.params.id).single();
  res.json(data);
});

// Assign repair
app.put('/api/repairs/:id/assign', authMiddleware, async (req, res) => {
  if (req.user.role !== 'snr_engineer') return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  const { assigned_to } = req.body;
  const { data } = await supabase.from('repairs')
    .update({ assigned_to, status: 'in_progress', updated_at: new Date() })
    .eq('id', req.params.id).select().single();

  // แจ้งเตือนผู้รับงาน
  const { data: assignedUser } = await supabase.from('users').select('email, name').eq('id', assigned_to).single();
  if (assignedUser) {
    await sendEmail(assignedUser.email, '📋 คุณได้รับมอบหมายงานซ่อม - ระบบแจ้งซ่อม I&E',
      `<h2>คุณได้รับมอบหมายงานซ่อม</h2>
      <p><b>เลขที่งาน:</b> ${data.ticket_no}</p>
      <p><b>รายละเอียด:</b> ${data.detail || '-'}</p>`
    );
  }
  res.json(data);
});

// Close repair (engineer/officer/snr)
app.put('/api/repairs/:id/close', authMiddleware, async (req, res) => {
  const { data } = await supabase.from('repairs')
    .update({ status: 'waiting_review', closed_at: new Date(), updated_at: new Date() })
    .eq('id', req.params.id).select().single();

  // แจ้งเตือน LabGM
  const { data: labgmList } = await supabase.from('users').select('email').eq('role', 'labgm');
  if (labgmList?.length) {
    const emails = labgmList.map(u => u.email).join(',');
    await sendEmail(emails, '✅ มีงานซ่อมรอการรีวิว - ระบบแจ้งซ่อม I&E',
      `<h2>มีงานซ่อมรอการรีวิว</h2>
      <p><b>เลขที่งาน:</b> ${data.ticket_no}</p>
      <p><b>รายละเอียด:</b> ${data.detail || '-'}</p>`
    );
  }
  res.json(data);
});

// Return repair
app.put('/api/repairs/:id/return', authMiddleware, async (req, res) => {
  const { return_reason } = req.body;
  const { data, error } = await supabase.from('repairs')
    .update({ status: 'returned', return_reason, updated_at: new Date() })
    .eq('id', req.params.id).select('*, assigned_user:users!repairs_assigned_to_fkey(email, name)').single();
  if (error) return res.status(400).json({ error: error.message });

  // แจ้งเตือนผู้รับงาน
  if (data.assigned_user?.email) {
    await sendEmail(data.assigned_user.email, '🔄 งานถูก Return กลับมา - ระบบแจ้งซ่อม I&E',
      `<h2>งานซ่อมถูก Return</h2>
      <p><b>เลขที่งาน:</b> ${data.ticket_no}</p>
      <p><b>เหตุผล:</b> ${return_reason || '-'}</p>`
    );
  }
  res.json(data);
});

// Review & complete (LabGM)
app.put('/api/repairs/:id/review', authMiddleware, async (req, res) => {
  if (req.user.role !== 'labgm') return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
  const { data } = await supabase.from('repairs')
    .update({ status: 'completed', reviewed_at: new Date(), updated_at: new Date() })
    .eq('id', req.params.id).select().single();
  res.json(data);
});

// ==================== REPORTS ====================

app.get('/api/reports/summary', authMiddleware, async (req, res) => {
  const { data: all } = await supabase.from('repairs').select('status, created_at');
  const total = all.length;
  const completed = all.filter(r => r.status === 'completed').length;
  const pending = all.filter(r => r.status === 'pending').length;
  const in_progress = all.filter(r => r.status === 'in_progress').length;
  const waiting_review = all.filter(r => r.status === 'waiting_review').length;
  const returned = all.filter(r => r.status === 'returned').length;

  // Monthly stats
  const monthly = {};
  all.forEach(r => {
    const month = r.created_at?.slice(0, 7);
    if (!monthly[month]) monthly[month] = 0;
    monthly[month]++;
  });

  res.json({ total, completed, pending, in_progress, waiting_review, returned, monthly });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
