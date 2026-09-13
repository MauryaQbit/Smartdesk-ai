import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);

  const load = async () => {
    const { data } = await api.get(`/tickets/${id}`);
    setTicket(data.ticket);
    setMessages(data.messages);
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
    // Realtime first, REST as fallback persistence is handled by socket server.
    socketRef.current?.emit('send-message', { ticketId: id, text });
    setText('');
    // Fallback poll after 800ms to sync if socket missed
    setTimeout(async () => {
      try {
        const { data } = await api.get(`/tickets/${id}`);
        setMessages(data.messages);
        setTicket(data.ticket);
      } catch {}
    }, 800);
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
        <p><small>{ticket.status} • {ticket.priority} • {ticket.category} • SLA: {new Date(ticket.slaDeadline).toLocaleString()}</small></p>
        {isStaff && (
          <div className="row">
            <button onClick={assign}>Assign to me</button>
            <button onClick={() => setStatus('resolved')}>Resolve</button>
            <button onClick={() => setStatus('closed')}>Close</button>
          </div>
        )}
        {!isStaff && ticket.status === 'resolved' && <button onClick={() => setStatus('closed')}>Close ticket</button>}
      </div>

      <div className="card">
        <h3>Live chat</h3>
        <div className="chat">
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
    </div>
  );
}
