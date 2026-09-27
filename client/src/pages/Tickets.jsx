import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Plus, Search, Sparkles, Ticket as TicketIcon } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, CardContent, CardHeader, Input, Select, Skeleton, Textarea, Toast } from '../components/ui';

export default function Tickets() {
  const { user, triageTicket } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'general' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [triaging, setTriaging] = useState('');
  const [toast, setToast] = useState('');

  const load = async (nextPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: nextPage, limit: 10 });
      if (status) params.set('status', status);
      if (search) params.set('q', search);
      const { data } = await api.get(`/tickets?${params}`);
      setTickets(data.data || []); setPage(data.page); setTotal(data.total || 0); setTotalPages(data.totalPages || 1);
    } catch { setToast('We could not load your tickets.'); }
    setLoading(false);
  };
  useEffect(() => { load(1); }, [status, search]);

  const create = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return setToast('Add a title and description first.');
    setCreating(true);
    try { await api.post('/tickets', form); setForm({ title: '', description: '', category: 'general' }); setToast('Ticket created successfully.'); load(1); } catch (error) { setToast(error.response?.data?.message || 'Ticket creation failed.'); }
    setCreating(false);
  };

  const triage = async (ticketId) => {
    setTriaging(ticketId);
    try { await triageTicket(ticketId); setToast('AI triage complete.'); load(page); } catch { setToast('SmartDesk could not triage this ticket.'); }
    setTriaging('');
  };

  const statusTone = (value) => value === 'resolved' ? 'green' : value === 'assigned' ? 'blue' : value === 'closed' ? 'zinc' : 'amber';
  const priorityTone = (value) => value === 'Urgent' ? 'red' : value === 'High' ? 'amber' : value === 'Medium' ? 'blue' : 'zinc';

  return (
    <div className="space-y-6">
      <Toast message={toast} />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">Support operations</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Tickets</h1><p className="mt-2 text-sm text-zinc-400">Manage and track every support request in one place.</p></div><Link to="/dashboard#create-ticket" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-emerald-300"><Plus size={16} /> Create ticket</Link></div>

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]">
        <Card className="h-fit border-emerald-400/10"><CardHeader><h2 className="flex items-center gap-2 font-semibold text-white"><Plus size={17} className="text-emerald-400" /> New support request</h2><p className="mt-1 text-sm text-zinc-500">Give the team enough context to help quickly.</p></CardHeader><CardContent><form onSubmit={create} className="space-y-3"><Input aria-label="Ticket title" placeholder="Subject" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><Textarea aria-label="Ticket description" placeholder="Describe what happened…" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><Input aria-label="Ticket category" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /><Button className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" disabled={creating}>{creating ? 'Creating ticket…' : 'Create ticket'}</Button></form></CardContent></Card>

        <Card id="ticket-list"><CardHeader><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="flex items-center gap-2 font-semibold text-white"><TicketIcon size={17} className="text-emerald-400" /> All tickets <Badge tone="zinc">{total}</Badge></h2><p className="mt-1 text-sm text-zinc-500">Search, filter, and open a request for the full conversation.</p></div><div className="flex gap-2"><Select aria-label="Filter tickets by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="open">Open</option><option value="assigned">Assigned</option><option value="resolved">Resolved</option><option value="closed">Closed</option></Select></div></div></CardHeader><CardContent><form onSubmit={(event) => { event.preventDefault(); setSearch(query); }} className="mb-4 flex gap-2"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><Input aria-label="Search tickets" className="pl-10" placeholder="Search tickets…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Button variant="secondary">Search</Button></form>{loading ? <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : tickets.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center"><TicketIcon size={24} className="mx-auto text-zinc-600" /><p className="mt-3 text-sm font-medium text-zinc-300">No tickets found</p><p className="mt-1 text-sm text-zinc-500">Create a request or adjust your filters.</p></div> : <div className="space-y-2">{tickets.map((ticket) => <div key={ticket._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-emerald-400/25 sm:flex-row sm:items-center sm:justify-between"><Link to={`/tickets/${ticket._id}`} className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-zinc-200 hover:text-white">{ticket.title}</div><div className="mt-2 flex flex-wrap items-center gap-1.5"><Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge><Badge tone="zinc">{ticket.category}</Badge>{ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date() && !['resolved', 'closed'].includes(ticket.status) && <Badge tone="red"><AlertTriangle size={12} className="mr-1" /> SLA overdue</Badge>}</div></Link><div className="flex items-center justify-between gap-3 sm:justify-end">{user?.role === 'admin' && ticket.status === 'open' && <Button size="sm" variant="secondary" disabled={triaging === ticket._id} onClick={() => triage(ticket._id)}><Sparkles size={13} className="mr-1.5" />{triaging === ticket._id ? 'Triaging…' : 'AI triage'}</Button>}<Link to={`/tickets/${ticket._id}`} aria-label={`Open ${ticket.title}`} className="text-zinc-500 hover:text-emerald-300"><ArrowRight size={17} /></Link></div></div>)}</div>}<div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</Button><span className="text-xs text-zinc-500">Page {page} of {totalPages}</span><Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</Button></div></CardContent></Card>
      </div>
    </div>
  );
}
