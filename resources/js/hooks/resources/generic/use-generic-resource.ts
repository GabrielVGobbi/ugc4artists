import { useResourceList, type UseResourceListReturn } from './use-resource-list'

/**
 * Hook genérico ultra-simplificado para buscar qualquer recurso da API.
 *
 * Ideal para prototipagem rápida ou quando você não precisa de lógica customizada.
 * Segue a convenção REST padrão: /api/v1/{resourceName}
 *
 * @template TData - O tipo do recurso
 * @param resourceName - Nome do recurso (ex: 'users', 'clients', 'products')
 * @param options - Opções de busca, filtros e ordenação
 * @returns Objeto com dados e controles de paginação
 *
 * @example
 * // Buscar todos os usuários
 * const users = useGenericResource<User>('users')
 *
 * @example
 * // Buscar com search
 * const users = useGenericResource<User>('users', {
 *   search: searchQuery
 * })
 *
 * @example
 * // Buscar com filtros
 * const activeClients = useGenericResource<Client>('clients', {
 *   filters: { status: 'active', type: 'premium' }
 * })
 *
 * @example
 * // Buscar com ordenação
 * const products = useGenericResource<Product>('products', {
 *   sortBy: 'price',
 *   sortDirection: 'desc',
 *   pageSize: 50,
 * })
 *
 * @example
 * // Buscar com tudo
 * const orders = useGenericResource<Order>('orders', {
 *   search: 'pending',
 *   sortBy: 'created_at',
 *   sortDirection: 'desc',
 *   filters: { status: 'pending', amount_min: 100 },
 *   pageSize: 20,
 * })
 */
export function useGenericResource<TData>(
	resourceName: string,
	options?: {
		/** Query de busca */
		search?: string
		/** Coluna para ordenação */
		sortBy?: string
		/** Direção da ordenação */
		sortDirection?: 'asc' | 'desc'
		/** Filtros adicionais */
		filters?: Record<string, unknown>
		/** Itens por página (padrão: 30) */
		pageSize?: number
		/** Se a query está habilitada (padrão: true) */
		enabled?: boolean
	},
): UseResourceListReturn<TData> {
	return useResourceList<TData>({
		endpoint: `/api/v1/${resourceName}`,
		queryKey: [resourceName, options?.filters],
		search: options?.search,
		sortBy: options?.sortBy,
		sortDirection: options?.sortDirection,
		filters: options?.filters,
		pageSize: options?.pageSize,
		enabled: options?.enabled,
	})
}

export default useGenericResource
