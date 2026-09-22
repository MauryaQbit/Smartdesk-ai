import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
const Login = lazy(()=>import('./pages/Login'));
const Register = lazy(()=>import('./pages/Register'));
const Dashboard = lazy(()=>import('./pages/Dashboard'));
const TicketDetail = lazy(()=>import('./pages/TicketDetail'));
const Users = lazy(()=>import('./pages/Users'));

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-zinc-500">Loading…</div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
}
function PublicLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-10 text-sm text-zinc-500">Loading…</div>}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
              <Route path="/" element={<Guard><Dashboard /></Guard>} />
              <Route path="/tickets/:id" element={<Guard><TicketDetail /></Guard>} />
              <Route path="/users" element={<Guard><Users /></Guard>} />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}
