import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Search, Sparkles, Upload, Ticket as TicketIcon, BarChart3, Clock, ShieldCheck, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, Button, Input, Textarea, Select, Badge, Skeleton, Toast, Stat } from '../components/ui';

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
    { name: 'AI', value: stats.aiResolved },
  ] : [];

  const priorityTone = (p) => p==='Urgent'?'red':p==='High'?'amber':p==='Medium'?'blue':'zinc';
  const statusTone = (s) => s==='open'?'amber':s==='assigned'?'blue':s==='resolved'?'green':'zinc';

  return (
    <div className="space-y-6">
      <Toast message={toast} />

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs tracking-widest text-zinc-400 uppercase"><Sparkles size={12} /> AI Helpdesk</div>
          <h1 className="text-2xl font-semibold mt-1">Good {new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, {user?.name}</h1>
          <p className="text-sm text-zinc-300 mt-1">Create a ticket, let Gemini triage in ~3s, and RAG try before human.</p>
        </div>
        <div className="flex gap-2">
          <Badge tone="violet" className="bg-white/10 text-white border-white/10">MERN</Badge>
          <Badge tone="blue" className="bg-white/10 text-white border-white/10">RAG</Badge>
          <Badge tone="green" className="bg-white/10 text-white border-white/10">Realtime</Badge>
        </div>
      </motion.div>

      {user?.role === 'admin' && stats && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2"><BarChart3 size={16} /> Admin Analytics <Badge tone="blue">{stats.totalTickets} total</Badge></h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <Stat label="Total" value={stats.totalTickets} />
              <Stat label="Open" value={stats.openTickets} sub="needs action" />
              <Stat label="Resolved" value={stats.resolvedTickets} sub="done" />
              <Stat label="Urgent" value={stats.urgentTickets} sub={<span className="text-red-600 flex items-center gap-1"><AlertTriangle size={12}/> SLA</span>} />
              <Stat label="AI Resolved" value={`${stats.aiResolvedPercent}%`} sub={`${stats.aiResolved} tickets`} />
              <Stat label="Avg Resolution" value={`${stats.avgResolutionTimeMin}m`} sub={<span className="flex items-center gap-1"><Clock size={12}/>mean</span>} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[220px] rounded-xl border p-2 bg-zinc-50/50">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><XAxis dataKey="name" tick={{fontSize:12}} /><YAxis tick={{fontSize:12}} /><Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer>
              </div>
              <div className="h-[220px] rounded-xl border p-2 bg-zinc-50/50">
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>{chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
              </div>
            </div>
            {stats.series && stats.series.length>0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2"><TrendingUp size={14}/> Tickets last 7 days</h4>
                <div className="h-[200px] rounded-xl border p-2 bg-zinc-50/50">
                  <ResponsiveContainer width="100%" height="100%"><LineChart data={stats.series}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} allowDecimals={false}/><Tooltip/><Legend/><Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
                </div>
              </div>
            )}
            {stats.byCategory && stats.byCategory.length>0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">By category</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.byCategory.map(c=> <Badge key={c.category} tone="zinc">{c.category}: {c.count}</Badge>)}
                </div>
              </div>
            )}
            {stats.leaderboard && stats.leaderboard.length>0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2"><Users size={14}/> Top agents (by assigned)</h4>
                <div className="rounded-xl border divide-y">
                  {stats.leaderboard.map((a,i)=>(<div key={a._id} className="flex justify-between p-3 text-sm"><span>#{i+1} {a.name} <span className="text-zinc-500">{a.email}</span></span><Badge tone="blue">{a.count}</Badge></div>))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="md:col-span-2">
          <Card className="h-fit">
            <CardHeader><h3 className="font-semibold flex items-center gap-2"><TicketIcon size={16}/> Create ticket</h3><p className="text-sm text-zinc-500">Get AI priority & category instantly</p></CardHeader>
            <CardContent>
              <form onSubmit={create} className="space-y-3">
                <Input placeholder="Title *" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
                <Textarea placeholder="Describe issue... *" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
                <Input placeholder="Category (bug/billing/feature)" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} />
                <Button className="w-full">Submit ticket</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><TicketIcon size={16}/> Tickets {loading && <span className="text-xs font-normal text-zinc-500">loading…</span>}</h3>
              <Badge tone="zinc">{tickets.length} shown</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-3">
              <Select value={status} onChange={(e)=>setStatus(e.target.value)}>
                <option value="">All</option><option value="open">Open</option><option value="assigned">Assigned</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
              </Select>
              <div className="relative flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/><Input className="pl-9" placeholder="Search..." value={q} onChange={(e)=>setQ(e.target.value)} /></div>
              <Button variant="secondary" onClick={()=>load(1)}>Search</Button>
            </div>
            {loading ? <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : tickets.length===0 ? <div className="text-center py-10 text-sm text-zinc-500"><div className="mx-auto h-10 w-10 grid place-items-center rounded-xl bg-zinc-100 mb-2"><TicketIcon size={16}/></div>No tickets yet. Create one!</div> : (
              <div className="space-y-2">
                {tickets.map((t)=>(
                  <Link key={t._id} to={`/tickets/${t._id}`} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50 hover:border-zinc-300 transition group">
                    <div className="min-w-0">
                      <div className="font-medium truncate group-hover:text-zinc-900">{t.title}</div>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                        <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
                        <Badge tone="zinc">{t.category}</Badge>
                        {t.slaDeadline && new Date(t.slaDeadline) < new Date() && t.status!=='closed' && <Badge tone="red">SLA overdue</Badge>}
                      </div>
                      {triageResults[t._id] && <div className="text-xs text-blue-600 mt-1">AI: {triageResults[t._id].priority} • {triageResults[t._id].category} • {triageResults[t._id].summary}</div>}
                    </div>
                    <span className="text-zinc-400 group-hover:text-zinc-900">→</span>
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <Button variant="secondary" size="sm" disabled={page<=1} onClick={()=>load(page-1)}>Prev</Button>
              <span className="text-sm text-zinc-600">{page}/{totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page>=totalPages} onClick={()=>load(page+1)}>Next</Button>
            </div>
            {user?.role==='admin' && <Button variant="secondary" className="w-full mt-3" onClick={()=>tickets.filter(t=>t.status==='open').forEach(t=>handleTriage(t._id))}><Sparkles size={14} className="mr-1.5"/> AI Triage all open</Button>}
          </CardContent>
        </Card>
      </div>

      {['admin','agent'].includes(user?.role) && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><h3 className="font-semibold flex items-center gap-2"><Upload size={16}/> Knowledge Base Upload</h3><p className="text-sm text-zinc-500">.txt/.md/.json — 500/50 chunk + 768 embed</p></CardHeader>
            <CardContent>
              <form onSubmit={handleKBUpload} className="space-y-3">
                <Input placeholder="Document title" value={kbTitle} onChange={(e)=>setKbTitle(e.target.value)} />
                <Input type="file" accept=".txt,.md,.json,.csv" onChange={(e)=>setKbFile(e.target.files[0])} />
                <Button className="w-full"><Upload size={14} className="mr-1.5"/> Upload to KB</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h3 className="font-semibold flex items-center gap-2"><ShieldCheck size={16}/> Knowledge Base Docs ({kbDocs.length})</h3></CardHeader>
            <CardContent>
              {kbDocs.length===0 ? <div className="text-sm text-zinc-500">No docs yet — upload one to enable RAG.</div> : (
                <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                  {kbDocs.map((d)=>(
                    <div key={d._id} className="rounded-xl border p-3 hover:bg-zinc-50">
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
