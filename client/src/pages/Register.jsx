import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, Button, Input, Select } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await register(form.name, form.email, form.password, form.role); nav('/dashboard'); } catch (e) { setErr(e.response?.data?.message || 'Register failed'); }
  };
  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="hidden md:flex flex-col justify-center rounded-2xl bg-white border p-8">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-zinc-900 text-white"><UserPlus size={18} /></div>
        <h1 className="text-3xl font-semibold mt-4 leading-tight">Create your<br/>workspace.</h1>
        <p className="text-sm text-zinc-600 mt-3">Role-based access, live tickets, and AI that cites its sources.</p>
        <ul className="mt-6 space-y-2 text-sm text-zinc-600 list-disc list-inside">
          <li>Customer, Agent, Admin</li>
          <li>JWT httpOnly + RBAC</li>
          <li>Recharts + SLA cron</li>
        </ul>
      </motion.div>
      <Card className="h-fit">
        <CardHeader>
          <h2 className="text-xl font-semibold">Create account</h2>
          <p className="text-sm text-zinc-500">Choose a role — admin limited to first user</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><Input className="pl-9" placeholder="Full name" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></div>
            <div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><Input className="pl-9" placeholder="Email" type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></div>
            <div className="relative"><Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><Input className="pl-9" placeholder="Password (min 6)" type="password" required value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} /></div>
            <Select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
            </Select>
            {err && <div className="text-sm text-red-600 bg-red-50 border rounded-xl px-3 py-2">{err}</div>}
            <Button className="w-full">Create account</Button>
          </form>
          <div className="text-sm text-center mt-4"><Link to="/login" className="underline">Back to login</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}
