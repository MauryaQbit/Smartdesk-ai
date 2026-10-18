import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, CircleAlert, MessageSquare, Send, Sparkles, Ticket, ThumbsDown, ThumbsUp } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Button, Card, CardContent, CardHeader, Input, Skeleton, Toast } from '../components/ui';

export default function AIAssistant() {
  const { chatAI, aiFeedback, escalateAI } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [toast, setToast] = useState('');
  const [escalating, setEscalating] = useState(false);
  const selectedTicket = tickets.find((ticket) => ticket._id === selectedId);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const { data } = await api.get('/tickets?page=1&limit=20');
        const availableTickets = data.data || [];
        setTickets(availableTickets);
        setSelectedId(availableTickets[0]?._id || '');
      } catch {
        setToast('We could not load your tickets.');
      }
      setLoading(false);
    };
    loadTickets();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/tickets/${selectedId}`).then(({ data }) => {
      setMessages((data.messages || []).map((message) => ({
        type: message.senderType === 'ai' ? 'ai' : 'user',
        text: message.text,
        messageId: message._id,
        chunkCount: message.sources?.length || 0,
        confidence: message.confidence,
        sources: message.sources || [],
        feedback: message.aiFeedback
      })));
    }).catch(() => setToast('We could not load this AI conversation.'));
  }, [selectedId]);

  const ask = async (event) => {
    event.preventDefault();
    if (!query.trim() || !selectedId) return;
    const question = query.trim();
    setMessages((current) => [...current, { type: 'user', text: question }]);
    setQuery('');
    setThinking(true);
    try {
      const result = await chatAI(selectedId, question);
      setMessages((current) => [...current, { type: 'ai', text: result.answer, messageId: result.messageId, chunkCount: result.chunkCount, confidence: result.confidence, sources: result.sources || [] }]);
    } catch (error) {
      setToast(error.response?.data?.message || 'SmartDesk could not process that question.');
    }
    setThinking(false);
  };

  const escalation = (message) => message.chunkCount === 0 || message.text.includes('Escalating to human');
  const submitFeedback = async (messageId, helpful) => {
    try {
      await aiFeedback(messageId, helpful);
      setMessages((current) => current.map((message) => message.messageId === messageId ? { ...message, feedback: helpful ? 'helpful' : 'not_helpful' } : message));
    } catch { setToast('We could not save that feedback.'); }
  };
  const escalate = async () => {
    if (!selectedId) return;
    setEscalating(true);
    try { await escalateAI(selectedId); setToast('A human agent has been notified.'); } catch (error) { setToast(error.response?.data?.message || 'We could not request a human agent.'); }
    setEscalating(false);
  };

  return (
    <div className="space-y-6">
      <Toast message={toast} />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300"><Sparkles size={13} /> SmartDesk AI</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Your support assistant</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Ask a question about a support request and SmartDesk will search the available knowledge base before recommending a human handoff.</p>
        </div>
        <Badge tone="violet"><Bot size={13} className="mr-1.5" /> Knowledge-grounded</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.36fr)]">
        <Card className="overflow-hidden border-indigo-400/20">
          <CardHeader className="bg-indigo-400/[0.04]"><div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold text-white"><MessageSquare size={17} className="text-indigo-300" /> Conversation</h2><p className="mt-1 text-sm text-zinc-500">Responses are grounded in the selected ticket context.</p></div>{selectedTicket && <Badge tone="zinc">Ticket {selectedTicket._id.slice(-6)}</Badge>}</div></CardHeader>
          <CardContent>
            <div className="min-h-[390px] space-y-4 rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
              {messages.length === 0 && !thinking && <div className="grid min-h-[350px] place-items-center text-center"><div><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-400/10 text-indigo-300"><Bot size={23} /></div><h3 className="mt-4 font-medium text-white">How can I help?</h3><p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">Ask about the selected ticket, troubleshooting steps, or information your team has uploaded.</p></div></div>}
              {messages.map((message, index) => <div key={`${message.messageId || message.type}-${index}`} className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-6 ${message.type === 'user' ? 'ml-auto border-emerald-400/20 bg-emerald-400/10 text-zinc-200' : escalation(message) ? 'border-amber-400/20 bg-amber-400/5 text-zinc-300' : 'border-indigo-400/20 bg-indigo-400/5 text-zinc-300'}`}><div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">{message.type === 'user' ? 'You' : <><Bot size={13} /> SmartDesk AI</>}</div><p>{message.text}</p>{message.type === 'ai' && <>{message.confidence > 0 && <p className="mt-2 text-xs text-zinc-500">Confidence {Math.round(message.confidence * 100)}% · grounded in {message.chunkCount} source{message.chunkCount === 1 ? '' : 's'}</p>}{message.sources?.length > 0 && <div className="mt-3 space-y-1 border-t border-white/10 pt-2"><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-600">Sources</p>{message.sources.map((source) => <p key={`${source.title}-${source.source}`} className="truncate text-xs text-zinc-500">{source.title || source.source || 'Knowledge base document'}</p>)}</div>}{message.messageId && !escalation(message) && <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2"><span className="text-xs text-zinc-600">Helpful?</span><button type="button" aria-label="Mark answer helpful" onClick={() => submitFeedback(message.messageId, true)} className={message.feedback === 'helpful' ? 'text-emerald-300' : 'text-zinc-600 hover:text-emerald-300'}><ThumbsUp size={14} /></button><button type="button" aria-label="Mark answer not helpful" onClick={() => submitFeedback(message.messageId, false)} className={message.feedback === 'not_helpful' ? 'text-amber-300' : 'text-zinc-600 hover:text-amber-300'}><ThumbsDown size={14} /></button></div>}</>}</div>)}
              {thinking && <div className="flex max-w-[88%] items-center gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-400/5 px-4 py-3 text-sm text-zinc-400"><Bot size={16} className="text-indigo-300" /><span>SmartDesk AI is thinking…</span><span className="flex gap-1"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-300" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-300 [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-300 [animation-delay:300ms]" /></span></div>}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row"><form onSubmit={ask} className="flex min-w-0 flex-1 gap-2"><Input aria-label="Ask SmartDesk AI" placeholder={selectedId ? 'Ask SmartDesk anything about this ticket…' : 'Select a ticket to start'} value={query} onChange={(event) => setQuery(event.target.value)} disabled={!selectedId || thinking} /><Button aria-label="Send question" className="bg-emerald-400 text-zinc-950 hover:bg-emerald-300" disabled={!selectedId || thinking || !query.trim()}><Send size={16} /></Button></form><Button type="button" variant="secondary" onClick={escalate} disabled={!selectedId || escalating}>{escalating ? 'Notifying…' : 'Ask a human'}</Button></div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><h2 className="flex items-center gap-2 font-semibold text-white"><Ticket size={17} className="text-emerald-400" /> Choose a ticket</h2><p className="mt-1 text-sm text-zinc-500">AI chat needs a ticket context.</p></CardHeader>
          <CardContent>
            {loading ? <div className="space-y-2"><Skeleton className="h-11" /><Skeleton className="h-11" /><Skeleton className="h-11" /></div> : tickets.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center"><CircleAlert size={21} className="mx-auto text-zinc-600" /><p className="mt-3 text-sm font-medium text-zinc-300">No tickets available</p><p className="mt-1 text-xs leading-5 text-zinc-500">Create a support ticket to give SmartDesk a conversation to work from.</p><Link to="/dashboard#create-ticket" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-emerald-300">Create ticket <ArrowRight size={13} /></Link></div> : <div className="space-y-2">{tickets.map((ticket) => <button type="button" key={ticket._id} onClick={() => setSelectedId(ticket._id)} className={`w-full rounded-2xl border p-3 text-left transition ${selectedId === ticket._id ? 'border-emerald-400/30 bg-emerald-400/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}><div className="truncate text-sm font-medium text-zinc-200">{ticket.title}</div><div className="mt-2 flex items-center gap-2"><Badge tone={ticket.status === 'resolved' ? 'green' : ticket.status === 'assigned' ? 'blue' : 'amber'}>{ticket.status}</Badge><span className="text-xs text-zinc-600">{ticket.category}</span></div></button>)}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
