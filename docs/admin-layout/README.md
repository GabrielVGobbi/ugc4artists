# 🎨 UGC 4Artists - Admin Panel

Sistema appistrativo moderno e elegante inspirado no design editorial do Kreo.

## 📐 Estrutura

```
resources/js/
├── layouts/
│   ├── app-layout.tsx          # Layout principal do app
│   └── app-layout.tsx            # Layout antigo (backup)
├── components/
│   └── app/
│       ├── app-sidebar.tsx     # Sidebar com navegação
│       └── app-header.tsx      # Header com busca e perfil
├── pages/
│   └── app/
│       └── dashboard.tsx         # Dashboard principal
└── lib/
    └── app-constants.ts        # Constantes e configurações
```

## 🎨 Design System

### Cores Principais
- **Primary**: `#FF4D00` - Laranja vibrante
- **Background**: `#FAF9F6` - Off-white elegante
- **Sidebar**: `#0A0A0A` - Preto profundo
- **Surface**: `#FFFFFF` - Branco puro
- **Text**: `#0A0A0A` - Texto escuro
- **Muted**: `#71717A` - Cinza neutro

### Tipografia
- **Headers**: Bold, tracking-tight
- **Body**: Font-medium, leading-relaxed
- **Labels**: Uppercase, tracking-widest, text-xs

### Componentes

#### Cards
- **Border Radius**: 2.5rem (40px) - Editorial style
- **Shadows**: Suaves com hover effects
- **Padding**: Generoso (p-8 a p-10)
- **Transitions**: Smooth 300-500ms

#### Sidebar
- **Width**: 288px (w-72)
- **Fixed**: Position fixa à esquerda
- **Navigation**: Items com hover e active states
- **Badge**: Contador em laranja para notificações

#### Header
- **Search**: Input com atalho Cmd+K / Ctrl+K
- **Notifications**: Bell com badge animado
- **Profile**: Avatar com status online

## 🚀 Páginas Disponíveis

### ✅ Dashboard (`/app/dashboard`)
Dashboard principal com métricas, gráficos e insights

### 🔜 Em Desenvolvimento
- Campanhas (`/app/campaigns`)
- Artistas (`/app/artists`)
- Marcas (`/app/brands`)
- Propostas (`/app/proposals`)
- Analytics (`/app/analytics`)
- Mensagens (`/app/inbox`)
- Pagamentos (`/app/payments`)
- Studio AI (`/app/studio`)
- Configurações (`/app/settings`)

## 🎯 Features

### Dashboard
- **Métricas em Tempo Real**: Campanhas, artistas, receita
- **Top Artistas**: Lista com match percentages
- **Campanhas Recentes**: Grid com status e detalhes
- **Studio AI Card**: CTA para novo recurso
- **Cards Assimétricos**: Design editorial moderno
- **Gradientes Sutis**: Background effects
- **Hover Effects**: Transições suaves em todos os elementos

### Navegação
- **Sidebar Fixa**: Navegação sempre visível
- **Active States**: Indicadores visuais de página ativa
- **Badges**: Contadores para notificações
- **Featured Card**: Destaque para novos recursos

### UX
- **Keyboard Shortcuts**: Cmd+K para busca
- **Smooth Scrolling**: Scrollbar customizada
- **Loading States**: Preparado para estados de loading
- **Responsive**: Mobile-first approach

## 🔧 Tecnologias

- **React 19**: Componentes funcionais
- **TypeScript**: Type-safe
- **Inertia.js**: SSR com Laravel
- **Tailwind CSS 4**: Utility-first styling
- **Lucide Icons**: Ícones modernos
- **Laravel 12**: Backend robusto

## 📝 Como Adicionar Nova Página

1. **Criar a página**:
```tsx
// resources/js/pages/app/nova-pagina.tsx
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'

export default function NovaPagina() {
    return (
        <AppLayout>
            <Head title="Nova Página - Admin" />
            {/* Seu conteúdo aqui */}
        </AppLayout>
    )
}
```

2. **Adicionar rota** em `routes/web.php`:
```php
Route::get('/nova-pagina', [NovoController::class, 'index'])->name('nova-pagina');
```

3. **Adicionar ao menu** em `app-constants.ts`:
```ts
{
    id: 'nova-pagina',
    label: 'Nova Página',
    icon: IconName,
    href: '/app/nova-pagina',
}
```

4. **Adicionar título** na função `getPageTitle`:
```ts
'/app/nova-pagina': {
    title: 'Título da Página',
    subtitle: 'Descrição curta da página.',
}
```

## 🎨 Princípios de Design

1. **Editorial First**: Design inspirado em revistas e publicações modernas
2. **Asymmetry**: Layouts assimétricos intencionais
3. **White Space**: Uso generoso de espaçamento
4. **Typography**: Hierarquia clara e legível
5. **Motion**: Transições suaves e propositais
6. **Color**: Uso estratégico da cor primária
7. **Depth**: Layers e sombras sutis
8. **Glassmorphism**: Efeitos de vidro em cards especiais

## 📊 Métricas do Dashboard

### Stats Cards
- Total de Campanhas
- Campanhas Ativas
- Total de Artistas
- Marcas Parceiras
- Receita Total
- Propostas Pendentes

### Visualizações
- Crescimento de receita (%)
- Crescimento de campanhas (%)
- Top artistas com match %
- Campanhas recentes com status

## 🔐 Autenticação

O app usa o middleware `auth` e `verified` do Laravel Fortify:
- Login obrigatório
- Email verificado obrigatório
- Logout disponível na sidebar

## 🚧 Próximos Passos

1. [ ] Implementar CRUD de campanhas
2. [ ] Implementar gestão de artistas
3. [ ] Implementar gestão de marcas
4. [ ] Sistema de propostas
5. [ ] Analytics avançado
6. [ ] Sistema de mensagens
7. [ ] Gestão de pagamentos
8. [ ] Studio AI (geração de campanhas)
9. [ ] Configurações do sistema
10. [ ] Dashboard responsivo otimizado

## 💡 Tips

- Use `custom-scrollbar` class para scrollbars estilizadas
- Cards importantes devem ter `rounded-[2.5rem]`
- Hover effects devem ter `transition-all duration-300`
- Use `group` e `group-hover:` para hover em filhos
- Badges de status: emerald (Live), amber (Draft), zinc (Completed)
- Mantenha consistency com as cores do ADMIN_COLORS

## 📦 Dependências Adicionais Futuras

- Recharts (para gráficos avançados)
- React Query (para cache de dados)
- Zod (para validação de formulários)
- Date-fns (para formatação de datas)

---

**Desenvolvido com 💜 pela equipe UGC 4Artists**




