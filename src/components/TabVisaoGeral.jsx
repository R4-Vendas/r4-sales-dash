import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { T } from '../lib/theme';

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
const formatDateBR = (s) => { if (!s) return ''; const parts = s.split('-'); return parts[2] + '/' + parts[1] + '/' + parts[0]; };

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
    <div style={Object.assign({ background: T.surface, border: '1px solid ' + T.border, borderRadius: 10, padding: '20px 24px' }, style)}>
      {children}
    </div>
  );
}
function Label({ children, color, style = {} }) {
  return (
    <div style={Object.assign({ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: color || T.textSec }, style)}>
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
      style={Object.assign({
        border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600, fontSize: 13, padding: '8px 18px',
        background: hov ? '#7B74FF' : T.accent, color: '#fff',
        opacity: disabled ? 0.5 : 1,
        boxShadow: hov && !disabled ? '0 0 0 3px ' + T.accentDim : 'none',
        transition: 'all 0.15s',
      }, style)}
    >
      {children}
    </button>
  );
}
function Toggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: T.bg, borderRadius: 7, padding: 3, gap: 2, border: '1px solid ' + T.border }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              background: active ? T.surface : 'transparent',
              color: active ? T.text : T.textSec,
              border: active ? '1px solid ' + T.border : '1px solid transparent',
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
    <div style={Object.assign({ display: 'flex', flexDirection: 'column', gap: 14 }, style)}>
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
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: T.overlay, border: '1px solid ' + T.borderMid, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
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
        background: T.surface, border: '1px solid ' + T.border, borderTop: '2px solid ' + color,
        borderRadius: 10, padding: '18px 20px', flex: 1, minWidth: 150,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <Label color={T.textSec}>{KPI_LABELS[kpiKey]}</Label>
      </div>
      <div
        onClick={() => { if (!readOnly) { setEditing(true); setTimeout(() => inputRef.current && inputRef.current.select(), 40); } }}
      >
        {editing && !readOnly ? (
          <input
            ref={inputRef} type="number" min={0} value={local}
            onChange={(e) => { setLocal(e.target.value); onChange(kpiKey, parseInt(e.target.value) || 0); }}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            style={{
              background: 'transparent', border: 'none', borderBottom: '1.5px solid ' + color,
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
          <div style={{ width: Math.min(100, progress) + '%', height: '100%', background: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
        </div>
      )}
    </Card>
  );
}

export default function TabVisaoGeral({ kpis, leads, readOnly, viewLabel, saveDay, isOwnView }) {
  const normalizedKpis = kpis.map(normalizeKpi);
  const todayStr = today();

  // Soma de TODOS os registros de hoje no conjunto recebido (cobre tanto
  // "Meus dados" -- 1 registro -- quanto "Consolidado"/"Vendedor X" -- N registros).
  const todayAggregate = normalizedKpis
    .filter((k) => k.date === todayStr)
    .reduce(
      (a, k) => ({
        leadsNovos: a.leadsNovos + (k.leadsNovos || 0),
        abordagem: a.abordagem + (k.abordagem || 0),
        fup: a.fup + (k.fup || 0),
        emNegociacao: a.emNegociacao + (k.emNegociacao || 0),
        fechados: a.fechados + (k.fechados || 0),
      }),
      { leadsNovos: 0, abordagem: 0, fup: 0, emNegociacao: 0, fechados: 0 }
    );

  // Estado local só é usado no modo editável ("Meus dados"). Em modo
  // readOnly, os cards exibem direto o todayAggregate recalculado a cada render.
  const [current, setCurrent] = useState(todayAggregate);

  useEffect(() => {
    setCurrent(todayAggregate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, viewLabel, JSON.stringify(todayAggregate)]);

  const displayValues = readOnly ? todayAggregate : current;

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('semanal');
  const [linePeriod, setLinePeriod] = useState('semanal');
  const now = new Date();

  const handleChange = (k, v) => setCurrent((p) => Object.assign({}, p, { [k]: v }));

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
      { leadsNovos: 0, abordagem: 0, fup: 0, emNegociacao: 0, fechados: 0 }
    );

  const totalLeadsCRM = leads.length;
  const fechadosCRM = leads.filter((l) => l.status === 'Fechado').length;
  const convLeads = totalLeadsCRM > 0 ? (fechadosCRM / totalLeadsCRM) * 100 : 0;

  const mStart = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01';
  const fatMes = leads
    .filter((l) => l.status === 'Fechado' && l.data_entrada >= mStart && l.data_entrada <= todayStr)
    .reduce((s, l) => s + (parseFloat(l.valor) || 0), 0);

  const buildChart = (period) => {
    if (period === 'semanal') {
      const sw = startOfWeek(now), ew = endOfWeek(now);
      return daysInRange(sw, ew).map((d) => {
        const rows = normalizedKpis.filter((x) => x.date === d);
        return Object.assign({ name: formatDateBR(d).slice(0, 5) }, aggregate(rows));
      });
    }
    return weeksOfMonth(now.getFullYear(), now.getMonth()).map((w, i) =>
      Object.assign({ name: 'Sem ' + (i + 1) }, aggregate(normalizedKpis.filter((k) => k.date >= w.start && k.date <= w.end)))
    );
  };

  const barData = buildChart(chartPeriod);
  const lineData = buildChart(linePeriod);

  const mKpis = normalizedKpis.filter((k) => k.date >= mStart && k.date <= todayStr);
  const pieAgg = aggregate(mKpis);
  const pieTotal = Object.values(pieAgg).reduce((s, v) => s + v, 0);
  const pieData = Object.entries(pieAgg).map(([k, v]) => ({
    name: KPI_LABELS[k], value: v, color: T.kpi[k],
    pct: pieTotal > 0 ? ((v / pieTotal) * 100).toFixed(1) : '0.0',
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {readOnly && (
        <div style={{ color: T.accent, fontSize: 12, fontWeight: 600 }}>
          Visualizando: {viewLabel} · somente leitura
        </div>
      )}

      <Section title={readOnly ? ('KPIs · ' + formatDateBR(todayStr)) : ('KPIs de hoje · ' + formatDateBR(todayStr))}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.keys(KPI_LABELS).map((k) => (
            <KpiCard key={k} kpiKey={k} value={displayValues[k]} onChange={handleChange} readOnly={readOnly} />
          ))}
        </div>

        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar dia'}</Btn>
            {toast && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: T.success, fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.success }} />
                KPIs salvos
              </div>
            )}
          </div>
        )}
      </Section>

      <Section title="Conversão e faturamento">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <MetricTile
            label="Leads → Fechado"
            value={convLeads.toFixed(1) + '%'}
            sub={fechadosCRM + ' fechados de ' + totalLeadsCRM + ' na base'}
            color={T.kpi.leadsNovos}
            progress={convLeads}
          />
          <MetricTile
            label="Faturamento do mês"
            value={formatBRL(fatMes)}
            sub={MONTH_NAMES[now.getMonth()] + ' ' + now.getFullYear() + ' · leads fechados'}
            color={T.success}
          />
        </div>
      </Section>

      <Section
        title="Volume por período"
        action={
          <Toggle
            options={[{ value: 'semanal', label: 'Semana' }, { value: 'mensal', label: 'Mês' }]}
            value={chartPeriod} onChange={setChartPeriod}
          />
        }
      >
        <Card style={{ padding: '20px 16px 8px' }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barGap={3} barCategoryGap="30%">
              <CartesianGrid stroke={T.border} strokeDasharray="0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 11, color: T.textSec }} iconType="circle" iconSize={6} />
              {Object.entries(KPI_LABELS).map(([k, label]) => (
                <Bar key={k} dataKey={k} name={label} fill={T.kpi[k]} radius={[3, 3, 0, 0]} maxBarSize={18} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
        <Section title={'Distribuição · ' + MONTH_NAMES[now.getMonth()]}>
          <Card style={{ padding: '16px 8px' }}>
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: T.overlay, border: '1px solid ' + T.borderMid, borderRadius: 8, padding: '8px 12px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                        <div style={{ color: d.color, fontWeight: 700, fontSize: 12 }}>{d.name}</div>
                        <div style={{ color: T.textSec, fontSize: 12 }}>{d.value} · {d.pct}%</div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: T.textSec }} iconType="circle" iconSize={6} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Section>

        <Section
          title="Evolução de performance"
          action={
            <Toggle
              options={[{ value: 'semanal', label: 'Semana' }, { value: 'mensal', label: 'Mês' }]}
              value={linePeriod} onChange={setLinePeriod}
            />
          }
        >
          <Card style={{ padding: '20px 16px 8px' }}>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={lineData}>
                <CartesianGrid stroke={T.border} strokeDasharray="0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 16, fontSize: 11, color: T.textSec }} iconType="circle" iconSize={6} />
                {Object.entries(KPI_LABELS).map(([k, label]) => (
                  <Line key={k} type="monotone" dataKey={k} name={label} stroke={T.kpi[k]} strokeWidth={1.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Section>
      </div>
    </div>
  );
}
