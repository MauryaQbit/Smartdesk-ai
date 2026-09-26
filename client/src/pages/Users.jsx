import { useEffect, useState } from 'react';
import { AlertCircle, ShieldCheck, Users as UsersIcon } from 'lucide-react';
import api from '../lib/api';
import { Card, CardHeader, CardContent, Badge, Toast, Select, Skeleton } from '../components/ui';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try { const { data } = await api.get('/users'); setUsers(data.data); } catch { setError('We could not load the workspace members.'); }
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);
  const changeRole = async (id, role) => {
    try { await api.patch(`/users/${id}/role`, { role }); setToast(`Role updated to ${role}`); setTimeout(()=>setToast(''),1500); load(); } catch { setToast('Role update failed'); setTimeout(()=>setToast(''),2000); }
  };
  return (
    <div className="space-y-6">
      <Toast message={toast} />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">Workspace administration</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">User management</h1><p className="mt-2 text-sm text-zinc-400">Manage roles for the people who handle SmartDesk tickets.</p></div><Badge tone="violet"><ShieldCheck size={13} className="mr-1.5" /> Admin access</Badge></div>
      <Card>
        <CardHeader><h2 className="flex items-center gap-2 font-semibold text-white"><UsersIcon size={17} className="text-emerald-400" /> Workspace members <Badge tone="zinc">{users.length}</Badge></h2><p className="mt-1 text-sm text-zinc-500">Role changes apply to the next request.</p></CardHeader>
        <CardContent>
          {error ? <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{error}<button type="button" onClick={load} className="ml-2 font-medium underline">Try again</button></span></div> : loading ? <div className="space-y-3"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : users.length === 0 ? <div className="py-10 text-center text-sm text-zinc-500">No workspace members found.</div> : <div className="divide-y divide-white/10 rounded-2xl border border-white/10">
            {users.map(u=>(
              <div key={u._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-sm font-medium text-emerald-200">{u.name?.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><div className="truncate text-sm font-medium text-zinc-200">{u.name}</div><div className="truncate text-xs text-zinc-500">{u.email} · joined {new Date(u.createdAt).toLocaleDateString()}</div></div></div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <Badge tone={u.role==='admin'?'violet':u.role==='agent'?'green':'zinc'}>{u.role}</Badge>
                  <Select aria-label={`Change role for ${u.name}`} value={u.role} onChange={e=>changeRole(u._id, e.target.value)}>
                    <option value="customer">customer</option><option value="agent">agent</option><option value="admin">admin</option>
                  </Select>
                </div>
              </div>
            ))}
          </div>}
        </CardContent>
      </Card>
    </div>
  );
}
