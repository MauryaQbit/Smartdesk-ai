import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, Button, Input, Textarea, Select, Badge, Skeleton, Toast } from '../components/ui';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { user, uploadKB, getKB, getStats, triageTicket } = useAuth();
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
  const loadStats = async () => { if (user?.role !== 'admin') return; try { const { data } = await getStats(); setStats(data); } catch {} };
  const loadKB = async () => { try { const d = await getKB(); setKbDocs(Array.isArray(d.data)?d.data:Array.isArray(d)?d:[]); } catch {} };

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
    const fd = new FormData(); fd.append('file', kbFile); fd.append('title', kbTitle || kbFile.name);
    try { const result = await uploadKB(fd); showToast(`Uploaded: ${result.title} (${result.chunkCount} chunks)`); setKbTitle(''); setKbFile(null); loadKB(); } catch (err) { showToast(err.response?.data?.message || 'Upload failed'); }
  };
  const handleTriage = async (ticketId) => {
    try { const result = await triageTicket(ticketId); setTriageResults((prev) => ({ ...prev, [ticketId]: result })); showToast(`Triaged: ${result.priority}`); load(1); loadStats(); } catch { showToast('Triage failed - check GEMINI key'); }
  };

  const chartData = stats ? [
    { name: 'Open', value: stats.openTickets },
    { name: 'Resolved', value: stats.resolvedTickets },
    { name: 'Urgent', value: stats.urgentTickets },
    { name: 'AI Resolved', value: stats.aiResolved },
  ] : [];

  const priorityTone = (p) => p==='Urgent'?'red':p==='High'?'amber':p==='Medium'?'blue':'zinc';
  const statusTone = (s) => s==='open'?'amber':s==='assigned'?'blue':s==='resolved'?'green':'zinc';

  return (
    <div className="space-y-6">
      <Toast message={toast} />

      {user?.role === 'admin' && stats && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">📊 Admin Analytics <Badge tone="blue">{stats.totalTickets} total</Badge></h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
              <div className="rounded-xl border p-3 text-center"><div className="text-xs text-zinc-500">Total</div><div className="text-xl font-semibold">{stats.totalTickets}</div></div>
              <div className="rounded-xl border p-3 text-center"><div className="text-xs text-zinc-500">Open</div><div className="text-xl font-semibold">{stats.openTickets}</div></div>
              <div className="rounded-xl border p-3 text-center"><div className="text-xs text-zinc-500">Resolved</div><div className="text-xl font-semibold">{stats.resolvedTickets}</div></div>
              <div className="rounded-xl border p-3 text-center"><div className="text-xs text-zinc-500">Urgent</div><div className="text-xl font-semibold text-red-600">{stats.urgentTickets}</div></div>
              <div className="rounded-xl border p-3 text-center"><div className="text-xs text-zinc-500">AI Resolved</div><div className="text-xl font-semibold">{stats.aiResolvedPercent}%</div></div>
              <div className="rounded-xl border p-3 text-center"><div className="text-xs text-zinc-500">Avg Resolution</div><div className="text-xl font-semibold">{stats.avgResolutionTimeMin}m</div></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[220px] rounded-xl border p-2">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer>
              </div>
              <div className="h-[220px] rounded-xl border p-2">
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>{chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        <Card className="md:col-span-2 h-fit">
          <CardHeader><h3 className="font-semibold">Create ticket</h3><p className="text-sm text-zinc-500">Customer creates, AI triages in &lt;3s</p></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-3">
              <Input placeholder="Title *" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
              <Textarea placeholder="Describe issue... *" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
              <Input placeholder="Category (bug/billing/feature)" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} />
              <Button className="w-full">Submit ticket</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tickets {loading && <span className="text-xs font-normal text-zinc-500">loading…</span>}</h3>
              <Badge tone="zinc">{tickets.length} shown</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Select value={status} onChange={(e)=>setStatus(e.target.value)}>
                <option value="">All</option><option value="open">Open</option><option value="assigned">Assigned</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
              </Select>
              <Input placeholder="Search..." value={q} onChange={(e)=>setQ(e.target.value)} />
              <Button variant="secondary" onClick={()=>load(1)}>Search</Button>
            </div>
            {loading ? <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : tickets.length===0 ? <div className="text-center py-8 text-zinc-500 text-sm">No tickets yet. Create one!</div> : (
              <div className="space-y-2">
                {tickets.map((t)=>(
                  <Link key={t._id} to={`/tickets/${t._id}`} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50 transition">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{t.title}</div>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                        <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
                        <Badge tone="zinc">{t.category}</Badge>
                      </div>
                      {triageResults[t._id] && <div className="text-xs text-blue-600 mt-1">AI: {triageResults[t._id].priority} • {triageResults[t._id].category} • {triageResults[t._id].summary}</div>}
                    </div>
                    <span className="text-zinc-400">→</span>
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <Button variant="secondary" size="sm" disabled={page<=1} onClick={()=>load(page-1)}>Prev</Button>
              <span className="text-sm text-zinc-600">{page}/{totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page>=totalPages} onClick={()=>load(page+1)}>Next</Button>
            </div>
            {user?.role==='admin' && <Button variant="secondary" className="w-full mt-3" onClick={()=>tickets.filter(t=>t.status==='open').forEach(t=>handleTriage(t._id))}>AI Triage all open</Button>}
          </CardContent>
        </Card>
      </div>

      {['admin','agent'].includes(user?.role) && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><h3 className="font-semibold">Knowledge Base Upload</h3><p className="text-sm text-zinc-500">Upload .txt/.md/.json — chunked 500/50 + nomic-embed-text (768)</p></CardHeader>
            <CardContent>
              <form onSubmit={handleKBUpload} className="space-y-3">
                <Input placeholder="Document title" value={kbTitle} onChange={(e)=>setKbTitle(e.target.value)} />
                <Input type="file" accept=".txt,.md,.json,.csv" onChange={(e)=>setKbFile(e.target.files[0])} />
                <Button className="w-full">Upload to KB</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h3 className="font-semibold">Knowledge Base Docs ({kbDocs.length})</h3></CardHeader>
            <CardContent>
              {kbDocs.length===0 ? <div className="text-sm text-zinc-500">No docs yet — upload one to enable RAG.</div> : (
                <div className="space-y-2 max-h-[220px] overflow-auto">
                  {kbDocs.map((d)=>(
                    <div key={d._id} className="rounded-xl border p-3">
                      <div className="font-medium text-sm">{d.title}</div>
                      <div className="text-xs text-zinc-500">{d.chunkCount ?? '—'} chunks • {d.source}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
