import { useState, useEffect } from 'react';

export default function App() {
  const [log, setLog] = useState('Iniciando...\n');

  useEffect(() => {
    const append = (msg) => setLog((prev) => prev + msg + '\n');

    append('useEffect rodou');

    window.onerror = (msg, src, line, col, err) => {
      append('ERRO GLOBAL: ' + msg + ' em ' + src + ':' + line);
      return true;
    };

    try {
      append('Testando import do supabase...');
      import('./lib/supabase').then((mod) => {
        append('Supabase importado OK: ' + (mod.supabase ? 'sim' : 'não'));
      }).catch((e) => {
        append('ERRO ao importar supabase: ' + e.message);
      });
    } catch (e) {
      append('ERRO síncrono: ' + e.message);
    }
  }, []);

  return (
    <pre style={{ color: '#0f0', background: '#000', padding: 20, fontSize: 14, whiteSpace: 'pre-wrap' }}>
      {log}
    </pre>
  );
}
