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

  try {
    return <Dashboard profile={profile} isAdmin={isAdmin} onSignOut={signOut} />;
  } catch (err) {
    return (
      <div style={{ color: 'red', padding: 40, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        ERRO NO DASHBOARD:
        {String(err.message)}
        {String(err.stack)}
      </div>
    );
  }
}
