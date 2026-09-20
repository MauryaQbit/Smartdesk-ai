import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { user, logout, uploadKB, getKB, getStats, triageTicket } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'general' });
  const [kbTitle, setKbTitle] = useState('');
  const [kbFile, setKbFile] = useState(null);
  const [kbDocs, setKbDocs] = useState([]);
  const [triageResults, setTriageResults] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      if (status) params.set('status', status);
      if (q) params.set('q', q);
      const { data } = await api.get(`/tickets?${params}`);
      setTickets(data.data);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch { showToast('Failed to load tickets'); }
    setLoading(false);
  };

  const loadStats = async () => {
    if (user?.role !== 'admin') return;
    try { const { data } = await getStats(); setStats(data); } catch {}
  };

  const loadKB = async () => {
    try { const d = await getKB(); setKbDocs(d.data || d); } catch {}
  };

  useEffect(() => { load(1); loadStats(); loadKB(); }, [status, user]);

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return showToast('Title and description required');
    try {
      await api.post('/tickets', form);
      setForm({ title: '', description: '', category: 'general' });
      showToast('Ticket created');
      load(1); loadStats();
    } catch (err) { showToast(err.response?.data?.message || 'Create failed'); }
  };

  const handleKBUpload = async (e) => {
    e.preventDefault();
    if (!kbFile) return showToast('Select a file first');
    const fd = new FormData();
    fd.append('file', kbFile);
    fd.append('title', kbTitle || kbFile.name);
    try {
      const result = await uploadKB(fd);
      showToast(`Uploaded: ${result.title} (${result.chunkCount} chunks)`);
      setKbTitle(''); setKbFile(null); loadKB();
    } catch (err) { showToast(err.response?.data?.message || 'Upload failed'); }
  };

  const handleTriage = async (ticketId) => {
    try {
      const result = await triageTicket(ticketId);
      setTriageResults((prev) => ({ ...prev, [ticketId]: result }));
      showToast(`Triaged: ${result.priority}`);
      load(1); loadStats();
    } catch { showToast('Triage failed - check GEMINI key'); }
  };

  const chartData = stats ? [
    { name: 'Open', value: stats.openTickets },
    { name: 'Resolved', value: stats.resolvedTickets },
    { name: 'Urgent', value: stats.urgentTickets },
    { name: 'AI Resolved', value: stats.aiResolved },
  ] : [];

  return (
    <div className="wrap">
      <header>
        <h2>SmartDesk AI — {user?.role} dashboard</h2>
        <div>
          <span>{user?.name} ({user?.email})</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      {toast && <div style={{ background: '#111827', color: '#fff', padding: '8px 12px', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>{toast}</div>}

      {user?.role === 'admin' && stats && (
        <div className="card">
          <h3>📊 Admin Analytics</h3>
          <div className="row" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <span>Total: <b>{stats.totalTickets}</b></span>
            <span>Open: <b>{stats.openTickets}</b></span>
            <span>Resolved: <b>{stats.resolvedTickets}</b></span>
            <span>Urgent: <b>{stats.urgentTickets}</b></span>
            <span>AI Resolved: <b>{stats.aiResolvedPercent}%</b></span>
            <span>Avg Resolution: <b>{stats.avgResolutionTimeMin} min</b></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#3b82f6" /></BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>{chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid">
        <div className="card">
          <h3>Create ticket</h3>
          <form onSubmit={create}>
            <input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea placeholder="Describe issue... *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="card">
          <h3>Tickets {loading && <small>loading...</small>}</h3>
          <div className="row">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
            <button onClick={() => load(1)}>Search</button>
          </div>
          {tickets.length === 0 && !loading && <p style={{ opacity: 0.6, textAlign: 'center' }}>No tickets yet. Create one!</p>}
          {tickets.map((t) => (
            <Link key={t._id} to={`/tickets/${t._id}`} className="ticket">
              <div>
                <b>{t.title}</b>
                <span> {t.status} • {t.priority} • {t.category}</span>
                {triageResults[t._id] && (
                  <small style={{ display: 'block', color: '#2563eb' }}>
                    AI: {triageResults[t._id].priority} • {triageResults[t._id].category} • {triageResults[t._id].summary}
                  </small>
                )}
              </div>
            </Link>
          ))}
          <div className="row">
            <button disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
            <span>{page}/{totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</button>
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => tickets.filter((t) => t.status === 'open').forEach((t) => handleTriage(t._id))}>
              AI Triage all open tickets
            </button>
          )}
        </div>
      </div>

      {['admin', 'agent'].includes(user?.role) && (
        <div className="grid" style={{ marginTop: 16 }}>
          <div className="card">
            <h3>Knowledge Base Upload</h3>
            <form onSubmit={handleKBUpload}>
              <input placeholder="Document title" value={kbTitle} onChange={(e) => setKbTitle(e.target.value)} />
              <input type="file" accept=".txt,.md,.json,.csv" onChange={(e) => setKbFile(e.target.files[0])} />
              <button type="submit">Upload to KB</button>
            </form>
          </div>
          <div className="card">
            <h3>Knowledge Base Docs ({kbDocs.length})</h3>
            {kbDocs.map((d) => (
              <div key={d._id} className="ticket">
                <div>
                  <b>{d.title}</b>
                  <span> {d.chunkCount} chunks • {d.source}</span>
                </div>
              </div>
            ))}
            {kbDocs.length === 0 && <p><small>No docs uploaded yet</small></p>}
          </div>
        </div>
      )}
    </div>
  );
}
