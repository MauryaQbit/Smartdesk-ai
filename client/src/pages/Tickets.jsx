import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckSquare, Download, Plus, Search, Sparkles, Ticket as TicketIcon, X } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, CardContent, CardHeader, Input, Select, Skeleton, Toast } from '../components/ui';
import TicketForm from '../components/TicketForm';

export default function Tickets() {
  const { user, triageTicket } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [queue, setQueue] = useState('');
  const [overdue, setOverdue] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('assigned');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());
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
      if (queue) params.set('assignedTo', queue);
      if (overdue) params.set('overdue', 'true');
      const { data } = await api.get(`/tickets?${params}`);
      setTickets(data.data || []); setPage(data.page); setTotal(data.total || 0); setTotalPages(data.totalPages || 1);
    } catch { setToast('We could not load your tickets.'); }
    setLoading(false);
  };
  useEffect(() => { load(1); setSelected([]); }, [status, search, queue, overdue]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);

  const create = async (form, reset) => {
    setCreating(true);
    try { await api.post('/tickets', form); reset(); setToast('Ticket created successfully.'); load(1); } catch (error) { setToast(error.response?.data?.message || 'Ticket creation failed.'); }
    setCreating(false);
  };

  const triage = async (ticketId) => {
    setTriaging(ticketId);
    try { await triageTicket(ticketId); setToast('AI triage complete.'); load(page); } catch { setToast('SmartDesk could not triage this ticket.'); }
    setTriaging('');
  };

  const toggleSelected = (ticketId) => setSelected((current) => current.includes(ticketId) ? current.filter((id) => id !== ticketId) : [...current, ticketId]);
  const bulkUpdate = async () => {
    if (!selected.length) return;
    setBulkLoading(true);
    try {
      await api.patch('/tickets/bulk-status', { ids: selected, status: bulkStatus });
      setToast(`${selected.length} ticket${selected.length === 1 ? '' : 's'} updated.`);
      setSelected([]);
      load(page);
    } catch (error) { setToast(error.response?.data?.message || 'Bulk update failed.'); }
    setBulkLoading(false);
  };
  const clearFilters = () => { setStatus(''); setQueue(''); setOverdue(false); setQuery(''); setSearch(''); };

  const statusTone = (value) => value === 'resolved' ? 'green' : value === 'assigned' ? 'blue' : value === 'closed' ? 'zinc' : 'amber';
  const priorityTone = (value) => value === 'Urgent' ? 'red' : value === 'High' ? 'amber' : value === 'Medium' ? 'blue' : 'zinc';
  const slaLabel = (deadline, ticketStatus) => {
    if (!deadline || ['resolved', 'closed'].includes(ticketStatus)) return null;
    const minutes = Math.round((new Date(deadline) - now) / 60000);
    if (minutes <= 0) return { label: 'SLA overdue', tone: 'red' };
    if (minutes < 120) return { label: `${minutes}m left`, tone: 'red' };
    const hours = Math.floor(minutes / 60);
    return { label: `${hours}h left`, tone: hours < 6 ? 'amber' : 'zinc' };
  };

  return (
    <div className="space-y-6">
      <Toast message={toast} />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">Support operations</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Tickets</h1><p className="mt-2 text-sm text-zinc-400">Manage and track every support request in one place.</p></div><div className="flex gap-2"><Link to="/dashboard#create-ticket" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-emerald-300"><Plus size={16} /> Create ticket</Link>{user?.role !== 'customer' && <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tickets/export.csv`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.11]"><Download size={15} /> Export CSV</a>}</div></div>

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]">
        <Card className="h-fit border-emerald-400/10"><CardHeader><h2 className="flex items-center gap-2 font-semibold text-white"><Plus size={17} className="text-emerald-400" /> New support request</h2><p className="mt-1 text-sm text-zinc-500">Give the team enough context to help quickly.</p></CardHeader><CardContent><TicketForm onSubmit={create} submitting={creating} compact /></CardContent></Card>

        <Card id="ticket-list"><CardHeader><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="flex items-center gap-2 font-semibold text-white"><TicketIcon size={17} className="text-emerald-400" /> {user?.role === 'customer' ? 'My tickets' : 'Ticket queue'} <Badge tone="zinc">{total}</Badge></h2><p className="mt-1 text-sm text-zinc-500">Search, filter, and open a request for the full conversation.</p></div><div className="flex flex-wrap gap-2"><Select aria-label="Filter tickets by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="open">Open</option><option value="assigned">Assigned</option><option value="resolved">Resolved</option><option value="closed">Closed</option></Select>{user?.role !== 'customer' && <><Select aria-label="Filter ticket ownership" value={queue} onChange={(event) => setQueue(event.target.value)}><option value="">All ownership</option><option value="me">Assigned to me</option><option value="unassigned">Unassigned</option></Select><Button size="sm" variant={overdue ? 'danger' : 'secondary'} onClick={() => setOverdue((value) => !value)}><AlertTriangle size={13} className="mr-1.5" />Overdue</Button></>}</div></div></CardHeader><CardContent><form onSubmit={(event) => { event.preventDefault(); setSearch(query); }} className="mb-4 flex gap-2"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><Input aria-label="Search tickets" className="pl-10" placeholder="Search tickets…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Button variant="secondary">Search</Button>{(status || queue || overdue || search) && <Button type="button" variant="ghost" onClick={clearFilters} aria-label="Clear ticket filters"><X size={16} /></Button>}</form>{user?.role !== 'customer' && selected.length > 0 && <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/5 p-3"><CheckSquare size={15} className="text-indigo-300" /><span className="mr-auto text-sm text-zinc-300">{selected.length} selected</span><Select aria-label="Bulk status" value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}><option value="assigned">Assigned</option><option value="open">Open</option><option value="resolved">Resolved</option><option value="closed">Closed</option></Select><Button size="sm" onClick={bulkUpdate} disabled={bulkLoading}>{bulkLoading ? 'Updating…' : 'Update tickets'}</Button></div>}{loading ? <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : tickets.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center"><TicketIcon size={24} className="mx-auto text-zinc-600" /><p className="mt-3 text-sm font-medium text-zinc-300">No tickets found</p><p className="mt-1 text-sm text-zinc-500">Create a request or adjust your filters.</p></div> : <div className="space-y-2">{tickets.map((ticket) => { const sla = slaLabel(ticket.slaDeadline, ticket.status); return <div key={ticket._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-emerald-400/25 sm:flex-row sm:items-center sm:justify-between">{user?.role !== 'customer' && <input type="checkbox" aria-label={`Select ${ticket.title}`} checked={selected.includes(ticket._id)} onChange={() => toggleSelected(ticket._id)} className="h-4 w-4 accent-emerald-400" />}<Link to={`/tickets/${ticket._id}`} className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-zinc-200 hover:text-white">{ticket.title}</div><div className="mt-2 flex flex-wrap items-center gap-1.5"><Badge tone={statusTone(ticket.status)}>{ticket.status}</Badge><Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge><Badge tone="zinc">{ticket.category}</Badge>{ticket.assignedAgentId?.name && <span className="text-xs text-zinc-600">· {ticket.assignedAgentId.name}</span>}{sla && <Badge tone={sla.tone}>{sla.label === 'SLA overdue' && <AlertTriangle size={12} className="mr-1" />}{sla.label}</Badge>}</div></Link><div className="flex items-center justify-between gap-3 sm:justify-end">{user?.role === 'admin' && ticket.status === 'open' && <Button size="sm" variant="secondary" disabled={triaging === ticket._id} onClick={() => triage(ticket._id)}><Sparkles size={13} className="mr-1.5" />{triaging === ticket._id ? 'Triaging…' : 'AI triage'}</Button>}<Link to={`/tickets/${ticket._id}`} aria-label={`Open ${ticket.title}`} className="text-zinc-500 hover:text-emerald-300"><ArrowRight size={17} /></Link></div></div>; })}</div>}<div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</Button><span className="text-xs text-zinc-500">Page {page} of {totalPages}</span><Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</Button></div></CardContent></Card>
      </div>
    </div>
  );
}
