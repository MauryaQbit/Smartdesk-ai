import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, Button, Input, Select } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await register(form.name, form.email, form.password, form.role); nav('/'); } catch (e) { setErr(e.response?.data?.message || 'Register failed'); }
  };
  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-zinc-500">Join SmartDesk AI — choose role</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="Full name" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
            <Input placeholder="Email" type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
            <Input placeholder="Password (min 6)" type="password" required value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
            <Select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
            </Select>
            <div className="text-xs text-zinc-500">Admin can be created only once via role=admin (server guard).</div>
            {err && <div className="text-sm text-red-600 bg-red-50 border rounded-xl px-3 py-2">{err}</div>}
            <Button className="w-full">Create account</Button>
          </form>
          <div className="text-sm text-center mt-4"><Link to="/login" className="underline">Back to login</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}
