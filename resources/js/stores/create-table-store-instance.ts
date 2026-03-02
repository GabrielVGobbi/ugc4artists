/**
 * Clients Table Store Instance
 *
 * This file creates a table store instance for the clients table using the
 * createTableStore factory. It provides typed hooks for managing table state
 * with localStorage persistence.
 *
 * @see resources/js/lib/create-table-store.ts for the factory implementation
 *
 * **Validates: Requirements 9.2, 9.3**
 * - 9.2: THE Table_Store_Factory SHALL accept a unique storage key for persistence
 * - 9.3: WHEN the store is created, THE Table_Store_Factory SHALL restore persisted state from localStorage
 */

import { createTableStore } from '@/lib/create-table-store'

// ─────────────────────────────────────────────────────────────────────────────
// Clients Table Store
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates the clients table store with localStorage persistence.
 * Uses 'clients-table' as the storage key for persistence.
 */
const clientsTableStore = createTableStore({
	storageKey: 'clients-table',
	defaultPerPage: 10,
	defaultSortBy: null,
	defaultSortDirection: 'asc',
})

/**
 * Hook to access the clients table store state and actions.
 *
 * @example
 * ```typescript
 * const { page, setPage, search, setSearch, sortBy, setSort } = useClientsTableStore()
 * ```
 */
export const useClientsTableStore = clientsTableStore.useStore

/**
 * Hook to get API-compatible query parameters for the clients list.
 * Converts camelCase state to snake_case API params.
 *
 * @example
 * ```typescript
 * const listParams = useClientsListParams()
 * // Returns: { page: 1, per_page: 10, search: 'query', sort_by: 'name', sort_direction: 'asc' }
 * ```
 */
export const useClientsListParams = clientsTableStore.useListParams


// ─────────────────────────────────────────────────────────────────────────────
// Users Table Store
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates the users table store with localStorage persistence.
 * Uses 'users-table' as the storage key for persistence.
 */
const usersTableStore = createTableStore({
	storageKey: 'users-table',
	defaultPerPage: 30,
	defaultSortBy: 'name',
	defaultSortDirection: 'asc',
})

/**
 * Hook to access the users table store state and actions.
 *
 * @example
 * ```typescript
 * const { page, setPage, search, setSearch, sortBy, setSort } = useUsersTableStore()
 * ```
 */
export const useUsersTableStore = usersTableStore.useStore

/**
 * Hook to get API-compatible query parameters for the users list.
 * Converts camelCase state to snake_case API params.
 *
 * @example
 * ```typescript
 * const listParams = useUsersListParams()
 * // Returns: { page: 1, per_page: 30, search: 'query', sort_by: 'name', sort_direction: 'asc' }
 * ```
 */
export const useUsersListParams = usersTableStore.useListParams
