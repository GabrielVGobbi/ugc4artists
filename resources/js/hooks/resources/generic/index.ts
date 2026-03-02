/**
 * Hooks Index
 *
 * Centraliza exports de hooks para facilitar imports
 */

// ─────────────────────────────────────────────────────────────────────────────
// Resource List Hooks (Para listagem com infinite scroll)
// ─────────────────────────────────────────────────────────────────────────────

export {
	useResourceList,
	type UseResourceListConfig,
	type UseResourceListReturn,
	type ResourceListParams,
} from './use-resource-list'

export { useGenericResource } from './use-generic-resource'

// ─────────────────────────────────────────────────────────────────────────────
// Resource Mutation Hooks (Para CRUD genérico)
// ─────────────────────────────────────────────────────────────────────────────

export {
	useDeleteResource,
	useCreateResource,
	useUpdateResource,
	useBulkDeleteResource,
} from './use-resource-mutations'

// ─────────────────────────────────────────────────────────────────────────────
// Resource-Specific Hooks (Quando precisar de lógica customizada)
// ─────────────────────────────────────────────────────────────────────────────

export {
	useUsers,
	useActiveUsers,
	useUsersByRole,
	type UseUsersParams,
} from '../use-users'

// ─────────────────────────────────────────────────────────────────────────────
// QuickView Hook (Para visualização rápida de entidades)
// ─────────────────────────────────────────────────────────────────────────────

export { useQuickView } from '../../use-quick-view'

