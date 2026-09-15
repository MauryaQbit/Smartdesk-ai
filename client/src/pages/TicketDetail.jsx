import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
  const socketRef = useRef(null);

  const load = async () => {
    const { data } = await api.get(`/tickets/${id}`);
    setTicket(data.ticket);
    setMessages(data.messages);
    const p = data.ticket.priority ? { priority: data.ticket.priority, category: data.ticket.category, summary: data.ticket.summaryAI } : null;
    setTriageInfo(p);
  };

  useEffect(() => {
    load();
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('join-ticket', id));
    socket.on('new-message', (msg) => {
      if (msg.ticketId === id) setMessages((m) => [...m, msg]);
    });
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit('send-message', { ticketId: id, text });
    setText('');
    setTimeout(async () => {
      try {
        const { data } = await api.get(`/tickets/${id}`);
        setMessages(data.messages);
        setTicket(data.ticket);
      } catch {}
    }, 800);
  };

  const handleChatAI = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    const result = await chatAI(id, chatQuery.trim());
    setChatResult(result);
    setChatQuery('');
    const { data } = await api.get(`/tickets/${id}`);
    setMessages(data.messages);
  };

  const handleDraft = async () => {
    const result = await draftReply(id);
    setDraft(result.draftReply || '');
  };

  const handleTriage = async () => {
    await api.post('/ai/triage', { ticketId: id });
    const { data } = await api.get(`/tickets/${id}`);
    const p = data.ticket.priority ? { priority: data.ticket.priority, category: data.ticket.category, summary: data.ticket.summaryAI } : null;
    setTriageInfo(p);
  };

  const assign = async () => {
    const { data } = await api.patch(`/tickets/${id}/assign`);
    setTicket(data);
  };

  const setStatus = async (status) => {
    const { data } = await api.patch(`/tickets/${id}/status`, { status });
    setTicket(data);
  };

  if (!ticket) return <p>Loading...</p>;
  const isStaff = ['agent', 'admin'].includes(user?.role);

  return (
    <div className="wrap">
      <Link to="/">← Back</Link>
      <div className="card">
        <h2>{ticket.title}</h2>
        <p>{ticket.description}</p>
        <p><small>{ticket.status} • {triageInfo?.priority || ticket.priority} • {triageInfo?.category || ticket.category} • SLA: {new Date(ticket.slaDeadline).toLocaleString()}</small></p>
        {triageInfo && <p><small style={{ color: '#2563eb' }}>AI triage: {triageInfo.priority} | {triageInfo.category} | {triageInfo.summary}</small></p>}
        {isStaff && (
          <div className="row">
            <button onClick={handleTriage}>AI Triage</button>
            <button onClick={assign}>Assign to me</button>
            <button onClick={() => setStatus('resolved')}>Resolve</button>
            <button onClick={() => setStatus('closed')}>Close</button>
          </div>
        )}
        {!isStaff && ticket.status === 'resolved' && <button onClick={() => setStatus('closed')}>Close ticket</button>}
      </div>

      {isStaff && (
        <div className="card">
          <h3>AI Agent Assist</h3>
          <div className="row">
            <button onClick={handleDraft}>Summarize thread & draft reply</button>
          </div>
          {draft && (
            <div className="msg" style={{ marginTop: 8 }}>
              <b>Draft reply:</b> {draft}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h3>Live chat</h3>
        <div className="chat">
          {chatResult && (
            <div className="msg ai">
              <span><b>RAG answer:</b> {chatResult.answer}</span>
              <small>AI • {chatResult.chunkCount} chunks used</small>
            </div>
          )}
          {messages.map((m) => (
            <div key={m._id} className={`msg ${m.senderType}`}>
              <span>{m.text}</span>
              <small>{m.senderType} • {new Date(m.createdAt).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="row">
          <input placeholder="Type message..." value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit">Send</button>
        </form>
      </div>

      <div className="card">
        <h3>RAG Chat (Knowledge Base)</h3>
        <form onSubmit={handleChatAI} className="row">
          <input placeholder="Ask a question about this ticket..." value={chatQuery} onChange={(e) => setChatQuery(e.target.value)} />
          <button type="submit">Ask AI</button>
        </form>
      </div>
    </div>
  );
}
