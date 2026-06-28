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
    border: `1px solid ${focus === field ? T.borderMid : T.border}`,
    borderRadius: 8,
    color: T.text,
    fontSize: 14,
    padding: '11px 14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focus === field ? `0 0 0 3px ${T.accentDim}` : 'none',
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
          border: `1px solid ${T.
