# Plataforma UGC (MVP)

MVP de uma plataforma web que conecta **artistas (músicos/bandas)** com **marcas/contratantes** para campanhas, shows e conteúdos personalizados, incluindo gestão de campanhas, propostas, entregas e pagamentos via carteira.

## Stack principal
- Backend: Laravel 12 (PHP 8.2+), Fortify (login, registro, recuperação de senha, verificação de e-mail, 2FA), filas/banco/cache via SQLite por padrão.
- Frontend: React 19 com Inertia.js, Vite, Tailwind CSS 4 (tema pronto para light/dark), Radix UI + lucide-react.
- Tipagem de rotas: @laravel/vite-plugin-wayfinder (gera helpers TS para rotas).

## O que já está pronto
- Autenticação completa Fortify (login, registro, reset, verificação de e-mail e 2FA) com páginas em `resources/js/pages/auth`.
- Layout SPA com sidebar (`resources/js/layouts/app`) e componentes UI prontos (`resources/js/components/ui`).
- Páginas de conta/configurações (perfil, senha, 2FA, aparência) já estruturadas em `resources/js/pages/settings` e controllers em `app/Http/Controllers/Settings` (rotas precisam ser reativadas no `routes/web.php`).
- Dashboard e página inicial ainda são placeholders, prontos para receber o fluxo de UGC.
- Testes de autenticação, 2FA e settings em `tests/Feature`.

## Estrutura rápida
- `app/Http/Controllers`: HomeController (LP) e Settings (perfil/senha/2FA).
- `resources/js/pages`: `home.tsx`, `dashboard.tsx`, `auth/*`, `settings/*`.
- `resources/views/app.blade.php`: shell Inertia + inclusão Vite.
- `resources/css/app.css`: tema Tailwind 4, fontes Instrument Sans, variantes light/dark.
- `database`: migrations base (users, jobs, cache) e `database.sqlite` já versionado.

## Branding base
- Cor primária: `#ff7900` (hsl(28, 100, 50)).
- Cor secundária: `#000000`.
- Fonte: Instrument Sans (via Bunny).

## Como rodar local
Pré-requisitos: PHP 8.2+, Composer, Node 20+, npm, SQLite (ou adapte .env para MySQL/Postgres), extensão OpenSSL.

### Setup rápido (tudo de uma vez)
```bash
composer setup
```
O script instala dependências, copia `.env` se não existir, gera key, roda migrations (--force), instala npm e faz build.

### Setup manual
```bash
composer install
cp .env.example .env   # ou copie manualmente
php artisan key:generate
php artisan migrate
npm install
npm run build
```

### Ambiente de desenvolvimento
```bash
composer dev          # serve Laravel + queue + Vite em paralelo
# ou
php artisan serve
php artisan queue:listen
npm run dev
```

### Testes
```bash
php artisan test
```

## Notas importantes
- Rotas de settings: descomentando `require __DIR__.'/settings.php';` em `routes/web.php` reativa Perfil/Senha/2FA/Aparência.
- Banco: por padrão é SQLite (`database/database.sqlite`). Para outro banco, ajuste `.env` e rode `php artisan migrate`.
- Tipos de rota/ações geradas pelo Wayfinder estão em `resources/js/routes` e `resources/js/actions`; regenere após alterar rotas/back-end se necessário.

## Próximos passos sugeridos para o MVP UGC
- Criar landing em `resources/js/pages/home.tsx` com proposta de valor e CTA para artistas/marcas.
- Modelar entidades: Artista/Marca, Campanha, Proposta, Entrega, Mensagens, Carteira/Transações.
- Fluxos iniciais: onboarding de artista/marca, criação de campanha pela marca, propostas/respostas, aceite e cronograma de entregas.
- Integrar carteira (saldo, pagamentos, repasses) e webhooks de pagamento quando o provedor for escolhido.
