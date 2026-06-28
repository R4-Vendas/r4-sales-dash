import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { T } from '../pages/Dashboard';

const KPI_LABELS = {
  leadsNovos: 'Leads Novos',
  abordagem: 'Abordagem',
  fup: 'FUP',
  emNegociacao: 'Em Negociação',
  fechados: 'Fechados',
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const today = () => new Date().toISOString().slice(0, 10);
const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDateBR = (s) => { if (!s) return ''; const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };

const startOfWeek = (date) => {
  const d = new Date(date);
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
};
const endOfWeek = (date) => {
  const s = new Date(startOfWeek(date));
  s.setDate(s.getDate() + 6);
  return s.toISOString().slice(0, 10);
};
const daysInRange = (start, end) => {
  const days = [], cur = new Date(start), last = new Date(end);
  while (cur <= last) { days.push(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1); }
  return days;
};
const weeksOfMonth = (year, month) => {
  const weeks = [];
  let cur = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  while (cur <= last) {
    const wStart = cur.toISOString().slice(0, 10);
    const wEnd = new Date(Math.min(new Date(endOfWeek(cur)).getTime(), last.getTime())).toISOString().slice(0, 10);
    weeks.push({ start: wStart, end: wEnd });
    cur = new Date(new Date(wEnd).getTime() + 86400000);
  }
  return weeks;
};

const normalizeKpi = (row) => ({
  date: row.data,
  leadsNovos: row.leads_novos || 0,
  abordagem: row.abordagem || 0,
  fup: row.fup || 0,
  emNegociacao: row.em_negociacao || 0,
  fechados: row.fechados || 0,
});

function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 24px', ...style }}>
      {children}
    </div>
  );
}
function Label({ children, color, style = {} }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: color || T.textSec, ...style }}>
      {children}
    </div>
  );
}
function Btn({ children, onClick, style = {}, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600, fontSize: 13, padding: '8px 18px',
        background: hov ? '#7B74FF' : T.accent, color: '#fff',
        opacity: disabled ? 0.5 : 1,
        boxShadow: hov && !disabled ? `0 0 0 3px ${T.accentDim}` : 'none',
        transition: 'all 0.15s', ...style,
      }}
    >
      {children}
    </button>
  );
}
function Toggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: T.bg, borderRadius: 7, padding: 3, gap: 2, border: `1px solid ${T.border}` }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              background: active ? T.surface : 'transparent',
              color: active ? T.text : T.textSec,
              border: active ? `1px solid ${T.border}` : '1px solid transparent',
              borderRadius: 5, padding: '4px 13px', fontSize: 12,
              fontWeight: active ? 600 : 400, cursor: 'pointer',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
function Section({ title, action, children, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {title}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.overlay, border: `1px solid ${T.borderMid}`, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
      <div style={{ color: T.textSec, fontSize: 11, marginBottom: 7, fontWeight: 600 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: T.textSec, fontSize: 12 }}>{p.name}</span>
          <span style={{ color: T.text, fontSize: 12, fontWeight: 600, marginLeft: 'auto', paddingLeft: 12 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ kpiKey, value, onChange, readOnly }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value));
  const inputRef = useRef();
  const color = T.kpi[kpiKey];

  useEffect(() => setLocal(String(value)), [value]);
  const commit = () => { setEditing(false); onChange(kpiKey, parseInt(local) || 0); };

  return (
    <div
      style={{
        background: T.surface, border: `1px solid ${T.border}`, borderTop: `2px solid ${color}`,
        borderRadius: 10, padding: '18px 20px', flex: 1, minWidth: 150,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <Label color={T.textSec}>{KPI_LABELS[kpiKey]}</Label>
      </div>
      <div
        onClick={() => { if (!readOnly) { setEditing(true); setTimeout(() => inputRef.current?.select(), 40); } }}
      >
        {editing && !readOnly ? (
          <input
            ref={inputRef} type="number" min={0} value={local}
            onChange={(e) => { setLocal(e.target.value); onChange(kpiKey, parseInt(e.target.value) || 0); }}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            style={{
              background: 'transparent', border: 'none', borderBottom: `1.5px solid ${color}`,
              color: T.text, fontSize: 30, fontWeight: 700, width: '100%', outline: 'none',
              padding: '0 0 2px', fontFamily: 'inherit',
            }}
          />
        ) : (
          <div style={{ fontSize: 30, fontWeight: 700, color: T.text, cursor: readOnly ? 'default' : 'text', lineHeight: 1.1 }}>
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricTile({ label, value, sub, color, progress }) {
  return (
    <Card style={{ flex: 1 }}>
      <Label style={{ marginBottom: 8 }}>{label}</Label>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || T.text, marginBottom: sub ? 4 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.textMuted }}>{sub}</div>}
      {progress !== undefined && (
        <div style={{ marginTop: 10, height: 3, background: T.border, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
        </div>
      )}
    </Card>
  );
}

export default function TabVisaoGeral({ kpis, leads, readOnly, viewLabel, saveDay, isOwnView }) {
  const normalizedKpis = kpis.map(normalizeKpi);
  const todayStr = today();
  const todayKpi = normalizedKpis.find((k) => k.date === todayStr) || {};

  const [current, setCurrent] = useState({
    leadsNovos: todayKpi.leadsNovos || 0,
    abordagem: todayKpi.abordagem || 0,
    fup: todayKpi.fup || 0,
    emNegociacao: todayKpi.emNegociacao || 0,
    fechados: todayKpi.fechados || 0,
  });

  useEffect(() => {
    const t = normalizedKpis.find((k) => k.date === todayStr);
    if (t) {
      setCurrent({
        leadsNovos: t.leadsNovos, abordagem: t.abordagem, fup: t.fup,
        emNegociacao: t.emNegociacao, fechados: t.fechados,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(normalizedKpis.find((k) => k.date === todayStr))]);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('semanal');
  const [linePeriod, setLinePeriod] = useState('semanal');
  const now = new Date();

  const handleChange = (k, v) => setCurrent((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await saveDay(current);
    setSaving(false);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const aggregate = (rows) =>
    rows.reduce(
      (a, k) => ({
        leadsNovos: a.leadsNovos + (k.leadsNovos || 0),
        abordagem: a.abordagem + (k.abordagem || 0),
        fup: a.fup + (k.fup || 0),
        emNegociacao: a.emNegociacao + (k.emNegociacao || 0),
        fechados: a.fechados + (k.fechados || 0),
      }),
      { leadsNovos: 0, abordagem: 0, fup:
