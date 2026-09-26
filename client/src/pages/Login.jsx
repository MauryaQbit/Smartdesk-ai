import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Headset, Lock, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, Button, Input } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await login(form.email, form.password); nav('/dashboard'); } catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
    setLoading(false);
  };
  return (
    <div className="mx-auto grid max-w-5xl gap-6 py-6 md:grid-cols-[1.05fr_0.95fr] md:py-12">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative hidden overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-900 p-8 text-white shadow-2xl shadow-emerald-950/20 md:flex md:flex-col md:justify-between">
        <div className="absolute right-[-15%] top-[-12%] h-56 w-56 rounded-full border border-emerald-400/10" />
        <div className="absolute right-[-8%] top-[-4%] h-40 w-40 rounded-full border border-emerald-400/10" />
        <div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-950/30"><Headset size={22} /></div>
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">SmartDesk AI</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">A calmer way to run support.</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-300">Bring every request, answer, and handoff into one workspace your team can trust.</p>
        </div>
        <div className="relative mt-12 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-zinc-200"><CheckCircle2 size={17} className="text-emerald-400" /> AI-assisted ticket triage</div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-zinc-200"><CheckCircle2 size={17} className="text-emerald-400" /> Answers grounded in your docs</div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-zinc-200"><CheckCircle2 size={17} className="text-emerald-400" /> Live updates for every handoff</div>
        </div>
      </motion.div>
      <Card className="h-fit rounded-3xl">
        <CardHeader>
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 md:hidden"><Headset size={21} /></div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-zinc-500">Sign in to continue to your support workspace.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-zinc-300">Email address</label>
              <div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><Input id="login-email" className="h-11 pl-10" placeholder="you@company.com" type="email" autoComplete="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><label htmlFor="login-password" className="block text-sm font-medium text-zinc-300">Password</label><span className="text-xs text-zinc-600">Keep it private</span></div>
              <div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><Input id="login-password" className="h-11 pl-10 pr-11" placeholder="Enter your password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            </div>
            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</div>}
            <Button className="h-11 w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" disabled={loading}>{loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={16} className="ml-2" /></>}</Button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">No account? <Link to="/register" className="font-medium text-emerald-300 hover:text-emerald-200">Create one</Link></div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-3 text-xs leading-5 text-zinc-400">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            <span>Your session is protected with secure, httpOnly authentication.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
