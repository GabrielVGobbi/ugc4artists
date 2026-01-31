import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { Head, router } from '@inertiajs/react'
import { SearchableSelect } from '@/components/ui/searchable-select'
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Sparkles,
    Music,
    Users,
    Mic2,
    Star,
    Globe,
    Zap,
    Target,
    Instagram,
    Youtube,
    Calendar,
    MessageSquare,
    Flame,
    TrendingUp,
    DollarSign,
    Video,
    Camera,
    Play,
    Heart,
    Briefcase,
    Shield,
    Disc,
    Radio,
    Gamepad2,
    Palette,
    Dumbbell,
    GraduationCap,
    UtensilsCrossed,
    Plane,
    Home,
    Stethoscope,
    Dog,
    Baby,
    type LucideIcon,
    Castle,
    Ellipsis,
} from 'lucide-react'
import ClearLayout from '@/layouts/clear-layout'
import axios from 'axios'
import SvgIcon from '@/components/svg-icon'

interface OnboardingProps {
    savedProgress: {
        current_step: number
        data: OnboardingData
        updated_at?: string
    } | null
    userName: string
}

interface OnboardingData {
    // Comum
    role: 'artist' | 'creator' | 'brand' | ''
    source: string
    display_name: string
    country: string
    state: string
    city: string
    primary_language: string
    expectation: string
    links: Array<{ type: string; url: string }>

    // Artista
    artist_type: string
    primary_genre: string
    subgenres: string[]
    career_stage: string
    released_tracks_count: string
    release_frequency: string
    next_release_window: string
    release_type: string
    release_stage: string
    has_cover_art: boolean
    has_release_date: boolean
    release_date: string
    platforms: string[]
    audience_range: string
    primary_goal: string
    open_to: string[]
    monetization_status: string

    // Creator
    primary_handle: string
    creator_type: string
    niches: string[]
    audience_gender: string
    audience_age_range: string[]
    followers_range: string
    engagement_self_assessment: string
    content_formats: string[]
    content_style: string[]
    on_camera_presence: string
    production_resources: string[]
    brand_experience_level: string
    work_models: string[]
    monthly_capacity: string
    disallowed_categories: string[]
    exclusivity_preference: string
    preferred_brands_text: string

    // Brand
    company_name: string
    brand_name: string
    industry: string
    company_size: string
    website: string
    contact_name: string
    contact_role: string
    contact_email: string
    contact_phone: string
    team_size_marketing: string
    primary_objective: string
    kpi_focus: string[]
    campaign_timeline: string
    creator_types: string[]
    platform_targets: string[]
    target_niches: string[]
    creator_location_preference: string
    monthly_budget_range: string
    campaigns_per_month: string
    typical_deliverables: string[]
    needs: string[]
    approval_flow: string
    disallowed_creator_categories: string[]
    brand_guidelines_url: string
}

interface StepConfig {
    id: string
    component: (props: StepComponentProps) => ReactNode
    dataKey?: string
    visibleIf?: (data: OnboardingData) => boolean
}

interface StepComponentProps {
    formData: OnboardingData
    setFormData: React.Dispatch<React.SetStateAction<OnboardingData>>
    onNext: () => void
    onPrev: () => void
    isFirstStep: boolean
}

interface SelectionCardProps {
    active: boolean
    onClick: () => void
    label: string
    icon?: LucideIcon
    description?: string
    subLabel?: string
}

interface CustomFieldProps {
    label: string
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
    as?: 'input' | 'select' | 'textarea'
    type?: string
    options?: Array<{ value: string; label: string }>
}

// ============================================================================
// DADOS DE CONFIGURAÇÃO
// ============================================================================

const INITIAL_FORM_DATA: OnboardingData = {
    role: '',
    source: '',
    display_name: '',
    country: 'BR',
    state: '',
    city: '',
    primary_language: 'pt-BR',
    expectation: '',
    links: [],
    artist_type: '',
    primary_genre: '',
    subgenres: [],
    career_stage: '',
    released_tracks_count: '',
    release_frequency: '',
    next_release_window: '',
    release_type: '',
    release_stage: '',
    has_cover_art: false,
    has_release_date: false,
    release_date: '',
    platforms: [],
    audience_range: '',
    primary_goal: '',
    open_to: [],
    monetization_status: '',
    primary_handle: '',
    creator_type: '',
    niches: [],
    audience_gender: '',
    audience_age_range: [],
    followers_range: '',
    engagement_self_assessment: '',
    content_formats: [],
    content_style: [],
    on_camera_presence: '',
    production_resources: [],
    brand_experience_level: '',
    work_models: [],
    monthly_capacity: '',
    disallowed_categories: [],
    exclusivity_preference: '',
    preferred_brands_text: '',
    company_name: '',
    brand_name: '',
    industry: '',
    company_size: '',
    website: '',
    contact_name: '',
    contact_role: '',
    contact_email: '',
    contact_phone: '',
    team_size_marketing: '',
    primary_objective: '',
    kpi_focus: [],
    campaign_timeline: '',
    creator_types: [],
    platform_targets: [],
    target_niches: [],
    creator_location_preference: '',
    monthly_budget_range: '',
    campaigns_per_month: '',
    typical_deliverables: [],
    needs: [],
    approval_flow: '',
    disallowed_creator_categories: [],
    brand_guidelines_url: '',
}

const GENRES = [
    { value: 'pop', label: 'Pop' },
    { value: 'trap', label: 'Trap' },
    { value: 'funk', label: 'Funk' },
    { value: 'sertanejo', label: 'Sertanejo' },
    { value: 'rock', label: 'Rock' },
    { value: 'indie', label: 'Indie' },
    { value: 'pagode', label: 'Pagode' },
    { value: 'forro', label: 'Forró' },
    { value: 'gospel', label: 'Gospel' },
    { value: 'electronic', label: 'Eletrônica' },
    { value: 'hiphop', label: 'Rap / Hip-hop' },
    { value: 'other', label: 'Outro' },
]

const LANGUAGES = [
    { value: 'pt-BR', label: 'Português' },
    { value: 'en', label: 'Inglês' },
    { value: 'es', label: 'Espanhol' },
    { value: 'other', label: 'Outro' },
]

const SOURCES = ['Instagram', 'TikTok', 'Amigo/Indicação', 'YouTube', 'Anúncio Google', 'Outro']

const NICHES: Array<{ label: string; value: string; icon?: LucideIcon }> = [
    { label: 'Fitness', value: 'fitness', icon: Dumbbell },
    { label: 'Beleza', value: 'beauty', icon: Palette },
    { label: 'Moda', value: 'fashion', icon: Heart },
    { label: 'Tecnologia', value: 'tech', icon: Zap },
    { label: 'Games', value: 'games', icon: Gamepad2 },
    { label: 'Música', value: 'music', icon: Music },
    { label: 'Finanças', value: 'finance', icon: DollarSign },
    { label: 'Lifestyle', value: 'lifestyle', icon: Star },
    { label: 'Educação', value: 'education', icon: GraduationCap },
    { label: 'Comida', value: 'food', icon: UtensilsCrossed },
    { label: 'Viagem', value: 'travel', icon: Plane },
    { label: 'Casa/Decoração', value: 'home', icon: Home },
    { label: 'Saúde', value: 'health', icon: Stethoscope },
    { label: 'Pets', value: 'pets', icon: Dog },
    { label: 'Maternidade', value: 'parenting', icon: Baby },
    { label: 'Outro', value: 'other', icon: Globe },
]

// ============================================================================
// COMPONENTES REUTILIZÁVEIS
// ============================================================================

const SelectionCard = ({ active, onClick, label, icon: Icon, description, subLabel }: SelectionCardProps) => (
    <button
        type="button"
        onClick={onClick}
        className={`cursor-pointer group relative overflow-hidden rounded-[3rem] border-2 p-10 text-left transition-all duration-700 ${active
            ? 'scale-[1.02] border-primary bg-white shadow-[30px_30px_80px_rgba(255,77,0,0.12)]'
            : 'border-zinc-100 bg-white hover:scale-[1.01] hover:border-zinc-200'
            }`}
    >
        {Icon && (
            <div
                className={`absolute -right-8 -bottom-8 transition-all duration-700 group-hover:-rotate-12 group-hover:scale-125 ${active ? 'text-primary opacity-[0.08]' : 'text-black opacity-[0.03]'
                    }`}
            >
                <Icon size={280} strokeWidth={1} />
            </div>
        )}

        {active && (
            <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-[80px]"></div>
        )}

        <div className="relative z-10 flex h-full flex-col">
            <div className="mb-10 flex items-start justify-between">
                {Icon && (
                    <div
                        className={`flex h-16 w-16 items-center justify-center rounded-[1.5rem] transition-all duration-700 ${active
                            ? 'rotate-6 bg-primary text-white shadow-xl shadow-orange-500/30'
                            : 'bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100'
                            }`}
                    >
                        <Icon size={28} />
                    </div>
                )}

                <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-500 ${active
                        ? 'scale-110 border-primary bg-primary text-white shadow-lg'
                        : 'border-zinc-200 opacity-0 group-hover:opacity-100'
                        }`}
                >
                    {active && <Check size={14} strokeWidth={4} />}
                </div>
            </div>

            <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2">
                    {active && <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"></div>}
                    <span
                        className={`block text-3xl leading-none font-black tracking-tighter uppercase transition-colors ${active ? 'text-secondary' : 'text-zinc-300 group-hover:text-zinc-600'
                            }`}
                    >
                        {label}
                    </span>
                </div>

                {subLabel && (
                    <span
                        className={`block text-[0.7rem] font-black tracking-[0.3em] uppercase transition-colors ${active ? 'text-primary' : 'text-zinc-400'
                            }`}
                    >
                        {subLabel}
                    </span>
                )}

                {description && (
                    <p className="mt-4 max-w-[240px] text-sm leading-relaxed font-medium text-zinc-400">{description}</p>
                )}
            </div>
        </div>
    </button>
)

const CustomField = ({ label, placeholder, value, onChange, as = 'input', type = 'text', options }: CustomFieldProps) => {
    const baseClasses =
        'w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 px-6 py-2 text-lg font-medium text-zinc-800 outline-none transition-all duration-300 placeholder:text-zinc-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-orange-500/5'
    return (
        <div className="space-y-3">
            <label className="ml-1 text-[0.7rem] font-black tracking-[0.1em] uppercase text-zinc-700">{label}</label>
            {as === 'textarea' ? (
                <textarea
                    className={`${baseClasses} min-h-[140px] resize-none`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            ) : as === 'select' ? (

                <SearchableSelect
                    label=""
                    placeholder={placeholder || "Selecione..."}
                    value={value}
                    onChange={(val) => onChange({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>)}
                    options={options || []}
                    searchPlaceholder="Buscar..."
                />

            ) : (
                <input className={baseClasses} type={type} placeholder={placeholder} value={value} onChange={onChange} />
            )}
        </div>
    )
}

const StepWrapper = ({
    children,
    title,
    subtitle,
    tag,
    onNext,
    onPrev,
    isFirstStep,
    canProceed,
    nextLabel = 'Próximo',
    showFinalCta = false,
    isSubmitting = false,
}: {
    children: ReactNode
    title: string
    subtitle?: string
    tag?: string
    onNext: () => void
    onPrev: () => void
    isFirstStep: boolean
    canProceed: boolean
    nextLabel?: string
    showFinalCta?: boolean
    isSubmitting?: boolean
}) => (
    <div className="relative space-y-4 rounded-[4rem] border border-zinc-100 bg-white p-12 shadow-sm">

        <div className="space-y-2">
            {tag && (
                <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary">{tag}</span>
                </div>
            )}
            <h2 className="text-6xl font-black tracking-tighter text-secondary">{title}</h2>
            {subtitle && <p className="text-xl font-medium text-zinc-500">{subtitle}</p>}
        </div>

        {children}

        <div className="mt-12 flex items-center justify-between border-t border-zinc-100 pt-5">
            {!isFirstStep ? (
                <button
                    type="button"
                    onClick={onPrev}
                    className="cursor-pointer flex items-center gap-3 text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400 transition-colors hover:text-black"
                >
                    <ArrowLeft size={16} /> Voltar
                </button>
            ) : (
                <div />
            )}
            <button
                type="button"
                disabled={!canProceed || isSubmitting}
                onClick={onNext}
                className={`cursor-pointer flex items-center gap-3 rounded-2xl px-12 py-6 text-xs font-black tracking-[0.2em] uppercase text-white shadow-xl transition-all disabled:opacity-30 ${showFinalCta
                    ? 'bg-primary shadow-[0_20px_60px_rgba(255,77,0,0.4)] hover:scale-105 hover:bg-[#E64500] active:scale-95'
                    : 'bg-secondary hover:bg-primary'
                    }`}
            >
                {isSubmitting ? 'Salvando...' : nextLabel} {!isSubmitting && (showFinalCta ? <></> : <ArrowRight size={18} />)}
            </button>
        </div>
    </div>
)

const MultiSelectChips = ({
    options,
    selected,
    onToggle,
    variant = 'default',
}: {
    options: Array<{ label: string; value: string; icon?: LucideIcon }>
    selected: string[]
    onToggle: (value: string) => void
    variant?: 'default' | 'orange'
}) => (
    <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
            <button
                key={opt.value}
                type="button"
                onClick={() => onToggle(opt.value)}
                className={`cursor-pointer flex items-center gap-2 rounded-full border-2 px-7 py-4 text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${selected.includes(opt.value)
                    ? variant === 'orange'
                        ? 'border-primary bg-primary text-white shadow-xl shadow-orange-500/20'
                        : 'border-secondary bg-secondary text-white shadow-xl'
                    : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200'
                    }`}
            >
                {opt.icon && <opt.icon size={16} />}
                {opt.label}
            </button>
        ))}
    </div>
)

const ShieldCheck = ({ size }: { size: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
)

// ============================================================================
// STEP COMPONENTS - COMUM
// ============================================================================

const StepRoleSelect = ({ formData, setFormData, onNext }: StepComponentProps) => {
    const getButtonText = () => {
        switch (formData.role) {
            case 'artist':
                return 'Quero divulgar minha música'
            case 'creator':
                return 'Quero ser criador'
            case 'brand':
                return 'Quero anunciar'
            default:
                return 'Confirmar e Prosseguir'
        }
    }

    return (
        <div className="space-y-10 mt-10">
            <div className="mx-auto max-w-4xl space-y-2 text-center">
                <h1 className="leading-[0.8] font-black tracking-tighter text-secondary text-7xl">
                    Vamos começar pelo seu  <span className="font-light text-primary italic">Perfil.</span>
                </h1>
                <p className="mx-auto max-w-xl text-xl leading-relaxed font-medium text-zinc-500">
                    Antes de liberarmos as ferramentas, precisamos entender como você quer atuar no futuro da música.
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <SelectionCard
                    label="Artista"
                    subLabel="Quero divulgar minha música"
                    description="Lance músicas com vídeos reais feitos por criadores que entendem de trends"
                    icon={Mic2}
                    active={formData.role === 'artist'}
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'artist' }))}
                />
                <SelectionCard
                    label="UGC & Divulgação"
                    subLabel="Quero ser criador"
                    description="Monetize criando vídeos para artistas e marcas musicais."
                    icon={TrendingUp}
                    active={formData.role === 'creator'}
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'creator' }))}
                />
                <SelectionCard
                    label="Marca"
                    subLabel="Quero anunciar"
                    description="Para empresas e marcas que querem divulgar seus produtos, lançar campanhas e contratar criadores para ampliar o alcance."
                    icon={Castle}
                    active={formData.role === 'brand'}
                    onClick={() => setFormData((prev) => ({ ...prev, role: 'brand' }))}
                />
            </div>

            <div className="flex justify-center">
                <button
                    type="button"
                    disabled={!formData.role}
                    onClick={onNext}
                    className="cursor-pointer group relative overflow-hidden rounded-[2.5rem] bg-secondary px-16 py-7 text-[0.7rem] font-black tracking-[0.3em] uppercase text-white shadow-2xl transition-all hover:bg-primary disabled:opacity-30"
                >
                    <div className="relative z-10 flex items-center gap-4">
                        {getButtonText()} <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                    </div>
                    <div className="absolute top-0 left-0 h-full w-full -translate-x-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-1000 group-hover:translate-x-full"></div>
                </button>
            </div>
        </div>
    )
}

// ============================================================================
// STEP COMPONENTS - ARTISTA
// ============================================================================

const StepArtistIdentity = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => (
    <StepWrapper
        title="Identidade Artística"
        subtitle="Como o mundo te conhece nos palcos?"
        tag="Artist Profile"
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        canProceed={!!formData.display_name && !!formData.artist_type && !!formData.primary_genre && !!formData.state && !!formData.city}
    >
        <div className="space-y-8 mt-10">
            <CustomField
                label="Nome Artístico"
                placeholder="Ex: MC Talento, Banda XYZ..."
                value={formData.display_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
            />

            <div className="space-y-6">
                <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">Tipo de Formação</label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: 'Solo', value: 'solo', icon: 'microphone' },
                        { label: 'Banda', value: 'band', icon: 'banda' },
                        { label: 'DJ / Producer', value: 'dj_producer', icon: 'dj' },
                        { label: 'Outro', value: 'other', icon: Ellipsis },
                    ].map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, artist_type: t.value }))}
                            className={`cursor-pointer flex flex-col items-center gap-5 rounded-[2rem] border-2 p-8 transition-all duration-500 ${formData.artist_type === t.value
                                ? 'border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200'
                                }`}
                        >
                            {typeof t.icon === 'string' ? (
                                <SvgIcon name={t.icon} size={28} />
                            ) : (
                                <t.icon size={28} />
                            )}
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase">{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <CustomField
                    label="Gênero Principal"
                    as="select"
                    value={formData.primary_genre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primary_genre: e.target.value }))}
                    options={[{ value: '', label: 'Selecione...' }, ...GENRES]}
                />
                <CustomField
                    label="Idioma Principal"
                    as="select"
                    value={formData.primary_language}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primary_language: e.target.value }))}
                    options={LANGUAGES}
                />
            </div>

            <div className="grid grid-cols-2 gap-8">
                <CustomField
                    label="Estado (UF)"
                    placeholder="SP"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value.toUpperCase().slice(0, 2) }))}
                />
                <CustomField
                    label="Cidade"
                    placeholder="São Paulo"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                />
            </div>
        </div>
    </StepWrapper>
)

const StepArtistCareerStage = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => (
    <StepWrapper
        title="Seu Momento"
        subtitle="Em qual fase da carreira você está hoje?"
        tag="Momentum"
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        canProceed={!!formData.career_stage && !!formData.released_tracks_count}
    >
        <div className="space-y-12 mt-10">
            <div className="grid grid-cols-2 gap-6">
                {[
                    { label: 'Iniciante', sub: 'Primeiros lançamentos', value: 'beginner', icon: Flame },
                    { label: 'Crescimento', sub: 'Audiência fiel', value: 'growing', icon: TrendingUp },
                    { label: 'Consolidado', sub: 'Base sólida', value: 'established', icon: Target },
                    { label: 'Profissional', sub: 'Vive de música', value: 'professional', icon: Star },
                ].map((s) => (
                    <SelectionCard
                        key={s.value}
                        label={s.label}
                        subLabel={s.sub}
                        icon={s.icon}
                        active={formData.career_stage === s.value}
                        onClick={() => setFormData((prev) => ({ ...prev, career_stage: s.value }))}
                    />
                ))}
            </div>

            <div className="grid grid-cols-2 gap-8">
                <CustomField
                    label="Músicas já lançadas?"
                    as="select"
                    value={formData.released_tracks_count}
                    onChange={(e) => setFormData((prev) => ({ ...prev, released_tracks_count: e.target.value }))}
                    options={[
                        { value: '', label: 'Selecione...' },
                        { value: '0', label: 'Ainda não' },
                        { value: '1_3', label: 'Sim, 1–3' },
                        { value: '4_10', label: 'Sim, 4–10' },
                        { value: '10_plus', label: 'Sim, +10' },
                    ]}
                />
                <CustomField
                    label="Frequência de Lançamentos"
                    as="select"
                    value={formData.release_frequency}
                    onChange={(e) => setFormData((prev) => ({ ...prev, release_frequency: e.target.value }))}
                    options={[
                        { value: '', label: 'Selecione...' },
                        { value: 'none', label: 'Ainda sem frequência' },
                        { value: 'quarterly', label: 'Cada 3–6 meses' },
                        { value: 'monthly', label: 'Mensal' },
                        { value: 'always_on', label: 'Contínuo' },
                    ]}
                />
            </div>
        </div>
    </StepWrapper>
)

const StepArtistReleaseWindow = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => (
    <StepWrapper
        title="Próximo Lançamento"
        subtitle="Você pretende lançar uma música nos próximos..."
        tag="Upcoming"
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        canProceed={!!formData.next_release_window}
    >
        <div className="grid grid-cols-2 gap-6 mt-10">
            {[
                { label: '30 Dias', icon: Zap, value: '30d' },
                { label: '60 Dias', icon: Calendar, value: '60d' },
                { label: '90 Dias', icon: Target, value: '90d' },
                { label: 'Ainda não sei', icon: MessageSquare, value: 'unknown' },
            ].map((w) => (
                <SelectionCard
                    key={w.value}
                    label={w.label}
                    icon={w.icon}
                    active={formData.next_release_window === w.value}
                    onClick={() => setFormData((prev) => ({ ...prev, next_release_window: w.value }))}
                />
            ))}
        </div>
    </StepWrapper>
)

const StepArtistReleaseDetails = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => (
    <StepWrapper
        title="Detalhes do Lançamento"
        subtitle="Conta mais sobre o que vem por aí."
        tag="Details"
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        canProceed={!!formData.release_type && !!formData.release_stage}
    >
        <div className="space-y-12 mt-10">
            <div className="space-y-6">
                <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">Tipo de Lançamento</label>
                <div className="grid grid-cols-3 gap-6">
                    {['Single', 'EP', 'Album'].map((type) => (
                        <SelectionCard
                            key={type}
                            label={type}
                            active={formData.release_type === type.toLowerCase()}
                            onClick={() => setFormData((prev) => ({ ...prev, release_type: type.toLowerCase() }))}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12">
                <CustomField
                    label="Em qual etapa está?"
                    as="select"
                    value={formData.release_stage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, release_stage: e.target.value }))}
                    options={[
                        { value: '', label: 'Selecione...' },
                        { value: 'in_production', label: 'Em Produção' },
                        { value: 'finished', label: 'Finalizada' },
                        { value: 'distributed', label: 'Já Distribuída' },
                    ]}
                />
                <div className="flex flex-col justify-center gap-5 rounded-[2rem] border border-zinc-100 bg-zinc-50/50 p-8">
                    <label className="group flex cursor-pointer items-center gap-4">
                        <div
                            className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${formData.has_cover_art
                                ? 'border-primary bg-primary text-white'
                                : 'border-zinc-200 bg-white group-hover:border-primary'
                                }`}
                        >
                            {formData.has_cover_art && <Check size={14} strokeWidth={4} />}
                        </div>
                        <input
                            type="checkbox"
                            checked={formData.has_cover_art}
                            onChange={(e) => setFormData((prev) => ({ ...prev, has_cover_art: e.target.checked }))}
                            className="hidden"
                        />
                        <span className="text-sm font-bold text-zinc-700">Já tenho capa</span>
                    </label>
                    <label className="group flex cursor-pointer items-center gap-4">
                        <div
                            className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${formData.has_release_date
                                ? 'border-primary bg-primary text-white'
                                : 'border-zinc-200 bg-white group-hover:border-primary'
                                }`}
                        >
                            {formData.has_release_date && <Check size={14} strokeWidth={4} />}
                        </div>
                        <input
                            type="checkbox"
                            checked={formData.has_release_date}
                            onChange={(e) => setFormData((prev) => ({ ...prev, has_release_date: e.target.checked }))}
                            className="hidden"
                        />
                        <span className="text-sm font-bold text-zinc-700">Já tenho data definida</span>
                    </label>
                </div>
            </div>

            {formData.has_release_date && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                    <CustomField
                        label="Data do Lançamento"
                        type="date"
                        value={formData.release_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, release_date: e.target.value }))}
                    />
                </div>
            )}
        </div>
    </StepWrapper>
)

const StepArtistPresence = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const togglePlatform = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            platforms: prev.platforms.includes(value) ? prev.platforms.filter((p) => p !== value) : [...prev.platforms, value],
        }))
    }

    return (
        <StepWrapper
            title="Presença Digital"
            subtitle="Onde você já está ativo?"
            tag="Presence"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={formData.platforms.length > 0 && !!formData.audience_range}
        >
            <div className="space-y-12 mt-10">
                <div className="space-y-8">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">Plataformas</label>
                    <MultiSelectChips
                        options={[
                            { label: 'Spotify', value: 'spotify' },
                            { label: 'YouTube', value: 'youtube' },
                            { label: 'Instagram', value: 'instagram' },
                            { label: 'TikTok', value: 'tiktok' },
                            { label: 'Deezer', value: 'deezer' },
                            { label: 'Apple Music', value: 'apple_music' },
                            { label: 'SoundCloud', value: 'soundcloud' },
                        ]}
                        selected={formData.platforms}
                        onToggle={togglePlatform}
                    />
                </div>

                <div className="space-y-8">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Sua Base de Audiência Total
                    </label>
                    <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                        {[
                            { label: '0 – 1k', value: '0_1k' },
                            { label: '1k – 10k', value: '1k_10k' },
                            { label: '10k – 50k', value: '10k_50k' },
                            { label: '50k+', value: '50k_plus' },
                        ].map((a) => (
                            <button
                                key={a.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, audience_range: a.value }))}
                                className={`cursor-pointer rounded-[2rem] border-2 p-10 text-xl font-black transition-all duration-500 ${formData.audience_range === a.value
                                    ? 'scale-105 border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                    : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'
                                    }`}
                            >
                                {a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    )
}

const StepArtistGoals = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const toggleOpenTo = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            open_to: prev.open_to.includes(value) ? prev.open_to.filter((o) => o !== value) : [...prev.open_to, value],
        }))
    }

    return (
        <StepWrapper
            title="Objetivos & Oportunidades"
            subtitle="Como podemos te ajudar a crescer?"
            tag="Goals"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={!!formData.primary_goal && formData.open_to.length > 0}
        >
            <div className="space-y-16 mt-10">
                <div className="space-y-8">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">Objetivo Principal</label>
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                        {[
                            { label: 'Crescer Audiência', value: 'grow_audience', icon: TrendingUp },
                            { label: 'Divulgar Sons', value: 'promote_releases', icon: Disc },
                            { label: 'Ganhar Dinheiro', value: 'monetize_music', icon: DollarSign },
                            { label: 'Conectar com Marcas', value: 'brand_deals', icon: Target },
                            { label: 'Profissionalizar', value: 'professionalize', icon: Zap },
                        ].map((g) => (
                            <SelectionCard
                                key={g.value}
                                label={g.label}
                                icon={g.icon}
                                active={formData.primary_goal === g.value}
                                onClick={() => setFormData((prev) => ({ ...prev, primary_goal: g.value }))}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Aberto a Oportunidades de...
                    </label>
                    <MultiSelectChips
                        variant="orange"
                        options={[
                            { label: 'Campanhas com Marcas', value: 'brand_campaigns' },
                            { label: 'Conteúdo Patrocinado', value: 'sponsored_content' },
                            { label: 'UGC para Marcas', value: 'ugc_for_brands' },
                            { label: 'Shows e Ativações', value: 'shows_activations' },
                            { label: 'Licenciamento / Sync', value: 'licensing_sync' },
                        ]}
                        selected={formData.open_to}
                        onToggle={toggleOpenTo}
                    />
                </div>
            </div>
        </StepWrapper>
    )
}

// ============================================================================
// STEP COMPONENTS - CREATOR
// ============================================================================

const StepCreatorIdentity = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => (
    <StepWrapper
        title="Identidade"
        subtitle="Como o público te conhece?"
        tag="Creator Profile"
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        canProceed={!!formData.display_name && !!formData.creator_type && !!formData.state && !!formData.city}
    >
        <div className="space-y-9">
            <div className="grid grid-cols-2 gap-4 mt-10">
                <CustomField
                    label="Nome Público"
                    placeholder="Ex: Ana Trends, João Vlogs..."
                    value={formData.display_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                />
                <CustomField
                    label="Seu @ Principal (opcional)"
                    placeholder="@seunome"
                    value={formData.primary_handle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primary_handle: e.target.value }))}
                />
            </div>

            <div className="space-y-6">
                <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">Formato de Criador</label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: 'Solo', value: 'solo', icon: Mic2 },
                        { label: 'Casal', value: 'couple', icon: Heart },
                        { label: 'Família', value: 'family', icon: Users },
                        { label: 'Coletivo', value: 'collective', icon: Globe },
                    ].map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, creator_type: t.value }))}
                            className={`cursor-pointer flex flex-col items-center gap-3 rounded-[2rem] border-2 p-6 px-2 transition-all duration-500 ${formData.creator_type === t.value
                                ? 'border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200'
                                }`}
                        >
                            <t.icon size={28} />
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase">{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <CustomField
                    label="Estado (UF)"
                    placeholder="SP"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value.toUpperCase().slice(0, 2) }))}
                />
                <CustomField
                    label="Cidade"
                    placeholder="São Paulo"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                />
            </div>
        </div>
    </StepWrapper>
)

const StepCreatorNiches = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const toggleNiche = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            niches: prev.niches.includes(value)
                ? prev.niches.filter((n) => n !== value)
                : prev.niches.length < 5
                    ? [...prev.niches, value]
                    : prev.niches,
        }))
    }

    return (
        <StepWrapper
            title="Nicho e Público"
            subtitle="Quais são seus nichos principais?"
            tag="Niche"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={formData.niches.length > 0}
        >
            <div className="space-y-12 mt-10">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                            Nichos (máx. 5)
                        </label>
                        <span className="text-sm font-bold text-zinc-400">{formData.niches.length}/5</span>
                    </div>
                    <MultiSelectChips options={NICHES} selected={formData.niches} onToggle={toggleNiche} variant="orange" />
                </div>

                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Seu público é mais... (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            { label: 'Mais feminino', value: 'mostly_female' },
                            { label: 'Mais masculino', value: 'mostly_male' },
                            { label: 'Equilibrado', value: 'balanced' },
                            { label: 'Não sei', value: 'unknown' },
                        ].map((g) => (
                            <button
                                key={g.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, audience_gender: g.value }))}
                                className={`cursor-pointer rounded-[2rem] border-2 p-4 text-xs font-black tracking-widest uppercase transition-all duration-500 ${formData.audience_gender === g.value
                                    ? 'border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                    : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200'
                                    }`}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    )
}

const StepCreatorPlatforms = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const togglePlatform = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            platforms: prev.platforms.includes(value) ? prev.platforms.filter((p) => p !== value) : [...prev.platforms, value],
        }))
    }

    return (
        <StepWrapper
            title="Plataformas e Alcance"
            subtitle="Onde você publica com frequência?"
            tag="Platforms"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={formData.platforms.length > 0}
        >
            <div className="space-y-16 mt-10">
                <div className="space-y-8">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">Plataformas</label>
                    <MultiSelectChips
                        options={[
                            { label: 'Instagram', value: 'instagram', icon: Instagram },
                            { label: 'TikTok', value: 'tiktok', icon: Video },
                            { label: 'YouTube', value: 'youtube', icon: Youtube },
                            { label: 'YouTube Shorts', value: 'youtube_shorts', icon: Play },
                            { label: 'Kwai', value: 'kwai', icon: Video },
                            { label: 'Twitch', value: 'twitch', icon: Radio },
                        ]}
                        selected={formData.platforms}
                        onToggle={togglePlatform}
                    />
                </div>

                <div className="space-y-8">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Faixa de Seguidores (aprox.)
                    </label>
                    <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
                        {[
                            { label: '0–5k', value: '0_5k' },
                            { label: '5k–25k', value: '5k_25k' },
                            { label: '25k–100k', value: '25k_100k' },
                            { label: '100k–500k', value: '100k_500k' },
                            { label: '500k+', value: '500k_plus' },
                        ].map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, followers_range: f.value }))}
                                className={`cursor-pointer rounded-[2rem] border-2 p-8 text-lg font-black transition-all duration-500 ${formData.followers_range === f.value
                                    ? 'scale-105 border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                    : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    )
}

const StepCreatorContent = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const toggleFormat = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            content_formats: prev.content_formats.includes(value)
                ? prev.content_formats.filter((f) => f !== value)
                : [...prev.content_formats, value],
        }))
    }

    const toggleStyle = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            content_style: prev.content_style.includes(value)
                ? prev.content_style.filter((s) => s !== value)
                : prev.content_style.length < 3
                    ? [...prev.content_style, value]
                    : prev.content_style,
        }))
    }

    return (
        <StepWrapper
            title="Seu Conteúdo"
            subtitle="O que você produz e como?"
            tag="Content"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={formData.content_formats.length > 0 && formData.content_style.length > 0 && !!formData.on_camera_presence}
        >
            <div className="space-y-12 mt-10">
                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">O que você produz?</label>
                    <MultiSelectChips
                        options={[
                            { label: 'Vídeos curtos', value: 'short_videos', icon: Video },
                            { label: 'Stories', value: 'stories', icon: Camera },
                            { label: 'Lives', value: 'lives', icon: Radio },
                            { label: 'Fotos', value: 'photos', icon: Camera },
                            { label: 'Reviews', value: 'reviews', icon: Star },
                            { label: 'Tutoriais', value: 'tutorials', icon: Play },
                            { label: 'Unboxing', value: 'unboxing', icon: Briefcase },
                            { label: 'UGC (sem postar)', value: 'ugc_off_profile', icon: Video },
                        ]}
                        selected={formData.content_formats}
                        onToggle={toggleFormat}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                            Qual seu estilo? (máx. 3)
                        </label>
                        <span className="text-sm font-bold text-zinc-400">{formData.content_style.length}/3</span>
                    </div>
                    <MultiSelectChips
                        variant="orange"
                        options={[
                            { label: 'Autêntico/casual', value: 'authentic' },
                            { label: 'Educativo', value: 'educational' },
                            { label: 'Humor', value: 'humor' },
                            { label: 'Cinematográfico', value: 'cinematic' },
                            { label: 'Trend/viral', value: 'trend' },
                            { label: 'Storytelling', value: 'storytelling' },
                        ]}
                        selected={formData.content_style}
                        onToggle={toggleStyle}
                    />
                </div>

                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Você aparece nos vídeos?
                    </label>
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Sempre', value: 'always', icon: Camera },
                            { label: 'Às vezes', value: 'sometimes', icon: Video },
                            { label: 'Não (faceless)', value: 'never', icon: Shield },
                        ].map((o) => (
                            <SelectionCard
                                key={o.value}
                                label={o.label}
                                icon={o.icon}
                                active={formData.on_camera_presence === o.value}
                                onClick={() => setFormData((prev) => ({ ...prev, on_camera_presence: o.value }))}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    )
}

const StepCreatorBrandWork = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const toggleWorkModel = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            work_models: prev.work_models.includes(value)
                ? prev.work_models.filter((w) => w !== value)
                : [...prev.work_models, value],
        }))
    }

    return (
        <StepWrapper
            title="Trabalhos com Marcas"
            subtitle="Sua experiência e preferências"
            tag="Brand Work"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={!!formData.brand_experience_level && formData.work_models.length > 0}
        >
            <div className="space-y-12 mt-10">
                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Você já trabalhou com marcas?
                    </label>
                    <div className="grid grid-cols-3 gap-6">
                        {[
                            { label: 'Nunca', value: 'never', icon: Star },
                            { label: 'Algumas vezes', value: 'sometimes', icon: TrendingUp },
                            { label: 'Frequentemente', value: 'often', icon: Target },
                        ].map((e) => (
                            <SelectionCard
                                key={e.value}
                                label={e.label}
                                icon={e.icon}
                                active={formData.brand_experience_level === e.value}
                                onClick={() => setFormData((prev) => ({ ...prev, brand_experience_level: e.value }))}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Que tipo de trabalho você aceita?
                    </label>
                    <MultiSelectChips
                        variant="orange"
                        options={[
                            { label: 'Conteúdo orgânico', value: 'organic_post' },
                            { label: 'Conteúdo patrocinado', value: 'sponsored_post' },
                            { label: 'UGC (sem postar)', value: 'ugc_only' },
                            { label: 'Afiliado/comissão', value: 'affiliate' },
                        ]}
                        selected={formData.work_models}
                        onToggle={toggleWorkModel}
                    />
                </div>
            </div>
        </StepWrapper>
    )
}

const StepCreatorAvailability = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => (
    <StepWrapper
        title="Disponibilidade e Objetivo"
        subtitle="Sua capacidade e metas"
        tag="Availability"
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        canProceed={!!formData.monthly_capacity && !!formData.primary_goal}
    >
        <div className="space-y-12 mt-10">
            <div className="space-y-6">
                <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                    Quantas campanhas você consegue fazer por mês?
                </label>
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { label: '1–2', value: '1_2' },
                        { label: '3–5', value: '3_5' },
                        { label: '5+', value: '5_plus' },
                    ].map((c) => (
                        <SelectionCard
                            key={c.value}
                            label={c.label}
                            active={formData.monthly_capacity === c.value}
                            onClick={() => setFormData((prev) => ({ ...prev, monthly_capacity: c.value }))}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                    Qual seu objetivo principal agora?
                </label>
                <div className="grid grid-cols-2 gap-6">
                    {[
                        { label: 'Monetizar', value: 'monetize', icon: DollarSign },
                        { label: 'Crescer audiência', value: 'grow_audience', icon: TrendingUp },
                        { label: 'Construir portfólio', value: 'build_portfolio', icon: Briefcase },
                        { label: 'Marcas grandes', value: 'big_brands', icon: Target },
                    ].map((g) => (
                        <SelectionCard
                            key={g.value}
                            label={g.label}
                            icon={g.icon}
                            active={formData.primary_goal === g.value}
                            onClick={() => setFormData((prev) => ({ ...prev, primary_goal: g.value }))}
                        />
                    ))}
                </div>
            </div>
        </div>
    </StepWrapper>
)

// ============================================================================
// STEP COMPONENTS - BRAND
// ============================================================================

const StepBrandIdentity = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => (
    <StepWrapper
        title="Sobre a empresa"
        subtitle="Informações da sua marca"
        tag="Brand Profile"
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        canProceed={!!formData.company_name && !!formData.industry && !!formData.state && !!formData.city}
    >
        <div className="space-y-9 mt-10">
            <div className="grid grid-cols-2 gap-4">
                <CustomField
                    label="Nome da empresa/marca"
                    placeholder="Ex: Minha Empresa LTDA"
                    value={formData.company_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
                />
                <CustomField
                    label="Nome público da marca (opcional)"
                    placeholder="Como são conhecidos"
                    value={formData.brand_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand_name: e.target.value }))}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <CustomField
                    label="Segmento"
                    as="select"
                    value={formData.industry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                    options={[
                        { value: '', label: 'Selecione...' },
                        { value: 'beauty', label: 'Beleza / Cosméticos' },
                        { value: 'fashion', label: 'Moda / Acessórios' },
                        { value: 'fitness', label: 'Fitness / Suplementos' },
                        { value: 'tech', label: 'Tecnologia / Apps' },
                        { value: 'food', label: 'Alimentos / Bebidas' },
                        { value: 'home', label: 'Casa / Decoração' },
                        { value: 'education', label: 'Educação' },
                        { value: 'finance', label: 'Finanças' },
                        { value: 'health', label: 'Saúde' },
                        { value: 'travel', label: 'Viagem / Turismo' },
                        { value: 'entertainment', label: 'Entretenimento' },
                        { value: 'b2b', label: 'Serviços B2B' },
                        { value: 'other', label: 'Outro' },
                    ]}
                />
                <CustomField
                    label="Tamanho da empresa (opcional)"
                    as="select"
                    value={formData.company_size}
                    onChange={(e) => setFormData((prev) => ({ ...prev, company_size: e.target.value }))}
                    options={[
                        { value: '', label: 'Selecione...' },
                        { value: '1_10', label: '1–10' },
                        { value: '11_50', label: '11–50' },
                        { value: '51_200', label: '51–200' },
                        { value: '201_1000', label: '201–1000' },
                        { value: '1000_plus', label: '1000+' },
                    ]}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <CustomField
                    label="Estado (UF)"
                    placeholder="SP"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value.toUpperCase().slice(0, 2) }))}
                />
                <CustomField
                    label="Cidade"
                    placeholder="São Paulo"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                />
            </div>

            <CustomField
                label="Site (opcional)"
                type="url"
                placeholder="https://www.suamarca.com.br"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
            />
        </div>
    </StepWrapper>
)

const StepBrandContact = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => (
    <StepWrapper
        title="Contato e time"
        subtitle="Quem vai gerenciar as campanhas?"
        tag="Contact"
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        canProceed={!!formData.contact_name && !!formData.contact_role && !!formData.contact_email}
    >
        <div className="space-y-9 mt-10">
            <CustomField
                label="Nome do responsável"
                placeholder="Seu nome completo"
                value={formData.contact_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, contact_name: e.target.value }))}
            />

            <div className="space-y-6">
                <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">Você trabalha em…</label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: 'Marketing', value: 'marketing' },
                        { label: 'Growth', value: 'growth' },
                        { label: 'E-commerce', value: 'ecommerce' },
                        { label: 'Produto', value: 'product' },
                        { label: 'Branding', value: 'branding' },
                        { label: 'Agência', value: 'partner' },
                        { label: 'Outro', value: 'other' },
                    ].map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, contact_role: r.value }))}
                            className={`cursor-pointer rounded-[2rem] border-2 p-4 text-xs font-black tracking-widest uppercase transition-all duration-500 ${
                                formData.contact_role === r.value
                                    ? 'border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                    : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <CustomField
                    label="E-mail para contato"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.contact_email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_email: e.target.value }))}
                />
                <CustomField
                    label="WhatsApp (opcional)"
                    type="tel"
                    placeholder="+55 11 99999-9999"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))}
                />
            </div>

            <div className="space-y-6">
                <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                    Quantas pessoas vão usar a plataforma? (opcional)
                </label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: 'Só eu', value: '1' },
                        { label: '2–5', value: '2_5' },
                        { label: '6–15', value: '6_15' },
                        { label: '16+', value: '16_plus' },
                    ].map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, team_size_marketing: t.value }))}
                            className={`cursor-pointer rounded-[2rem] border-2 p-6 text-lg font-black transition-all duration-500 ${
                                formData.team_size_marketing === t.value
                                    ? 'scale-105 border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                    : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </StepWrapper>
)

const StepBrandGoals = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const toggleKpi = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            kpi_focus: prev.kpi_focus.includes(value)
                ? prev.kpi_focus.filter((k) => k !== value)
                : prev.kpi_focus.length < 4
                    ? [...prev.kpi_focus, value]
                    : prev.kpi_focus,
        }))
    }

    return (
        <StepWrapper
            title="Objetivos de campanha"
            subtitle="O que você quer alcançar?"
            tag="Goals"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={!!formData.primary_objective && !!formData.campaign_timeline}
        >
            <div className="space-y-12 mt-10">
                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Qual é o objetivo principal?
                    </label>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {[
                            { label: 'Alcance / Reconhecimento', value: 'awareness', icon: Globe },
                            { label: 'Performance / Conversão', value: 'performance', icon: Target },
                            { label: 'Lançamento de Produto', value: 'product_launch', icon: Sparkles },
                            { label: 'Conteúdo UGC para Anúncios', value: 'ugc_ads', icon: Video },
                            { label: 'Crescimento Social', value: 'social_growth', icon: TrendingUp },
                            { label: 'Tráfego para Site/App', value: 'traffic', icon: Zap },
                        ].map((g) => (
                            <SelectionCard
                                key={g.value}
                                label={g.label}
                                icon={g.icon}
                                active={formData.primary_objective === g.value}
                                onClick={() => setFormData((prev) => ({ ...prev, primary_objective: g.value }))}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                            Quais métricas importam mais? (máx. 4, opcional)
                        </label>
                        <span className="text-sm font-bold text-zinc-400">{formData.kpi_focus.length}/4</span>
                    </div>
                    <MultiSelectChips
                        variant="orange"
                        options={[
                            { label: 'Views', value: 'views' },
                            { label: 'CTR', value: 'ctr' },
                            { label: 'CPA/ROAS', value: 'cpa_roas' },
                            { label: 'Leads', value: 'leads' },
                            { label: 'Vendas', value: 'sales' },
                            { label: 'Seguidores', value: 'followers' },
                            { label: 'Conteúdo reutilizável', value: 'reusable_content' },
                        ]}
                        selected={formData.kpi_focus}
                        onToggle={toggleKpi}
                    />
                </div>

                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Quando quer lançar a primeira campanha?
                    </label>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            { label: 'Esta semana', value: 'this_week' },
                            { label: '2–4 semanas', value: '2_4_weeks' },
                            { label: '1–2 meses', value: '1_2_months' },
                            { label: 'Ainda não sei', value: 'unknown' },
                        ].map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, campaign_timeline: t.value }))}
                                className={`cursor-pointer rounded-[2rem] border-2 p-6 text-xs font-black tracking-widest uppercase transition-all duration-500 ${
                                    formData.campaign_timeline === t.value
                                        ? 'border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                        : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    )
}

const StepBrandCreators = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const toggleCreatorType = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            creator_types: prev.creator_types.includes(value)
                ? prev.creator_types.filter((c) => c !== value)
                : [...prev.creator_types, value],
        }))
    }

    const togglePlatform = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            platform_targets: prev.platform_targets.includes(value)
                ? prev.platform_targets.filter((p) => p !== value)
                : [...prev.platform_targets, value],
        }))
    }

    const toggleNiche = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            target_niches: prev.target_niches.includes(value)
                ? prev.target_niches.filter((n) => n !== value)
                : prev.target_niches.length < 6
                    ? [...prev.target_niches, value]
                    : prev.target_niches,
        }))
    }

    return (
        <StepWrapper
            title="Quem você quer contratar"
            subtitle="Preferências de criadores"
            tag="Creators"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={formData.creator_types.length > 0 && formData.platform_targets.length > 0}
        >
            <div className="space-y-12 mt-10">
                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Você quer trabalhar com…
                    </label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                            { label: 'Influenciadores', sub: 'Postam no próprio perfil', value: 'influencers' },
                            { label: 'Criadores UGC', sub: 'Sem postar no perfil', value: 'ugc_creators' },
                            { label: 'Ambos', sub: 'Máxima flexibilidade', value: 'both' },
                        ].map((c) => (
                            <SelectionCard
                                key={c.value}
                                label={c.label}
                                subLabel={c.sub}
                                active={formData.creator_types.includes(c.value)}
                                onClick={() => toggleCreatorType(c.value)}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">Plataformas alvo</label>
                    <MultiSelectChips
                        options={[
                            { label: 'Instagram', value: 'instagram', icon: Instagram },
                            { label: 'TikTok', value: 'tiktok', icon: Video },
                            { label: 'YouTube', value: 'youtube', icon: Youtube },
                            { label: 'YouTube Shorts', value: 'youtube_shorts', icon: Play },
                        ]}
                        selected={formData.platform_targets}
                        onToggle={togglePlatform}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                            Nichos desejados (máx. 6, opcional)
                        </label>
                        <span className="text-sm font-bold text-zinc-400">{formData.target_niches.length}/6</span>
                    </div>
                    <MultiSelectChips variant="orange" options={NICHES} selected={formData.target_niches} onToggle={toggleNiche} />
                </div>

                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Localização dos criadores (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            { label: 'Tanto faz', value: 'any' },
                            { label: 'Minha região', value: 'same_region' },
                            { label: 'Brasil (geral)', value: 'br' },
                            { label: 'Internacional', value: 'global' },
                        ].map((l) => (
                            <button
                                key={l.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, creator_location_preference: l.value }))}
                                className={`cursor-pointer rounded-[2rem] border-2 p-4 text-xs font-black tracking-widest uppercase transition-all duration-500 ${
                                    formData.creator_location_preference === l.value
                                        ? 'border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                        : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200'
                                }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    )
}

const StepBrandBudget = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const toggleDeliverable = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            typical_deliverables: prev.typical_deliverables.includes(value)
                ? prev.typical_deliverables.filter((d) => d !== value)
                : prev.typical_deliverables.length < 5
                    ? [...prev.typical_deliverables, value]
                    : prev.typical_deliverables,
        }))
    }

    return (
        <StepWrapper
            title="Orçamento e volume"
            subtitle="Planejamento financeiro"
            tag="Budget"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={true}
        >
            <div className="space-y-12 mt-10">
                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Orçamento mensal estimado (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {[
                            { label: 'Até R$ 2.000', value: '0_2k' },
                            { label: 'R$ 2k – R$ 10k', value: '2k_10k' },
                            { label: 'R$ 10k – R$ 50k', value: '10k_50k' },
                            { label: 'R$ 50k+', value: '50k_plus' },
                            { label: 'Não informar', value: 'unknown' },
                        ].map((b) => (
                            <button
                                key={b.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, monthly_budget_range: b.value }))}
                                className={`cursor-pointer rounded-[2rem] border-2 p-6 text-xs font-black tracking-widest uppercase transition-all duration-500 ${
                                    formData.monthly_budget_range === b.value
                                        ? 'border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                        : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200'
                                }`}
                            >
                                {b.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Quantas campanhas por mês? (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            { label: '1', value: '1' },
                            { label: '2–4', value: '2_4' },
                            { label: '5–10', value: '5_10' },
                            { label: '10+', value: '10_plus' },
                        ].map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, campaigns_per_month: c.value }))}
                                className={`cursor-pointer rounded-[2rem] border-2 p-8 text-lg font-black transition-all duration-500 ${
                                    formData.campaigns_per_month === c.value
                                        ? 'scale-105 border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                                        : 'border-zinc-100 bg-zinc-50/50 text-zinc-400'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                            O que você costuma contratar? (máx. 5, opcional)
                        </label>
                        <span className="text-sm font-bold text-zinc-400">{formData.typical_deliverables.length}/5</span>
                    </div>
                    <MultiSelectChips
                        options={[
                            { label: 'Vídeos curtos (15–60s)', value: 'short_videos' },
                            { label: 'Stories', value: 'stories' },
                            { label: 'Fotos', value: 'photos' },
                            { label: 'Lives', value: 'lives' },
                            { label: 'Reviews / Depoimentos', value: 'reviews' },
                            { label: 'UGC para anúncios', value: 'ugc_ads' },
                        ]}
                        selected={formData.typical_deliverables}
                        onToggle={toggleDeliverable}
                    />
                </div>
            </div>
        </StepWrapper>
    )
}

const StepBrandWorkflow = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const toggleNeed = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            needs: prev.needs.includes(value) ? prev.needs.filter((n) => n !== value) : prev.needs.length < 5 ? [...prev.needs, value] : prev.needs,
        }))
    }

    return (
        <StepWrapper
            title="Como você quer operar"
            subtitle="Necessidades da plataforma"
            tag="Workflow"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={formData.needs.length > 0}
        >
            <div className="space-y-12 mt-10">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                            O que você precisa da plataforma? (máx. 5)
                        </label>
                        <span className="text-sm font-bold text-zinc-400">{formData.needs.length}/5</span>
                    </div>
                    <MultiSelectChips
                        variant="orange"
                        options={[
                            { label: 'Encontrar criadores rapidamente', value: 'fast_match' },
                            { label: 'Gerenciar propostas', value: 'proposals' },
                            { label: 'Aprovar entregas', value: 'approvals' },
                            { label: 'Pagamentos centralizados', value: 'payments' },
                            { label: 'Relatórios e métricas', value: 'reports' },
                            { label: 'Chat por campanha', value: 'messaging' },
                        ]}
                        selected={formData.needs}
                        onToggle={toggleNeed}
                    />
                </div>

                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Como prefere aprovar entregas? (opcional)
                    </label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[
                            { label: 'Aprovação simples', sub: 'Aprovou/Reprovou', value: 'simple' },
                            { label: 'Por etapas', sub: 'Rascunho → Final', value: 'staged' },
                            { label: 'Não sei ainda', sub: '', value: 'unknown' },
                        ].map((a) => (
                            <SelectionCard
                                key={a.value}
                                label={a.label}
                                subLabel={a.sub}
                                active={formData.approval_flow === a.value}
                                onClick={() => setFormData((prev) => ({ ...prev, approval_flow: a.value }))}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    )
}

const StepBrandSafety = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => {
    const toggleCategory = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            disallowed_creator_categories: prev.disallowed_creator_categories.includes(value)
                ? prev.disallowed_creator_categories.filter((c) => c !== value)
                : [...prev.disallowed_creator_categories, value],
        }))
    }

    return (
        <StepWrapper
            title="Brand safety (rápido)"
            subtitle="Preferências de conteúdo"
            tag="Safety"
            onNext={onNext}
            onPrev={onPrev}
            isFirstStep={isFirstStep}
            canProceed={true}
        >
            <div className="space-y-12 mt-10">
                <div className="space-y-6">
                    <label className="ml-1 text-[0.7rem] font-black tracking-[0.2em] uppercase text-zinc-700">
                        Evitar criadores que fazem conteúdo de… (opcional)
                    </label>
                    <MultiSelectChips
                        options={[
                            { label: 'Apostas', value: 'betting' },
                            { label: 'Política', value: 'politics' },
                            { label: 'Cripto', value: 'crypto' },
                            { label: 'Conteúdo adulto', value: 'adult' },
                            { label: 'Tabaco/Nicotina', value: 'nicotine' },
                        ]}
                        selected={formData.disallowed_creator_categories}
                        onToggle={toggleCategory}
                    />
                </div>

                <CustomField
                    label="Link do brandbook/guia (opcional)"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.brand_guidelines_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand_guidelines_url: e.target.value }))}
                />
            </div>
        </StepWrapper>
    )
}

// ============================================================================
// STEP COMPONENTS - FIXOS (FINAL)
// ============================================================================

const StepSource = ({ formData, setFormData, onNext, onPrev, isFirstStep }: StepComponentProps) => (
    <StepWrapper
        title="Onde nos conheceu?"
        subtitle="Uma curiosidade rápida para o nosso time."
        tag="Analytics"
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        canProceed={!!formData.source}
    >
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 mt-10">
            {SOURCES.map((source) => (
                <button
                    key={source}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, source }))}
                    className={`cursor-pointer rounded-[2rem] border-2 p-8 text-xs font-black tracking-widest uppercase transition-all duration-500 ${formData.source === source
                        ? 'border-primary bg-white text-primary shadow-xl shadow-orange-500/10'
                        : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-200'
                        }`}
                >
                    {source}
                </button>
            ))}
        </div>
    </StepWrapper>
)

const StepFinal = ({
    formData,
    setFormData,
    onComplete,
    onPrev,
    isSubmitting,
}: StepComponentProps & { onComplete: () => void; isSubmitting: boolean }) => (
    <StepWrapper
        title="Pra fechar com chave de ouro..."
        subtitle="O que você mais espera da plataforma?"
        tag="Finalize"
        onNext={onComplete}
        onPrev={onPrev}
        isFirstStep={false}
        canProceed={true}
        nextLabel="Ativar Studio"
        showFinalCta
        isSubmitting={isSubmitting}
    >
        <div className="space-y-10 mt-10">
            <CustomField
                label="Suas Expectativas (Opcional)"
                as="textarea"
                placeholder="Ex: Quero escalar meus lançamentos no TikTok, encontrar influenciadores que combinem com meu som..."
                value={formData.expectation}
                onChange={(e) => setFormData((prev) => ({ ...prev, expectation: e.target.value }))}
            />

            <div className="group relative flex items-start gap-8 overflow-hidden rounded-[3rem] border border-zinc-100 bg-zinc-50/50 p-10">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-[50px]"></div>
                <div className="flex h-20 w-20 shrink-0 rotate-3 items-center justify-center rounded-[1.5rem] bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30">
                    <ShieldCheck size={36} />
                </div>
                <div className="space-y-3 pt-2">
                    <p className="text-[0.7rem] font-black tracking-[0.2em] uppercase text-secondary">Seu perfil está pronto!</p>
                    <p className="max-w-xl text-base leading-relaxed font-medium text-zinc-500">
                        Ao finalizar, nosso <strong>Match Engine</strong> processará seus dados para personalizar seu dashboard. Você
                        terá acesso imediato a oportunidades exclusivas.
                    </p>
                </div>
            </div>
        </div>
    </StepWrapper>
)

// ============================================================================
// CONFIGURAÇÃO DE STEPS (ORIENTADA A CONFIGURAÇÃO)
// ============================================================================

const getStepsConfig = (role: 'artist' | 'creator' | 'brand' | ''): StepConfig[] => {
    const commonStart: StepConfig[] = [{ id: 'role', component: StepRoleSelect }]

    const artistSteps: StepConfig[] = [
        { id: 'artist_identity', component: StepArtistIdentity },
        { id: 'artist_career', component: StepArtistCareerStage },
        { id: 'artist_release_window', component: StepArtistReleaseWindow },
        {
            id: 'artist_release_details',
            component: StepArtistReleaseDetails,
            visibleIf: (data) => data.next_release_window !== 'unknown' && data.next_release_window !== '',
        },
        { id: 'artist_presence', component: StepArtistPresence },
        { id: 'artist_goals', component: StepArtistGoals },
    ]

    const creatorSteps: StepConfig[] = [
        { id: 'creator_identity', component: StepCreatorIdentity },
        { id: 'creator_niches', component: StepCreatorNiches },
        { id: 'creator_platforms', component: StepCreatorPlatforms },
        { id: 'creator_content', component: StepCreatorContent },
        { id: 'creator_brand_work', component: StepCreatorBrandWork },
        { id: 'creator_availability', component: StepCreatorAvailability },
    ]

    const brandSteps: StepConfig[] = [
        { id: 'brand_identity', component: StepBrandIdentity },
        { id: 'brand_contact', component: StepBrandContact },
        { id: 'brand_goals', component: StepBrandGoals },
        { id: 'brand_creators', component: StepBrandCreators },
        { id: 'brand_budget', component: StepBrandBudget },
        { id: 'brand_workflow', component: StepBrandWorkflow },
        { id: 'brand_safety', component: StepBrandSafety },
    ]

    // Steps fixos finais
    const fixedFinalSteps: StepConfig[] = [
        { id: 'source', component: StepSource },
        { id: 'final', component: () => null }, // Tratado separadamente
    ]

    if (role === 'artist') {
        return [...commonStart, ...artistSteps, ...fixedFinalSteps]
    }

    if (role === 'creator') {
        return [...commonStart, ...creatorSteps, ...fixedFinalSteps]
    }

    if (role === 'brand') {
        return [...commonStart, ...brandSteps, ...fixedFinalSteps]
    }

    return commonStart
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Onboarding({ savedProgress, userName }: OnboardingProps) {
    const [step, setStep] = useState(savedProgress?.current_step ?? 0)
    const [formData, setFormData] = useState<OnboardingData>(() => ({
        ...INITIAL_FORM_DATA,
        display_name: userName || '',
        ...(savedProgress?.data || {}),
    }))
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Obtém configuração de steps baseado no role
    const stepsConfig = getStepsConfig(formData.role)

    // Filtra steps visíveis baseado nas condições
    const visibleSteps = stepsConfig.filter((stepConfig) => {
        if (!stepConfig.visibleIf) return true
        return stepConfig.visibleIf(formData)
    })

    const totalSteps = visibleSteps.length
    const currentStepConfig = visibleSteps[step]
    const isLastStep = step === totalSteps - 1
    const isFinalStep = currentStepConfig?.id === 'final'

    // Ref para controlar se está salvando
    const isSavingRef = useRef(false)
    const lastSavedStepRef = useRef(-1)

    // Salva progresso quando muda de step (apenas uma vez por step)
    useEffect(() => {
        // Não salva no step 0 ou se já salvou este step
        if (step === 0 || step === lastSavedStepRef.current) return

        const saveProgress = async () => {
            if (isSavingRef.current) return

            isSavingRef.current = true
            setIsSaving(true)

            try {
                await axios.post('/app/onboarding/progress', {
                    current_step: step,
                    data: formData,
                })
                lastSavedStepRef.current = step
            } catch (error) {
                console.error('Erro ao salvar progresso:', error)
            } finally {
                isSavingRef.current = false
                setIsSaving(false)
            }
        }

        // Debounce de 500ms apenas quando muda de step
        const debounceTimer = setTimeout(saveProgress, 500)

        return () => clearTimeout(debounceTimer)
    }, [step])

    const handleNext = useCallback(() => {
        if (step < totalSteps - 1) {
            setStep((prev) => prev + 1)
        }
    }, [step, totalSteps])

    const handlePrev = useCallback(() => {
        if (step > 0) {
            setStep((prev) => prev - 1)
        }
    }, [step])

    const handleComplete = useCallback(async () => {
        setIsSubmitting(true)
        try {
            const payload: Record<string, string | boolean | string[] | Array<{ type: string; url: string }>> = {
                role: formData.role,
                source: formData.source,
                display_name: formData.display_name,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                primary_language: formData.primary_language,
                expectation: formData.expectation,
                links: formData.links,
                // Artist
                artist_type: formData.artist_type,
                primary_genre: formData.primary_genre,
                subgenres: formData.subgenres,
                career_stage: formData.career_stage,
                released_tracks_count: formData.released_tracks_count,
                release_frequency: formData.release_frequency,
                next_release_window: formData.next_release_window,
                release_type: formData.release_type,
                release_stage: formData.release_stage,
                has_cover_art: formData.has_cover_art,
                has_release_date: formData.has_release_date,
                release_date: formData.release_date,
                platforms: formData.platforms,
                audience_range: formData.audience_range,
                primary_goal: formData.primary_goal,
                open_to: formData.open_to,
                monetization_status: formData.monetization_status,
                // Creator
                primary_handle: formData.primary_handle,
                creator_type: formData.creator_type,
                niches: formData.niches,
                audience_gender: formData.audience_gender,
                audience_age_range: formData.audience_age_range,
                followers_range: formData.followers_range,
                engagement_self_assessment: formData.engagement_self_assessment,
                content_formats: formData.content_formats,
                content_style: formData.content_style,
                on_camera_presence: formData.on_camera_presence,
                production_resources: formData.production_resources,
                brand_experience_level: formData.brand_experience_level,
                work_models: formData.work_models,
                monthly_capacity: formData.monthly_capacity,
                disallowed_categories: formData.disallowed_categories,
                exclusivity_preference: formData.exclusivity_preference,
                preferred_brands_text: formData.preferred_brands_text,
                // Brand
                company_name: formData.company_name,
                brand_name: formData.brand_name,
                industry: formData.industry,
                company_size: formData.company_size,
                website: formData.website,
                contact_name: formData.contact_name,
                contact_role: formData.contact_role,
                contact_email: formData.contact_email,
                contact_phone: formData.contact_phone,
                team_size_marketing: formData.team_size_marketing,
                primary_objective: formData.primary_objective,
                kpi_focus: formData.kpi_focus,
                campaign_timeline: formData.campaign_timeline,
                creator_types: formData.creator_types,
                platform_targets: formData.platform_targets,
                target_niches: formData.target_niches,
                creator_location_preference: formData.creator_location_preference,
                monthly_budget_range: formData.monthly_budget_range,
                campaigns_per_month: formData.campaigns_per_month,
                typical_deliverables: formData.typical_deliverables,
                needs: formData.needs,
                approval_flow: formData.approval_flow,
                disallowed_creator_categories: formData.disallowed_creator_categories,
                brand_guidelines_url: formData.brand_guidelines_url,
            }

            router.post('/app/onboarding/complete', payload, {
                onSuccess: () => {
                    // Redirect handled by server
                },
                onError: (errors) => {
                    console.error('Erro ao completar onboarding:', errors)
                    setIsSubmitting(false)
                },
            })
        } catch (error) {
            console.error('Erro ao completar onboarding:', error)
            setIsSubmitting(false)
        }
    }, [formData])

    const stepProps: StepComponentProps = {
        formData,
        setFormData,
        onNext: handleNext,
        onPrev: handlePrev,
        isFirstStep: step === 0,
    }

    return (
        <ClearLayout>
            <Head title="Onboarding" />

            {/* Progress Header */}
            {step > 0 && (
                <div className="fixed top-12 right-0 left-0 z-50 mx-auto flex max-w-5xl items-center justify-between px-8">
                    <div className="flex gap-2">
                        {visibleSteps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-16 bg-primary' : step > i ? 'w-8 bg-emerald-500' : 'w-8 bg-zinc-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">Jornada UGC</span>
                        <span className="rounded-full border border-zinc-100 bg-white px-3 py-1 text-[10px] font-black text-primary">
                            {step}/{totalSteps - 1}
                        </span>
                        {isSaving && (
                            <span className="text-[10px] font-medium text-zinc-400">Salvando...</span>
                        )}
                    </div>
                </div>
            )}

            <div className="animate-in fade-in slide-in-from-bottom-8 mx-auto w-full max-w-5xl duration-1000">
                {isFinalStep ? (
                    <StepFinal {...stepProps} onComplete={handleComplete} isSubmitting={isSubmitting} />
                ) : currentStepConfig ? (
                    <currentStepConfig.component {...stepProps} />
                ) : null}
            </div>
        </ClearLayout>
    )
}
