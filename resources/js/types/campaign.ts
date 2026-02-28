// ─────────────────────────────────────────────────────────────────────────────
// Campaign Types
// ─────────────────────────────────────────────────────────────────────────────

export type CampaignKind = 'ugc' | 'influencers'
export type InfluencerPostMode = 'profile' | 'collab'
export type MusicPlatform = 'spotify' | 'youtube' | 'deezer' | 'other'
export type BriefingMode = 'has_briefing' | 'create_for_me'
export type CreatorProfileType = 'influencer' | 'page' | 'both'
export type ContentPlatform =
	| 'instagram'
	| 'tiktok'
	| 'youtube'
	| 'youtube_shorts'
export type AudioFormat = 'music' | 'narration'
export type FilterGender = 'female' | 'male' | 'both'
export type PublicationPlan = 'basic' | 'highlight' | 'premium'
export type ObjectiveTag =
	| 'divulgar_musica'
	| 'divulgar_clipe'
	| 'divulgar_perfil'
	| 'divulgar_trend'
	| 'outros'

export type CampaignStatusValue =
	| 'draft'
	| 'pending'
	| 'under_review'
	| 'approved'
	| 'refused'
	| 'awaiting_payment'
	| 'sent_to_creators'
	| 'in_progress'
	| 'completed'
	| 'cancelled'

/**
 * @deprecated Use CampaignStatusValue instead.
 * Kept for backward compatibility with existing code.
 */
export type CampaignStatus = CampaignStatusValue

// ─────────────────────────────────────────────────────────────────────────────
// Shared / Nested Interfaces
// ─────────────────────────────────────────────────────────────────────────────

/** User summary attached to a campaign (advertiser) */
export interface CampaignUser {
	id: number
	name: string
	email: string
	avatar: string | null
}

/** Creator selected/approved for a campaign */
export interface CampaignCreator {
	id: number
	uuid: string
	name: string
	email: string
	avatar: string | null
}

/** Status object returned by the API for display purposes */
export interface CampaignStatusDisplay {
	value: CampaignStatusValue
	label: string
	color: string
	icon: string
	classes: string
}

/** Campaign target audience filters */
export interface CampaignTargetFilters {
	age_min: number | null
	age_max: number | null
	gender: FilterGender | null
	niches: string[]
	states: string[]
	min_followers: number | null
}

/** Campaign responsible person data */
export interface CampaignResponsible {
	name: string | null
	cpf: string | null
	phone: string | null
	email: string | null
}

/** Campaign review/moderation timestamps and metadata */
export interface CampaignReview {
	submitted_at: string | null
	reviewed_at: string | null
	approved_at: string | null
	rejected_at: string | null
	rejection_reason: string | null
	reason_for_refusal: string | null
	reviewed_by: number | null
	started_at: string | null
	completed_at: string | null
	cancelled_at: string | null
}

/** Campaign computed summary values */
export interface CampaignSummary {
	has_optional_filters: boolean
	estimated_total: number
	grand_total: number
	duration_days: number | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Resource (main entity)
// ─────────────────────────────────────────────────────────────────────────────

export interface CampaignResource {
	uuid: string
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
	objective_tags: ObjectiveTag[]

	// Briefing
	briefing_mode: BriefingMode | null
	description: string | null
	terms_accepted: boolean

	// Perfil do creator
	creator_profile_type: CreatorProfileType | null
	content_platforms: ContentPlatform[]
	audio_format: AudioFormat | null
	video_duration_min: number | null
	video_duration_max: number | null

	// Filtros de público-alvo
	filters: CampaignTargetFilters

	// Cronograma
	requires_product_shipping: boolean
	applications_open_date: string | null
	applications_close_date: string | null
	payment_date: string | null

	// Orçamento
	slots_to_approve: number
	price_per_influencer: number
	requires_invoice: boolean

	// Branding
	cover_image: string | null
	cover_image_url: string | null
	brand_instagram: string | null

	// Publicação
	publication_plan: PublicationPlan | null
	publication_fee: number

	// Responsável
	responsible: CampaignResponsible

	// Status
	status: CampaignStatusDisplay

	// Revisão / moderação
	review: CampaignReview

	// Resumos
	summary: CampaignSummary

	// Listagem (card/table)
	total_budget: number
	applications_count: number
	approved_creators_count: number
	approved_creators: CampaignCreator[]

	// Timestamps (ISO 8601)
	created_at: string
	updated_at: string
	deleted_at: string | null
	use_my_data: boolean | null

	// Relations
	user?: CampaignUser
}

/** Alias for use in lists and hooks */
export type Campaign = CampaignResource

// ─────────────────────────────────────────────────────────────────────────────
// Admin Campaign Management Types
// ─────────────────────────────────────────────────────────────────────────────

/** Status option for filter dropdowns (from CampaignStatus enum) */
export interface CampaignStatusOption {
	value: string
	label: string
	color: string
}

/** Filters used on the admin campaigns index page */
export interface CampaignIndexFilters {
	search: string
	statuses: string[]
	date_from: string | null
	date_to: string | null
	sort_by: string
	sort_dir: 'asc' | 'desc'
}

/** View mode toggle for the campaigns index page */
export type ViewMode = 'table' | 'kanban'

// ─────────────────────────────────────────────────────────────────────────────
// Pagination — re-exported from index.d.ts for convenience
// ─────────────────────────────────────────────────────────────────────────────

export type {
	PaginatedResponse,
	PaginationMeta,
	PaginationLinks,
} from '.'

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Stats
// ─────────────────────────────────────────────────────────────────────────────

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

/** Legacy filter interface used by existing campaign list hooks */
export interface CampaignFilters {
	status?: CampaignStatusValue | CampaignStatusValue[]
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

/** Tailwind color map for status badge (backend sends: gray, warning, info, success, danger) */
const STATUS_COLOR_MAP: Record<string, string> = {
	gray: 'bg-zinc-300',
	warning: 'bg-amber-500',
	info: 'bg-blue-500',
	success: 'bg-emerald-500',
	danger: 'bg-red-500',
	primary: 'bg-primary',
}

export const CAMPAIGN_STATUS_COLORS: Record<
	CampaignStatusValue,
	string
> = {
	draft: 'bg-zinc-300',
	pending: 'bg-amber-500',
	under_review: 'bg-amber-400',
	approved: 'bg-blue-500',
	refused: 'bg-red-500',
	awaiting_payment: 'bg-amber-500',
	sent_to_creators: 'bg-blue-500',
	in_progress: 'bg-emerald-500',
	completed: 'bg-primary',
	cancelled: 'bg-zinc-400',
}

/** Resolves status color: uses API object (color) or fallback by value */
export const getCampaignStatusColor = (
	status: CampaignStatusDisplay
		| { value: CampaignStatusValue; color?: string },
): string => {
	if (status.color && STATUS_COLOR_MAP[status.color]) {
		return STATUS_COLOR_MAP[status.color]
	}
	return CAMPAIGN_STATUS_COLORS[status.value] ?? 'bg-zinc-300'
}

export const CAMPAIGN_STATUS_LABELS: Record<
	CampaignStatusValue,
	string
> = {
	draft: 'Rascunho',
	pending: 'Pendente',
	under_review: 'Em Analise',
	approved: 'Aprovada',
	refused: 'Recusada',
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
