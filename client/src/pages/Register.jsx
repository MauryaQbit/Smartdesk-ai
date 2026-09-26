import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Headset, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, Button, Input, Select } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await register(form.name, form.email, form.password, form.role); nav('/dashboard'); } catch (e) { setErr(e.response?.data?.message || 'Register failed'); }
    setLoading(false);
  };
  return (
    <div className="mx-auto grid max-w-5xl gap-6 py-6 md:grid-cols-[1.05fr_0.95fr] md:py-12">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative hidden overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-900 p-8 text-white shadow-2xl shadow-emerald-950/20 md:flex md:flex-col md:justify-between">
        <div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-zinc-950"><Headset size={22} /></div>
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">Start with SmartDesk</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">Give every request a clear next step.</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-300">Create a workspace for ticket intake, AI-assisted answers, and reliable customer handoffs.</p>
        </div>
        <div className="mt-12 space-y-3 text-sm text-zinc-200">
          <div className="flex items-center gap-3"><CheckCircle2 size={17} className="text-emerald-400" /> Customer and agent roles</div>
          <div className="flex items-center gap-3"><CheckCircle2 size={17} className="text-emerald-400" /> Knowledge-grounded AI</div>
          <div className="flex items-center gap-3"><CheckCircle2 size={17} className="text-emerald-400" /> Secure session handling</div>
        </div>
      </motion.div>
      <Card className="h-fit rounded-3xl">
        <CardHeader>
          <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300 md:hidden"><Headset size={21} /></div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Create your account</h2>
          <p className="mt-1 text-sm text-zinc-500">Choose how you’ll work in SmartDesk.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div><label htmlFor="register-name" className="mb-2 block text-sm font-medium text-zinc-300">Full name</label><div className="relative"><User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><Input id="register-name" className="h-11 pl-10" placeholder="Alex Morgan" autoComplete="name" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></div></div>
            <div><label htmlFor="register-email" className="mb-2 block text-sm font-medium text-zinc-300">Work email</label><div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><Input id="register-email" className="h-11 pl-10" placeholder="you@company.com" type="email" autoComplete="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></div></div>
            <div><label htmlFor="register-password" className="mb-2 block text-sm font-medium text-zinc-300">Password</label><div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><Input id="register-password" className="h-11 pl-10 pr-11" placeholder="At least 6 characters" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} required value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
            <div><label htmlFor="register-role" className="mb-2 block text-sm font-medium text-zinc-300">Your role</label><Select id="register-role" className="h-11 w-full" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
            </Select><p className="mt-2 text-xs text-zinc-600">Admin access is managed by the first workspace account.</p></div>
            {err && <div className="text-sm text-red-600 bg-red-50 border rounded-xl px-3 py-2">{err}</div>}
            <Button className="h-11 w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300" disabled={loading}>{loading ? 'Creating account…' : <><span>Create account</span><ArrowRight size={16} className="ml-2" /></>}</Button>
          </form>
          <div className="mt-6 text-center text-sm text-zinc-500">Already have an account? <Link to="/login" className="font-medium text-emerald-300 hover:text-emerald-200">Sign in</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}
