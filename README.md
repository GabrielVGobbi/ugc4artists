# UGC4Artists - Plataforma UGC para musica e creators

Aplicacao web para conectar marcas, artistas e creators em campanhas UGC, com onboarding por perfil, criacao de campanhas, checkout (PIX/cartao/carteira), acompanhamento de pagamentos e area administrativa.

## Visao rapida do estado atual
- Landing page publica em `/` com seo e secoes institucionais.
- Waitlist publica em `/waitlist` com formulario multi-etapas.
- App autenticado em `/app/*` com onboarding obrigatorio antes do dashboard.
- Modulo de campanhas com CRUD, duplicacao, submissao e checkout.
- Wallet com deposito, historico, exportacao CSV e pagina de pagamento.
- Modulo de pagamentos interno (`app/Modules/Payments`) com arquitetura por gateway.
- Area admin em `/admin/*` protegida por role.

## Stack principal
- Backend: Laravel 12, PHP 8.3, Fortify, Sanctum, Socialite, Telescope.
- Frontend: React 19 + Inertia.js, TypeScript, Vite, Tailwind CSS 4.
- UI/Data: Radix UI, lucide-react, TanStack Query, Zod.
- Financeiro: `bavix/laravel-wallet` + modulo proprio de pagamentos.

## Principais modulos
### Landing + copy
- Entrada em `app/Http/Controllers/HomeController.php`.
- Pagina em `resources/js/pages/landing-page/index.tsx`.
- Fonte de copy institucional em `.docs/copy_lp/copy_lp.md`.

### Waitlist
- Rotas: `GET /waitlist`, `POST /waitlist`.
- Controller: `app/Http/Controllers/WaitlistRegistrationController.php`.
- Frontend: `resources/js/pages/landing-page/waitlist/index.tsx`.

### Autenticacao e onboarding
- Auth Fortify em `routes/auth.php` e `resources/js/pages/auth/*`.
- Onboarding em `/app/onboarding` com persistencia parcial em cache.
- Servico: `app/Services/Onboarding/OnboardingService.php`.
- Middleware de bloqueio: `app/Http/Middleware/EnsureOnboardingCompleted.php`.

### Campanhas
- Model principal: `app/Models/Campaign.php`.
- Status: `draft`, `awaiting_payment`, `under_review`, `sent_to_creators`, `in_progress`, `completed`, `cancelled`.
- Rotas app: `routes/app.php` em `/app/campaigns/*`.
- Rotas API: `routes/api.php` em `/api/v1/campaigns/*`.
- Checkout de campanha: `app/Services/Campaign/CampaignCheckoutService.php`.

### Wallet e pagamentos
- Wallet app: `app/Http/Controllers/App/WalletAppController.php`.
- Servico wallet: `app/Services/Wallet/WalletService.php`.
- Webhooks publicos: `POST /webhook/{provider}` e `POST /api/v1/payments/webhooks/{provider}`.
- Documentacao do modulo: `app/Modules/Payments/README.md`.

### Admin
- Rotas: `routes/admin.php` (`/admin/*`).
- Docs de UI admin: `docs/admin-layout/README.md`.

## Estrutura de pastas (atalho)
- `app/Http/Controllers`: controladores web/api/app/admin.
- `app/Models`: modelos de dominio (`Campaign`, `User`, `Address`, etc.).
- `app/Services`: regras de negocio (campaign, onboarding, wallet, dashboard).
- `app/Modules/Payments`: modulo de pagamentos desacoplado por gateway.
- `resources/js/pages`: paginas Inertia (landing, app, auth, settings, admin).
- `.docs`: docs de produto, fluxos, copy, guias internos e referencias.

## Requisitos locais
- PHP 8.3+
- Composer
- Node.js 20+
- NPM
- Banco (SQLite por padrao, ou MySQL/Postgres via `.env`)

## Setup
### Setup rapido
```bash
composer setup
```

### Setup manual
```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build
```

## Desenvolvimento
```bash
composer dev
```

Comando alternativo:
```bash
php artisan serve
php artisan queue:listen --tries=1
npm run dev
```

## Testes e qualidade
```bash
php artisan test
npm run lint
npm run types
```

## Variaveis importantes (.env)
- App: `APP_URL`, `APP_ENV`, `APP_DEBUG`.
- Banco: `DB_*`.
- Pagamentos: `PAYMENT_GATEWAY`, `PAYMENT_TEST_MODE`, `ASAAS_*`, `IUGU_*`.
- Google auth (se usado): variaveis em `.docs/auth/SETUP_GOOGLE_OAUTH.md`.

## Rotas importantes
- Publico: `/`, `/waitlist`, `/regulamento`.
- App: `/app/onboarding`, `/app/dashboard`, `/app/campaigns`, `/app/wallet`.
- Admin: `/admin`.
- API: `/api/v1/*`.

## Documentacao interna recomendada
- `.docs/copy_lp/copy_lp.md` (copy institucional).
- `.docs/campanhas/campaign.md` (fluxo detalhado de criacao de campanha).
- `.docs/formulario_ugc.md` (origem do formulario de comunidade).
- `.docs/ADDRESS_SYSTEM.md` (sistema de enderecos).
- `app/Modules/Payments/README.md` (arquitetura e uso do modulo de pagamentos).
