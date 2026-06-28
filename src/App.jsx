import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const { session, profile, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return <div style={{ color: 'white', padding: 40 }}>Carregando…</div>;
  }

  if (!session || !profile) {
    return <LoginPage />;
  }

  return <Dashboard profile={profile} isAdmin={isAdmin} onSignOut={signOut} />;
}
