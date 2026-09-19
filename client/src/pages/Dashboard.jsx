import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

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

  const load = async (p = 1) => {
    const params = new URLSearchParams({ page: p, limit: 10 });
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    const { data } = await api.get(`/tickets?${params}`);
    setTickets(data.data);
    setPage(data.page);
    setTotalPages(data.totalPages);
  };

  const loadStats = async () => {
    if (user?.role === 'admin') {
      const { data } = await getStats();
      setStats(data);
    }
  };

  useEffect(() => { load(1); loadStats(); }, [status]);

  useEffect(() => { load(1); }, [status]);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/tickets', form);
    setForm({ title: '', description: '', category: 'general' });
    load(1);
  };

  const handleKBUpload = async (e) => {
    e.preventDefault();
    if (!kbFile) return alert('Select a file first');
    const fd = new FormData();
    fd.append('file', kbFile);
    fd.append('title', kbTitle || kbFile.name);
    const result = await uploadKB(fd);
    alert(`Uploaded: ${result.title} with ${result.chunkCount} chunks`);
    setKbTitle('');
    setKbFile(null);
    loadKB();
  };

  const loadKB = async () => {
    const { data } = await getKB();
    setKbDocs(data.data);
  };

  const handleTriage = async (ticketId) => {
    const result = await triageTicket(ticketId);
    setTriageResults((prev) => ({ ...prev, [ticketId]: result }));
    load(1);
  };

  return (
    <div className="wrap">
      <header>
        <h2>SmartDesk AI — {user?.role} dashboard</h2>
        <div>
          <span>{user?.name} ({user?.email})</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="grid">
        <div className="card">
          <h3>Create ticket</h3>
          <form onSubmit={create}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea placeholder="Describe issue..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="card">
          <h3>Tickets</h3>
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

      {user?.role === 'admin' && stats && (
        <div className="grid" style={{ marginTop: 16 }}>
          <div className="card">
            <h3>📊 Admin Stats</h3>
            <div className="row">
              <div>Total: <b>{stats.totalTickets}</b></div>
              <div>Open: <b>{stats.openTickets}</b></div>
              <div>Resolved: <b>{stats.resolvedTickets}</b></div>
              <div>Urgent: <b>{stats.urgentTickets}</b></div>
              <div>AI Resolved: <b>{stats.aiResolvedPercent}%</b></div>
              <div>Avg Resolution: <b>{stats.avgResolutionTimeMin} min</b></div>
            </div>
          </div>
        </div>
      )}
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
