import type { ComponentType } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Filter Value Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Possible filter value types
 */
export type FilterValue =
	| string
	| string[]
	| { from: string; to: string }
	| undefined

/**
 * Record of filter values keyed by category id
 */
export type FilterValues = Record<string, FilterValue>

// ─────────────────────────────────────────────────────────────────────────────
// Filter Option Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter option for select/multi-select filters
 */
export interface FilterOption {
	/** Unique identifier for the option */
	value: string
	/** Display label */
	label: string
	/** Optional icon component */
	icon?: ComponentType<{ className?: string }>
	/** Optional color indicator (hex or CSS variable) */
	color?: string
	/** Optional count of items with this filter */
	count?: number
}

/**
 * Date column configuration for date filters
 */
export interface DateColumn {
	/** Column identifier (matches backend column name) */
	value: string
	/** Display label */
	label: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Presets
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Date period preset for quick date range selection
 */
export interface DatePreset {
	/** Unique identifier */
	value: string
	/** Display label */
	label: string
	/** Function that returns the date range */
	getRange: () => { from: Date; to: Date }
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Category Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All supported filter types
 */
export type FilterType =
	| 'select'
	| 'multi-select'
	| 'text'
	| 'date'
	| 'date-range'
	| 'async-select'

/**
 * Base filter category configuration
 */
interface BaseFilterCategory {
	/** Unique identifier for the category */
	id: string
	/** Display title */
	title: string
	/** Optional icon component */
	icon?: ComponentType<{ className?: string }>
	/** Placeholder text */
	placeholder?: string
	/** Whether options are searchable (default: true for > 5 options) */
	searchable?: boolean
}

/**
 * Select filter category (single selection)
 */
export interface SelectFilterCategory extends BaseFilterCategory {
	type: 'select'
	options: FilterOption[]
}

/**
 * Multi-select filter category (multiple selection)
 */
export interface MultiSelectFilterCategory extends BaseFilterCategory {
	type: 'multi-select'
	options: FilterOption[]
}

/**
 * Text filter category (free text input)
 */
export interface TextFilterCategory extends BaseFilterCategory {
	type: 'text'
}

/**
 * Date filter category (single date selection)
 */
export interface DateFilterCategory extends BaseFilterCategory {
	type: 'date'
}

/**
 * Date range filter category (date interval)
 */
export interface DateRangeFilterCategory extends BaseFilterCategory {
	type: 'date-range'
	/** Available date columns to filter on */
	dateColumns?: DateColumn[]
	/** Custom date presets (uses default if not provided) */
	presets?: DatePreset[]
}

/**
 * Async select filter category (options loaded from API)
 */
export interface AsyncSelectFilterCategory extends BaseFilterCategory {
	type: 'async-select'
	/** API endpoint to fetch options from */
	apiEndpoint: string
	/** Transform function for API response */
	transformData?: (data: unknown) => FilterOption[]
	/** Whether multiple selection is allowed */
	multiple?: boolean
}

/**
 * Union type for all filter category configurations
 */
export type FilterCategoryConfig =
	| SelectFilterCategory
	| MultiSelectFilterCategory
	| TextFilterCategory
	| DateFilterCategory
	| DateRangeFilterCategory
	| AsyncSelectFilterCategory

// ─────────────────────────────────────────────────────────────────────────────
// Quick Filter Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Quick filter configuration for inline filters in toolbar
 * These filters appear alongside the search input for quick access
 */
export interface QuickFilter {
	/** Unique identifier (should match a filter category id) */
	id: string
	/** Display label */
	label: string
	/** Placeholder text for the select */
	placeholder?: string
	/** Available options */
	options: FilterOption[]
	/** Whether multiple selection is allowed */
	multiple?: boolean
	/** Minimum width for the select */
	minWidth?: number
	/** Whether to show clear button when value is selected */
	clearable?: boolean
	/** Optional icon component */
	icon?: ComponentType<{ className?: string }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Chip Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter chip representation for active filters display
 */
export interface FilterChip {
	/** Category identifier */
	categoryId: string
	/** Category display title */
	categoryTitle: string
	/** The actual filter value */
	value: string
	/** Human-readable label for display */
	label: string
	/** Optional chip type for styling */
	type?: 'search' | 'date' | 'default'
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook Return Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return type for useTableFilters hook
 */
export interface UseTableFiltersReturn {
	/** Current filter values */
	values: FilterValues
	/** Set a single filter value */
	setValue: (id: string, value: FilterValue) => void
	/** Set multiple filter values at once */
	setValues: (values: FilterValues) => void
	/** Remove a specific filter */
	removeFilter: (id: string, value?: string) => void
	/** Clear all filters */
	clearAll: () => void
	/** Active filter chips for display */
	chips: FilterChip[]
	/** Convert current filters to API query params */
	toQueryParams: () => Record<string, string>
	/** Count of active filters */
	activeCount: number
	/** Whether any filters are active */
	hasActiveFilters: boolean
	/** Whether current filters are from cache */
	isCached: boolean
	/** Clear cache manually (without clearing filters) */
	clearCache: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Advanced Filter Panel Props
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Props for the AdvancedFilterPanel component
 */
export interface AdvancedFilterPanelProps {
	/** Filter category configurations */
	categories: FilterCategoryConfig[]
	/** Current filter values */
	values: FilterValues
	/** Callback when a filter value changes */
	onChange: (id: string, value: FilterValue) => void
	/** Callback to reset all filters */
	onReset: () => void
	/** Optional callback when filters are applied (for manual apply mode) */
	onApply?: () => void
	/** Trigger button label */
	triggerLabel?: string
	/** Trigger button variant */
	triggerVariant?: 'default' | 'outline' | 'ghost' | 'secondary'
	/** Popover alignment */
	align?: 'start' | 'center' | 'end'
	/** Popover width in pixels */
	width?: number
	/** Whether to show active filter chips */
	showActiveFilters?: boolean
	/** Whether to show apply button (manual apply mode) */
	showApplyButton?: boolean
	/** Whether to show global search input */
	showGlobalSearch?: boolean
	/** Global search placeholder */
	globalSearchPlaceholder?: string
	/** Global search input width */
	globalSearchWidth?: number
	/** Debounce delay for text inputs in ms */
	debounceMs?: number
	/** Additional CSS class */
	className?: string
	/** Whether to show date filter section in header */
	showDateFilter?: boolean
	/** Date filter columns configuration */
	dateFilterColumns?: DateColumn[]
	/** Custom date presets */
	dateFilterPresets?: DatePreset[]
	/** Default date column */
	defaultDateColumn?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
	return str ? str.charAt(0).toUpperCase() + str.slice(1) : str
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string): string {
	const date = new Date(dateStr)
	return date.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}

/**
 * Format a date range for display
 */
export function formatDateRange(from?: string, to?: string): string {
	if (from && to) {
		return `${formatDate(from)} - ${formatDate(to)}`
	}
	if (from) {
		return `A partir de ${formatDate(from)}`
	}
	if (to) {
		return `Até ${formatDate(to)}`
	}
	return 'Todas as datas'
}

/**
 * Convert filter values to API query parameters
 */
export function filterValuesToQueryParams(
	values: FilterValues,
	categories: FilterCategoryConfig[]
): Record<string, string> {
	const params: Record<string, string> = {}

	Object.entries(values).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') return

		// Check if this key matches a category
		const category = categories.find((c) => c.id === key)

		// Handle date filter keys from header section (e.g., created_at_from, created_at_to)
		// These are passed directly without a matching category
		if (!category) {
			// Pass through date range keys directly (_from, _to suffix)
			if (
				(key.endsWith('_from') || key.endsWith('_to')) &&
				typeof value === 'string' &&
				value.trim()
			) {
				params[key] = value
				return
			}
			// Skip other unknown keys without a category
			return
		}

		// Handle array values (multi-select)
		if (Array.isArray(value)) {
			if (value.length > 0) {
				params[key] = value.join(',')
			}
			return
		}

		// Handle date range objects
		if (typeof value === 'object' && 'from' in value) {
			if (value.from) {
				params[`${key}_from`] = value.from
			}
			if (value.to) {
				params[`${key}_to`] = value.to
			}
			return
		}

		// Handle simple string values
		if (typeof value === 'string' && value.trim()) {
			params[key] = value
		}
	})

	return params
}

/**
 * Convert API query parameters back to filter values
 */
export function queryParamsToFilterValues(
	params: Record<string, string>,
	categories: FilterCategoryConfig[]
): FilterValues {
	const values: FilterValues = {}

	categories.forEach((category) => {
		switch (category.type) {
			case 'multi-select':
			case 'async-select': {
				const value = params[category.id]
				if (value) {
					values[category.id] = value.split(',').filter(Boolean)
				}
				break
			}
			case 'date-range': {
				const from = params[`${category.id}_from`]
				const to = params[`${category.id}_to`]
				if (from || to) {
					values[category.id] = { from: from || '', to: to || '' }
				}
				break
			}
			default: {
				const value = params[category.id]
				if (value) {
					values[category.id] = value
				}
			}
		}
	})

	return values
}

/**
 * Generate filter chips from filter values
 */
export function filterValuesToChips(
	values: FilterValues,
	categories: FilterCategoryConfig[],
	dateColumns?: DateColumn[]
): FilterChip[] {
	const chips: FilterChip[] = []

	// Track which _from keys we've processed to avoid duplicate chips
	const processedDateKeys = new Set<string>()

	Object.entries(values).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') return

		// Check if this key matches a category
		const category = categories.find((c) => c.id === key)

		// Handle date filter keys from header section (e.g., created_at_from, created_at_to)
		if (!category) {
			// Only process _from keys to avoid duplicate chips
			if (key.endsWith('_from') && typeof value === 'string' && value.trim()) {
				const columnName = key.replace('_from', '')
				const toKey = `${columnName}_to`
				const toValue = values[toKey] as string | undefined

				// Find column label from dateColumns
				const dateColumn = dateColumns?.find((c) => c.value === columnName)
				const columnLabel = dateColumn?.label || capitalize(columnName.replace('_', ' '))

				const rangeLabel = formatDateRange(value, toValue)

				chips.push({
					categoryId: key, // Use _from key as the id for removal
					categoryTitle: columnLabel,
					value: `${columnName}_date`,
					label: rangeLabel,
					type: 'date',
				})

				processedDateKeys.add(key)
				processedDateKeys.add(toKey)
			}
			// Skip _to keys (already handled with _from) and other unknown keys
			return
		}

		// Handle array values (multi-select)
		if (Array.isArray(value)) {
			value.forEach((v) => {
				let option: FilterOption | undefined
				if ('options' in category) {
					option = category.options?.find((o) => o.value === v)
				}
				chips.push({
					categoryId: key,
					categoryTitle: category.title,
					value: v,
					label: option?.label || capitalize(v),
				})
			})
			return
		}

		// Handle date range objects
		if (typeof value === 'object' && 'from' in value) {
			const rangeLabel = formatDateRange(value.from, value.to)
			chips.push({
				categoryId: key,
				categoryTitle: category.title,
				value: JSON.stringify(value),
				label: rangeLabel,
				type: 'date',
			})
			return
		}

		// Handle simple string values
		if (typeof value === 'string' && value.trim()) {
			let label = value
			if ('options' in category && category.options) {
				const option = category.options.find((o) => o.value === value)
				label = option?.label || capitalize(value)
			}
			chips.push({
				categoryId: key,
				categoryTitle: category.title,
				value,
				label,
			})
		}
	})

	return chips
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Types (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use FilterCategoryConfig instead
 */
export interface FilterCategory {
	id: string
	label: string
	icon: ComponentType<{ className?: string }>
	type: 'checkbox' | 'date-range'
	options?: Array<{ id: string; label: string; color?: string; count?: number }>
	dateColumns?: Array<{ id: string; label: string }>
}

/**
 * @deprecated Use DateRangeFilterCategory with DateColumn instead
 */
export interface DateRangeFilter {
	from?: string
	to?: string
	column: string
}

/**
 * @deprecated Use filterValuesToQueryParams instead
 */
export function filtersToQueryParams(
	chips: Array<{ key: string; value: string }>
): Record<string, string> {
	const params: Record<string, string> = {}

	chips.forEach((chip) => {
		const category = chip.key

		// Handle date range filters
		if (chip.value.startsWith('{')) {
			try {
				const dateRange = JSON.parse(chip.value) as DateRangeFilter
				if (dateRange.column) {
					params[`${category}_column`] = dateRange.column
				}
				if (dateRange.from) {
					params[`${category}_from`] = dateRange.from
				}
				if (dateRange.to) {
					params[`${category}_to`] = dateRange.to
				}
			} catch {
				// Invalid JSON, skip
			}
		} else {
			// Handle multiple values for the same category
			if (params[category]) {
				params[category] += `,${chip.value}`
			} else {
				params[category] = chip.value
			}
		}
	})

	return params
}
