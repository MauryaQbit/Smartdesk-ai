import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await register(form.name, form.email, form.password, form.role);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="card">
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password (min 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
        </select>
        {err && <p className="error">{err}</p>}
        <button type="submit">Register</button>
      </form>
      <p><Link to="/login">Back to login</Link></p>
    </div>
  );
}
