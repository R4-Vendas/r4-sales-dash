import { useState } from 'react';
import { useKpis, useTeamKpis } from '../hooks/useKpis';
import { useLeads, useTeamLeads } from '../hooks/useLeads';
import TabVisaoGeral from '../components/TabVisaoGeral';
import TabCRM from '../components/TabCRM';
import TabRelatorios from '../components/TabRelatorios';
import { T } from '../lib/theme';

const today = () => new Date().toISOString().slice(0, 10);
const formatDateBR = (s) => {
  if (!s) return '';
  const parts = s.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
};

export default function Dashboard({ profile, isAdmin, onSignOut }) {
  const [tab, setTab] = useState('visao');
  const [viewMode, setViewMode] = useState('mine');

  const ownKpis = useKpis(profile.id);
  const ownLeads = useLeads(profile.id);
  const teamKpisHook = useTeamKpis(isAdmin);
  const teamLeadsHook = useTeamLeads(isAdmin);

  const NAV = [
    { key: 'visao', label: 'Visão Geral' },
    { key: 'crm', label: 'CRM' },
    { key: 'relatorios', label: 'Relatórios' },
  ];

  const getDisplayData = () => {
    if (viewMode === 'mine') {
      return { kpis: ownKpis.kpis, leads: ownLeads.leads, readOnly: false, label: profile.nome };
    }
    if (viewMode === 'team') {
      return {
        kpis: teamKpisHook.teamKpis,
        leads: teamLeadsHook.teamLeads,
        readOnly: true,
        label: 'Consolidado da equipe',
      };
    }
    const vendedor = teamKpisHook.vendedores.find((v) => v.id === viewMode);
    return {
      kpis: teamKpisHook.teamKpis.filter((k) => k.user_id === viewMode),
      leads: teamLeadsHook.teamLeads.filter((l) => l.user_id === viewMode),
      readOnly: true,
      label: vendedor ? vendedor.nome : 'Vendedor',
    };
  };

  const display = getDisplayData();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.text,
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <header
        style={{
          height: 52,
          borderBottom: '1px solid ' + T.border,
          background: T.surface,
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          gap: 24,
          position: 'sticky',
          top: 0,
          zIndex: 200,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: T.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            R4
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Sales</span>
        </div>

        <nav style={{ display: 'flex', gap: 2 }}>
          {NAV.map((n) => {
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 5,
                  color: active ? T.text : T.textSec,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  padding: '5px 11px',
                  position: 'relative',
                }}
              >
                {n.label}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: 1,
                      background: T.accent,
                      borderRadius: 1,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {isAdmin && (
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              background: T.bg,
              border: '1px solid ' + T.border,
              borderRadius: 6,
              color: T.text,
              fontSize: 12,
              padding: '5px 10px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="mine">Meus dados</option>
            <option value="team">Consolidado da equipe</option>
            {teamKpisHook.vendedores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </select>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: T.textMuted, fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
            {formatDateBR(today())}
          </span>
          <span style={{ color: T.textSec, fontSize: 12 }}>{profile.nome}</span>
          <button
            onClick={onSignOut}
            style={{
              background: 'transparent',
              border: '1px solid ' + T.border,
              borderRadius: 6,
              color: T.textSec,
              fontSize: 12,
              padding: '5px 12px',
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1380, margin: '0 auto', padding: '36px 28px' }}>
        {tab === 'visao' && (
          <TabVisaoGeral
            kpis={display.kpis}
            leads={display.leads}
            readOnly={display.readOnly}
            viewLabel={display.label}
            saveDay={ownKpis.saveDay}
            isOwnView={viewMode === 'mine'}
          />
        )}
        {tab === 'crm' && (
          <TabCRM
            leads={display.leads}
            readOnly={display.readOnly}
            viewLabel={display.label}
            addLead={ownLeads.addLead}
            updateLead={ownLeads.updateLead}
            deleteLead={ownLeads.deleteLead}
            isOwnView={viewMode === 'mine'}
          />
        )}
        {tab === 'relatorios' && (
          <TabRelatorios
            kpis={display.kpis}
            leads={display.leads}
            viewLabel={display.label}
          />
        )}
      </main>
    </div>
  );
}
