import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Badge } from './ui';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const onLogout = async () => { await logout(); nav('/login'); };
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="h-7 w-7 grid place-items-center rounded-lg bg-zinc-900 text-white text-sm">S</span>
            SmartDesk AI
            <Badge tone="blue" className="ml-2">MERN + RAG</Badge>
          </Link>
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="text-sm">Login</Link>
                <Link to="/register"><Button size="sm">Create account</Button></Link>
              </>
            ) : (
              <>
                <span className="hidden sm:inline text-sm text-zinc-600">{user.name} <span className="text-zinc-400">· {user.role}</span></span>
                <Badge tone={user.role==='admin'?'blue':user.role==='agent'?'green':'zinc'}>{user.role}</Badge>
                <Button variant="secondary" size="sm" onClick={onLogout}>Logout</Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-zinc-500">Built for placement · JWT httpOnly · Socket rooms · RAG strict context · SLA 24h</footer>
    </div>
  );
}
