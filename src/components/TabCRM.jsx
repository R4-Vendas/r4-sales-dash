import { useState } from 'react';
import { T } from '../pages/Dashboard';

const STATUS_COLORS = {
  'Em Negociação': T.kpi.leadsNovos,
  FUP: T.warning,
  Fechado: T.success,
  Perdido: T.danger,
};

const STATUS_OPTS = [
  { value: '', label: 'Selecione' },
  { value: 'Em Negociação', label: 'Em Negociação' },
  { value: 'FUP', label: 'FUP' },
  { value: 'Fechado', label: 'Fechado' },
  { value: 'Perdido', label: 'Perdido' },
];

const EMPTY = { nome: '', email: '', telefone: '', status: '', dataEntrada: '', negocio: '', valor: '' };

const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDateBR = (s) => { if (!s) return ''; const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };

const validateLead = (l) => {
  const e = {};
  if (!l.nome.trim()) e.nome = 'Obrigatório';
  if (!l.email.trim()) e.email = 'Obrigatório';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email)) e.email = 'E-mail inválido';
  if (!l.telefone.trim()) e.telefone = 'Obrigatório';
  if (!l.status) e.status = 'Obrigatório';
  if (!l.dataEntrada) e.dataEntrada = 'Obrigatório';
  if (!l.negocio.trim()) e.negocio = 'Obrigatório';
  if (!l.valor || isNaN(parseFloat(l.valor))) e.valor = 'Valor numérico obrigatório';
  return e;
};

const toFormShape = (row) => ({
  id: row.id,
  nome: row.nome,
  email: row.email,
  telefone: row.telefone,
  status: row.status,
  dataEntrada: row.data_entrada,
  negocio: row.negocio,
  valor: String(row.valor),
});

function Card({ children, style = {} }) {
  return <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 24px', ...style }}>{children}</div>;
}
function Label({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textSec }}>{children}</div>;
}
function Btn({ children, onClick, variant = 'primary', style = {}, small = false }) {
  const [hov, setHov] = useState(false);
  const variants = {
    primary: { background: hov ? '#7B74FF' : T.accent, color: '#fff' },
    danger: { background: hov ? '#ff6b6b' : T.danger, color: '#fff' },
    ghost: { background: 'transparent', color: hov ? T.text : T.textSec, border: `1px solid ${hov ? T.borderMid : T.border}` },
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: small ? 12 : 13, padding: small ? '5px 12px' : '8px 18px', transition: 'all 0.15s', ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
function Pill({ status }) {
  const color = STATUS_COLORS[status] || T.textSec;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '18', border: `1px solid ${color}30`, borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 600, color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {status}
    </span>
  );
}
function Input({ label, value, onChange, type = 'text', placeholder = '', error = '', style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && <Label>{label}</Label>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          background: T.bg, border: `1px solid ${error ? T.danger : focus ? T.borderMid : T.border}`, borderRadius: 6,
          color: T.text, fontSize: 13, padding: '8px 11px', outline: 'none', width: '100%', boxSizing: 'border-box',
          boxShadow: focus ? `0 0 0 3px ${error ? T.danger + '20' : T.accentDim}` : 'none',
        }}
      />
      {error && <span style={{ color: T.danger, fontSize: 11 }}>{error}</span>}
    </div>
  );
}
function Select({ label, value, onChange, options, error = '', style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && <Label>{label}</Label>}
      <select
        value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          background: T.bg, border: `1px solid ${error ? T.danger : focus ? T.borderMid : T.border}`, borderRadius: 6,
          color: value ? T.text : T.textSec, fontSize: 13, padding: '8px 11px', outline: 'none', width: '100%',
          boxSizing: 'border-box', cursor: 'pointer', boxShadow: focus ? `0 0 0 3px
