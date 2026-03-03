import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useDebounce } from '@/hooks/use-debounce'
import type {
	CampaignFilterParams,
	CampaignFiltersState,
	CampaignStatusValue,
	UseCampaignFiltersReturn,
} from '@/types/campaign'
import { DEFAULT_CAMPAIGN_FILTERS } from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// URL Param Keys
// ─────────────────────────────────────────────────────────────────────────────

const PARAM_SEARCH = 'search'
const PARAM_STATUSES = 'statuses'
const PARAM_DATE_FROM = 'date_from'
const PARAM_DATE_TO = 'date_to'
const PARAM_SORT_BY = 'sort_by'
const PARAM_SORT_DIR = 'sort_dir'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse URL search params into a CampaignFiltersState,
 * falling back to defaults for missing values.
 */
const parseFiltersFromUrl = (): CampaignFiltersState => {
	const params = new URLSearchParams(window.location.search)

	const search = params.get(PARAM_SEARCH) ?? DEFAULT_CAMPAIGN_FILTERS.search
	const statusesRaw = params.get(PARAM_STATUSES)
	const statuses: CampaignStatusValue[] = statusesRaw
		? (statusesRaw.split(',').filter(Boolean) as CampaignStatusValue[])
		: DEFAULT_CAMPAIGN_FILTERS.statuses
	const dateFrom = params.get(PARAM_DATE_FROM) ?? DEFAULT_CAMPAIGN_FILTERS.dateFrom
	const dateTo = params.get(PARAM_DATE_TO) ?? DEFAULT_CAMPAIGN_FILTERS.dateTo
	const sortBy = params.get(PARAM_SORT_BY) ?? DEFAULT_CAMPAIGN_FILTERS.sortBy
	const sortDirRaw = params.get(PARAM_SORT_DIR)
	const sortDir: 'asc' | 'desc' =
		sortDirRaw === 'asc' || sortDirRaw === 'desc'
			? sortDirRaw
			: DEFAULT_CAMPAIGN_FILTERS.sortDir

	return { search, statuses, dateFrom, dateTo, sortBy, sortDir }
}

/**
 * Serialize filter state to URLSearchParams, omitting default values.
 */
const filtersToSearchParams = (
	filters: CampaignFiltersState,
): URLSearchParams => {
	const params = new URLSearchParams()

	if (filters.search !== DEFAULT_CAMPAIGN_FILTERS.search) {
		params.set(PARAM_SEARCH, filters.search)
	}
	if (filters.statuses.length > 0) {
		params.set(PARAM_STATUSES, filters.statuses.join(','))
	}
	if (filters.dateFrom !== DEFAULT_CAMPAIGN_FILTERS.dateFrom && filters.dateFrom) {
		params.set(PARAM_DATE_FROM, filters.dateFrom)
	}
	if (filters.dateTo !== DEFAULT_CAMPAIGN_FILTERS.dateTo && filters.dateTo) {
		params.set(PARAM_DATE_TO, filters.dateTo)
	}
	if (filters.sortBy !== DEFAULT_CAMPAIGN_FILTERS.sortBy) {
		params.set(PARAM_SORT_BY, filters.sortBy)
	}
	if (filters.sortDir !== DEFAULT_CAMPAIGN_FILTERS.sortDir) {
		params.set(PARAM_SORT_DIR, filters.sortDir)
	}

	return params
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manages campaign filter state with bidirectional URL sync.
 *
 * - Initializes from URL query params on mount
 * - Syncs filter changes back to the URL via `replaceState`
 * - Applies 400ms debounce on the search field
 * - Provides `clearFilters` to reset all filters and update the URL
 * - Computes `hasActiveFilters` and `filterParams` for API calls
 *
 * @returns {UseCampaignFiltersReturn}
 */
export function useCampaignFilters(): UseCampaignFiltersReturn {
	// ─── State ────────────────────────────────────────────────────────────
	const [filters, setFilters] = useState<CampaignFiltersState>(
		parseFiltersFromUrl,
	)
	const isInitialMount = useRef(true)

	// ─── Debounced search ─────────────────────────────────────────────────
	const debouncedSearch = useDebounce(filters.search, 400)

	// ─── URL sync (filters → URL) ────────────────────────────────────────
	useEffect(() => {
		// Skip URL update on initial mount (URL already has the params)
		if (isInitialMount.current) {
			isInitialMount.current = false
			return
		}

		const params = filtersToSearchParams(filters)
		const queryString = params.toString()
		const newUrl = queryString
			? `${window.location.pathname}?${queryString}`
			: window.location.pathname

		window.history.replaceState(null, '', newUrl)
	}, [filters])

	// ─── Setters ──────────────────────────────────────────────────────────

	const setSearch = useCallback((value: string) => {
		setFilters((prev) => ({ ...prev, search: value }))
	}, [])

	const setStatuses = useCallback((statuses: CampaignStatusValue[]) => {
		setFilters((prev) => ({ ...prev, statuses }))
	}, [])

	const setDateFrom = useCallback((date: string | null) => {
		setFilters((prev) => ({ ...prev, dateFrom: date }))
	}, [])

	const setDateTo = useCallback((date: string | null) => {
		setFilters((prev) => ({ ...prev, dateTo: date }))
	}, [])

	const setSortBy = useCallback((column: string) => {
		setFilters((prev) => ({ ...prev, sortBy: column }))
	}, [])

	const setSortDir = useCallback((direction: 'asc' | 'desc') => {
		setFilters((prev) => ({ ...prev, sortDir: direction }))
	}, [])

	// ─── Clear all filters ───────────────────────────────────────────────
	const clearFilters = useCallback(() => {
		setFilters({ ...DEFAULT_CAMPAIGN_FILTERS })

		// Immediately update URL to remove all params
		window.history.replaceState(null, '', window.location.pathname)
	}, [])

	// ─── Computed values ─────────────────────────────────────────────────

	const hasActiveFilters = useMemo(() => {
		const d = DEFAULT_CAMPAIGN_FILTERS
		return (
			filters.search !== d.search ||
			filters.statuses.length > 0 ||
			filters.dateFrom !== d.dateFrom ||
			filters.dateTo !== d.dateTo ||
			filters.sortBy !== d.sortBy ||
			filters.sortDir !== d.sortDir
		)
	}, [filters])

	const filterParams = useMemo((): CampaignFilterParams => {
		const params: CampaignFilterParams = {}

		if (debouncedSearch) {
			params.search = debouncedSearch
		}
		if (filters.statuses.length > 0) {
			params.status = filters.statuses.join(',')
		}
		if (filters.dateFrom) {
			params.date_from = filters.dateFrom
		}
		if (filters.dateTo) {
			params.date_to = filters.dateTo
		}
		if (filters.sortBy !== DEFAULT_CAMPAIGN_FILTERS.sortBy) {
			params.sort_by = filters.sortBy
		}
		if (filters.sortDir !== DEFAULT_CAMPAIGN_FILTERS.sortDir) {
			params.sort_direction = filters.sortDir
		}

		return params
	}, [debouncedSearch, filters.statuses, filters.dateFrom, filters.dateTo, filters.sortBy, filters.sortDir])

	// ─── Return ──────────────────────────────────────────────────────────

	return {
		filters,
		debouncedSearch,
		setSearch,
		setStatuses,
		setDateFrom,
		setDateTo,
		setSortBy,
		setSortDir,
		clearFilters,
		hasActiveFilters,
		filterParams,
	}
}
