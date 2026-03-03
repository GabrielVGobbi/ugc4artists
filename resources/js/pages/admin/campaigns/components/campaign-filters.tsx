import { useCallback, useMemo } from 'react'
import { Search, X, Filter, Calendar } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuickFilterSelect } from '@/components/ui/quick-filter-select'
import type {
	CampaignStatusValue,
	UseCampaignFiltersReturn,
} from '@/types/campaign'
import {
	CAMPAIGN_STATUS_COLORS,
	CAMPAIGN_STATUS_LABELS,
} from '@/types/campaign'
import type { FilterOption, FilterValue } from '@/types/filters'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignFiltersProps {
	/** Current filter state from useCampaignFilters */
	filters: UseCampaignFiltersReturn['filters']
	/** Set the search input value */
	setSearch: UseCampaignFiltersReturn['setSearch']
	/** Set the selected status filters */
	setStatuses: UseCampaignFiltersReturn['setStatuses']
	/** Set the start date filter */
	setDateFrom: UseCampaignFiltersReturn['setDateFrom']
	/** Set the end date filter */
	setDateTo: UseCampaignFiltersReturn['setDateTo']
	/** Reset all filters to defaults */
	clearFilters: UseCampaignFiltersReturn['clearFilters']
	/** Whether any filter is active (non-default) */
	hasActiveFilters: UseCampaignFiltersReturn['hasActiveFilters']
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_HEX_MAP: Record<string, string> = {
	'bg-zinc-300': '#d4d4d8',
	'bg-amber-500': '#f59e0b',
	'bg-amber-400': '#fbbf24',
	'bg-blue-500': '#3b82f6',
	'bg-red-500': '#ef4444',
	'bg-emerald-500': '#10b981',
	'bg-primary': '#6366f1',
	'bg-zinc-400': '#a1a1aa',
}

/**
 * Resolve a Tailwind bg class to a hex color for the filter option dot.
 */
const resolveStatusHex = (tailwindClass: string): string =>
	STATUS_HEX_MAP[tailwindClass] ?? '#71717a'

// ─────────────────────────────────────────────────────────────────────────────
// Status filter options (built from campaign type constants)
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS: FilterOption[] = (
	Object.entries(CAMPAIGN_STATUS_LABELS) as [CampaignStatusValue, string][]
).map(([value, label]) => ({
	value,
	label,
	color: resolveStatusHex(CAMPAIGN_STATUS_COLORS[value]),
}))

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Campaign filters panel with search, status multi-select, and date range.
 * Receives state and handlers from the `useCampaignFilters` hook.
 *
 * Clean, compact design with QuickFilterSelect dropdowns.
 */
function CampaignFilters({
	filters,
	setSearch,
	setStatuses,
	setDateFrom,
	setDateTo,
	clearFilters,
	hasActiveFilters,
}: CampaignFiltersProps) {
	// ── Search handler ───────────────────────────────────────────────

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSearch(e.target.value)
		},
		[setSearch],
	)

	const handleClearSearch = useCallback(() => {
		setSearch('')
	}, [setSearch])

	// ── Status handler (QuickFilterSelect) ───────────────────────────

	const handleStatusChange = useCallback(
		(_id: string, value: FilterValue) => {
			const statuses = Array.isArray(value)
				? (value as CampaignStatusValue[])
				: typeof value === 'string'
					? ([value] as CampaignStatusValue[])
					: []
			setStatuses(statuses)
		},
		[setStatuses],
	)

	// ── Date handlers ────────────────────────────────────────────────

	const handleDateFromChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setDateFrom(e.target.value || null)
		},
		[setDateFrom],
	)

	const handleDateToChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setDateTo(e.target.value || null)
		},
		[setDateTo],
	)

	// ── Clear all ────────────────────────────────────────────────────

	const handleClearAll = useCallback(() => {
		clearFilters()
	}, [clearFilters])

	// ── Active filter count (for badge) ──────────────────────────────

	const activeFilterCount = useMemo(() => {
		let count = 0
		if (filters.search) count++
		if (filters.statuses.length > 0) count += filters.statuses.length
		if (filters.dateFrom) count++
		if (filters.dateTo) count++
		return count
	}, [filters])

	// ── Render ────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col lg:flex-row gap-3">
			{/* Search */}
			<div className="flex-1 min-w-0">
				<div className="relative group">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
						size={16}
					/>
					<Input
						placeholder="Buscar por nome, slug ou Instagram..."
						value={filters.search}
						onChange={handleSearchChange}
						className="w-full pl-9 pr-8 h-9 text-sm rounded-lg border-border focus:ring-2 focus:ring-primary/20"
						aria-label="Buscar campanhas"
					/>
					{filters.search && (
						<button
							type="button"
							onClick={handleClearSearch}
							className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors rounded-sm hover:bg-muted"
							aria-label="Limpar busca"
							tabIndex={0}
						>
							<X className="size-3.5" />
						</button>
					)}
				</div>
			</div>

			{/* Status Filter Dropdown */}
			<div className="flex-shrink-0">
				<QuickFilterSelect
					id="statuses"
					label="Status"
					placeholder="Todos os status"
					options={STATUS_FILTER_OPTIONS}
					value={filters.statuses}
					onChange={handleStatusChange}
					multiple={true}
					minWidth={180}
					icon={Filter}
					size="sm"
					aria-label="Filtrar por status"
				/>
			</div>

			{/* Date From */}
			<div className="flex-shrink-0">
				<div className="relative">
					<Calendar
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
						size={14}
					/>
					<Input
						type="date"
						value={filters.dateFrom ?? ''}
						onChange={handleDateFromChange}
						placeholder="Data início"
						className="w-full lg:w-[160px] pl-9 h-9 text-xs rounded-lg border-border"
						aria-label="Filtrar por data inicial"
					/>
				</div>
			</div>

			{/* Date To */}
			<div className="flex-shrink-0">
				<div className="relative">
					<Calendar
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
						size={14}
					/>
					<Input
						type="date"
						value={filters.dateTo ?? ''}
						onChange={handleDateToChange}
						placeholder="Data fim"
						className="w-full lg:w-[160px] pl-9 h-9 text-xs rounded-lg border-border"
						aria-label="Filtrar por data final"
					/>
				</div>
			</div>

			{/* Clear all button */}
			{hasActiveFilters && (
				<div className="flex-shrink-0">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClearAll}
						className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5"
						aria-label="Limpar todos os filtros"
					>
						<X className="size-3.5" />
						Limpar filtros
						<Badge
							variant="secondary"
							className="size-4 justify-center rounded-full p-0 text-[10px]"
						>
							{activeFilterCount}
						</Badge>
					</Button>
				</div>
			)}
		</div>
	)
}

export { CampaignFilters }
export type { CampaignFiltersProps }
