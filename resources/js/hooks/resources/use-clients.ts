import { useQuery } from '@tanstack/react-query'

import { httpGet } from '@/lib/http'
import type { Client } from '@/types/app/client'
import type { ClientAddress } from '@/types/app/order'

interface ClientWithAddresses extends Client {
	addresses?: ClientAddress[]
}

interface ClientsResponse {
	data: ClientWithAddresses[]
}

/**
 * Hook para buscar clientes com endereços sob demanda.
 * Usa TanStack Query com `enabled` para controlar quando a busca acontece.
 *
 * @param enabled - Controla se a query deve ser executada (ex: modal aberto)
 * @returns Query result com lista de clientes e seus endereços
 *
 * @example
 * const { data, isLoading, isError, refetch } = useClients(isModalOpen)
 */
export function useClients(enabled: boolean) {
	return useQuery({
		queryKey: ['clients-with-addresses'],
		queryFn: () => httpGet<ClientsResponse>(
			'/api/v1/tables/clients',
		),
		enabled,
		staleTime: 5 * 60 * 1000,
	})
}
