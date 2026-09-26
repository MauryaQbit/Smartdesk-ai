import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Bot, CheckCircle2, CircleAlert, Copy, History, Paperclip, Send, Sparkles, UserRound } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Input, Badge, Toast } from '../components/ui';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function TicketDetail() {
  const { id } = useParams();
  const { user, chatAI, draftReply } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [chatResult, setChatResult] = useState(null);
  const [draft, setDraft] = useState('');
  const [triageInfo, setTriageInfo] = useState(null);
  const [toast, setToast] = useState('');
  const [typing, setTyping] = useState(false);
  const [socketState, setSocketState] = useState('connecting');
  const [chatLoading, setChatLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [triageLoading, setTriageLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const endRef = useRef(null);
  const socketRef = useRef(null);

  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''), 2500); };
  const loadHistory = async () => { try { const { data } = await api.get(`/tickets/${id}/history`); setHistory(data.data); } catch {} };

  const load = async () => {
    const { data } = await api.get(`/tickets/${id}`);
    setTicket(data.ticket);
    setMessages(data.messages);
    setTriageInfo(data.ticket.priority ? { priority: data.ticket.priority, category: data.ticket.category, summary: data.ticket.summaryAI } : null);
  };

  useEffect(() => {
    load(); loadHistory();
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => { setSocketState('connected'); socket.emit('join-ticket', id); });
    socket.on('disconnect', () => setSocketState('disconnected'));
    socket.on('connect_error', () => setSocketState('disconnected'));
    socket.on('new-message', (msg) => { if (String(msg.ticketId)===String(id)) { setMessages((m)=>[...m, msg]); setTyping(false); } });
    socket.on('typing', () => { setTyping(true); setTimeout(()=>setTyping(false), 1500); });
    return () => socket.disconnect();
  }, [id]);

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatResult]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit('send-message', { ticketId: id, text });
    socketRef.current?.emit('typing', { ticketId: id });
    setText('');
    setTimeout(async ()=>{ try{ const {data}=await api.get(`/tickets/${id}`); setMessages(data.messages); }catch{} }, 800);
  };

  const handleChatAI = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    setChatLoading(true);
    try {
      const result = await chatAI(id, chatQuery.trim());
      setChatResult(result);
      showToast(result.chunkCount?`RAG used ${result.chunkCount} chunks`:'Escalated — no KB');
      setChatQuery('');
      const { data } = await api.get(`/tickets/${id}`); setMessages(data.messages);
    } catch (err) { showToast(err.response?.data?.message||'SmartDesk could not process that request'); }
    setChatLoading(false);
  };

  const handleDraft = async () => {
    setDraftLoading(true);
    try { const result = await draftReply(id); setDraft(result.draftReply||result.summary||''); showToast('Draft generated'); } catch { showToast('SmartDesk could not generate a draft'); }
    setDraftLoading(false);
  };

  const handleTriage = async () => {
    setTriageLoading(true);
    try { await api.post('/ai/triage', { ticketId: id }); const { data } = await api.get(`/tickets/${id}`); setTriageInfo(data.ticket.priority?{priority:data.ticket.priority,category:data.ticket.category,summary:data.ticket.summaryAI}:null); setTicket(data.ticket); showToast('AI triage complete'); } catch { showToast('SmartDesk could not triage this ticket'); }
    setTriageLoading(false);
  };

  const copyDraft = async () => { await navigator.clipboard?.writeText(draft); setCopyMessage('Copied'); setTimeout(() => setCopyMessage(''), 1500); };

  const assign = async () => { const { data } = await api.patch(`/tickets/${id}/assign`); setTicket(data); showToast('Assigned to you'); loadHistory(); };
  const setStatus = async (status) => { const { data } = await api.patch(`/tickets/${id}/status`, { status }); setTicket(data); showToast(status); loadHistory(); };
  const uploadAttachment = async (e) => {
    e.preventDefault(); if (!file) return showToast('Choose file');
    const fd = new FormData(); fd.append('file', file);
    try { await api.post(`/tickets/${id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); showToast('Attachment added'); setFile(null); load(); } catch { showToast('Upload failed'); }
  };

  if (!ticket) return <div className="mx-auto max-w-3xl py-16 text-center"><div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-emerald-400/10" /><p className="mt-4 text-sm text-zinc-500">Loading ticket details…</p></div>;
  const isStaff = ['agent','admin'].includes(user?.role);
  const slaOver = new Date(ticket.slaDeadline) < new Date() && ['open','assigned'].includes(ticket.status);
  const aiEscalated = chatResult && (chatResult.chunkCount === 0 || chatResult.answer?.includes('Escalating to human'));

  return (
    <div className="space-y-6">
      <Toast message={toast} />
      <Link to="/dashboard#tickets" className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-emerald-300"><ArrowLeft size={15} /> Back to tickets</Link>

      <Card className={slaOver ? 'border-red-400/30' : 'border-white/10'}>
        <CardHeader>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500"><span>Ticket</span><span className="text-zinc-700">/</span><span>{id.slice(-8)}</span></div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">{ticket.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{ticket.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Badge tone={ticket.status==='open'?'amber':ticket.status==='assigned'?'blue':ticket.status==='resolved'?'green':'zinc'}>{ticket.status}</Badge>
              <Badge tone={slaOver?'red':ticket.priority==='Urgent'?'red':ticket.priority==='High'?'amber':'blue'}>{triageInfo?.priority||ticket.priority}</Badge>
              <Badge tone="zinc">{triageInfo?.category||ticket.category}</Badge>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-xs text-zinc-500">
            <span>SLA: {new Date(ticket.slaDeadline).toLocaleString()} {slaOver && <span className="font-medium text-red-300">· overdue → Urgent</span>}</span>
            <span>Customer: {ticket.customerId?.name || ticket.customerId}</span>
            {ticket.assignedAgentId && <span>Agent: {ticket.assignedAgentId?.name || ticket.assignedAgentId}</span>}
          </div>
          {triageInfo && <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-zinc-300"><Sparkles size={17} className="mt-0.5 shrink-0 text-emerald-300" /><span><b className="text-emerald-200">AI triage processed</b><span className="mx-2 text-zinc-600">·</span>{triageInfo.priority} priority<span className="mx-2 text-zinc-600">·</span>{triageInfo.category}<span className="block mt-1 text-zinc-400">{triageInfo.summary || 'No summary was returned.'}</span></span></div>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {isStaff && <><Button size="sm" variant="secondary" disabled={triageLoading} onClick={handleTriage}><Sparkles size={14} className="mr-1.5" />{triageLoading ? 'Triaging…' : 'Run AI triage'}</Button><Button size="sm" onClick={assign}>Assign to me</Button><Button size="sm" variant="secondary" onClick={()=>setStatus('resolved')}><CheckCircle2 size={14} className="mr-1.5" />Resolve</Button><Button size="sm" variant="secondary" onClick={()=>setStatus('closed')}>Close</Button></>}
            {!isStaff && ticket.status==='resolved' && <Button size="sm" onClick={()=>setStatus('closed')}>Close ticket</Button>}
          </div>
        </CardContent>
      </Card>

      {isStaff && (
        <Card className="border-indigo-400/20 bg-indigo-400/[0.04]">
          <CardHeader><div className="flex items-start justify-between gap-4"><div><h3 className="flex items-center gap-2 font-semibold text-white"><Bot size={17} className="text-indigo-300" /> AI agent assist</h3><p className="mt-1 text-sm text-zinc-400">Generate a draft from the existing conversation. Nothing is sent automatically.</p></div><Badge tone="violet">Human controlled</Badge></div></CardHeader>
          <CardContent>
            <Button size="sm" onClick={handleDraft} disabled={draftLoading}><Sparkles size={14} className="mr-1.5" />{draftLoading ? 'Writing draft…' : 'Generate draft reply'}</Button>
            {draft && <div className="mt-4 rounded-2xl border border-indigo-400/20 bg-zinc-950/40 p-4 text-sm leading-6 text-zinc-300"><div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.14em] text-indigo-300"><span>AI-generated draft</span><button type="button" onClick={copyDraft} className="inline-flex items-center gap-1 text-zinc-500 hover:text-white"><Copy size={13} /> {copyMessage || 'Copy'}</button></div>{draft}</div>}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <Card className="lg:col-span-2">
          <CardHeader><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-white">Conversation</h3><p className="mt-1 text-sm text-zinc-500">Customer and agent messages update in real time.</p></div><span className={`inline-flex items-center gap-1.5 text-xs ${socketState === 'connected' ? 'text-emerald-300' : 'text-amber-300'}`}><span className={`h-1.5 w-1.5 rounded-full ${socketState === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />{socketState === 'connected' ? 'Connected' : socketState === 'connecting' ? 'Connecting…' : 'Reconnecting…'}</span></div></CardHeader>
          <CardContent>
            <div className="h-[420px] space-y-3 overflow-auto rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
              {chatResult && <div className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-6 ${aiEscalated ? 'border-amber-400/20 bg-amber-400/5 text-zinc-300' : 'border-indigo-400/20 bg-indigo-400/5 text-zinc-300'}`}><div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-indigo-300"><Bot size={14} /> SmartDesk AI</div>{aiEscalated ? <><p>I couldn’t find enough information in the knowledge base to answer this confidently.</p><Link to="/dashboard#create-ticket" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200">Create a support ticket <ArrowLeft size={12} className="rotate-180" /></Link></> : <><p>{chatResult.answer}</p><div className="mt-2 text-xs text-zinc-500">Grounded in {chatResult.chunkCount} knowledge chunks</div></>}</div>}
              {messages.map((m)=>(
                <div key={m._id} className={`max-w-[82%] rounded-2xl border px-4 py-3 text-sm leading-6 ${m.senderType==='agent'?'ml-auto border-emerald-400/20 bg-emerald-400/10 text-zinc-200':m.senderType==='ai'?'border-indigo-400/20 bg-indigo-400/5 text-zinc-300':'border-white/10 bg-white/[0.04] text-zinc-300'}`}>
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">{m.senderType === 'ai' ? <Bot size={13} /> : m.senderType === 'agent' ? <Sparkles size={13} /> : <UserRound size={13} />}{m.senderType === 'user' ? 'Customer' : m.senderType === 'agent' ? 'Agent' : 'SmartDesk AI'}</div><div>{m.text}</div>
                  <div className="mt-1 text-xs text-zinc-500">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
              {messages.length === 0 && !chatResult && <div className="grid h-full place-items-center text-center"><div><CircleAlert size={24} className="mx-auto text-zinc-600" /><p className="mt-3 text-sm text-zinc-500">No messages yet. Start the conversation below.</p></div></div>}
              {typing && <div className="text-xs text-zinc-500">Someone is typing…</div>}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="mt-3 flex gap-2">
              <Input aria-label="Message" placeholder="Write a message…" value={text} onChange={(e)=>setText(e.target.value)} />
              <Button aria-label="Send message" className="bg-emerald-400 text-zinc-950 hover:bg-emerald-300"><Send size={15} /></Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="flex items-center gap-2 font-semibold text-white"><Sparkles size={16} className="text-indigo-300" /> Ask SmartDesk</h3><p className="mt-1 text-sm text-zinc-500">Answers use the available knowledge base only.</p></CardHeader>
          <CardContent>
            <form onSubmit={handleChatAI} className="space-y-3">
              <Input aria-label="Ask SmartDesk" placeholder="How do I reset a password?" value={chatQuery} onChange={(e)=>setChatQuery(e.target.value)} />
              <Button variant="secondary" className="w-full" disabled={chatLoading}>{chatLoading ? 'SmartDesk is thinking…' : 'Ask SmartDesk'}</Button>
            </form>
            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-zinc-500"><Bot size={14} className="mt-0.5 shrink-0 text-indigo-300" />If the knowledge base does not have enough context, SmartDesk will recommend a human handoff.</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><h3 className="flex items-center gap-2 font-semibold text-white"><Paperclip size={14} className="text-zinc-400" /> Attachments {ticket.attachments?.length?`(${ticket.attachments.length})`:''}</h3></CardHeader>
          <CardContent>
            <form onSubmit={uploadAttachment} className="mb-3 flex flex-col gap-2 sm:flex-row">
              <Input aria-label="Attachment" type="file" onChange={(e)=>setFile(e.target.files[0])} />
              <Button size="sm" variant="secondary">Upload</Button>
            </form>
            <div className="space-y-2">
              {(ticket.attachments||[]).map((a,i)=>(<div key={i} className="flex justify-between rounded-xl border border-white/10 px-3 py-2 text-sm"><span className="truncate text-zinc-300">{a.name}</span><span className="text-zinc-500">{(a.size/1024).toFixed(1)}KB</span></div>))}
              {(!ticket.attachments||ticket.attachments.length===0) && <div className="text-sm text-zinc-500">No attachments yet</div>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="flex items-center gap-2 font-semibold text-white"><History size={14} className="text-zinc-400" /> Audit history</h3></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm max-h-[220px] overflow-auto">
              <div className="flex gap-2"><span className="text-zinc-400">{new Date(ticket.createdAt).toLocaleString()}</span><span>Ticket created</span></div>
              {history.map(h=><div key={h._id} className="flex gap-2"><span className="text-zinc-400">{new Date(h.createdAt).toLocaleTimeString()}</span><span><b>{h.actorName}:</b> {h.action}</span></div>)}
              {messages.map((m)=><div key={m._id} className="flex gap-2 opacity-60"><span className="text-zinc-400">{new Date(m.createdAt).toLocaleTimeString()}</span><span className="truncate"><b>{m.senderType}:</b> {m.text.slice(0,40)}</span></div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
