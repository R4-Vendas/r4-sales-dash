import { Component } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: 'red', padding: 40, fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 13 }}>
          ERRO CAPTURADO:{'\n'}
          {String(this.state.error.message)}
          {'\n\n'}
          {String(this.state.error.stack)}
        </div>
      );
    }
    return this.props.children;
  }
}

function Inner() {
  const { session, profile, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return <div style={{ color: 'white', padding: 40 }}>Carregando…</div>;
  }

  if (!session || !profile) {
    return <LoginPage />;
  }

  return <Dashboard profile={profile} isAdmin={isAdmin} onSignOut={signOut} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Inner />
    </ErrorBoundary>
  );
}
