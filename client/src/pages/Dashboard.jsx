import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, FileText, Search, Sparkles, Upload, Ticket as TicketIcon, BarChart3, Clock, ShieldCheck, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, Button, Input, Textarea, Select, Badge, Skeleton, Toast, Stat } from '../components/ui';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const location = useLocation();
  const { user, uploadKB, getKB, getStats, triageTicket } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: 'general' });
  const [kbTitle, setKbTitle] = useState('');
  const [kbFile, setKbFile] = useState(null);
  const [kbDocs, setKbDocs] = useState([]);
  const [kbUploading, setKbUploading] = useState(false);
  const [kbInputKey, setKbInputKey] = useState(0);
  const [triageResults, setTriageResults] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const [debouncedQ, setDebouncedQ] = useState('');
  const searchRef = useRef(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  useEffect(()=>{ const h=(e)=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); searchRef.current?.focus(); }}; window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h); },[]);

  // debounce search 350ms + URL sync for efficiency
  useEffect(()=>{ const id=setTimeout(()=>setDebouncedQ(q),350); return ()=>clearTimeout(id); },[q]);
  useEffect(()=>{ const p=new URLSearchParams(window.location.search); if(status) p.set('status',status); else p.delete('status'); if(debouncedQ) p.set('q',debouncedQ); else p.delete('q'); window.history.replaceState(null,'',`${window.location.pathname}?${p.toString()}`); },[status,debouncedQ]);
  useEffect(() => {
    if (!location.hash) return;
    const scrollToSection = () => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const frame = requestAnimationFrame(scrollToSection);
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      if (status) params.set('status', status);
      if (debouncedQ) params.set('q', debouncedQ);
      const { data } = await api.get(`/tickets?${params}`);
      setTickets(data.data);
      setTotalTickets(data.total || 0);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch { showToast('Failed to load tickets'); }
    setLoading(false);
  };
  const loadStats = async () => { if (user?.role !== 'admin') return; try { const { data } = await getStats(); setStats(data); } catch {} };
  const loadKB = async () => { try { const d = await getKB(); setKbDocs(Array.isArray(d.data)?d.data:Array.isArray(d)?d:[]); } catch {} };

  useEffect(() => { load(1); loadStats(); loadKB(); }, [status, debouncedQ, user]);

  const templates = {
    bug: { title: 'Cannot login to dashboard', description: 'Login fails with 500 after password reset. Steps: 1. Go to /login 2. Enter valid creds 3. See 500', category: 'bug' },
    billing: { title: 'Billing double charge', description: 'Charged twice for March transaction TXN_123. Please refund one.', category: 'billing' },
    feature: { title: 'Feature: dark mode', description: 'Please add dark mode toggle in header. Expected: switch theme, persist in localStorage.', category: 'feature' },
  };
  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return showToast('Title and description required');
    // optimistic: add temp ticket immediately
    const temp = { _id: `temp-${Date.now()}`, title: form.title, status: 'open', priority: 'Medium', category: form.category, _optimistic: true };
    setTickets(prev=>[temp, ...prev]);
    try {
      await api.post('/tickets', form);
      setForm({ title: '', description: '', category: 'general' });
      showToast('Ticket created');
      load(1); loadStats();
    } catch (err) { setTickets(prev=>prev.filter(t=>!t._optimistic)); showToast(err.response?.data?.message || 'Create failed'); }
  };
  const bulkTriage = async () => {
    const ids = tickets.filter(t=>t.status==='open' && !t._optimistic).map(t=>t._id);
    if (!ids.length) return showToast('No open tickets');
    try { const { data } = await api.post('/tickets/bulk-triage', { ids }); showToast(`Bulk triaged ${data.processed.length}`); load(1); loadStats(); } catch { showToast('Bulk triage failed'); }
  };
  const handleKBUpload = async (e) => {
    e.preventDefault();
    if (!kbFile) return showToast('Select a file first');
    setKbUploading(true);
    const fd = new FormData(); fd.append('file', kbFile); fd.append('title', kbTitle || kbFile.name);
    try { const result = await uploadKB(fd); showToast(`Uploaded: ${result.title} (${result.chunkCount} chunks)`); setKbTitle(''); setKbFile(null); setKbInputKey((key) => key + 1); loadKB(); } catch (err) { showToast(err.response?.data?.message || 'Upload failed'); }
    setKbUploading(false);
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
  const visibleOpen = tickets.filter((ticket) => ticket.status === 'open').length;
  const visibleResolved = tickets.filter((ticket) => ['resolved', 'closed'].includes(ticket.status)).length;
  const visibleUrgent = tickets.filter((ticket) => ticket.priority === 'Urgent').length;
  function SLATimer({ deadline, status }) {
    const [now,setNow]=useState(Date.now());
    useEffect(()=>{ const id=setInterval(()=>setNow(Date.now()),60000); return ()=>clearInterval(id); },[]);
    if(status==='closed'||status==='resolved') return null;
    const diff = new Date(deadline) - now;
    if(diff<=0) return <Badge tone="red">SLA overdue</Badge>;
    const h=Math.floor(diff/3600000), m=Math.floor((diff%3600000)/60000);
    return <Badge tone={h<2?'red':h<6?'amber':'zinc'}>{h}h {m}m SLA</Badge>;
  }

  return (
    <div className="space-y-6">
      <Toast message={toast} />

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-900/80 p-6 text-white shadow-2xl shadow-emerald-950/20 md:p-8">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-400/10 to-transparent pointer-events-none" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300"><Sparkles size={12} /> Support workspace</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Good {new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, {user?.name}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">Create a ticket, let AI find the right next step, and keep every handoff visible.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="green" className="bg-emerald-400/10 text-emerald-200 border-emerald-400/20">AI triage</Badge>
          <Badge tone="blue" className="bg-blue-400/10 text-blue-200 border-blue-400/20">Knowledge base</Badge>
          <Badge tone="zinc" className="bg-white/10 text-zinc-200 border-white/10">Live updates</Badge>
        </div>
        </div>
      </motion.div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(user?.role === 'admin' && stats ? [
          { label: 'Total tickets', value: stats.totalTickets, detail: 'Across the workspace', icon: TicketIcon, tone: 'text-blue-300 bg-blue-400/10' },
          { label: 'Open tickets', value: stats.openTickets, detail: 'Need a next step', icon: AlertTriangle, tone: 'text-amber-300 bg-amber-400/10' },
          { label: 'Resolved', value: stats.resolvedTickets, detail: 'Closed successfully', icon: CheckCircle2, tone: 'text-emerald-300 bg-emerald-400/10' },
          { label: 'AI resolved', value: `${stats.aiResolvedPercent}%`, detail: `${stats.aiResolved} tickets assisted`, icon: BrainCircuit, tone: 'text-indigo-300 bg-indigo-400/10' },
        ] : [
          { label: 'My tickets', value: totalTickets, detail: 'Total in your workspace', icon: TicketIcon, tone: 'text-blue-300 bg-blue-400/10' },
          { label: 'Open now', value: visibleOpen, detail: 'In the current page', icon: AlertTriangle, tone: 'text-amber-300 bg-amber-400/10' },
          { label: 'Resolved', value: visibleResolved, detail: 'In the current page', icon: CheckCircle2, tone: 'text-emerald-300 bg-emerald-400/10' },
          { label: 'Urgent', value: visibleUrgent, detail: 'In the current page', icon: ShieldCheck, tone: 'text-red-300 bg-red-400/10' },
        ]).map(({ label, value, detail, icon: Icon, tone }) => <Card key={label} className="border-white/10"><CardContent className="flex items-start justify-between gap-3 p-5"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p><p className="mt-1 text-xs text-zinc-500">{detail}</p></div><div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></div></CardContent></Card>)}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link to="/dashboard#create-ticket" className="group rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5 transition hover:border-emerald-400/40 hover:bg-emerald-400/[0.08]"><div className="flex items-center justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 text-zinc-950"><TicketIcon size={17} /></div><ArrowRight size={16} className="text-emerald-300 transition group-hover:translate-x-1" /></div><h2 className="mt-5 font-semibold text-white">Create a ticket</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Describe a problem and send it to your support workflow.</p></Link>
        <Link to="/ai-assistant" className="group rounded-2xl border border-indigo-400/20 bg-indigo-400/[0.04] p-5 transition hover:border-indigo-400/40 hover:bg-indigo-400/[0.08]"><div className="flex items-center justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-400/15 text-indigo-300"><BrainCircuit size={17} /></div><ArrowRight size={16} className="text-indigo-300 transition group-hover:translate-x-1" /></div><h2 className="mt-5 font-semibold text-white">Ask SmartDesk</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Get a knowledge-grounded answer from a ticket context.</p></Link>
        <Link to="/dashboard#tickets" className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"><div className="flex items-center justify-between"><div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-zinc-300"><Search size={17} /></div><ArrowRight size={16} className="text-zinc-400 transition group-hover:translate-x-1" /></div><h2 className="mt-5 font-semibold text-white">Review tickets</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Search, filter, and follow up on recent requests.</p></Link>
      </section>

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
              <div className="h-[220px] rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><XAxis dataKey="name" tick={{fontSize:12, fill:'#a1a1aa'}} axisLine={false} tickLine={false} /><YAxis tick={{fontSize:12, fill:'#a1a1aa'}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{background:'#18181b', border:'1px solid #3f3f46', borderRadius:12, color:'#fff'}} /><Bar dataKey="value" fill="#34d399" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer>
              </div>
              <div className="h-[220px] rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>{chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{background:'#18181b', border:'1px solid #3f3f46', borderRadius:12, color:'#fff'}} /></PieChart></ResponsiveContainer>
              </div>
            </div>
            {stats.series && stats.series.length>0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2"><TrendingUp size={14}/> Tickets last 7 days</h4>
                <div className="h-[200px] rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                  <ResponsiveContainer width="100%" height="100%"><LineChart data={stats.series}><CartesianGrid strokeDasharray="3 3" stroke="#3f3f46"/><XAxis dataKey="date" tick={{fontSize:11, fill:'#a1a1aa'}}/><YAxis tick={{fontSize:11, fill:'#a1a1aa'}} allowDecimals={false}/><Tooltip contentStyle={{background:'#18181b', border:'1px solid #3f3f46', borderRadius:12, color:'#fff'}}/><Legend/><Line type="monotone" dataKey="count" stroke="#34d399" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
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
        <motion.div id="create-ticket" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="scroll-mt-24 md:col-span-2">
          <Card className="h-fit border-emerald-400/10">
            <CardHeader><h3 className="font-semibold flex items-center gap-2"><TicketIcon size={16} className="text-emerald-400"/> Create a ticket</h3><p className="mt-1 text-sm text-zinc-500">Tell us what happened and we’ll route it to the right person.</p></CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-1.5">
                <Button size="sm" variant="secondary" onClick={()=>setForm(templates.bug)}>Bug</Button>
                <Button size="sm" variant="secondary" onClick={()=>setForm(templates.billing)}>Billing</Button>
                <Button size="sm" variant="secondary" onClick={()=>setForm(templates.feature)}>Feature</Button>
              </div>
              <form onSubmit={create} className="space-y-3">
                <Input aria-label="Ticket title" placeholder="What do you need help with? *" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
                <Textarea aria-label="Ticket description" placeholder="Describe the issue, what you expected, and what happened... *" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
                <Input aria-label="Ticket category" placeholder="Category (bug, billing, feature)" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} />
                <Button className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300">Submit ticket</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <Card id="tickets" className="scroll-mt-24 md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div><h3 className="font-semibold flex items-center gap-2"><TicketIcon size={16} className="text-emerald-400"/> Your tickets {loading && <span className="text-xs font-normal text-zinc-500">loading…</span>}</h3><p className="mt-1 text-sm text-zinc-500">Track status, priority, and response time.</p></div>
              <Badge tone="zinc">{tickets.length} shown</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <Select aria-label="Filter tickets by status" value={status} onChange={(e)=>setStatus(e.target.value)}>
                <option value="">All</option><option value="open">Open</option><option value="assigned">Assigned</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
              </Select>
              <div className="relative flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/><Input aria-label="Search tickets" ref={searchRef} className="pl-9" placeholder="Search tickets... (⌘K)" value={q} onChange={(e)=>setQ(e.target.value)} /></div>
              <Button variant="secondary" onClick={()=>load(1)}>Search tickets</Button>
            </div>
            {loading ? <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div> : tickets.length===0 ? <div className="text-center py-10 text-sm text-zinc-500"><div className="mx-auto h-10 w-10 grid place-items-center rounded-xl bg-zinc-100 mb-2"><TicketIcon size={16}/></div>No tickets yet. Create one!</div> : (
              <div className="space-y-2">
                {tickets.map((t)=>(
                  <Link key={t._id} to={`/tickets/${t._id}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.04] group">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-zinc-200 group-hover:text-white">{t.title}</div>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                        <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
                        <Badge tone="zinc">{t.category}</Badge>
                        {t.slaDeadline && <SLATimer deadline={t.slaDeadline} status={t.status} />}
                      </div>
                      {triageResults[t._id] && <div className="text-xs text-blue-600 mt-1">AI: {triageResults[t._id].priority} • {triageResults[t._id].category} • {triageResults[t._id].summary}</div>}
                    </div>
                    <span className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-emerald-300">→</span>
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <Button variant="secondary" size="sm" disabled={page<=1} onClick={()=>load(page-1)}>Prev</Button>
              <span className="text-sm text-zinc-500">Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page>=totalPages} onClick={()=>load(page+1)}>Next</Button>
            </div>
            {user?.role==='admin' && <div className="flex gap-2 mt-3"><Button variant="secondary" className="flex-1" onClick={()=>tickets.filter(t=>t.status==='open').forEach(t=>handleTriage(t._id))}><Sparkles size={14} className="mr-1.5"/> Triage one-by-one</Button><Button className="flex-1" onClick={bulkTriage}><Sparkles size={14} className="mr-1.5"/> Bulk triage (efficient)</Button></div>}
          </CardContent>
        </Card>
      </div>

      <section id="ai-assistant" className="scroll-mt-24">
        <Card className="border-emerald-400/10 bg-emerald-400/[0.03]">
          <CardContent className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><BrainCircuit size={21} /></div><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">AI assistant</p><h2 className="mt-1 text-xl font-semibold text-white">Ask SmartDesk from a ticket</h2><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">Open a ticket to ask questions grounded in your knowledge base. When the answer is uncertain, SmartDesk escalates to a human agent.</p></div></div>
            <div className="flex shrink-0 flex-wrap gap-2"><Link to="/ai-assistant" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-300">Open AI Assistant <ArrowRight size={14} /></Link>{tickets.length === 0 && <span className="self-center text-sm text-zinc-500">Create a ticket to start.</span>}</div>
          </CardContent>
        </Card>
      </section>

      {['admin','agent'].includes(user?.role) && (
        <section id="knowledge-base" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">Knowledge base</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Give SmartDesk better context</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">Upload support documents so AI answers can stay grounded in the information your team owns.</p></div><div className="flex items-center gap-2 text-xs text-zinc-500"><ShieldCheck size={14} className="text-emerald-400" /> Private to your workspace</div></div>
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
            <Card className="border-emerald-400/10">
              <CardHeader><h3 className="flex items-center gap-2 font-semibold text-white"><Upload size={16} className="text-emerald-400" /> Upload a document</h3><p className="mt-1 text-sm text-zinc-500">Supported: TXT, MD, JSON, or CSV.</p></CardHeader>
              <CardContent>
                <form onSubmit={handleKBUpload} className="space-y-4">
                  <div><label htmlFor="kb-title" className="mb-2 block text-sm font-medium text-zinc-300">Document title <span className="font-normal text-zinc-600">(optional)</span></label><Input id="kb-title" placeholder="e.g. Password reset guide" value={kbTitle} onChange={(e)=>setKbTitle(e.target.value)} /></div>
                  <div><label htmlFor="kb-file" className="mb-2 block text-sm font-medium text-zinc-300">File</label><label htmlFor="kb-file" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-7 text-center transition hover:border-emerald-400/40 hover:bg-emerald-400/[0.03]"><FileText size={22} className="text-emerald-300" /><span className="mt-3 text-sm font-medium text-zinc-200">{kbFile ? kbFile.name : 'Choose a support document'}</span><span className="mt-1 text-xs text-zinc-500">Max file size follows server limits</span><input key={kbInputKey} id="kb-file" type="file" className="sr-only" accept=".txt,.md,.json,.csv" onChange={(e)=>setKbFile(e.target.files?.[0] || null)} /></label></div>
                  <Button className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" disabled={kbUploading || !kbFile}><Upload size={14} className="mr-1.5" /> {kbUploading ? 'Indexing document…' : 'Upload to knowledge base'}</Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><div className="flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 font-semibold text-white"><BookOpen size={16} className="text-emerald-400" /> Documents</h3><p className="mt-1 text-sm text-zinc-500">Available as context for SmartDesk answers.</p></div><Badge tone="zinc">{kbDocs.length} {kbDocs.length === 1 ? 'document' : 'documents'}</Badge></div></CardHeader>
              <CardContent>
                {kbDocs.length===0 ? <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center"><FileText size={24} className="mx-auto text-zinc-600" /><p className="mt-3 text-sm font-medium text-zinc-300">Your knowledge base is empty</p><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-zinc-500">Upload a guide, policy, or FAQ to give SmartDesk more information to work with.</p></div> : (
                  <div className="space-y-2 lg:max-h-[280px] lg:overflow-auto lg:pr-1">
                    {kbDocs.map((d)=>(
                      <div key={d._id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-emerald-400/20"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><FileText size={16} /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-zinc-200">{d.title}</div><div className="mt-1 truncate text-xs text-zinc-500">{d.source || 'Uploaded document'}</div><div className="mt-2 flex flex-wrap gap-2"><Badge tone="green">Available to AI</Badge><span className="text-xs text-zinc-600">{d.chunkCount ?? '—'} chunks</span>{d.uploadedBy?.name && <span className="text-xs text-zinc-600">Uploaded by {d.uploadedBy.name}</span>}</div></div><span className="shrink-0 text-xs text-zinc-600">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}</span></div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
