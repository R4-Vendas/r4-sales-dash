import { useState } from 'react';
import { T } from '../lib/theme';

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

const EMPTY = { nome: '', email: '', telefone: '', status: '', dataEntrada: '', negocio: '', valor: '', observacao: '' };

const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDateBR = (s) => { if (!s) return ''; const parts = s.split('-'); return parts[2] + '/' + parts[1] + '/' + parts[0]; };

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
  observacao: row.observacao || '',
});

function Card({ children, style = {} }) {
  return <div style={Object.assign({ background: T.surface, border: '1px solid ' + T.border, borderRadius: 10, padding: '20px 24px' }, style)}>{children}</div>;
}
function Label({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textSec }}>{children}</div>;
}
function Btn({ children, onClick, variant = 'primary', style = {}, small = false }) {
  const [hov, setHov] = useState(false);
  const variants = {
    primary: { background: hov ? '#7B74FF' : T.accent, color: '#fff' },
    danger: { background: hov ? '#ff6b6b' : T.danger, color: '#fff' },
    ghost: { background: 'transparent', color: hov ? T.text : T.textSec, border: '1px solid ' + (hov ? T.borderMid : T.border) },
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={Object.assign({ border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: small ? 12 : 13, padding: small ? '5px 12px' : '8px 18px', transition: 'all 0.15s' }, variants[variant], style)}
    >
      {children}
    </button>
  );
}
function Pill({ status }) {
  const color = STATUS_COLORS[status] || T.textSec;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color + '18', border: '1px solid ' + color + '30', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 600, color: color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {status}
    </span>
  );
}
function Input({ label, value, onChange, type = 'text', placeholder = '', error = '', style = {} }) {
  const [focus, setFocus] = useState(false);
  const isDate = type === 'date';
  return (
    <div style={Object.assign({ display: 'flex', flexDirection: 'column', gap: 5 }, style)}>
      {label && <Label>{label}</Label>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          background: T.bg,
          border: '1px solid ' + (error ? T.danger : focus ? T.borderMid : T.border),
          borderRadius: 6,
          color: T.text,
          fontSize: 13,
          padding: isDate ? '8px 8px' : '8px 11px',
          outline: 'none',
          width: '100%',
          minHeight: 36,
          boxSizing: 'border-box',
          boxShadow: focus ? '0 0 0 3px ' + (error ? T.danger + '20' : T.accentDim) : 'none',
          colorScheme: 'dark',
          WebkitAppearance: isDate ? 'none' : undefined,
        }}
      />
      {error && <span style={{ color: T.danger, fontSize: 11 }}>{error}</span>}
    </div>
  );
}
function Textarea({ label, value, onChange, placeholder = '', style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={Object.assign({ display: 'flex', flexDirection: 'column', gap: 5 }, style)}>
      {label && <Label>{label}</Label>}
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        rows={3}
        style={{
          background: T.bg,
          border: '1px solid ' + (focus ? T.borderMid : T.border),
          borderRadius: 6,
          color: T.text,
          fontSize: 13,
          padding: '8px 11px',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: focus ? '0 0 0 3px ' + T.accentDim : 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          colorScheme: 'dark',
        }}
      />
    </div>
  );
}
function Select({ label, value, onChange, options, error = '', style = {} }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={Object.assign({ display: 'flex', flexDirection: 'column', gap: 5 }, style)}>
      {label && <Label>{label}</Label>}
      <select
        value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          background: T.bg, border: '1px solid ' + (error ? T.danger : focus ? T.borderMid : T.border), borderRadius: 6,
          color: value ? T.text : T.textSec, fontSize: 13, padding: '8px 11px', outline: 'none', width: '100%',
          boxSizing: 'border-box', cursor: 'pointer', boxShadow: focus ? '0 0 0 3px ' + T.accentDim : 'none',
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value} style={{ background: T.surface }}>{o.label}</option>)}
      </select>
      {error && <span style={{ color: T.danger, fontSize: 11 }}>{error}</span>}
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <span style={{ color: T.textSec, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</span>
      {children}
    </div>
  );
}
function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: T.surface, border: '1px solid ' + T.borderMid, borderRadius: 12, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ color: T.text, fontSize: 16, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid ' + T.border, color: T.textSec, fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '1px 8px', borderRadius: 6 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function TabCRM({ leads, readOnly, viewLabel, addLead, updateLead, deleteLead, isOwnView }) {
  const [form, setForm] = useState(Object.assign({}, EMPTY));
  const [errors, setErrors] = useState({});
  const [editLead, setEditLead] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [confirmDel, setConfirmDel] = useState(null);
  const [fStatus, setFStatus] = useState('');
  const [fFrom, setFFrom] = useState('');
  const [fTo, setFTo] = useState('');
  const [fNeg, setFNeg] = useState('');
  const [saving, setSaving] = useState(false);

  const cutoff60Str = (function () { const d = new Date(); d.setDate(d.getDate() - 60); return d.toISOString().slice(0, 10); })();
  const sf = (f, v) => setForm((p) => Object.assign({}, p, { [f]: v }));

  const handleAdd = async () => {
    const errs = validateLead(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await addLead(form);
    setSaving(false);
    setForm(Object.assign({}, EMPTY));
    setErrors({});
  };

  const handleEditSave = async () => {
    const errs = validateLead(editLead);
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    await updateLead(editLead.id, editLead);
    setEditLead(null);
    setEditErrors({});
  };

  const handleDel = async (id) => {
    await deleteLead(id);
    setConfirmDel(null);
  };

  const shapedLeads = leads.map(toFormShape);
  const filtered = shapedLeads.filter((l) => {
    if (fStatus && l.status !== fStatus) return false;
    if (fFrom && l.dataEntrada < fFrom) return false;
    if (fTo && l.dataEntrada > fTo) return false;
    if (fNeg && !l.negocio.toLowerCase().includes(fNeg.toLowerCase())) return false;
    return true;
  });

  const TH = ({ children }) => (
    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, borderBottom: '1px solid ' + T.border, whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {readOnly && (
        <div style={{ color: T.accent, fontSize: 12, fontWeight: 600 }}>
          Visualizando: {viewLabel} · somente leitura
        </div>
      )}

      {!readOnly && (
        <Section title="Novo lead">
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 14 }}>
              <Input label="Nome" value={form.nome} onChange={(v) => sf('nome', v)} error={errors.nome} />
              <Input label="E-mail" value={form.email} onChange={(v) => sf('email', v)} error={errors.email} />
              <Input label="Telefone" value={form.telefone} onChange={(v) => sf('telefone', v)} error={errors.telefone} />
              <Select label="Status" value={form.status} onChange={(v) => sf('status', v)} options={STATUS_OPTS} error={errors.status} />
              <Input label="Data de entrada" type="date" value={form.dataEntrada} onChange={(v) => sf('dataEntrada', v)} error={errors.dataEntrada} />
              <Input label="Negócio" value={form.negocio} onChange={(v) => sf('negocio', v)} error={errors.negocio} placeholder="Ex: Plano Enterprise" />
              <Input label="Valor (R$)" type="number" value={form.valor} onChange={(v) => sf('valor', v)} error={errors.valor} placeholder="0.00" />
            </div>
            <div style={{ marginTop: 14 }}>
              <Textarea label="Observações" value={form.observacao} onChange={(v) => sf('observacao', v)} placeholder="Desconto solicitado, motivo de objeção, contexto do lead..." />
            </div>
            <div style={{ marginTop: 18 }}>
              <Btn onClick={handleAdd} style={{ opacity: saving ? 0.6 : 1 }}>{saving ? 'Salvando…' : 'Adicionar lead'}</Btn>
            </div>
          </Card>
        </Section>
      )}

      <Section title="Filtros">
        <Card style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Select label="Status" value={fStatus} onChange={setFStatus} options={[{ value: '', label: 'Todos' }].concat(STATUS_OPTS.slice(1))} style={{ minWidth: 155 }} />
            <Input label="Data inicial" type="date" value={fFrom} onChange={setFFrom} style={{ minWidth: 155 }} />
            <Input label="Data final" type="date" value={fTo} onChange={setFTo} style={{ minWidth: 155 }} />
            <Input label="Negócio" value={fNeg} onChange={setFNeg} placeholder="Buscar…" style={{ minWidth: 175 }} />
            <Btn variant="ghost" small onClick={() => { setFStatus(''); setFFrom(''); setFTo(''); setFNeg(''); }} style={{ marginBottom: 1 }}>Limpar</Btn>
          </div>
        </Card>
      </Section>

      <Section title={String(filtered.length) + ' lead' + (filtered.length !== 1 ? 's' : '')}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>Nenhum lead encontrado.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>{['Nome', 'E-mail', 'Telefone', 'Status', 'Entrada', 'Negócio', 'Valor', 'Observações', ''].map((h) => <TH key={h}>{h}</TH>)}</tr>
                </thead>
                <tbody>
                  {filtered.map((l, i) => {
                    const old = l.dataEntrada < cutoff60Str;
                    return (
                      <tr key={l.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid ' + T.border : 'none' }}>
                        <td style={{ padding: '11px 14px', color: T.text, whiteSpace: 'nowrap', fontWeight: 500 }}>
                          {l.nome}
                          {old && <span style={{ marginLeft: 7, fontSize: 9, fontWeight: 700, color: T.warning, background: T.warning + '18', border: '1px solid ' + T.warning + '30', borderRadius: 4, padding: '1px 5px' }}>+60d</span>}
                        </td>
                        <td style={{ padding: '11px 14px', color: T.textSec }}>{l.email}</td>
                        <td style={{ padding: '11px 14px', color: T.textSec, whiteSpace: 'nowrap' }}>{l.telefone}</td>
                        <td style={{ padding: '11px 14px' }}><Pill status={l.status} /></td>
                        <td style={{ padding: '11px 14px', color: T.textSec, whiteSpace: 'nowrap' }}>{formatDateBR(l.dataEntrada)}</td>
                        <td style={{ padding: '11px 14px', color: T.textSec, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.negocio}</td>
                        <td style={{ padding: '11px 14px', color: T.success, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{formatBRL(l.valor)}</td>
                        <td style={{ padding: '11px 14px', color: T.textSec, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.observacao || <span style={{ color: T.textMuted, fontStyle: 'italic' }}>—</span>}
                        </td>
                        {!readOnly && (
                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Btn small variant="ghost" onClick={() => setEditLead(Object.assign({}, l))}>Editar</Btn>
                              <Btn small variant="danger" onClick={() => setConfirmDel(l)}>Excluir</Btn>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </Section>

      {editLead && (
        <Modal title="Editar lead" onClose={() => setEditLead(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="Nome" value={editLead.nome} onChange={(v) => setEditLead((p) => Object.assign({}, p, { nome: v }))} error={editErrors.nome} />
            <Input label="E-mail" value={editLead.email} onChange={(v) => setEditLead((p) => Object.assign({}, p, { email: v }))} error={editErrors.email} />
            <Input label="Telefone" value={editLead.telefone} onChange={(v) => setEditLead((p) => Object.assign({}, p, { telefone: v }))} error={editErrors.telefone} />
            <Select label="Status" value={editLead.status} onChange={(v) => setEditLead((p) => Object.assign({}, p, { status: v }))} options={STATUS_OPTS} error={editErrors.status} />
            <Input label="Data entrada" type="date" value={editLead.dataEntrada} onChange={(v) => setEditLead((p) => Object.assign({}, p, { dataEntrada: v }))} error={editErrors.dataEntrada} />
            <Input label="Negócio" value={editLead.negocio} onChange={(v) => setEditLead((p) => Object.assign({}, p, { negocio: v }))} error={editErrors.negocio} />
            <Input label="Valor (R$)" type="number" value={editLead.valor} onChange={(v) => setEditLead((p) => Object.assign({}, p, { valor: v }))} error={editErrors.valor} />
          </div>
          <div style={{ marginTop: 14 }}>
            <Textarea label="Observações" value={editLead.observacao} onChange={(v) => setEditLead((p) => Object.assign({}, p, { observacao: v }))} placeholder="Desconto solicitado, motivo de objeção, contexto do lead..." />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setEditLead(null)}>Cancelar</Btn>
            <Btn onClick={handleEditSave}>Salvar</Btn>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Excluir lead" onClose={() => setConfirmDel(null)} width={400}>
          <p style={{ color: T.textSec, margin: '0 0 22px', fontSize: 14, lineHeight: 1.6 }}>
            Excluir <strong style={{ color: T.text }}>{confirmDel.nome}</strong>? Esta ação é irreversível.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setConfirmDel(null)}>Cancelar</Btn>
            <Btn variant="danger" onClick={() => handleDel(confirmDel.id)}>Excluir</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
