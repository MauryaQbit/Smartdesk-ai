import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../lib/api';

export default function NotificationBell() {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const load = async () => {
    try { const { data } = await api.get('/notifications'); setNotifs(data.data); setUnread(data.unread); } catch {}
  };
  useEffect(()=>{ load(); const id=setInterval(load, 10000); return ()=>clearInterval(id); }, []);
  const markAll = async () => { await api.post('/notifications/read-all'); load(); };
  return (
    <div className="relative">
      <button onClick={()=>setOpen(!open)} className="relative h-9 w-9 grid place-items-center rounded-xl border bg-white hover:bg-zinc-50">
        <Bell size={16} />
        {unread>0 && <span className="absolute -top-1 -right-1 h-5 min-w-5 grid place-items-center rounded-full bg-red-600 text-white text-xs px-1">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border bg-white shadow-xl z-50 overflow-hidden">
          <div className="p-3 flex justify-between items-center border-b"><span className="font-medium text-sm">Notifications</span><button onClick={markAll} className="text-xs text-blue-600">Mark all read</button></div>
          <div className="max-h-80 overflow-auto divide-y">
            {notifs.length===0 ? <div className="p-6 text-sm text-zinc-500 text-center">No notifications</div> : notifs.map(n=>(
              <div key={n._id} className={`p-3 text-sm ${n.read?'opacity-60':''}`}>
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-zinc-500">{n.type} · {new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
