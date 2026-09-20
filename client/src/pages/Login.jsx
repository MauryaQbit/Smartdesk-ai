import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, Button, Input } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await login(form.email, form.password); nav('/'); } catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
    setLoading(false);
  };
  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="hidden md:flex flex-col justify-center rounded-2xl bg-zinc-900 text-white p-8">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-white/10"><LogIn size={18} /></div>
        <h1 className="text-3xl font-semibold mt-4 leading-tight">Support that<br/>answers itself.</h1>
        <p className="text-sm text-zinc-300 mt-3 leading-relaxed">RAG chatbot tries from your docs first. If unsure, it escalates with a draft for the agent — all live.</p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/10 p-3"><div className="text-xl font-semibold">3s</div><div className="text-xs text-zinc-300">triage</div></div>
          <div className="rounded-xl bg-white/10 p-3"><div className="text-xl font-semibold">40%</div><div className="text-xs text-zinc-300">auto</div></div>
          <div className="rounded-xl bg-white/10 p-3"><div className="text-xl font-semibold">24h</div><div className="text-xs text-zinc-300">SLA</div></div>
        </div>
      </motion.div>
      <Card className="h-fit">
        <CardHeader>
          <h2 className="text-xl font-semibold">Welcome back</h2>
          <p className="text-sm text-zinc-500">Sign in to SmartDesk AI</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><Input className="pl-9" placeholder="Email" type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></div>
            <div className="relative"><Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><Input className="pl-9" placeholder="Password" type="password" required value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} /></div>
            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</div>}
            <Button className="w-full" disabled={loading}>{loading?'Signing in…':'Login'}</Button>
          </form>
          <div className="text-sm text-center mt-4 text-zinc-600">No account? <Link to="/register" className="text-zinc-900 underline">Create one</Link></div>
          <div className="mt-4 rounded-xl bg-zinc-50 border p-3 text-xs text-zinc-600">
            <div className="font-medium mb-1">Demo</div>
            <div>Admin: admin@test.com / admin123</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
