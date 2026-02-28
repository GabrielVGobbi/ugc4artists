import { useCallback, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { Search, X, CalendarDays, Filter } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type {
	CampaignIndexFilters,
	CampaignStatusOption,
} from '@/types/campaign'

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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Campaign filters panel with search, status multi-select, and date range.
 * Syncs filters with Inertia query params for server-side filtering.
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
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

	// ── Status toggle ────────────────────────────────────────────────

	const handleStatusToggle = useCallback(
		(statusValue: string) => {
			const current = filters.statuses ?? []
			const isActive = current.includes(statusValue)
			const next = isActive
				? current.filter((s) => s !== statusValue)
				: [...current, statusValue]

			applyFilters({ statuses: next })
		},
		[filters.statuses, applyFilters],
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

	// ── Status color mapping ─────────────────────────────────────────

	const statusColorMap: Record<string, string> = {
		gray: 'border-zinc-300 bg-zinc-100 text-zinc-700',
		warning: 'border-amber-300 bg-amber-100 text-amber-700',
		info: 'border-blue-300 bg-blue-100 text-blue-700',
		success: 'border-emerald-300 bg-emerald-100 text-emerald-700',
		danger: 'border-rose-300 bg-rose-100 text-rose-700',
	}

	// ── Render ────────────────────────────────────────────────────────

	return (
		<div className="space-y-4">
			{/* Search + Date row */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
					<Input
						placeholder="Buscar por nome, slug ou Instagram..."
						value={searchValue}
						onChange={handleSearchChange}
						className="h-10 pl-10 text-sm"
						aria-label="Buscar campanhas"
					/>
					{searchValue && (
						<button
							type="button"
							onClick={() => {
								setSearchValue('')
								applyFilters({ search: '' })
							}}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
							aria-label="Limpar busca"
							tabIndex={0}
						>
							<X className="size-4" />
						</button>
					)}
				</div>

				<div className="flex items-center gap-2">
					<CalendarDays className="size-4 text-zinc-400" />
					<Input
						type="date"
						value={filters.date_from ?? ''}
						onChange={handleDateFromChange}
						className="h-10 w-36 text-sm"
						aria-label="Data inicial"
					/>
					<span className="text-xs text-zinc-400">até</span>
					<Input
						type="date"
						value={filters.date_to ?? ''}
						onChange={handleDateToChange}
						className="h-10 w-36 text-sm"
						aria-label="Data final"
					/>
				</div>
			</div>

			{/* Status chips */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
					<Filter className="size-3.5" />
					Status:
				</div>
				{statusOptions.map((option) => {
					const isActive = (filters.statuses ?? []).includes(option.value)
					const colorClasses = isActive
						? statusColorMap[option.color] ?? 'border-zinc-300 bg-zinc-100 text-zinc-700'
						: 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'

					return (
						<button
							key={option.value}
							type="button"
							onClick={() => handleStatusToggle(option.value)}
							className={`cursor-pointer inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${colorClasses}`}
							aria-label={`Filtrar por status ${option.label}`}
							aria-pressed={isActive}
							tabIndex={0}
						>
							{option.label}
							{isActive && (
								<X className="ml-1.5 size-3" />
							)}
						</button>
					)
				})}

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClearAll}
						className="ml-2 h-7 text-xs text-zinc-500 hover:text-zinc-700"
					>
						Limpar filtros
						<Badge
							variant="secondary"
							className="ml-1.5 size-5 justify-center rounded-full p-0 text-[10px]"
						>
							{activeFilterCount}
						</Badge>
					</Button>
				)}
			</div>
		</div>
	)
}

export { CampaignFilters }
export type { CampaignFiltersProps }
