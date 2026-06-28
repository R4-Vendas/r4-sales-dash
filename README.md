# R4 Sales Dash

Dashboard comercial multi-usuário com login, KPIs diários, CRM e relatórios — conectado ao Supabase.

## Papéis de usuário
- **vendedor**: vê e edita apenas os próprios KPIs e leads
- **administrador**: vê os próprios dados + pode alternar para "Consolidado da equipe" ou um vendedor específico (somente leitura nesses casos)

## Estrutura do projeto
- `src/lib/supabase.js` → conexão com o banco de dados
- `src/hooks/` → lógica de autenticação, KPIs e leads
- `src/pages/LoginPage.jsx` → tela de login
- `src/pages/Dashboard.jsx` → layout principal + navegação
- `src/components/` → as 3 abas (Visão Geral, CRM, Relatórios)
- `supabase/schema.sql` → script SQL do banco (já executado)
teste deploy
