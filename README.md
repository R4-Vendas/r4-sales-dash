# 📊 R4 Sales Dash

Dashboard comercial para acompanhamento de desempenho da equipe de vendas.

## Funcionalidades

* Login por usuário
* Registro de KPIs diários
* CRM para gerenciamento de leads
* Relatórios mensais
* Indicadores de conversão e faturamento
* Visualização individual e consolidada da equipe

## Perfis

**Vendedor**

* Gerencia apenas seus próprios KPIs e leads.

**Administrador**

* Visualiza seus dados, o consolidado da equipe e os resultados individuais de cada vendedor.

## Executando o projeto

```bash
npm install
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:5173
```

## Estrutura

```text
src/
├── components/
├── hooks/
├── lib/
├── pages/
├── App.jsx
└── main.jsx
```

## Banco de Dados

O projeto utiliza Supabase.

O script de criação das tabelas está disponível em:

```text
supabase/schema.sql
```
