import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
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
  const endRef = useRef(null);
  const socketRef = useRef(null);

  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''), 2500); };

  const load = async () => {
    const { data } = await api.get(`/tickets/${id}`);
    setTicket(data.ticket);
    setMessages(data.messages);
    setTriageInfo(data.ticket.priority ? { priority: data.ticket.priority, category: data.ticket.category, summary: data.ticket.summaryAI } : null);
  };

  useEffect(() => {
    load();
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('join-ticket', id));
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
    try {
      const result = await chatAI(id, chatQuery.trim());
      setChatResult(result);
      showToast(result.chunkCount?`RAG used ${result.chunkCount} chunks`:'Escalated — no KB');
      setChatQuery('');
      const { data } = await api.get(`/tickets/${id}`); setMessages(data.messages);
    } catch (err) { showToast(err.response?.data?.message||'RAG failed'); }
  };

  const handleDraft = async () => {
    try { const result = await draftReply(id); setDraft(result.draftReply||result.summary||''); showToast('Draft generated'); } catch { showToast('Draft failed'); }
  };

  const handleTriage = async () => {
    try { await api.post('/ai/triage', { ticketId: id }); const { data } = await api.get(`/tickets/${id}`); setTriageInfo(data.ticket.priority?{priority:data.ticket.priority,category:data.ticket.category,summary:data.ticket.summaryAI}:null); setTicket(data.ticket); showToast('Triaged'); } catch { showToast('Triage failed'); }
  };

  const assign = async () => { const { data } = await api.patch(`/tickets/${id}/assign`); setTicket(data); showToast('Assigned to you'); };
  const setStatus = async (status) => { const { data } = await api.patch(`/tickets/${id}/status`, { status }); setTicket(data); showToast(status); };

  if (!ticket) return <div className="py-10 text-center text-sm text-zinc-500">Loading ticket…</div>;
  const isStaff = ['agent','admin'].includes(user?.role);
  const slaOver = new Date(ticket.slaDeadline) < new Date() && ['open','assigned'].includes(ticket.status);

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm text-zinc-600 hover:text-zinc-900">← Back to dashboard</Link>
      <Toast message={toast} />

      <Card className={slaOver ? 'border-red-200' : ''}>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">{ticket.title}</h1>
              <p className="text-sm text-zinc-600 mt-1">{ticket.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={ticket.status==='open'?'amber':ticket.status==='assigned'?'blue':ticket.status==='resolved'?'green':'zinc'}>{ticket.status}</Badge>
              <Badge tone={slaOver?'red':ticket.priority==='Urgent'?'red':ticket.priority==='High'?'amber':'blue'}>{triageInfo?.priority||ticket.priority}</Badge>
              <Badge tone="zinc">{triageInfo?.category||ticket.category}</Badge>
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500 flex flex-wrap gap-3">
            <span>SLA: {new Date(ticket.slaDeadline).toLocaleString()} {slaOver && <span className="text-red-600 font-medium">· overdue → Urgent</span>}</span>
            <span>Customer: {ticket.customerId?.name || ticket.customerId}</span>
            {ticket.assignedAgentId && <span>Agent: {ticket.assignedAgentId?.name || ticket.assignedAgentId}</span>}
          </div>
          {triageInfo && <div className="mt-3 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800">AI triage: <b>{triageInfo.priority}</b> · {triageInfo.category} · {triageInfo.summary}</div>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {isStaff && <><Button size="sm" variant="secondary" onClick={handleTriage}>AI Triage</Button><Button size="sm" onClick={assign}>Assign to me</Button><Button size="sm" variant="secondary" onClick={()=>setStatus('resolved')}>Resolve</Button><Button size="sm" variant="secondary" onClick={()=>setStatus('closed')}>Close</Button></>}
            {!isStaff && ticket.status==='resolved' && <Button size="sm" onClick={()=>setStatus('closed')}>Close ticket</Button>}
          </div>
        </CardContent>
      </Card>

      {isStaff && (
        <Card>
          <CardHeader><h3 className="font-semibold">AI Agent Assist</h3><p className="text-sm text-zinc-500">Summarize thread + draft reply (Gemini)</p></CardHeader>
          <CardContent>
            <Button size="sm" onClick={handleDraft}>Summarize & draft reply</Button>
            {draft && <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm"><b>Draft:</b> {draft}</div>}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><h3 className="font-semibold">Live chat <span className="text-xs font-normal text-zinc-500">· Socket room {id.slice(-6)}</span></h3></CardHeader>
          <CardContent>
            <div className="h-[380px] overflow-auto rounded-xl border bg-zinc-50 p-3 space-y-2">
              {chatResult && <div className="max-w-[85%] rounded-2xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm"><b>RAG:</b> {chatResult.answer} <div className="text-xs text-zinc-500">{chatResult.chunkCount} chunks</div></div>}
              {messages.map((m)=>(
                <div key={m._id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.senderType==='agent'?'ml-auto bg-blue-600 text-white':m.senderType==='ai'?'bg-amber-50 border border-amber-200':'bg-white border'}`}>
                  <div>{m.text}</div>
                  <div className={`text-xs mt-1 ${m.senderType==='agent'?'text-blue-100':'text-zinc-500'}`}>{m.senderType} · {new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
              {typing && <div className="text-xs text-zinc-500">Someone is typing…</div>}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="flex gap-2 mt-3">
              <Input placeholder="Type message..." value={text} onChange={(e)=>setText(e.target.value)} />
              <Button>Send</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">RAG Chat (KB)</h3><p className="text-sm text-zinc-500">Ask from uploaded docs — strict context</p></CardHeader>
          <CardContent>
            <form onSubmit={handleChatAI} className="flex gap-2">
              <Input placeholder="e.g. how to reset password?" value={chatQuery} onChange={(e)=>setChatQuery(e.target.value)} />
              <Button variant="secondary">Ask AI</Button>
            </form>
            {chatResult && <div className="mt-3 text-sm rounded-xl border p-3 bg-white"><b>Answer:</b> {chatResult.answer}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><h3 className="font-semibold">Timeline</h3></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2"><span className="text-zinc-400">{new Date(ticket.createdAt).toLocaleString()}</span><span>Ticket created</span></div>
            {messages.map((m)=><div key={m._id} className="flex gap-2"><span className="text-zinc-400">{new Date(m.createdAt).toLocaleTimeString()}</span><span className="truncate"><b>{m.senderType}:</b> {m.text}</span></div>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
