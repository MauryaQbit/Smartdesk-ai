import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, Button, Input } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try { await login(form.email, form.password); nav('/'); } catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-zinc-500">Sign in to SmartDesk AI</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <Input placeholder="Email" type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
            <Input placeholder="Password" type="password" required value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</div>}
            <Button className="w-full" disabled={loading}>{loading?'Signing in…':'Login'}</Button>
          </form>
          <div className="text-sm text-center mt-4 text-zinc-600">No account? <Link to="/register" className="text-zinc-900 underline">Create one</Link></div>
          <div className="mt-4 rounded-xl bg-zinc-50 border p-3 text-xs text-zinc-600">
            <div className="font-medium mb-1">Demo accounts</div>
            <div>Admin: admin@test.com / admin123</div>
            <div>Customer: any registered email</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
