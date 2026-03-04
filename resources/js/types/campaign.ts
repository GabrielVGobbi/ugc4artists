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

// ─────────────────────────────────────────────────────────────────────────────
// Admin Campaigns — Status Transitions (mirrors CampaignStatus PHP enum)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map of valid status transitions for kanban drag-and-drop.
 * Mirrors `CampaignStatus::getAvailableTransitions()` from the backend.
 *
 * Used by the kanban to validate whether a drag-and-drop move is allowed
 * before sending the request to the API.
 */
export const VALID_STATUS_TRANSITIONS: Record<
	CampaignStatusValue,
	readonly CampaignStatusValue[]
> = {
	draft: ['awaiting_payment', 'cancelled'],
	awaiting_payment: [
		'pending',
		'under_review',
		'draft',
		'cancelled',
	],
	under_review: [
		'pending',
		'approved',
		'refused',
		'draft',
		'cancelled',
	],
	pending: [
		'approved',
		'refused',
		'sent_to_creators',
		'draft',
		'cancelled',
	],
	approved: ['sent_to_creators', 'in_progress', 'cancelled'],
	refused: ['draft'],
	sent_to_creators: ['in_progress', 'cancelled'],
	in_progress: ['completed', 'cancelled'],
	completed: [],
	cancelled: ['draft'],
} as const

/**
 * Checks whether a status transition is valid for kanban drag-and-drop.
 *
 * @param from - Current campaign status
 * @param to - Target campaign status
 * @returns Whether the transition is allowed
 */
export const isValidStatusTransition = (
	from: CampaignStatusValue,
	to: CampaignStatusValue,
): boolean => {
	const allowed = VALID_STATUS_TRANSITIONS[from]
	return allowed.includes(to)
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Campaigns — Filters State (useCampaignFilters hook)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * State managed by the `useCampaignFilters` hook.
 * Represents all filter values for the admin campaigns page,
 * with bidirectional URL sync.
 */
export interface CampaignFiltersState {
	/** Text search query (debounced 400ms before triggering fetch) */
	search: string
	/** Selected status values for filtering */
	statuses: CampaignStatusValue[]
	/** Start date filter (ISO 8601 date string, e.g. '2024-01-01') */
	dateFrom: string | null
	/** End date filter (ISO 8601 date string, e.g. '2024-12-31') */
	dateTo: string | null
	/** Column key to sort by */
	sortBy: string
	/** Sort direction */
	sortDir: 'asc' | 'desc'
}

/** Default filter values used for initialization and reset */
export const DEFAULT_CAMPAIGN_FILTERS: CampaignFiltersState = {
	search: '',
	statuses: [],
	dateFrom: null,
	dateTo: null,
	sortBy: 'created_at',
	sortDir: 'desc',
}

/**
 * Query parameters sent to the campaigns API.
 * Derived from `CampaignFiltersState` by the filters hook.
 */
export interface CampaignFilterParams {
	search?: string
	status?: string
	date_from?: string
	date_to?: string
	sort_by?: string
	sort_direction?: 'asc' | 'desc'
	per_page?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Campaigns — Stats Response (useCampaignStats hook)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Response from `GET /api/v1/admin/campaigns/stats`.
 * Contains aggregated counts by status for the stats grid.
 */
export interface CampaignStatsResponse {
	total: number
	under_review: number
	approved: number
	active: number
	completed: number
	refused: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Campaigns — Mutation Response
// ─────────────────────────────────────────────────────────────────────────────

/** Response from approve, refuse, and updateStatus API endpoints */
export interface CampaignMutationResponse {
	message: string
	campaign: Campaign
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Campaigns — Kanban Types
// ─────────────────────────────────────────────────────────────────────────────

/** A single kanban column with its campaigns */
export interface CampaignKanbanColumn {
	/** Status value used as column identifier */
	status: CampaignStatusValue
	/** Display label for the column header */
	label: string
	/** Campaigns belonging to this column */
	campaigns: Campaign[]
}

/**
 * Data for a single kanban column with pagination metadata.
 * Used by the per-column infinite query architecture.
 */
export interface CampaignKanbanColumnData {
	/** Status value used as column identifier */
	status: CampaignStatusValue
	/** Display label for the column header */
	label: string
	/** Campaigns loaded so far across all pages */
	campaigns: Campaign[]
	/** Total campaigns for this status on the server */
	totalCount: number
	/** Number of campaigns loaded client-side so far */
	loadedCount: number
	/** Whether there are more pages to load */
	hasNextPage: boolean
	/** Whether the next page is currently being fetched */
	isFetchingNextPage: boolean
	/** Whether the initial load is in progress */
	isLoading: boolean
	/** Load the next page */
	fetchNextPage: () => void
}

/**
 * Admin-visible statuses displayed as kanban columns.
 * Matches the statuses filtered by the backend controller.
 */
export const KANBAN_COLUMN_STATUSES: readonly CampaignStatusValue[] = [
	'under_review',
	'approved',
	'sent_to_creators',
	'in_progress',
	'completed',
	'refused',
] as const

/**
 * All statuses available to add as kanban columns.
 * Includes statuses not shown by default.
 */
export const ALL_KANBAN_STATUSES: readonly CampaignStatusValue[] = [
	'under_review',
	'approved',
	'refused',
	'awaiting_payment',
	'sent_to_creators',
	'in_progress',
	'completed',
	'cancelled',
] as const

// ─────────────────────────────────────────────────────────────────────────────
// Admin Campaigns — Hook Return Types
// ─────────────────────────────────────────────────────────────────────────────

/** Return type for the `useCampaignFilters` hook */
export interface UseCampaignFiltersReturn {
	/** Current filter state */
	filters: CampaignFiltersState
	/** Debounced search value (400ms delay) for use in query keys */
	debouncedSearch: string
	/** Set the search input value (raw, before debounce) */
	setSearch: (value: string) => void
	/** Set the selected status filters */
	setStatuses: (statuses: CampaignStatusValue[]) => void
	/** Set the start date filter */
	setDateFrom: (date: string | null) => void
	/** Set the end date filter */
	setDateTo: (date: string | null) => void
	/** Set the sort column */
	setSortBy: (column: string) => void
	/** Set the sort direction */
	setSortDir: (direction: 'asc' | 'desc') => void
	/** Reset all filters to defaults and update the URL */
	clearFilters: () => void
	/** Whether any filter is active (non-default) */
	hasActiveFilters: boolean
	/** Filter params ready to pass to API hooks */
	filterParams: CampaignFilterParams
}

/** Return type for the `useCampaignStats` hook */
export interface UseCampaignStatsReturn {
	/** Stats data from the server */
	data: CampaignStatsResponse | undefined
	/** Whether the initial load is in progress */
	isLoading: boolean
	/** Error if the fetch failed */
	error: Error | null
	/** Refetch stats data */
	refetch: () => void
}

/** Return type for the `useCampaignKanban` hook */
export interface UseCampaignKanbanReturn {
	/** Kanban columns with per-column pagination data */
	columns: CampaignKanbanColumnData[]
	/** Whether any column is still loading initial data */
	isLoading: boolean
	/** Optimistically move a campaign between columns (drag-and-drop) */
	optimisticMove: (
		campaignUuid: string,
		fromStatus: CampaignStatusValue,
		toStatus: CampaignStatusValue,
		creatorIds?: number[],
	) => Promise<void>
}

/** Creators pagination response from the API */
export interface CreatorsPaginatedResponse {
	data: CreatorOption[]
	meta: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

/** Creator option for selection in the creators modal */
export interface CreatorOption {
	id: number
	uuid: string
	name: string
	email: string
	avatar: string | null
}

/** Mutation input for approving a campaign */
export interface ApproveCampaignInput {
	campaignUuid: string
	creatorIds: number[]
}

/** Mutation input for refusing a campaign */
export interface RefuseCampaignInput {
	campaignUuid: string
	reason: string
}

/** Mutation input for updating campaign status (drag-and-drop) */
export interface UpdateCampaignStatusInput {
	campaignUuid: string
	status: CampaignStatusValue
	creatorIds?: number[]
	reasonForRefusal?: string
}

/** Return type for the `useCampaignMutations` hook */
export interface UseCampaignMutationsReturn {
	/** Approve a campaign with selected creators */
	approve: (input: ApproveCampaignInput) => Promise<void>
	/** Refuse a campaign with a reason */
	refuse: (input: RefuseCampaignInput) => Promise<void>
	/** Update campaign status (used by kanban drag-and-drop) */
	updateStatus: (input: UpdateCampaignStatusInput) => Promise<void>
	/** Whether any mutation is currently in progress */
	isPending: boolean
}
