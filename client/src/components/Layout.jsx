import { Link, useNavigate } from 'react-router-dom';
import { Headset, Sparkles, LogOut, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Badge } from './ui';
import NotificationBell from './NotificationBell';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const onLogout = async () => { await logout(); nav('/login'); };
  return (
    <div className="min-h-screen bg-grid">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="h-9 w-9 grid place-items-center rounded-xl bg-zinc-900 text-white"><Headset size={16} /></span>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">SmartDesk AI</div>
              <div className="text-xs text-zinc-500">Helpdesk · RAG · Realtime</div>
            </div>
            <Badge tone="violet" className="hidden sm:inline-flex ml-2"><Sparkles size={12} className="mr-1" /> MERN + Gemini</Badge>
          </Link>
          <div className="flex items-center gap-2">
            <Link to={user?"/dashboard":"/"} className="text-sm px-3 py-2 hover:bg-zinc-100 rounded-xl hidden sm:inline-flex">{user?'Dashboard':'Home'}</Link>
            {!user ? (
              <>
                <Link to="/login" className="text-sm px-3 py-2 hover:bg-zinc-100 rounded-xl">Login</Link>
                <Link to="/register"><Button size="sm">Create account</Button></Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-sm px-3 py-2 hover:bg-zinc-100 rounded-xl hidden sm:inline-flex">Dashboard</Link>
                <NotificationBell />
                {user.role==='admin' && <Link to="/users" className="hidden sm:inline-flex items-center gap-1 text-sm px-3 py-2 hover:bg-zinc-100 rounded-xl"><Users size={14}/> Users</Link>}
                <span className="hidden md:inline text-sm text-zinc-600">{user.name} <span className="text-zinc-400">· {user.role}</span></span>
                <Badge tone={user.role==='admin'?'violet':user.role==='agent'?'green':'zinc'}>{user.role}</Badge>
                <Button variant="secondary" size="sm" onClick={onLogout}><LogOut size={14} className="mr-1.5" /> Logout</Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">{children}</main>
      <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-zinc-500 flex flex-wrap gap-2 justify-between">
        <span>© SmartDesk AI — built for placement · JWT httpOnly · Socket rooms · SLA 24h</span>
        <span className="text-zinc-400">Gemini 2.5 Flash · nomic-embed-text 768 · cosine</span>
      </footer>
    </div>
  );
}
