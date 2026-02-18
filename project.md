# Projeto UGC4Artists

## Visao de produto
UGC4Artists e um ecossistema para conectar marcas e artistas aos creators certos, transformando conteudo em performance. O projeto combina captacao de comunidade (landing + waitlist), operacao de campanhas e camada financeira com carteira e checkout.

Referencias de copy e posicionamento:
- `.docs/copy_lp/copy_lp.md`
- `.docs/formulario_ugc.md`

## Escopo atual no codigo
- Landing institucional com SEO e secoes de marketing.
- Waitlist multi-etapas para captacao inicial de creators/artistas.
- Autenticacao completa (Fortify + 2FA + verificacao de email).
- Onboarding por perfil (`artist`, `creator`, `brand`) com cache de progresso.
- Modulo de campanhas com estados e regras de transicao.
- Checkout com PIX/cartao e uso parcial/total de carteira.
- Wallet com deposito, historico e consulta de status de pagamentos.
- Modulo admin protegido por roles.

## Dominio principal
### 1. Aquisicao e entrada
- Usuario chega pela landing (`/`) e pode entrar na waitlist (`/waitlist`).
- Copy e FAQ estao alinhados ao posicionamento de marca/artista/creator.

### 2. Acesso ao app
- Usuario autenticado entra em `/app/onboarding` se onboarding nao estiver completo.
- Apos concluir onboarding, middleware libera `/app/dashboard` e demais rotas do app.

### 3. Campanhas
Entidade central: `app/Models/Campaign.php`.

Fluxo de status (enum em `app/Enums/CampaignStatus.php`):
1. `draft`
2. `awaiting_payment`
3. `under_review`
4. `sent_to_creators`
5. `in_progress`
6. `completed`
7. `cancelled`

Regras relevantes:
- Campanha valida pode seguir para pagamento/submissao.
- Checkout pode ser wallet-only, PIX pendente ou cartao aprovado.
- Webhook e hooks de pagamento atualizam estado da campanha.

### 4. Financeiro
- Carteira baseada em `bavix/laravel-wallet`.
- Pagamentos centralizados no modulo `app/Modules/Payments`.
- Gateway padrao atual: Asaas (configuravel).
- Rotas de webhook expostas para conciliacao automatica.

## Mapa tecnico resumido
- Backend: Laravel 12 + PHP 8.3
- Frontend: React 19 + Inertia + Tailwind 4 + TypeScript
- Auth: Fortify + Sanctum + Socialite
- Payments: modulo proprio com facades, DTOs e gateway managers
- Filas/Jobs: infraestrutura pronta para processamento assincrono

## Estrutura de dados chave
- `users`: autenticacao, papel de conta, onboarding.
- `onboarding_profiles`: dados por perfil (artist/creator/brand).
- `campaigns`: briefing, filtros, cronograma, orcamento, status, metricas.
- `payments` (modulo): cobrancas, status gateway, webhook.
- `wallets/transactions`: saldo e movimentacao financeira.
- `addresses`: endereco de cobranca/operacao.
- `notifications` e `notification_settings`: comunicacao no app.

## Rotas principais
- Publico: `routes/web.php`
- App autenticado: `routes/app.php`
- API: `routes/api.php`
- Admin: `routes/admin.php`

## Documentacao interna importante
- `.docs/campanhas/campaign.md`
- `.docs/ADDRESS_SYSTEM.md`
- `.docs/ADMIN_QUICKSTART.md`
- `docs/admin-layout/README.md`
- `resources/js/pages/landing-page/waitlist/README.md`
- `app/Modules/Payments/README.md`

## Prioridades de produto (proximas fases)
### Fase 1 - Consolidacao de campanhas
- Fechar fluxo fim-a-fim de campanha com validacoes de negocio completas.
- Expandir telemetria (eventos de criacao, submit, pagamento, aprovacao).

### Fase 2 - Operacao creator/brand
- Entregaveis e aprovacoes por campanha.
- Comunicacao operacional (mensageria e notificacoes transacionais).

### Fase 3 - Escala financeira
- Fortalecer conciliacao por webhook e reprocessamento.
- Melhorar relatarios de wallet/campanhas para operacao e admin.

### Fase 4 - Governanca e qualidade
- Cobertura de testes de fluxos criticos de campanha/pagamento.
- Padrao de observabilidade para erros e auditoria de eventos.

## Criterios de sucesso do projeto
- Tempo curto entre cadastro e primeira campanha ativa.
- Alta confiabilidade no fluxo de pagamento e mudanca de status.
- Visibilidade operacional para time de produto/admin.
- Base tecnica estavel para adicionar novos gateways e novos fluxos.
