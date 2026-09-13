import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'general' });

  const load = async (p = 1) => {
    const params = new URLSearchParams({ page: p, limit: 10 });
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    const { data } = await api.get(`/tickets?${params}`);
    setTickets(data.data);
    setPage(data.page);
    setTotalPages(data.totalPages);
  };

  useEffect(() => { load(1); }, [status]);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/tickets', form);
    setForm({ title: '', description: '', category: 'general' });
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
              <b>{t.title}</b>
              <span>{t.status} • {t.priority} • {t.category}</span>
            </Link>
          ))}
          <div className="row">
            <button disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
            <span>{page}/{totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
