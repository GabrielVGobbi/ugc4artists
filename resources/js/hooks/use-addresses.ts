import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import type { Address } from '@/types/address'
import type { PaginatedResponse } from '@/types'
import accountNamespace from '@/routes/api/account'

export function useAddresses() {
    return useQuery({
        queryKey: ['account', 'addresses'],
        queryFn: async () => {
            const { url } = accountNamespace.addresses.index()
            const response = await apiGet<PaginatedResponse<Address>>(url)
            return response.data ?? []
        },
        staleTime: 1000 * 60 * 5,
    })
}
