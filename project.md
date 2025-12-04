# Projeto UGC – Diretrizes e Roadmap

## Visão
Plataforma que conecta artistas (músicos/bandas) a marcas/contratantes para campanhas, shows e conteúdos personalizados, com gestão ponta a ponta: campanhas, propostas, entregas, mensageria e pagamentos via carteira.

## Estado atual do código
- Base Laravel 12 + Inertia/React/Tailwind 4 configurada.
- Fortify ativo: login, registro, reset, verificação de e-mail e 2FA com páginas prontas.
- Layout SPA com sidebar e componentes (Radix/Tailwind) prontos; `home.tsx` e `dashboard.tsx` estão como placeholders.
- Páginas de settings (perfil, senha, 2FA, aparência) e controllers existem, mas as rotas estão comentadas em `routes/web.php` (reativar para usar).
- Tipagem de rotas/ações gerada pelo Wayfinder em `resources/js/routes` e `resources/js/actions`.
- Migrations base (users, jobs, cache, 2FA) e testes de autenticação/settings já inclusos.

## Público-alvo
- Artistas: músicos/bandas que oferecem shows, conteúdos e entregas criativas.
- Marcas/Contratantes: empresas ou produtores que lançam campanhas e contratam entregas.

## MVP — blocos funcionais
1) **Onboarding**: cadastro/login, escolha de perfil (artista ou marca), dados básicos (gênero musical, região, links, CNPJ/CPF).  
2) **Campanhas** (marcas): criar/editar campanha com briefing, orçamento, prazo, entregáveis, tags/segmentação.  
3) **Match & propostas**: artistas enviam propostas (preço, datas, ideia criativa); marcas aceitam/negociam.  
4) **Entregas**: checklist de entregáveis, upload/link de prova, aprovação/reprovação.  
5) **Carteira/pagamentos**: saldo, release após aprovação, repasse para artista; histórico de transações.  
6) **Mensageria & notificações**: chat por campanha e alertas (e-mail/in-app).  
7) **Admin básico**: gestão de usuários/campanhas, disputes, auditoria.

## Modelo de dados inicial (sugestão)
- `users`: base Fortify (role: artist|brand, display_name, avatar, phone).  
- `artist_profiles`: user_id, gêneros, regiões, cachê médio, links.  
- `brand_profiles`: user_id, empresa, cnpj, site, contatos.  
- `campaigns`: brand_id, título, briefing, orçamento, status (draft|open|in_progress|done|canceled), datas.  
- `proposals`: campaign_id, artist_id, valor, mensagem, status (sent|accepted|rejected|withdrawn).  
- `deliverables`: proposal_id, tipo, url/arquivo, aprovado (bool), feedback.  
- `wallet_accounts`: user_id, saldo disponível/retido.  
- `wallet_transactions`: account_id, tipo (credit|debit|hold|release), referência (proposal/campaign), gateway_id, status.  
- `messages`: proposal_id ou campaign_id, sender_id, conteúdo.

## Roadmap sugerido
- **Fase 0 — Fundamentos**
  - Reativar `routes/settings.php`; gerar actions/rotas typed para settings.
  - Branding: aplicar paleta `#ff7900` + `#000000`, atualizar sidebar/nav para o domínio UGC.
  - Landing em `home.tsx` com CTA duplo (sou artista / sou marca).
- **Fase 1 — Onboarding e Campanhas**
  - Migrações de perfis (artist/brand) e escolha de papel pós-registro.
  - CRUD de campanhas para marcas; listagem pública/privada para artistas.
  - Formulário de proposta por artista com validação e status.
- **Fase 2 — Entregas e Fluxo de Aprovação**
  - Modelo de entregáveis + uploads (S3/local) e aprovação pelo contratante.
  - Logs/linhas do tempo por campanha/proposta.
- **Fase 3 — Carteira e Pagamentos**
  - Modelo de wallet e transações; integrações (ex.: Stripe, Mercado Pago, Pagar.me) com webhooks.
  - Regras de retenção/liberação após aprovação de entregas.
- **Fase 4 — Mensageria e Notificações**
  - Chat simples por campanha/proposta; e-mail + in-app notifications.
  - Painel de admin para moderação e disputas.

## UI/UX
- Paleta: primária `#ff7900`, secundária `#000000`, neutros claros/escuros do tema Tailwind existente.
- Fonte: Instrument Sans (já carregada).
- SPA com sidebar; criar telas focadas em fluxo (landing → onboarding → dashboards de artista/marca).
- Evitar excesso de cinza; usar a primária como cor de ação principal (botões/links/etapas).

## Observações técnicas
- Tailwind v4 sem `tailwind.config`; tokens estão em `resources/css/app.css`.
- Fortify redireciona pós-login para `/dashboard`; ajuste quando o fluxo principal estiver pronto.
- Banco padrão é SQLite; ajuste `.env` para outro banco conforme necessidade.
- Regenerar helpers de rota após alterar `routes/*.php` (`wayfinder` roda no Vite).

## Métricas e qualidade
- Logar eventos chave: criação de campanha, proposta enviada/aceita, entregável aprovado, pagamento liberado.
- Cobrir autenticação, permissões por papel (artist/brand/admin) e estados de campanha nos testes de feature.
- Adicionar monitoramento de erros (Sentry/etc.) quando for para staging/produção.
