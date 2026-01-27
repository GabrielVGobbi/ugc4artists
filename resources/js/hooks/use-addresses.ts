import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import account from '@/routes/account'
import type { Address } from '@/types/address'
import type { PaginatedResponse } from '@/types'

export function useAddresses() {
    return useQuery({
        queryKey: ['account', 'addresses'],
        queryFn: async () => {
            const { url } = account.addresses.index()
            const response = await apiGet<PaginatedResponse<Address>>(url)
            return response.data ?? []
        },
        staleTime: 1000 * 60 * 5,
    })
}
