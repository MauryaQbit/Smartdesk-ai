import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Headset, Sparkles, LogOut, Users, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Badge } from './ui';
import NotificationBell from './NotificationBell';
import { BackgroundGradient } from './CoreLandingPages/StartupLandingPages/tsx/Goo';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const onLogout = async () => { await logout(); nav('/login'); };
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 relative">
      <BackgroundGradient />
      <header className="sticky top-0 z-40 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="h-9 w-9 grid place-items-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20"><Headset size={16} /></span>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight text-white">SmartDesk AI</div>
              <div className="text-xs text-zinc-500">Helpdesk · RAG · Realtime</div>
            </div>
            <Badge tone="violet" className="hidden sm:inline-flex ml-2"><Sparkles size={12} className="mr-1" /> Nexus Goo</Badge>
          </Link>
          <div className="flex items-center gap-2">
            <Link to={user?"/dashboard":"/"} className="text-sm px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl hidden sm:inline-flex">{user?'Dashboard':'Home'}</Link>
            {!user ? (
              <>
                <Link to="/login" className="text-sm px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl">Login</Link>
                <Link to="/register"><Button size="sm" className="bg-white text-black hover:bg-zinc-200">Create account</Button></Link>
              </>
            ) : (
              <>
                <NotificationBell />
                {user.role==='admin' && <Link to="/users" className="hidden sm:inline-flex items-center gap-1 text-sm px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl"><Users size={14}/> Users</Link>}
                <span className="hidden md:inline text-sm text-zinc-400">{user.name} <span className="text-zinc-600">· {user.role}</span></span>
                <Badge tone={user.role==='admin'?'violet':user.role==='agent'?'green':'zinc'}>{user.role}</Badge>
                <Button variant="secondary" size="sm" onClick={onLogout}><LogOut size={14} className="mr-1.5" /> Logout</Button>
              </>
            )}
            <button type="button" aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="sm:hidden h-9 w-9 grid place-items-center rounded-xl border border-white/10 bg-white/5 text-white">
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
        {menuOpen && <div className="sm:hidden border-t border-white/5 px-4 py-3 space-y-1">
          <Link onClick={() => setMenuOpen(false)} to={user ? '/dashboard' : '/'} className="block rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">{user ? 'Dashboard' : 'Home'}</Link>
          {user?.role === 'admin' && <Link onClick={() => setMenuOpen(false)} to="/users" className="block rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">Users</Link>}
          {!user && <Link onClick={() => setMenuOpen(false)} to="/login" className="block rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">Login</Link>}
          {user && <button type="button" onClick={onLogout} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/5">Log out</button>}
        </div>}
      </header>
      <main className="relative max-w-6xl mx-auto px-4 py-6 md:py-8">{children}</main>
      <footer className="relative max-w-6xl mx-auto px-4 py-8 text-xs text-zinc-500 flex flex-wrap gap-2 justify-between border-t border-white/5">
        <span>© SmartDesk AI — Goo UI · JWT httpOnly · Socket rooms · SLA 24h</span>
        <span className="text-zinc-600">Gemini 2.5 Flash · nomic-embed-text 768 · cosine</span>
      </footer>
    </div>
  );
}
