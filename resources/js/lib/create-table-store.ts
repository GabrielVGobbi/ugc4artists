import { useMemo } from 'react'
import { create, type StateCreator } from 'zustand'
import { createJSONStorage, persist, type PersistOptions } from 'zustand/middleware'

import type {
	CreateTableStoreOptions,
	ListParams,
	TableActions,
	TableState,
	TableStore,
} from '@/types/data-table'

// ─────────────────────────────────────────────────────────────────────────────
// Default State
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates the default initial state for a table store.
 */
const createInitialState = (
	options: CreateTableStoreOptions,
): TableState => ({
	page: 1,
	perPage: options.defaultPerPage ?? 10,
	search: '',
	sortBy: options.defaultSortBy ?? null,
	sortDirection: options.defaultSortDirection ?? 'asc',
	filters: {},
	selectedIds: new Set(),
	columnVisibility: options.initialColumnVisibility ?? {},
})

// ─────────────────────────────────────────────────────────────────────────────
// Serialization Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom storage configuration for Zustand persist middleware.
 * Handles Set serialization/deserialization for localStorage.
 */
const createTableStorage = () =>
	createJSONStorage<TableStore>(() => localStorage, {
		reviver: (_key: string, value: unknown): unknown => {
			return value
		},
		replacer: (_key: string, value: unknown): unknown => {
			// Convert Set to Array for JSON serialization
			if (value instanceof Set) {
				return Array.from(value)
			}
			return value
		},
	})

// ─────────────────────────────────────────────────────────────────────────────
// Store Creator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates the state creator function for Zustand.
 */
const createStoreSlice = (
	options: CreateTableStoreOptions,
): StateCreator<TableStore, [], [], TableStore> => {
	const initialState = createInitialState(options)

	return (set, get) => ({
		// Initial state
		...initialState,

		// ─────────────────────────────────────────────────────────────────────
		// Pagination Actions
		// ─────────────────────────────────────────────────────────────────────

		/**
		 * Set the current page number.
		 */
		setPage: (page: number) => {
			set({ page })
		},

		/**
		 * Set items per page and reset to page 1.
		 */
		setPerPage: (perPage: number) => {
			set({ perPage, page: 1 })
		},

		// ─────────────────────────────────────────────────────────────────────
		// Search Action
		// ─────────────────────────────────────────────────────────────────────

		/**
		 * Set search query and reset to page 1.
		 */
		setSearch: (search: string) => {
			set({ search, page: 1 })
		},

		// ─────────────────────────────────────────────────────────────────────
		// Sort Action
		// ─────────────────────────────────────────────────────────────────────

		/**
		 * Toggle sort on a column.
		 * Cycles through: asc → desc → null → asc
		 */
		setSort: (column: string) => {
			const state = get()

			if (state.sortBy !== column) {
				// New column: start with ascending
				set({ sortBy: column, sortDirection: 'asc' })
			} else if (state.sortDirection === 'asc') {
				// Same column, was asc: switch to desc
				set({ sortDirection: 'desc' })
			} else if (state.sortDirection === 'desc') {
				// Same column, was desc: clear sort
				set({ sortBy: null, sortDirection: 'asc' })
			} else {
				// Fallback: start with ascending
				set({ sortBy: column, sortDirection: 'asc' })
			}
		},

		// ─────────────────────────────────────────────────────────────────────
		// Filter Actions
		// ─────────────────────────────────────────────────────────────────────

		/**
		 * Set a specific filter value and reset to page 1.
		 */
		setFilter: (key: string, value: unknown) => {
			const state = get()
			set({
				filters: { ...state.filters, [key]: value },
				page: 1,
			})
		},

		/**
		 * Clear all filters and reset to page 1.
		 */
		clearFilters: () => {
			set({ filters: {}, page: 1 })
		},

		// ─────────────────────────────────────────────────────────────────────
		// Selection Actions
		// ─────────────────────────────────────────────────────────────────────

		/**
		 * Toggle selection state of a single row.
		 */
		toggleRowSelection: (id: number | string) => {
			const state = get()
			const newSelectedIds = new Set(state.selectedIds)

			if (newSelectedIds.has(id)) {
				newSelectedIds.delete(id)
			} else {
				newSelectedIds.add(id)
			}

			set({ selectedIds: newSelectedIds })
		},

		/**
		 * Select all provided IDs.
		 */
		selectAll: (ids: (number | string)[]) => {
			set({ selectedIds: new Set(ids) })
		},

		/**
		 * Clear all selections.
		 */
		clearSelection: () => {
			set({ selectedIds: new Set() })
		},

		// ─────────────────────────────────────────────────────────────────────
		// Column Visibility Actions
		// ─────────────────────────────────────────────────────────────────────

		/**
		 * Toggle visibility of a column.
		 */
		toggleColumnVisibility: (key: string) => {
			const state = get()
			const currentVisibility = state.columnVisibility[key] ?? true
			set({
				columnVisibility: {
					...state.columnVisibility,
					[key]: !currentVisibility,
				},
			})
		},

		/**
		 * Set column visibility state.
		 */
		setColumnVisibility: (visibility: Record<string, boolean>) => {
			set({ columnVisibility: visibility })
		},

		// ─────────────────────────────────────────────────────────────────────
		// Reset Action
		// ─────────────────────────────────────────────────────────────────────

		/**
		 * Reset store to initial state.
		 */
		reset: () => {
			set(createInitialState(options))
		},
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factory function to create a typed table store with localStorage persistence.
 *
 * @param options - Configuration options for the store
 * @returns Object containing useStore hook and useListParams hook
 *
 * @example
 * ```typescript
 * const { useStore, useListParams } = createTableStore({
 *   storageKey: 'clients-table',
 *   defaultPerPage: 25,
 *   defaultSortBy: 'created_at',
 *   defaultSortDirection: 'desc',
 * })
 *
 * // In a component:
 * const { page, setPage, search, setSearch } = useStore()
 * const listParams = useListParams()
 * ```
 */
export function createTableStore(options: CreateTableStoreOptions): {
	useStore: () => TableStore
	useListParams: () => ListParams
} {
	// Create persist options with custom storage for Set serialization
	const persistOptions: PersistOptions<TableStore> = {
		name: options.storageKey,
		storage: createTableStorage(),
		// Only persist state properties, not actions
		partialize: (state) => ({
			page: state.page,
			perPage: state.perPage,
			search: state.search,
			sortBy: state.sortBy,
			sortDirection: state.sortDirection,
			filters: state.filters,
			selectedIds: state.selectedIds,
			columnVisibility: state.columnVisibility,
		}) as TableStore,
		// Merge persisted state with initial state, handling Set conversion
		merge: (persistedState, currentState) => {
			const persisted = persistedState as Partial<TableState> | undefined

			if (!persisted) {
				return currentState
			}

			// Convert selectedIds array back to Set if needed
			let selectedIds = currentState.selectedIds
			if (persisted.selectedIds) {
				if (Array.isArray(persisted.selectedIds)) {
					selectedIds = new Set(persisted.selectedIds)
				} else if (persisted.selectedIds instanceof Set) {
					selectedIds = persisted.selectedIds
				}
			}

			return {
				...currentState,
				...persisted,
				selectedIds,
			}
		},
	}

	// Create the store with persist middleware
	const useStore = create<TableStore>()(
		persist(createStoreSlice(options), persistOptions),
	)

	/**
	 * Hook that returns API-compatible query parameters.
	 * Converts camelCase state to snake_case API params.
	 */
	const useListParams = (): ListParams => {
		const { page, perPage, search, sortBy, sortDirection, filters } =
			useStore()

		return useMemo(() => {
			const params: ListParams = {
				page,
				per_page: perPage,
			}

			// Only include search if not empty
			if (search) {
				params.search = search
			}

			// Only include sort params if sortBy is set
			if (sortBy) {
				params.sort_by = sortBy
				params.sort_direction = sortDirection
			}

			// Spread filter entries into params
			return { ...params, ...filters }
		}, [page, perPage, search, sortBy, sortDirection, filters])
	}

	return {
		useStore,
		useListParams,
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────────

export type {
	CreateTableStoreOptions,
	ListParams,
	TableActions,
	TableState,
	TableStore,
}
