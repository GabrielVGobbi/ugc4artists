import type { ReactNode } from 'react'
import type { BaseModel } from '@/types/data-table'

// Re-export types from central data-table types for convenience
export type { BaseModel, ColumnDef } from '@/types/data-table'

/**
 * Column interface for DataTable.
 * Compatible with both legacy usage and new ColumnDef from data-table types.
 *
 * @template T - The data type for the column
 */
export interface Column<T> {
	/** Unique identifier for the column */
	key: string
	/** Header text or component */
	header: string | ReactNode
	/** Function to render cell content */
	cell?: (item: T, index: number) => ReactNode
	/** Key to access value from data object */
	accessorKey?: keyof T
	/** Enable sorting for this column */
	sortable?: boolean
	/** Column width (CSS value) */
	width?: string
	/** Additional CSS classes */
	className?: string
	/** Text alignment */
	align?: 'left' | 'center' | 'right'
	/** Hide column permanently (won't appear in column toggle) */
	hidden?: boolean
	/** Hide column by default but allow toggling via column visibility menu */
	defaultHidden?: boolean
	/** Hide on mobile screens */
	hideOnMobile?: boolean
	/** Pin column to left or right */
	pinned?: 'left' | 'right'
}

/**
 * Props for the DataTable component.
 * Supports generic type parameter for full type safety with any data model.
 *
 * @template TData - The data model type. When extending BaseModel, enables
 *                   full type safety for selection and other features.
 *
 * @example
 * ```tsx
 * // Basic usage (backward compatible)
 * interface User {
 *   id: number
 *   name: string
 * }
 *
 * <DataTable<User>
 *   data={users}
 *   columns={columns}
 *   keyExtractor={(item) => item.id}
 * />
 *
 * // With selection
 * <DataTable<User>
 *   data={users}
 *   columns={columns}
 *   keyExtractor={(item) => item.id}
 *   selectable
 *   selectedIds={selectedIds}
 *   onSelectionChange={setSelectedIds}
 * />
 * ```
 */
export interface DataTableProps<TData> {
	/** Data array to display */
	data: TData[]
	/** Column definitions */
	columns: Column<TData>[]
	/** Function to extract unique key from item */
	keyExtractor: (item: TData) => string | number
	/** Loading state - shows skeleton loader when true */
	isLoading?: boolean
	/**
	 * Background refetching state - shows subtle loading indicator when true.
	 * Use this to indicate data is being refreshed in the background while
	 * still showing the current data.
	 * @requirement 11.3
	 */
	isFetching?: boolean
	/** Empty state message displayed when data array is empty */
	emptyMessage?: string
	/**
	 * Custom empty state component - overrides emptyMessage when provided.
	 * Use this to render a custom empty state with icons, actions, etc.
	 * @requirement 11.4
	 */
	emptyComponent?: ReactNode
	/** Current sort column key */
	sortBy?: string | null
	/** Current sort direction */
	sortDirection?: 'asc' | 'desc'
	/** Sort change handler - called when user clicks a sortable column header */
	onSort?: (column: string) => void
	/** Row click handler - called when user clicks a row (not on checkbox) */
	onRowClick?: (item: TData) => void
	/**
	 * Enable row selection via checkboxes.
	 * When true, a checkbox column is added as the first column.
	 * @requirement 6.1
	 */
	selectable?: boolean
	/**
	 * Set of selected row IDs - controlled selection state.
	 * Use with onSelectionChange for controlled selection behavior.
	 * @requirement 6.1
	 */
	selectedIds?: Set<number | string>
	/**
	 * Selection change handler - called when selection changes.
	 * Receives the new Set of selected IDs.
	 * @requirement 6.1
	 */
	onSelectionChange?: (ids: Set<number | string>) => void
	/**
	 * Column visibility state - keys are column keys, values are visibility.
	 * When provided, columns with visibility set to false will be hidden.
	 * @requirement 1.5
	 */
	columnVisibility?: Record<string, boolean>
	/** Additional CSS classes for the table container */
	className?: string
	/**
	 * Enable sticky header mode.
	 * When true, the table header remains fixed at the top of the scroll container
	 * while the table body scrolls. Useful for long tables and infinite scroll mode.
	 * @requirement 4.1, 4.2, 4.3, 4.4, 4.5
	 */
	stickyHeader?: boolean
}

/**
 * Props for the DataTable component with BaseModel constraint.
 * Use this type when you need full type safety for selection features.
 *
 * @template TData - The data model type extending BaseModel
 */
export type TypedDataTableProps<TData extends BaseModel> = DataTableProps<TData>

/**
 * Props for the pagination component.
 */
export interface PaginationProps {
	/** Current page number (1-indexed) */
	currentPage: number
	/** Last page number */
	lastPage: number
	/** Items per page */
	perPage: number
	/** Total number of items */
	total: number
	/** First item index on current page (null if empty) */
	from: number | null
	/** Last item index on current page (null if empty) */
	to: number | null
	/** Page change handler */
	onPageChange: (page: number) => void
	/** Per-page change handler */
	onPerPageChange?: (perPage: number) => void
	/** Available per-page options */
	perPageOptions?: number[]
}
