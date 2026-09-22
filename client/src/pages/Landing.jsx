import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, MessageSquare, ShieldCheck, BarChart3, Clock, Headset, ArrowRight, Play, Check, Database, Layers, Cpu } from 'lucide-react';
import { Button, Badge, Card, CardContent } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[28px] bg-zinc-900 text-white">
        <div className="absolute inset-0 bg-grid opacity-[0.08]" />
        <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs tracking-wide"><Sparkles size={12}/> MERN · Gemini 2.5 Flash · RAG · Realtime</div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">Support that<br/><span className="bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">answers itself.</span></h1>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-xl">SmartDesk AI triages every ticket in ~3s, tries RAG from your docs first, and escalates with a draft for the agent — all live via Socket rooms. Built solo for placement, production-hardened.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to={user?'/':'/register'}><Button size="lg">{user?'Go to dashboard':'Get started'} <ArrowRight size={16} className="ml-1.5"/></Button></Link>
              <Link to="/login"><Button variant="secondary" size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100"><Play size={14} className="mr-1.5"/> View demo</Button></Link>
            </div>
            <div className="flex gap-6 pt-4 text-sm">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400"/> JWT httpOnly</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400"/> Socket rooms</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400"/> SLA 24h</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white text-zinc-900 p-4 shadow-2xl">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-3"><span className="flex items-center gap-1.5"><Headset size={12}/> Ticket #6aa • open</span><Badge tone="amber">High</Badge></div>
            <div className="space-y-2">
              <div className="rounded-xl border p-3"><div className="text-sm font-medium">Cannot login to dashboard</div><div className="text-xs text-zinc-500 mt-1">AI triage: <span className="text-blue-600">High • bug • User unable to log in</span></div></div>
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl bg-zinc-900 text-white px-3 py-2 text-sm">Customer: Need help urgently!</div>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm"><b>RAG:</b> Go to Settings → Account → Reset Password <span className="text-xs text-zinc-500">(2 chunks)</span></div>
              <div className="flex gap-2 justify-end">
                <div className="rounded-xl bg-blue-600 text-white px-3 py-2 text-sm">Agent: Try the reset link, I’ve assigned your ticket.</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500"><Clock size={12}/> avg first response seconds · SLA cron every minute</div>
            </div>
          </motion.div>
        </div>
        <div className="grid grid-cols-3 gap-3 p-4 md:p-6 pt-0">
          <div className="rounded-xl bg-white/10 border border-white/10 p-3 text-center"><div className="text-xl font-semibold">~3s</div><div className="text-xs text-zinc-300">triage</div></div>
          <div className="rounded-xl bg-white/10 border border-white/10 p-3 text-center"><div className="text-xl font-semibold">~40%</div><div className="text-xs text-zinc-300">Tier-1 auto</div></div>
          <div className="rounded-xl bg-white/10 border border-white/10 p-3 text-center"><div className="text-xl font-semibold">24h</div><div className="text-xs text-zinc-300">SLA → Urgent</div></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div><h2 className="text-xl font-semibold tracking-tight">Everything for a real helpdesk</h2><p className="text-sm text-zinc-500">MERN + AI + realtime — not CRUD.</p></div>
          <Badge tone="blue">Placement ready</Badge>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: 'AI Triage', desc: 'Gemini 2.5 Flash classifies priority/sentiment/category + summary in strict JSON, retry on 503.' },
            { icon: MessageSquare, title: 'RAG Chatbot', desc: '500/50 chunk → nomic-embed-text 768 → cosine top3 → strict context prompt, escalate fallback.' },
            { icon: Headset, title: 'Realtime', desc: 'Socket.io rooms per ticketId, JWT auth, typing indicator, REST fallback.' },
            { icon: Clock, title: 'SLA Engine', desc: 'slaDeadline +24h, node-cron */1 * * * * → Urgent, badge + analytics.' },
            { icon: BarChart3, title: 'Admin Analytics', desc: 'Aggregation: total/open/resolved/urgent, time-series 7d, byCategory, leaderboard — Recharts.' },
            { icon: ShieldCheck, title: 'RBAC + Security', desc: 'httpOnly JWT, protect/authorize, helmet, rateLimit 20/m AI, mongoSanitize, hpp.' },
          ].map(f=>(
            <Card key={f.title}><CardContent className="p-5"><div className="h-9 w-9 grid place-items-center rounded-xl bg-zinc-900 text-white mb-3"><f.icon size={16}/></div><div className="font-medium">{f.title}</div><div className="text-sm text-zinc-600 mt-1 leading-relaxed">{f.desc}</div></CardContent></Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="rounded-2xl border bg-white p-6">
        <h3 className="font-semibold">How it works</h3>
        <div className="grid md:grid-cols-3 gap-6 mt-4">
          {[
            { n: '01', t: 'Customer creates', d: 'Title + description → ticket with pagination, search, SLA timer.' },
            { n: '02', t: 'AI tries first', d: 'Triage badge + RAG from KB docs. If no chunks, escalates to human.' },
            { n: '03', t: 'Agent resolves', d: 'Assign, live chat, draft reply (Gemini), status → resolved, history logged.' },
          ].map(s=>(
            <div key={s.n} className="rounded-xl bg-zinc-50 border p-4"><div className="text-xs tracking-widest text-zinc-400">{s.n}</div><div className="font-medium mt-1">{s.t}</div><div className="text-sm text-zinc-600 mt-1">{s.d}</div></div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><Layers size={16}/> Stack</h3>
        <div className="flex flex-wrap gap-2">
          {['React + Vite','Tailwind','Recharts','Node 24','Express','Mongoose','Socket.io','Gemini 2.5 Flash','nomic-embed-text','Helmet','Winston','Swagger','Jest 18','Docker'].map(s=> <Badge key={s} tone="zinc" className="border">{s}</Badge>)}
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <Card><CardContent className="p-4 flex gap-3"><Database size={16} className="mt-0.5"/><div><div className="font-medium">Indexes</div><div className="text-zinc-600">status+createdAt, text title/desc, category+priority, aiResolved</div></div></CardContent></Card>
          <Card><CardContent className="p-4 flex gap-3"><Cpu size={16} className="mt-0.5"/><div><div className="font-medium">Perf</div><div className="text-zinc-600">compression, pagination 10, lru-cache stub, code-split + lazy</div></div></CardContent></Card>
          <Card><CardContent className="p-4 flex gap-3"><ShieldCheck size={16} className="mt-0.5"/><div><div className="font-medium">Deploy</div><div className="text-zinc-600">multi-stage Docker, healthchecks, seed, vercel + render</div></div></CardContent></Card>
        </div>
      </section>

      {/* METRICS */}
      <section className="rounded-2xl bg-zinc-900 text-white p-6">
        <h3 className="font-semibold">Why this gets shortlisted</h3>
        <div className="grid md:grid-cols-4 gap-4 mt-4 text-center">
          <div className="rounded-xl bg-white/10 p-4"><div className="text-2xl font-semibold">9</div><div className="text-xs text-zinc-300">REST APIs</div></div>
          <div className="rounded-xl bg-white/10 p-4"><div className="text-2xl font-semibold">18</div><div className="text-xs text-zinc-300">Jest tests</div></div>
          <div className="rounded-xl bg-white/10 p-4"><div className="text-2xl font-semibold">&lt;3s</div><div className="text-xs text-zinc-300">triage</div></div>
          <div className="rounded-xl bg-white/10 p-4"><div className="text-2xl font-semibold">100%</div><div className="text-xs text-zinc-300">local + free tier</div></div>
        </div>
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <Link to={user?'/':'/register'}><Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100">Start now <ArrowRight size={16} className="ml-1.5"/></Button></Link>
          <a href="/api/docs" target="_blank"><Button size="lg" variant="secondary" className="bg-transparent border-white/20 text-white hover:bg-white/10">Swagger docs</Button></a>
        </div>
      </section>
    </div>
  );
}
