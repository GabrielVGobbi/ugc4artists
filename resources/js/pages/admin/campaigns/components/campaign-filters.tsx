import { useCallback, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { Search, X, Filter, Calendar } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuickFilterSelect } from '@/components/ui/quick-filter-select'
import type {
	CampaignIndexFilters,
	CampaignStatusOption,
} from '@/types/campaign'
import type { FilterOption } from '@/types/filters'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignFiltersProps {
	filters: CampaignIndexFilters
	statusOptions: CampaignStatusOption[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 400

const STATUS_COLOR_MAP: Record<string, string> = {
	gray: '#71717a',
	warning: '#f59e0b',
	info: '#3b82f6',
	success: '#10b981',
	danger: '#ef4444',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Campaign filters panel with search, status multi-select, and date range.
 * Syncs filters with Inertia query params for server-side filtering.
 *
 * Clean, compact design with QuickFilterSelect dropdowns.
 */
function CampaignFilters({ filters, statusOptions }: CampaignFiltersProps) {
	const [searchValue, setSearchValue] = useState(filters.search ?? '')
	const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

	// ── Navigate with updated filters ────────────────────────────────

	const applyFilters = useCallback(
		(updates: Partial<CampaignIndexFilters>) => {
			const merged = { ...filters, ...updates, page: 1 }

			// Clean empty values
			const params: Record<string, unknown> = {}
			if (merged.search) params.search = merged.search
			if (merged.statuses?.length > 0) params.statuses = merged.statuses
			if (merged.date_from) params.date_from = merged.date_from
			if (merged.date_to) params.date_to = merged.date_to
			if (merged.sort_by) params.sort_by = merged.sort_by
			if (merged.sort_dir) params.sort_dir = merged.sort_dir

			router.get(window.location.pathname, params as Record<string, string>, {
				preserveState: true,
				preserveScroll: true,
			})
		},
		[filters],
	)

	// ── Search with debounce ─────────────────────────────────────────

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value
			setSearchValue(value)

			if (debounceTimer) clearTimeout(debounceTimer)

			const timer = setTimeout(() => {
				applyFilters({ search: value })
			}, DEBOUNCE_MS)

			setDebounceTimer(timer)
		},
		[applyFilters, debounceTimer],
	)

	// ── Status filter (using QuickFilterSelect) ──────────────────────

	const statusFilterOptions = useMemo((): FilterOption[] => {
		return statusOptions.map((opt) => ({
			value: opt.value,
			label: opt.label,
			color: STATUS_COLOR_MAP[opt.color] || STATUS_COLOR_MAP.gray,
		}))
	}, [statusOptions])

	const handleStatusChange = useCallback(
		(_id: string, value: string | string[] | undefined) => {
			const statuses = Array.isArray(value) ? value : value ? [value] : []
			applyFilters({ statuses })
		},
		[applyFilters],
	)

	// ── Date filters ─────────────────────────────────────────────────

	const handleDateFromChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			applyFilters({ date_from: e.target.value || null })
		},
		[applyFilters],
	)

	const handleDateToChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			applyFilters({ date_to: e.target.value || null })
		},
		[applyFilters],
	)

	// ── Clear all ────────────────────────────────────────────────────

	const handleClearAll = useCallback(() => {
		setSearchValue('')
		applyFilters({
			search: '',
			statuses: [],
			date_from: null,
			date_to: null,
		})
	}, [applyFilters])

	// ── Active filter count ──────────────────────────────────────────

	const activeFilterCount = useMemo(() => {
		let count = 0
		if (filters.search) count++
		if (filters.statuses?.length > 0) count += filters.statuses.length
		if (filters.date_from) count++
		if (filters.date_to) count++
		return count
	}, [filters])

	const hasActiveFilters = activeFilterCount > 0

	// ── Render ────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col lg:flex-row gap-3">
					{/* Search */}
					<div className="flex-1 min-w-0">
						<div className="relative group">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
							<Input
								placeholder="Buscar por nome, slug ou Instagram..."
								value={searchValue}
								onChange={handleSearchChange}
								className="w-full pl-9 pr-8 h-9 text-sm rounded-lg border-border focus:ring-2 focus:ring-primary/20"
								aria-label="Buscar campanhas"
							/>
							{searchValue && (
								<button
									type="button"
									onClick={() => {
										setSearchValue('')
										applyFilters({ search: '' })
									}}
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
							options={statusFilterOptions}
							value={filters.statuses ?? []}
							onChange={handleStatusChange}
							multiple={true}
							minWidth={180}
							icon={Filter}
							size="sm"
						/>
					</div>

					{/* Date From */}
					<div className="flex-shrink-0">
						<div className="relative">
							<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
							<Input
								type="date"
								value={filters.date_from ?? ''}
								onChange={handleDateFromChange}
								placeholder="Data início"
								className="w-full lg:w-[160px] pl-9 h-9 text-xs rounded-lg border-border"
								aria-label="Data inicial"
							/>
						</div>
					</div>

					{/* Date To */}
					<div className="flex-shrink-0">
						<div className="relative">
							<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
							<Input
								type="date"
								value={filters.date_to ?? ''}
								onChange={handleDateToChange}
								placeholder="Data fim"
								className="w-full lg:w-[160px] pl-9 h-9 text-xs rounded-lg border-border"
								aria-label="Data final"
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
					>
						<X className="size-3.5" />
						Limpar
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
