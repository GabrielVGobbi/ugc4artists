import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type {
	FilterCategoryConfig,
	FilterChip,
	FilterValue,
	FilterValues,
	UseTableFiltersReturn,
} from '@/types/filters'
import { filterValuesToChips, filterValuesToQueryParams } from '@/types/filters'
import { filterCacheManager, type FilterCacheConfig } from '@/lib/filter-cache-manager'
import { toast } from '@/stores/toast-store'

// ─────────────────────────────────────────────────────────────────────────────
// Hook Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface UseTableFiltersConfig {
	/** Filter category configurations */
	categories: FilterCategoryConfig[]
	/** Initial filter values */
	initialValues?: FilterValues
	/** Callback when filters change */
	onChange?: (values: FilterValues, params: Record<string, string>) => void
	/**
	 * Cache key (resource name) for persisting filters
	 * @example 'clients', 'deliveries', 'orders'
	 * If not provided, caching is disabled
	 */
	cacheKey?: string
	/**
	 * Cache configuration
	 */
	cacheConfig?: FilterCacheConfig
	/**
	 * Show toast notification when filters are restored from cache
	 * @default true
	 */
	showCacheRestoreToast?: boolean
	/**
	 * Debounce time (ms) for auto-save to cache
	 * @default 1000
	 */
	cacheSaveDebounce?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// useTableFilters Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook for managing table filter state with conversion to query params and chips.
 *
 * @example
 * ```tsx
 * const filters = useTableFilters({
 *   categories: [
 *     { id: 'status', title: 'Status', type: 'multi-select', options: [...] },
 *     { id: 'date_range', title: 'Period', type: 'date-range' },
 *   ],
 *   initialValues: { status: ['active'] },
 *   onChange: (values, params) => {
 *     // Update API call with new params
 *   },
 * })
 *
 * // Use in component
 * <AdvancedFilterPanel
 *   categories={filters.categories}
 *   values={filters.values}
 *   onChange={filters.setValue}
 *   onReset={filters.clearAll}
 * />
 * ```
 */
export function useTableFilters({
	categories,
	initialValues = {},
	onChange,
	cacheKey,
	cacheConfig,
	showCacheRestoreToast = true,
	cacheSaveDebounce = 1000,
}: UseTableFiltersConfig): UseTableFiltersReturn & {
	categories: FilterCategoryConfig[]
	isCached: boolean
	clearCache: () => void
} {
	// ─────────────────────────────────────────────────────────────────────────
	// Refs
	// ─────────────────────────────────────────────────────────────────────────

	const saveTimeoutRef = useRef<NodeJS.Timeout>()
	const isInitialMount = useRef(true)

	// ─────────────────────────────────────────────────────────────────────────
	// State
	// ─────────────────────────────────────────────────────────────────────────

	// Restore from cache on mount (se cacheKey fornecida)
	const getInitialValues = (): FilterValues => {
		if (cacheKey) {
			// Configurar cache se config fornecido
			if (cacheConfig) {
				filterCacheManager.configure(cacheKey, cacheConfig)
			}

			const cached = filterCacheManager.get(cacheKey)
			if (cached) {
				if (showCacheRestoreToast) {
					toast.info('Filtros anteriores restaurados', {
						description: `${Object.keys(cached.values).length} filtro(s) aplicado(s)`,
					})
				}
				return cached.values
			}
		}

		return initialValues
	}

	const [values, setValuesState] = useState<FilterValues>(getInitialValues)
	const [isCached, setIsCached] = useState(false)

	// ─────────────────────────────────────────────────────────────────────────
	// Effects
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Auto-save to cache with debounce
	 */
	useEffect(() => {
		// Skip on initial mount
		if (isInitialMount.current) {
			isInitialMount.current = false
			setIsCached(cacheKey ? filterCacheManager.has(cacheKey) : false)
			return
		}

		// Skip if no cache key
		if (!cacheKey) return

		// Clear previous timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current)
		}

		// Schedule save
		saveTimeoutRef.current = setTimeout(() => {
			filterCacheManager.set(cacheKey, values)
			setIsCached(Object.keys(values).length > 0)
		}, cacheSaveDebounce)

		// Cleanup
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current)
			}
		}
	}, [values, cacheKey, cacheSaveDebounce])

	// ─────────────────────────────────────────────────────────────────────────
	// Computed Values
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Convert current filter values to API query parameters
	 */
	const toQueryParams = useCallback((): Record<string, string> => {
		return filterValuesToQueryParams(values, categories)
	}, [values, categories])

	/**
	 * Generate filter chips for display
	 */
	const chips = useMemo((): FilterChip[] => {
		return filterValuesToChips(values, categories)
	}, [values, categories])

	/**
	 * Count of active filters
	 */
	const activeCount = useMemo((): number => {
		let count = 0

		Object.entries(values).forEach(([key, value]) => {
			if (value === undefined || value === null || value === '') return

			// Skip _to keys - they're counted with _from
			if (key.endsWith('_to')) {
				return
			}

			// Handle _from keys (date filters from header) - count as 1 with their _to pair
			if (key.endsWith('_from')) {
				if (typeof value === 'string' && value.trim()) {
					count += 1
				}
				return
			}

			if (Array.isArray(value)) {
				count += value.length
			} else if (typeof value === 'object' && 'from' in value) {
				// Date range counts as 1
				if (value.from || value.to) {
					count += 1
				}
			} else if (typeof value === 'string' && value.trim()) {
				count += 1
			}
		})

		return count
	}, [values])

	/**
	 * Whether any filters are active
	 */
	const hasActiveFilters = activeCount > 0

	// ─────────────────────────────────────────────────────────────────────────
	// Handlers
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Set a single filter value
	 */
	const setValue = useCallback(
		(id: string, value: FilterValue) => {
			setValuesState((prev) => {
				const newValues = { ...prev }

				// Remove if undefined or empty
				if (
					value === undefined ||
					value === null ||
					value === '' ||
					(Array.isArray(value) && value.length === 0)
				) {
					delete newValues[id]
				} else {
					newValues[id] = value
				}

				// Notify parent
				if (onChange) {
					const params = filterValuesToQueryParams(newValues, categories)
					onChange(newValues, params)
				}

				return newValues
			})
		},
		[categories, onChange]
	)

	/**
	 * Set multiple filter values at once
	 */
	const setValues = useCallback(
		(newValues: FilterValues) => {
			setValuesState((prev) => {
				const merged = { ...prev, ...newValues }

				// Clean up undefined/empty values
				Object.keys(merged).forEach((key) => {
					const value = merged[key]
					if (
						value === undefined ||
						value === null ||
						value === '' ||
						(Array.isArray(value) && value.length === 0)
					) {
						delete merged[key]
					}
				})

				// Notify parent
				if (onChange) {
					const params = filterValuesToQueryParams(merged, categories)
					onChange(merged, params)
				}

				return merged
			})
		},
		[categories, onChange]
	)

	/**
	 * Remove a specific filter (or a specific value from multi-select)
	 */
	const removeFilter = useCallback(
		(id: string, specificValue?: string) => {
			setValuesState((prev) => {
				const newValues = { ...prev }
				const currentValue = newValues[id]

				// If specific value provided and current value is array, remove just that value
				if (specificValue && Array.isArray(currentValue)) {
					const filtered = currentValue.filter((v) => v !== specificValue)
					if (filtered.length === 0) {
						delete newValues[id]
					} else {
						newValues[id] = filtered
					}
				} else {
					// Remove entire filter
					delete newValues[id]
				}

				// Notify parent
				if (onChange) {
					const params = filterValuesToQueryParams(newValues, categories)
					onChange(newValues, params)
				}

				return newValues
			})
		},
		[categories, onChange]
	)

	/**
	 * Clear all filters
	 */
	const clearAll = useCallback(() => {
		setValuesState({})

		// Clear cache
		if (cacheKey) {
			filterCacheManager.invalidate(cacheKey)
			setIsCached(false)
		}

		if (onChange) {
			onChange({}, {})
		}
	}, [cacheKey, onChange])

	/**
	 * Clear cache manually (without clearing filters)
	 */
	const clearCache = useCallback(() => {
		if (cacheKey) {
			filterCacheManager.invalidate(cacheKey)
			setIsCached(false)
			toast.success('Cache de filtros limpo')
		}
	}, [cacheKey])

	// ─────────────────────────────────────────────────────────────────────────
	// Return
	// ─────────────────────────────────────────────────────────────────────────

	return {
		categories,
		values,
		setValue,
		setValues,
		removeFilter,
		clearAll,
		chips,
		toQueryParams,
		activeCount,
		hasActiveFilters,
		isCached,
		clearCache,
	}
}

export default useTableFilters
