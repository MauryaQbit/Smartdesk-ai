import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';

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
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/" element={<Guard><Dashboard /></Guard>} />
          <Route path="/tickets/:id" element={<Guard><TicketDetail /></Guard>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
