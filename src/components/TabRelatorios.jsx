import { useState } from 'react';
import { T } from '../lib/theme';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const KPI_DOT = {
  leadsNovos: T.kpi.leadsNovos,
  abordagem: T.kpi.abordagem,
  fup: T.kpi.fup,
  emNegociacao: T.kpi.emNegociacao,
  fechados: T.kpi.fechados,
};

function Card({ children, style = {} }) {
  return <div style={Object.assign({ background: T.surface, border: '1px solid ' + T.border, borderRadius: 10, padding: '20px 24px' }, style)}>{children}</div>;
}
function Label({ children, style = {} }) {
  return <div style={Object.assign({ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textSec }, style)}>{children}</div>;
}
function Section({ title, subtitle, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</span>
        {subtitle && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function MonthReport({ report }) {
  const { leadsNovos, abordagem, fup, emNegociacao, fechados, convLeadsCRM, totalCRM, fat, month, year } = report;
  const rows = [
    { key: 'leadsNovos', n: leadsNovos, label: 'Leads novos' },
    { key: 'abordagem', n: abordagem, label: 'Abordagens' },
    { key: 'fup', n: fup, label: 'FUPs realizados' },
    { key: 'emNegociacao', n: emNegociacao, label: 'Em negociação' },
    { key: 'fechados', n: fechados, label: 'Vendas fechadas' },
  ];
  return (
    <Card>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{MONTH_NAMES[parseInt(month) - 1]} {year}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {rows.map((r, i) => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid ' + T.border : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: KPI_DOT[r.key], flexShrink: 0 }} />
              <span style={{ color: T.textSec, fontSize: 13 }}>{r.label}</span>
            </div>
            <span style={{ color: T.text, fontWeight: 700, fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>{r.n}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
        {[
          { label: 'Leads → Fechado', value: (convLeadsCRM || 0).toFixed(1) + '%', sub: fechados + ' fechados de ' + totalCRM + ' na base', color: T.kpi.leadsNovos },
          { label: 'Faturamento', value: formatBRL(fat), sub: 'leads com status Fechado', color: T.success },
        ].map((m) => (
          <div key={m.label} style={{ background: m.color + '10', border: '1px solid ' + m.color + '20', borderRadius: 8, padding: '12px 14px' }}>
            <Label style={{ marginBottom: 6 }}>{m.label}</Label>
            <div style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</div>
            {m.sub && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 3 }}>{m.sub}</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function GeralReport({ kpis, leads, vendedores }) {
  const aggTotal = kpis.reduce(
    (a, k) => ({
      leadsNovos: a.leadsNovos + (k.leads_novos || 0),
      abordagem: a.abordagem + (k.abordagem || 0),
      fup: a.fup + (k.fup || 0),
      emNegociacao: a.emNegociacao + (k.em_negociacao || 0),
      fechados: a.fechados + (k.fechados || 0),
    }),
    { leadsNovos: 0, abordagem: 0, fup: 0, emNegociacao: 0, fechados: 0 }
  );

  const totalLeads = leads.length;
  const totalFechados = leads.filter((l) => l.status === 'Fechado').length;
  const convGeral = totalLeads > 0 ? (totalFechados / totalLeads) * 100 : 0;
  const fatTotal = leads.filter((l) => l.status === 'Fechado').reduce((s, l) => s + (parseFloat(l.valor) || 0), 0);

  const rows = [
    { key: 'leadsNovos', n: aggTotal.leadsNovos, label: 'Leads novos' },
    { key: 'abordagem', n: aggTotal.abordagem, label: 'Abordagens' },
    { key: 'fup', n: aggTotal.fup, label: 'FUPs realizados' },
    { key: 'emNegociacao', n: aggTotal.emNegociacao, label: 'Em negociação' },
    { key: 'fechados', n: aggTotal.fechados, label: 'Vendas fechadas' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 20 }}>Totais acumulados — toda a equipe</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {rows.map((r, i) => (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid ' + T.border : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: KPI_DOT[r.key], flexShrink: 0 }} />
                <span style={{ color: T.textSec, fontSize: 13 }}>{r.label}</span>
              </div>
              <span style={{ color: T.text, fontWeight: 700, fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>{r.n}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
          {[
            { label: 'Conversão geral', value: convGeral.toFixed(1) + '%', sub: totalFechados + ' fechados de ' + totalLeads + ' na base', color: T.kpi.leadsNovos },
            { label: 'Faturamento total', value: formatBRL(fatTotal), sub: 'todos os leads fechados', color: T.success },
          ].map((m) => (
            <div key={m.label} style={{ background: m.color + '10', border: '1px solid ' + m.color + '20', borderRadius: 8, padding: '12px 14px' }}>
              <Label style={{ marginBottom: 6 }}>{m.label}</Label>
              <div style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</div>
              {m.sub && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 3 }}>{m.sub}</div>}
            </div>
          ))}
        </div>
      </Card>

      {vendedores && vendedores.length > 0 && (
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 20 }}>Por vendedor</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {vendedores.map((v) => {
              const vKpis = kpis.filter((k) => k.user_id === v.id);
              const vLeads = leads.filter((l) => l.user_id === v.id);
              const vAgg = vKpis.reduce(
                (a, k) => ({
                  leadsNovos: a.leadsNovos + (k.leads_novos || 0),
                  fechados: a.fechados + (k.fechados || 0),
                }),
                { leadsNovos: 0, fechados: 0 }
              );
              const vFechados = vLeads.filter((l) => l.status === 'Fechado').length;
              const vFat = vLeads.filter((l) => l.status === 'Fechado').reduce((s, l) => s + (parseFloat(l.valor) || 0), 0);
              const vConv = vLeads.length > 0 ? (vFechados / vLeads.length) * 100 : 0;
              return (
                <div key={v.id} style={{ border: '1px solid ' + T.border, borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>{v.nome}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Leads novos', value: vAgg.leadsNovos, color: T.kpi.leadsNovos },
                      { label: 'Fechados (KPI)', value: vAgg.fechados, color: T.kpi.fechados },
                      { label: 'Conversão CRM', value: vConv.toFixed(1) + '%', color: T.kpi.leadsNovos },
                      { label: 'Faturamento', value: formatBRL(vFat), color: T.success },
                    ].map((item) => (
                      <div key={item.label} style={{ background: T.bg, borderRadius: 6, padding: '10px 12px' }}>
                        <Label style={{ marginBottom: 4 }}>{item.label}</Label>
                        <div style={{ color: item.color, fontSize: 15, fontWeight: 700 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function TabRelatorios({ kpis, leads, viewLabel, isAdmin, isTeamView, vendedores, teamKpis, teamLeads }) {
  const [aba, setAba] = useState('mensal');
  const [selected, setSelected] = useState(null);

  const monthMap = {};
  kpis.forEach((k) => {
    const mk = k.data.slice(0, 7);
    if (!monthMap[mk]) monthMap[mk] = [];
    monthMap[mk].push(k);
  });
  const months = Object.keys(monthMap).sort().reverse();

  const getReport = (mk) => {
    const parts = mk.split('-');
    const y = parts[0], m = parts[1];
    const agg = (monthMap[mk] || []).reduce(
      (a, k) => ({
        leadsNovos: a.leadsNovos + (k.leads_novos || 0),
        abordagem: a.abordagem + (k.abordagem || 0),
        fup: a.fup + (k.fup || 0),
        emNegociacao: a.emNegociacao + (k.em_negociacao || 0),
        fechados: a.fechados + (k.fechados || 0),
      }),
      { leadsNovos: 0, abordagem: 0, fup: 0, emNegociacao: 0, fechados: 0 }
    );
    const mStart = y + '-' + m + '-01';
    const mEnd = new Date(parseInt(y), parseInt(m), 0).toISOString().slice(0, 10);
    const leadsDoMes = leads.filter((l) => l.data_entrada >= mStart && l.data_entrada <= mEnd);
    const totalCRM = leadsDoMes.length;
    const fechadosMes = leadsDoMes.filter((l) => l.status === 'Fechado').length;
    const convLeadsCRM = totalCRM > 0 ? (fechadosMes / totalCRM) * 100 : 0;
    const fat = leadsDoMes.filter((l) => l.status === 'Fechado').reduce((s, l) => s + (parseFloat(l.valor) || 0), 0);
    return Object.assign({}, agg, { convLeadsCRM, totalCRM, fat, month: m, year: y });
  };

  const showGeral = isAdmin && isTeamView;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setAba('mensal')}
          style={{
            background: aba === 'mensal' ? T.accentDim : 'transparent',
            border: '1px solid ' + (aba === 'mensal' ? T.accent + '50' : T.border),
            borderRadius: 7, padding: '8px 18px',
            color: aba === 'mensal' ? T.accent : T.textSec,
            fontSize: 13, fontWeight: aba === 'mensal' ? 700 : 400,
            cursor: 'pointer',
          }}
        >
          Histórico Mensal
        </button>
        {showGeral && (
          <button
            onClick={() => setAba('geral')}
            style={{
              background: aba === 'geral' ? T.accentDim : 'transparent',
              border: '1px solid ' + (aba === 'geral' ? T.accent + '50' : T.border),
              borderRadius: 7, padding: '8px 18px',
              color: aba === 'geral' ? T.accent : T.textSec,
              fontSize: 13, fontWeight: aba === 'geral' ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            Geral
          </button>
        )}
      </div>

      {aba === 'mensal' && (
        <Section title="Histórico mensal" subtitle={viewLabel ? ('Visualizando: ' + viewLabel) : undefined}>
          {months.length === 0 ? (
            <Card>
              <div style={{ padding: '48px 0', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
                Nenhum dado ainda. Registre os KPIs diários na aba Visão Geral.
              </div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {months.map((mk) => {
                  const parts = mk.split('-');
                  const y = parts[0], m = parts[1];
                  const active = selected === mk;
                  return (
                    <button
                      key={mk}
                      onClick={() => setSelected(mk)}
                      style={{
                        background: active ? T.accentDim : 'transparent',
                        border: '1px solid ' + (active ? T.accent + '50' : T.border),
                        borderRadius: 7, padding: '9px 14px',
                        color: active ? T.accent : T.textSec,
                        fontSize: 13, fontWeight: active ? 700 : 400,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      {MONTH_NAMES[parseInt(m) - 1]} {y}
                    </button>
                  );
                })}
              </div>
              <div>
                {selected ? (
                  <MonthReport report={getReport(selected)} />
                ) : (
                  <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
                    <div style={{ color: T.textMuted, fontSize: 13 }}>← Selecione um mês</div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </Section>
      )}

      {aba === 'geral' && showGeral && (
        <Section title="Geral" subtitle="Soma acumulada de todos os períodos — toda a equipe">
          <GeralReport
            kpis={teamKpis || []}
            leads={teamLeads || []}
            vendedores={vendedores || []}
          />
        </Section>
      )}
    </div>
  );
}
