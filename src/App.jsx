import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

const T = {
  bg: '#08080E',
  text: '#8B8B9E',
};

export default function App() {
  const { session, profile, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.text,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
        }}
      >
        Carregando…
      </div>
    );
  }

  if (!session || !profile) {
    return <LoginPage />;
  }

  return <Dashboard profile={profile} isAdmin={isAdmin} onSignOut={signOut} />;
}
