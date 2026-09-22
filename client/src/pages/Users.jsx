import { useEffect, useState } from 'react';
import { Shield, Users as UsersIcon } from 'lucide-react';
import api from '../lib/api';
import { Card, CardHeader, CardContent, Button, Badge, Toast, Select } from '../components/ui';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState('');
  const load = async () => {
    const { data } = await api.get('/users');
    setUsers(data.data);
  };
  useEffect(()=>{ load(); }, []);
  const changeRole = async (id, role) => {
    await api.patch(`/users/${id}/role`, { role });
    setToast(`Role → ${role}`); setTimeout(()=>setToast(''),1500); load();
  };
  return (
    <div className="space-y-6">
      <Toast message={toast} />
      <Card>
        <CardHeader><h2 className="font-semibold flex items-center gap-2"><UsersIcon size={16}/> User Management <Badge tone="violet">admin</Badge></h2><p className="text-sm text-zinc-500">Promote customers to agents</p></CardHeader>
        <CardContent>
          <div className="rounded-xl border divide-y">
            {users.map(u=>(
              <div key={u._id} className="flex items-center justify-between p-3">
                <div><div className="font-medium text-sm">{u.name} <span className="text-zinc-500">{u.email}</span></div><div className="text-xs text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</div></div>
                <div className="flex items-center gap-2">
                  <Badge tone={u.role==='admin'?'violet':u.role==='agent'?'green':'zinc'}>{u.role}</Badge>
                  <Select value={u.role} onChange={e=>changeRole(u._id, e.target.value)}>
                    <option value="customer">customer</option><option value="agent">agent</option><option value="admin">admin</option>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
