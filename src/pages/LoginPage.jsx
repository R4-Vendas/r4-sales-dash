import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const T = {
  bg: '#08080E',
  surface: '#0F0F17',
  border: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.12)',
  text: '#EEEEF2',
  textSec: '#8B8B9E',
  textMuted: '#55556A',
  accent: '#635BFF',
  accentDim: 'rgba(99,91,255,0.12)',
  danger: '#EF4444',
};

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError('E-mail ou senha incorretos.');
    }
  };

  const inputStyle = (field) => ({
    background: T.bg,
    border: '1px solid ' + (focus === field ? T.borderMid : T.border),
    borderRadius: 8,
    color: T.text,
    fontSize: 14,
    padding: '11px 14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focus === field ? '0 0 0 3px ' + T.accentDim : 'none',
    fontFamily: 'inherit',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: T.surface,
          border: '1px solid ' + T.border,
          borderRadius: 14,
          padding: '36px 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              background: T.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            R4
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>Sales Dash</span>
        </div>

        <h1 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>
          Entrar
        </h1>
        <p style={{ fontSize: 13, color: T.textSec, margin: '0 0 24px' }}>
          Acesse com seu e-mail e senha
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: T.textSec, textTransform: 'uppercase' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocus('email')}
              onBlur={() => setFocus('')}
              required
              autoComplete="email"
              style={inputStyle('email')}
              placeholder="seu@email.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: T.textSec, textTransform: 'uppercase' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocus('password')}
              onBlur={() => setFocus('')}
              required
              autoComplete="current-password"
              style={inputStyle('password')}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ color: T.danger, fontSize: 12, marginTop: -4 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              background: T.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '11px 0',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
