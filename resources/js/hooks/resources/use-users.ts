import { useResourceList, type UseResourceListReturn } from './generic/use-resource-list'

import type { User } from '@/types/app/user'

/**
 * Parâmetros para filtrar usuários
 */
export interface UseUsersParams {
	/** Query de busca */
	search?: string
	/** Filtrar por status */
	status?: 'active' | 'inactive' | 'pending'
	/** Filtrar por role */
	role?: string
	/** Ordenar por campo */
	sortBy?: 'name' | 'email' | 'created_at'
	/** Direção da ordenação */
	sortDirection?: 'asc' | 'desc'
}

/**
 * Hook para buscar lista de usuários com filtros específicos.
 *
 * Este é um exemplo de como criar um hook wrapper quando você precisa
 * de lógica específica ou validações adicionais.
 *
 * @param params - Parâmetros de busca e filtros
 * @returns Objeto com dados e controles de paginação
 *
 * @example
 * // Buscar todos os usuários
 * const users = useUsers()
 *
 * @example
 * // Buscar usuários ativos
 * const activeUsers = useUsers({ status: 'active' })
 *
 * @example
 * // Buscar com search e ordenação
 * const users = useUsers({
 *   search: 'john',
 *   sortBy: 'name',
 *   sortDirection: 'asc',
 * })
 *
 * @example
 * // Buscar admins ativos
 * const admins = useUsers({
 *   role: 'admin',
 *   status: 'active',
 * })
 */
export function useUsers(params?: UseUsersParams): UseResourceListReturn<User> {
	const {
		search,
		status,
		role,
		sortBy = 'name',
		sortDirection = 'asc',
	} = params ?? {}

	return useResourceList<User>({
		endpoint: '/api/v1/users',
		queryKey: ['users', { status, role }],
		search,
		sortBy,
		sortDirection,
		filters: {
			status,
			role,
		},
	})
}

/**
 * Hook para buscar apenas usuários ativos.
 * Atalho conveniente para um caso de uso comum.
 *
 * @param search - Query de busca opcional
 * @returns Objeto com dados e controles de paginação
 *
 * @example
 * const activeUsers = useActiveUsers()
 * const searchedUsers = useActiveUsers('john')
 */
export function useActiveUsers(search?: string): UseResourceListReturn<User> {
	return useUsers({
		search,
		status: 'active',
		sortBy: 'name',
		sortDirection: 'asc',
	})
}

/**
 * Hook para buscar usuários por role específica.
 *
 * @param role - Role do usuário (admin, user, etc.)
 * @param search - Query de busca opcional
 * @returns Objeto com dados e controles de paginação
 *
 * @example
 * const admins = useUsersByRole('admin')
 * const managers = useUsersByRole('manager', 'john')
 */
export function useUsersByRole(
	role: string,
	search?: string,
): UseResourceListReturn<User> {
	return useUsers({
		role,
		search,
		sortBy: 'name',
		sortDirection: 'asc',
	})
}

export default useUsers
