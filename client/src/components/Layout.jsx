import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BookOpen, BrainCircuit, Headset, LayoutDashboard, LogOut, Menu, Plus, Ticket, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Badge } from './ui';
import NotificationBell from './NotificationBell';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const onLogout = async () => { await logout(); nav('/login'); };
  const isApp = Boolean(user);
  const role = user?.role;
  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['customer', 'agent', 'admin'] },
    { label: 'Tickets', to: '/tickets', icon: Ticket, roles: ['customer', 'agent', 'admin'] },
    { label: 'AI Assistant', to: '/ai-assistant', icon: BrainCircuit, roles: ['customer', 'agent', 'admin'] },
    { label: 'Knowledge Base', to: '/knowledge-base', icon: BookOpen, roles: ['agent', 'admin'] },
    { label: 'Users', to: '/users', icon: Users, roles: ['admin'] },
  ].filter((item) => item.roles.includes(role));
  const closeMenu = () => setMenuOpen(false);
  const pageTitle = location.pathname === '/users' ? 'User management' : location.pathname === '/tickets' ? 'Tickets' : location.pathname === '/knowledge-base' ? 'Knowledge Base' : location.pathname === '/ai-assistant' ? 'AI Assistant' : location.hash === '#tickets' ? 'Tickets' : location.hash === '#knowledge-base' ? 'Knowledge Base' : 'Dashboard';
  const isActive = (to) => {
    if (to === '/dashboard') return location.pathname === '/dashboard' && !location.hash;
    if (to.includes('#')) return location.pathname === '/dashboard' && location.hash === to.slice(to.indexOf('#'));
    if (to === '/ai-assistant') return location.pathname === '/ai-assistant';
    return location.pathname === to;
  };
  const navLink = (item, mobile = false) => {
    const Icon = item.icon;
    return <Link key={item.label} to={item.to} onClick={mobile ? closeMenu : undefined} className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${isActive(item.to) ? 'border-emerald-200/10 bg-emerald-300/10 text-emerald-200' : 'border-transparent text-zinc-400 hover:bg-white/[0.05] hover:text-white'}`}>
      <Icon size={17} className={isActive(item.to) ? 'text-emerald-200' : 'text-zinc-500 group-hover:text-zinc-300'} />
      <span>{item.label}</span>
    </Link>;
  };

  if (isApp) return (
    <div className="app-surface min-h-screen text-zinc-200">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-white/[0.09] bg-[#111b19]/95 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
        <Link to="/dashboard" className="flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#b9f4d5] text-[#10201a] shadow-lg shadow-emerald-950/30"><Headset size={19} /></span>
          <span className="leading-tight"><span className="block font-semibold tracking-tight text-white">SmartDesk AI</span><span className="block text-xs text-zinc-500">Support operations</span></span>
        </Link>
        <div className="mt-10 flex items-center justify-between px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600"><span>Workspace</span><span className="text-emerald-300">{role}</span></div>
        <nav className="mt-3 space-y-1">{navItems.map((item) => navLink(item))}</nav>
        <div className="mt-auto space-y-4">
          <Link to="/dashboard#create-ticket" className="flex items-center justify-center gap-2 rounded-xl bg-[#b9f4d5] px-3 py-2.5 text-sm font-medium text-[#10201a] transition hover:bg-[#d4f9e4]"><Plus size={16} /> Create ticket</Link>
          <div className="border-t border-white/[0.09] pt-4">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-300/15 text-sm font-medium text-emerald-100">{user.name?.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm text-white">{user.name}</span><span className="block truncate text-xs text-zinc-500">{user.email}</span></span></div>
            <Button variant="ghost" size="sm" onClick={onLogout} className="mt-2 w-full justify-start"><LogOut size={14} className="mr-2" /> Sign out</Button>
          </div>
        </div>
      </aside>

      {menuOpen && <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeMenu} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.09] bg-[#111b19] px-4 py-5 transition-transform lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between"><Link to="/dashboard" onClick={closeMenu} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#b9f4d5] text-[#10201a]"><Headset size={19} /></span><span className="font-semibold text-white">SmartDesk AI</span></Link><button type="button" aria-label="Close navigation" onClick={closeMenu} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-300"><X size={17} /></button></div>
        <nav className="mt-10 space-y-1">{navItems.map((item) => navLink(item, true))}</nav>
        <Link to="/dashboard#create-ticket" onClick={closeMenu} className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-[#b9f4d5] px-3 py-2.5 text-sm font-medium text-[#10201a]"><Plus size={16} /> Create ticket</Link>
        <Button variant="ghost" size="sm" onClick={onLogout} className="mt-auto w-full justify-start"><LogOut size={14} className="mr-2" /> Sign out</Button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/[0.09] bg-[#101917]/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3"><button type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-300 lg:hidden"><Menu size={17} /></button><div><p className="text-sm font-medium text-white">{pageTitle}</p><p className="hidden text-xs text-zinc-500 sm:block">Keep support moving with less noise.</p></div></div>
            <div className="flex items-center gap-2"><NotificationBell /><Badge tone={role === 'admin' ? 'violet' : role === 'agent' ? 'green' : 'blue'} className="hidden sm:inline-flex">{role}</Badge><span className="hidden text-sm text-zinc-400 md:inline">{user.name}</span></div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );

  return (
    <div className="public-surface relative min-h-screen text-zinc-200">
      <header className="sticky top-0 z-40 border-b border-white/[0.09] bg-[#101917]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#b9f4d5] text-[#10201a] shadow-lg shadow-emerald-950/30"><Headset size={16} /></span>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight text-white">SmartDesk AI</div>
              <div className="text-xs text-zinc-500">AI support workspace</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to={user?"/dashboard":"/"} className="text-sm px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl hidden sm:inline-flex">{user?'Dashboard':'Home'}</Link>
            {!user ? (
              <>
                <Link to="/login" className="text-sm px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl">Login</Link>
                <Link to="/register"><Button size="sm">Create account</Button></Link>
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
      <main className="relative mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>
      <footer className="relative mx-auto flex max-w-6xl flex-wrap justify-between gap-2 border-t border-white/10 px-4 py-8 text-xs text-zinc-500">
        <span>© SmartDesk AI · secure support operations</span>
        <span className="text-zinc-600">AI triage · RAG assistance · live ticket chat</span>
      </footer>
    </div>
  );
}
