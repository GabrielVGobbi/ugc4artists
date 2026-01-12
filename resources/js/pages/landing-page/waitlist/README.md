# 🎨 UGC 4Artists - Waitlist (Nova Estrutura Editorial)

Sistema de lista de espera redesenhado com estrutura editorial inspirada no Admin Panel.

## 📐 Estrutura Atualizada

```
resources/js/
├── layouts/
│   └── waitlist-layout.tsx          # Layout principal (sidebar + main)
├── components/
│   └── waitlist/
│       └── waitlist-sidebar.tsx     # Sidebar fixa com steps
└── pages/
    └── landing-page/
        └── waitlist/
            ├── index.tsx             # Página principal
            ├── waitlist-form.tsx     # Formulário multi-etapas
            └── components/
                └── hero.tsx          # Hero section
```

## 🎨 Design System

### Cores Principais
- **Primary**: `#fc7c04` - Laranja vibrante UGC
- **Background**: `#0a0a0a` - Preto profundo
- **Sidebar**: `#0A0A0A` - Preto profundo com border sutil
- **Surface**: `rgba(255, 255, 255, 0.02)` - Cards translúcidos
- **Text**: `#FFFFFF` - Branco puro
- **Muted**: `rgba(255, 255, 255, 0.6)` - Cinza claro

### Tipografia
- **Headers**: Bold, `tracking-tight`
- **Body**: Font-medium, `leading-relaxed`
- **Labels**: Uppercase, `tracking-widest`, text-xs, font-bold

### Componentes

#### Layout (WaitlistLayout)
- **Estrutura**: Sidebar fixa (w-72) + Main content (ml-72)
- **Background Effects**:
  - Blurs laranjas nos cantos
  - Text "UGC 4ARTISTS" editorial assimétrico
  - Gradiente sutil laranja
- **Custom Scrollbar**: Estilizada com hover laranja
- **Minimal Header**: Logo + botão fechar

#### Sidebar (WaitlistSidebar)
- **Width**: 288px (w-72)
- **Fixed**: Position fixa à esquerda
- **Progress Bar**: Gradiente laranja com porcentagem
- **Steps Navigation**:
  - Ícones com estados (pending/active/completed)
  - Connection lines entre steps
  - Active indicator animado
  - Hover effects suaves
- **Success Card**: Aparece quando formulário é enviado
- **Social Links**: Bottom section com Instagram

#### Form Cards
- **Border Radius**: `rounded-[2.5rem]` (40px) - Editorial style
- **Background**: `bg-white/[0.02]` com backdrop-blur
- **Borders**: `border-white/10`
- **Shadows**: Suaves com cores temáticas
- **Padding**: Generoso (p-10 a p-12)
- **Transitions**: Smooth 300ms

#### Input Fields
- **Height**: `h-12` (48px)
- **Border Radius**: `rounded-xl`
- **Background**: `bg-white/5`
- **Border**: `border-white/20`
- **Focus**: `focus:border-[#fc7c04]` com ring laranja
- **Placeholder**: `placeholder:text-white/30`

#### Selection Cards (Artist Types, Participation)
- **Border Radius**: `rounded-[1.5rem]` (24px)
- **Padding**: `p-5`
- **Active State**:
  - Border: `border-[#fc7c04]`
  - Background: `bg-[#fc7c04]/10`
  - Shadow: Glow laranja intenso
- **Icon Container**: `rounded-xl`, background branco
- **Hover**: Border e background suaves

#### Buttons
- **Primary**: Gradiente laranja, `rounded-[2rem]`, text preto, font-bold
- **Outline**: `rounded-[2rem]`, border branco, hover com background
- **Height**: `h-12` (48px)
- **Shadow**: Glow da cor primária

## 🎯 Features

### Novo Layout Editorial
- **Sidebar Fixa**: Navegação sempre visível durante preenchimento
- **Progress Tracking**: Barra de progresso sincronizada
- **Step States**: Visual claro de pending/active/completed
- **Background Effects**: Text editorial + gradientes sutis
- **Custom Scrollbar**: Hover laranja + design minimalista

### Formulário Multi-Etapas
- **3 Seções**:
  1. Perfil do Artista
  2. Tipo de Participação
  3. Termos de Participação
- **Validação**: Client-side (Zod) + Server-side (Laravel)
- **State Management**: Sincronização entre form e sidebar
- **Success Screen**: Confirmação visual com animação

### UX Melhorada
- **Smooth Scrolling**: Scrollbar customizada
- **Loading States**: Feedback visual durante envio
- **Error Handling**: Mensagens claras e contextuais
- **Responsive**: Mobile-first approach
- **Animations**: Transições suaves e propositais

## 🔧 Tecnologias

- **React 19**: Componentes funcionais com hooks
- **TypeScript**: Type-safe em toda aplicação
- **Inertia.js**: SSR com Laravel
- **Tailwind CSS 4**: Utility-first styling
- **Zod**: Validação de schemas
- **Lucide Icons**: Ícones modernos
- **Laravel 12**: Backend robusto

## 📝 Como Usar

### Estrutura de Estado

O estado do formulário é gerenciado no `waitlist-form.tsx` e sincronizado com a sidebar através de callbacks:

```tsx
// index.tsx
const [currentStep, setCurrentStep] = useState(0)
const [isSuccessStep, setIsSuccessStep] = useState(false)

const handleStepChange = useCallback((step: number, success: boolean) => {
    setCurrentStep(step)
    setIsSuccessStep(success)
}, [])

<WaitListForm onStepChange={handleStepChange} />
```

### Adicionando Nova Etapa

1. **Adicionar ao array `steps`** em `waitlist-form.tsx`:

```ts
{
    number: 3,
    id: 'new-step',
    title: 'Seção 4 · Título',
    subtitle: 'Descrição da seção',
    icon: IconName,
    fields: ['field1', 'field2'] as Array<keyof WaitlistFormValues>,
}
```

2. **Criar função de render**:

```tsx
const renderNewStep = () => (
    <div className="space-y-8">
        {/* Campos do formulário */}
    </div>
)
```

3. **Adicionar ao renderSection**:

```tsx
{currentStep === 3 && renderNewStep()}
```

## 🎨 Princípios de Design

1. **Editorial First**: Design inspirado em publicações modernas
2. **Glassmorphism**: Cards translúcidos com backdrop-blur
3. **Fixed Navigation**: Sidebar sempre visível
4. **Generous Spacing**: White space intencional
5. **Bold Typography**: Hierarquia clara com tracking-tight
6. **Smooth Transitions**: Animações propositais (300ms)
7. **Color Strategy**: Uso estratégico do laranja primário
8. **Depth & Layers**: Shadows e glows sutis
9. **Custom Scrollbar**: Detalhes que fazem diferença
10. **Asymmetric Balance**: Background text editorial

## 🔐 Validação

### Client-Side (Zod)
- Validação em tempo real
- Mensagens contextuais
- Validação por step
- Validação cruzada (ex: ao menos uma rede social)

### Server-Side (Laravel)
- Form Request validation
- Database constraints
- Sanitization

## 🚀 Performance

- **Code Splitting**: Layout e componentes separados
- **Lazy Loading**: Componentes carregados sob demanda
- **Optimized Re-renders**: useCallback, useMemo
- **Efficient State**: Estado local quando possível

## 📱 Responsividade

- **Mobile**: Single column, sidebar como drawer
- **Tablet**: Grid adaptativo
- **Desktop**: Sidebar fixa + content área

## 🎭 Animações

- **Form Steps**: Fade in/slide com motion
- **Progress Bar**: Smooth width transition (500ms)
- **Cards**: Hover effects e shadows
- **Success**: Pulse animation no ícone
- **Active Indicator**: Pulse na sidebar

## 💡 Tips

- Use `rounded-[2.5rem]` para cards principais
- Use `rounded-[1.5rem]` para cards internos
- Use `rounded-xl` para inputs
- Hover effects sempre com `transition-all duration-300`
- Shadows com glow da cor primária
- Mantenha consistency com cores e espaçamentos
- Background effects sempre com `pointer-events-none`

## 🔄 Diferenças do Layout Anterior

### Antes
- ❌ Sidebar inline que scrollava junto
- ❌ Progress bar simples
- ❌ Steps sem visual hierarchy clara
- ❌ Background simples com blurs
- ❌ Border-radius inconsistente
- ❌ Scrollbar padrão
- ❌ Typography sem tracking

### Agora (Editorial)
- ✅ Sidebar fixa sempre visível
- ✅ Progress bar com porcentagem destacada
- ✅ Steps com estados visuais claros
- ✅ Background editorial com text assimétrico
- ✅ Border-radius consistente (2.5rem)
- ✅ Custom scrollbar estilizada
- ✅ Typography com tracking-tight

## 🎯 Checklist de Implementação

- [x] WaitlistLayout com sidebar + main
- [x] WaitlistSidebar com progress e steps
- [x] Reestruturar WaitlistForm (remover sidebar antiga)
- [x] Atualizar index.tsx para usar novo layout
- [x] Custom scrollbar com hover laranja
- [x] Background editorial com text "UGC 4ARTISTS"
- [x] Atualizar todos os inputs para novo design
- [x] Atualizar selection cards (artist types, participation)
- [x] Atualizar availability section
- [x] Atualizar terms section
- [x] Success screen editorial
- [x] Botões com novo design
- [x] Hero section integrada
- [x] State sync entre form e sidebar
- [x] Corrigir erros de linting
- [x] Validação Zod funcionando
- [x] Responsividade básica

---

**Desenvolvido com 💜 pela equipe UGC 4Artists**

Design inspirado no Admin Panel com identidade visual única da Waitlist.

