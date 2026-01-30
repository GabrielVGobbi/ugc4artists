import { useCallback, useRef, useState } from 'react'
import { apiGet, ApiError, PaginatedResponse } from '@/lib/api'
import wallet from '@/routes/app/wallet'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentStatus {
    value: string
    label: string
    color: string
    is_final: boolean
    is_pending: boolean
}

export interface PaymentMethod {
    value: string
    label: string
    color: string
    icon: string
}

export interface Payment {
    id: number
    uuid: string
    amount_cents: number
    wallet_applied_cents: number
    gateway_amount_cents: number
    currency: string
    status: PaymentStatus
    payment_method: PaymentMethod | null
    meta: {
        description?: string
    }
    due_date: string | null
    paid_at: string | null
    created_at: string
}

interface UsePaymentsState {
    payments: Payment[]
    meta: PaginatedResponse<Payment>['meta'] | null
    isLoading: boolean
    isFetchingMore: boolean
    error: ApiError | null
    search: string
}

interface UsePaymentsReturn extends UsePaymentsState {
    fetchPayments: (page?: number, searchTerm?: string) => Promise<void>
    loadMore: () => Promise<void>
    hasMore: boolean
    refresh: () => Promise<void>
    setSearch: (search: string) => void
    exportUrl: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function usePayments(perPage = 10): UsePaymentsReturn {
    const [state, setState] = useState<UsePaymentsState>({
        payments: [],
        meta: null,
        isLoading: false,
        isFetchingMore: false,
        error: null,
        search: '',
    })

    const searchRef = useRef(state.search)

    const fetchPayments = useCallback(async (page = 1, searchTerm?: string) => {
        const currentSearch = searchTerm ?? searchRef.current

        setState(prev => ({
            ...prev,
            isLoading: page === 1,
            isFetchingMore: page > 1,
            error: null,
            search: currentSearch,
        }))

        searchRef.current = currentSearch

        try {
            const query: Record<string, unknown> = { page, per_page: perPage }
            if (currentSearch) {
                query.search = currentSearch
            }

            const url = wallet.payments.url({ query })
            const response = await apiGet<PaginatedResponse<Payment>>(url)

            setState(prev => ({
                ...prev,
                payments: page === 1 ? response.data : [...prev.payments, ...response.data],
                meta: response.meta,
                isLoading: false,
                isFetchingMore: false,
            }))
        } catch (err) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                isFetchingMore: false,
                error: err as ApiError,
            }))
        }
    }, [perPage])

    const loadMore = useCallback(async () => {
        if (!state.meta || state.isFetchingMore) return

        const nextPage = state.meta.current_page + 1
        if (nextPage > state.meta.last_page) return

        await fetchPayments(nextPage)
    }, [state.meta, state.isFetchingMore, fetchPayments])

    const refresh = useCallback(async () => {
        await fetchPayments(1)
    }, [fetchPayments])

    const setSearch = useCallback((search: string) => {
        searchRef.current = search
        setState(prev => ({ ...prev, search }))
    }, [])

    const hasMore = state.meta
        ? state.meta.current_page < state.meta.last_page
        : false

    // Build export URL with current search
    const exportUrl = wallet.payments.export.url({
        query: state.search ? { search: state.search } : undefined,
    })

    return {
        ...state,
        fetchPayments,
        loadMore,
        hasMore,
        refresh,
        setSearch,
        exportUrl,
    }
}
