import { useState, useEffect } from 'react';

export default function App() {
  const [log, setLog] = useState('Iniciando...\n');

  useEffect(() => {
    const append = (msg) => setLog((prev) => prev + msg + '\n');

    window.onerror = (msg, src, line, col, err) => {
      append('ERRO GLOBAL: ' + msg + ' linha ' + line);
      return true;
    };

    append('Importando useAuth...');
    import('./hooks/useAuth').then((mod) => {
      append('useAuth importado: ' + (mod.useAuth ? 'sim' : 'não'));
    }).catch((e) => {
      append('ERRO ao importar useAuth: ' + e.message);
    });

    append('Importando LoginPage...');
    import('./pages/LoginPage').then((mod) => {
      append('LoginPage importado: ' + (mod.default ? 'sim' : 'não'));
    }).catch((e) => {
      append('ERRO ao importar LoginPage: ' + e.message);
    });

    append('Importando Dashboard...');
    import('./pages/Dashboard').then((mod) => {
      append('Dashboard importado: ' + (mod.default ? 'sim' : 'não'));
    }).catch((e) => {
      append('ERRO ao importar Dashboard: ' + e.message);
    });
  }, []);

  return (
    <pre style={{ color: '#0f0', background: '#000', padding: 20, fontSize: 14, whiteSpace: 'pre-wrap' }}>
      {log}
    </pre>
  );
}
