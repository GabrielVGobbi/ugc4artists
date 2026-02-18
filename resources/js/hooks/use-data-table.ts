import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { createTableStore } from '@/lib/create-table-store'
import type {
	ColumnVisibilityConfig,
	PaginationConfig,
	PaginationMeta,
	SearchConfig,
	SelectionConfig,
	SortConfig,
	UseDataTableOptions,
	UseDataTableReturn,
} from '@/types/data-table-composite'

// ─────────────────────────────────────────────────────────────────────────────
// Store Cache
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cache for table stores to prevent recreating stores on re-renders.
 * Uses storageKey as the cache key.
 */
const storeCache = new Map<
	string,
	ReturnType<typeof createTableStore>
>()

/**
 * Gets or creates a table store for the given storage key.
 */
function getOrCreateStore(options: {
	storageKey: string
	defaultPerPage?: number
	defaultSortBy?: string | null
	defaultSortDirection?: 'asc' | 'desc'
	initialColumnVisibility?: Record<string, boolean>
}) {
	const cached = storeCache.get(options.storageKey)
	if (cached) {
		return cached
	}

	const store = createTableStore({
		storageKey: options.storageKey,
		defaultPerPage: options.defaultPerPage,
		defaultSortBy: options.defaultSortBy,
		defaultSortDirection: options.defaultSortDirection,
		initialColumnVisibility: options.initialColumnVisibility,
	})

	storeCache.set(options.storageKey, store)
	return store
}

// ─────────────────────────────────────────────────────────────────────────────
// useDataTable Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook that combines table state management with TanStack Query data fetching.
 * Provides a unified interface for managing table state, fetching data, and
 * generating pre-built configurations for DataTableComposite.
 *
 * @template TData - The data model type
 * @param options - Configuration options for the hook
 * @returns Combined state, actions, query results, and pre-built configs
 *
 * @example
 * ```typescript
 * const {
 *   data,
 *   meta,
 *   isLoading,
 *   searchConfig,
 *   paginationConfig,
 *   selectionConfig,
 *   sortConfig,
 *   columnVisibilityConfig,
 * } = useDataTable({
 *   storageKey: 'clients-table',
 *   queryKey: ['clients'],
 *   queryFn: (params) => fetchClients(params),
 * })
 *
 * return (
 *   <DataTableComposite
 *     data={data}
 *     columns={columns}
 *     keyExtractor={(item) => item.id}
 *     meta={meta}
 *     isLoading={isLoading}
 *     searchConfig={searchConfig}
 *     paginationConfig={paginationConfig}
 *     selectionConfig={selectionConfig}
 *     sortConfig={sortConfig}
 *     columnVisibilityConfig={columnVisibilityConfig}
 *   />
 * )
 * ```
 *
 * @requirement 9.1-9.6
 */
export function useDataTable<TData>(
	options: UseDataTableOptions<TData>,
): UseDataTableReturn<TData> {
	const {
		storageKey,
		queryFn,
		queryKey,
		defaultPerPage,
		defaultSortBy,
		defaultSortDirection,
		initialColumnVisibility,
	} = options

	// Get or create the table store
	const tableStore = getOrCreateStore({
		storageKey,
		defaultPerPage,
		defaultSortBy,
		defaultSortDirection,
		initialColumnVisibility,
	})

	// Get store state and actions
	const {
		page,
		perPage,
		search,
		sortBy,
		sortDirection,
		selectedIds,
		columnVisibility,
		setPage,
		setPerPage,
		setSearch,
		setSort,
		toggleRowSelection,
		selectAll,
		clearSelection,
		toggleColumnVisibility,
	} = tableStore.useStore()

	// Get list params for API calls
	const listParams = tableStore.useListParams()

	// Fetch data using TanStack Query
	const {
		data: queryData,
		isLoading,
		isFetching,
		error,
	} = useQuery({
		queryKey: [...queryKey, listParams],
		queryFn: () => queryFn(listParams),
	})

	// Extract data and meta from query result
	const data = queryData?.data ?? []
	const meta: PaginationMeta | undefined = queryData?.meta

	// ─────────────────────────────────────────────────────────────────────────
	// Pre-built Configurations
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Pre-built search configuration for DataTableComposite.
	 */
	const searchConfig: SearchConfig = useMemo(
		() => ({
			value: search,
			onChange: setSearch,
			placeholder: 'Buscar...',
			debounceMs: 300,
		}),
		[search, setSearch],
	)

	/**
	 * Pre-built pagination configuration for DataTableComposite.
	 * Only defined when meta is available.
	 */
	const paginationConfig: PaginationConfig | undefined = useMemo(() => {
		if (!meta) return undefined
		return {
			page,
			perPage,
			onPageChange: setPage,
			onPerPageChange: setPerPage,
			perPageOptions: [10, 25, 50, 100],
		}
	}, [meta, page, perPage, setPage, setPerPage])

	/**
	 * Pre-built selection configuration for DataTableComposite.
	 */
	const selectionConfig: SelectionConfig = useMemo(
		() => ({
			selectedIds,
			onSelectionChange: (ids: Set<number | string>) => {
				clearSelection()
				if (ids.size > 0) {
					selectAll(Array.from(ids))
				}
			},
			onClearSelection: clearSelection,
		}),
		[selectedIds, clearSelection, selectAll],
	)

	/**
	 * Pre-built sort configuration for DataTableComposite.
	 */
	const sortConfig: SortConfig = useMemo(
		() => ({
			sortBy,
			sortDirection,
			onSort: setSort,
		}),
		[sortBy, sortDirection, setSort],
	)

	/**
	 * Pre-built column visibility configuration for DataTableComposite.
	 */
	const columnVisibilityConfig: ColumnVisibilityConfig = useMemo(
		() => ({
			visibility: columnVisibility,
			onToggle: toggleColumnVisibility,
		}),
		[columnVisibility, toggleColumnVisibility],
	)

	return {
		// Query data
		data,
		meta,
		isLoading,
		isFetching,
		error: error as Error | null,

		// Table state
		page,
		perPage,
		search,
		sortBy,
		sortDirection,
		selectedIds,
		columnVisibility,

		// Table actions
		setPage,
		setPerPage,
		setSearch,
		setSort,
		toggleRowSelection,
		selectAll,
		clearSelection,
		toggleColumnVisibility,

		// Query params
		listParams,

		// Pre-built configs
		searchConfig,
		paginationConfig,
		selectionConfig,
		sortConfig,
		columnVisibilityConfig,
	}
}
