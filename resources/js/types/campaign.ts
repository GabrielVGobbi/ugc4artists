// ─────────────────────────────────────────────────────────────────────────────
// Campaign Types
// ─────────────────────────────────────────────────────────────────────────────

export type CampaignKind = 'ugc' | 'influencers'
export type InfluencerPostMode = 'profile' | 'collab'
export type MusicPlatform = 'spotify' | 'youtube' | 'deezer' | 'other'
export type BriefingMode = 'has_briefing' | 'create_for_me'
export type CreatorProfileType = 'influencer' | 'page' | 'both'
export type ContentPlatform = 'instagram' | 'tiktok' | 'youtube' | 'youtube_shorts'
export type AudioFormat = 'music' | 'narration'
export type FilterGender = 'female' | 'male' | 'both'
export type PublicationPlan = 'basic' | 'highlight' | 'premium'
export type ObjectiveTag = 'divulgar_musica' | 'divulgar_clipe' | 'divulgar_perfil' | 'divulgar_trend' | 'outros'

export type CampaignStatus =
    | 'draft'
    | 'under_review'
    | 'awaiting_payment'
    | 'sent_to_creators'
    | 'in_progress'
    | 'completed'
    | 'cancelled'

/** Objeto de status retornado pela API para visualização */
export interface CampaignStatusDisplay {
    value: CampaignStatus
    label: string
    color: string
    icon: string
    classes: string
}

export interface CampaignUser {
    id: number
    name: string
    avatar?: string | null
}

export interface CampaignResource {
    id: number
    uuid: string | null
    user_id: number

    // Básico
    name: string
    slug: string
    kind: CampaignKind
    influencer_post_mode: InfluencerPostMode | null

    // Música / conteúdo
    music_platform: MusicPlatform | null
    music_link: string | null

    // Produto/objetivo
    product_or_service: string | null
    objective: string | null
    objective_tags: ObjectiveTag[] // Resource sempre devolve array (nunca null)

    // Briefing
    briefing_mode: BriefingMode
    description: string | null
    terms_accepted: boolean

    // Perfil do creator
    creator_profile_type: CreatorProfileType
    content_platforms: ContentPlatform[] // Resource sempre devolve array (nunca null)
    audio_format: AudioFormat | null
    video_duration_min: number | null
    video_duration_max: number | null

    // Filtros (objeto)
    filters: {
        age_min: number | null
        age_max: number | null
        gender: FilterGender | null
        niches: string[] // Resource sempre devolve array
        states: string[] // Resource sempre devolve array
        min_followers: number | null
    }

    // Cronograma (strings em d/m/Y ou null)
    requires_product_shipping: boolean
    applications_open_date: string | null // "dd/mm/YYYY"
    applications_close_date: string | null // "dd/mm/YYYY"
    payment_date: string | null // "dd/mm/YYYY"

    // Orçamento
    slots_to_approve: number
    price_per_influencer: number
    requires_invoice: boolean

    // Branding
    cover_image: string | null
    cover_image_url: string | null
    brand_instagram: string | null

    // Publicação
    publication_plan: PublicationPlan
    publication_fee: number

    // Responsável (objeto)
    responsible: {
        name: string | null
        cpf: string | null
        phone: string | null
        email: string | null
    }

    // Status para visualização (label, cor, ícone)
    status: CampaignStatusDisplay

    // Status / revisão (objeto)
    review: {
        submitted_at: string | null
        reviewed_at: string | null
        approved_at: string | null
        rejected_at: string | null
        rejection_reason: string | null
        reviewed_by: number | null
        started_at: string | null
        completed_at: string | null
        cancelled_at: string | null
    }

    // Resumos úteis
    summary: {
        has_optional_filters: boolean
        estimated_total: number
        grand_total: number
        duration_days: number | null
    }

    // Listagem (card/table)
    total_budget?: number
    applications_count?: number

    // Metas (ISO)
    created_at: string | null // ISO 8601 (no seu helper pode retornar null)
    updated_at: string | null // ISO 8601
    deleted_at: string | null // ISO 8601
    use_my_data: boolean

    // Relations
    user?: CampaignUser
}

/** Alias para uso em listas e hooks (mesmo que CampaignResource) */
export type Campaign = CampaignResource

export interface CampaignStats {
    total: number
    draft: number
    awaiting_payment: number
    sent_to_creators: number
    in_progress: number
    completed: number
    total_budget: number
    total_applications: number
}

export interface CampaignFilters {
    status?: CampaignStatus | CampaignStatus[]
    search?: string
    page?: number
    per_page?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Form Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CampaignFormData {
    name: string
    kind: CampaignKind
    influencer_post_mode?: InfluencerPostMode | null
    music_platform?: MusicPlatform | null
    music_link?: string
    product_or_service?: string
    objective?: string
    objective_tags?: ObjectiveTag[]
    briefing_mode?: BriefingMode
    description?: string
    terms_accepted?: boolean
    creator_profile_type?: CreatorProfileType
    content_platforms?: ContentPlatform[]
    audio_format?: AudioFormat | null
    video_duration_min?: number | null
    video_duration_max?: number | null
    filter_age_min?: number | null
    filter_age_max?: number | null
    filter_gender?: FilterGender | null
    filter_niches?: string[]
    filter_states?: string[]
    filter_min_followers?: number | null
    requires_product_shipping?: boolean
    applications_open_date?: string
    applications_close_date?: string
    payment_date?: string
    slots_to_approve?: number
    price_per_influencer?: number
    requires_invoice?: boolean
    cover_image?: File | null
    brand_instagram?: string
    publication_plan?: PublicationPlan
    publication_fee?: number
    responsible_name?: string
    responsible_cpf?: string
    responsible_phone?: string
    responsible_email?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Cores Tailwind para badge por status (backend envia: gray, warning, info, success, danger) */
const STATUS_COLOR_MAP: Record<string, string> = {
    gray: 'bg-zinc-300',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    success: 'bg-emerald-500',
    danger: 'bg-red-500',
    primary: 'bg-primary',
}

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
    draft: 'bg-zinc-300',
    under_review: 'bg-amber-400',
    awaiting_payment: 'bg-amber-500',
    sent_to_creators: 'bg-blue-500',
    in_progress: 'bg-emerald-500',
    completed: 'bg-primary',
    cancelled: 'bg-zinc-400',
}

/** Resolve cor do status: usa objeto da API (color) ou fallback pelo value */
export function getCampaignStatusColor(status: CampaignStatusDisplay | { value: CampaignStatus; color?: string }): string {
    if (status.color && STATUS_COLOR_MAP[status.color]) return STATUS_COLOR_MAP[status.color]
    return CAMPAIGN_STATUS_COLORS[status.value] ?? 'bg-zinc-300'
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
    draft: 'Rascunho',
    under_review: 'Em Análise',
    awaiting_payment: 'Aguardando Pagamento',
    sent_to_creators: 'Enviado para Creators',
    in_progress: 'Em Andamento',
    completed: 'Finalizada',
    cancelled: 'Cancelada',
}

export const PUBLICATION_PLAN_LABELS: Record<PublicationPlan, string> = {
    basic: 'Básico',
    highlight: 'Destaque',
    premium: 'Premium',
}

export const PUBLICATION_PLAN_PRICES: Record<PublicationPlan, number> = {
    basic: 0,
    highlight: 29.90,
    premium: 49.90,
}

// ─────────────────────────────────────────────────────────────────────────────
// Publication Plan (from backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicationPlanOption {
    id: string
    label: string
    price: number
    description: string
    features?: string[]
}
