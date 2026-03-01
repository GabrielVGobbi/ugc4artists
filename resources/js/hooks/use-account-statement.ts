import { useState, useCallback } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'

export interface AccountStatement {
    id: number
    uuid: string
    type: 'deposit' | 'service_payment' | 'refund' | 'withdrawal'
    type_label: string
    category: string
    category_label: string
    amount: number
    wallet_amount: number
    gateway_amount: number
    formatted_amount: string
    payment_method: string | null
    gateway: string | null
    status: string
    status_label: string
    status_color: string
    description: string | null
    service?: {
        type: string
        id: number
        uuid: string
        name: string
        slug: string
    }
    payment?: {
        uuid: string
        status: string
        payment_method: string
    }
    breakdown: any
    is_income: boolean
    is_expense: boolean
    completed_at: string | null
    created_at: string
    updated_at: string
}

interface Meta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

interface Summary {
    total_in: number
    total_out: number
    period_balance: number
    current_balance: number
}

interface ApiResponse {
    success: boolean
    data: AccountStatement[]
    summary: Summary
    meta: Meta
}

export function useAccountStatement(perPage: number = 20) {
    const [statements, setStatements] = useState<AccountStatement[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const [meta, setMeta] = useState<Meta | null>(null)
    const [summary, setSummary] = useState<Summary | null>(null)
    const [search, setSearch] = useState('')
    const [type, setType] = useState<string>('')
    const [category, setCategory] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<string>('')
    const [status, setStatus] = useState<string>('')

    const buildUrl = useCallback((page: number, filters: any = {}) => {
        const params = new URLSearchParams({
            per_page: String(perPage),
            page: String(page),
        })

        if (filters.search) params.append('search', filters.search)
        if (filters.type) params.append('type', filters.type)
        if (filters.category) params.append('category', filters.category)
        if (filters.payment_method) params.append('payment_method', filters.payment_method)
        if (filters.status) params.append('status', filters.status)

        return `/api/v1/account/statement?${params.toString()}`
    }, [perPage])

    const fetchStatements = useCallback(
        async (page: number = 1, filters: any = {}) => {
            const isFirstPage = page === 1

            if (isFirstPage) {
                setIsLoading(true)
                setStatements([])
            } else {
                setIsFetchingMore(true)
            }

            try {
                const response = await fetch(buildUrl(page, filters), {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch statements')
                }

                const data: ApiResponse = await response.json()

                setStatements(prev => isFirstPage ? data.data : [...prev, ...data.data])
                setMeta(data.meta)
                setSummary(data.summary)
            } catch (error) {
                console.error('Error fetching statements:', error)
                toast.error('Erro ao carregar extrato')
            } finally {
                setIsLoading(false)
                setIsFetchingMore(false)
            }
        },
        [buildUrl]
    )

    const loadMore = useCallback(() => {
        if (!meta || isFetchingMore) return
        const nextPage = meta.current_page + 1
        if (nextPage <= meta.last_page) {
            fetchStatements(nextPage, { search, type, category, payment_method: paymentMethod, status })
        }
    }, [meta, isFetchingMore, fetchStatements, search, type, category, paymentMethod, status])

    const hasMore = meta ? meta.current_page < meta.last_page : false

    const applyFilters = useCallback(() => {
        fetchStatements(1, { search, type, category, payment_method: paymentMethod, status })
    }, [fetchStatements, search, type, category, paymentMethod, status])

    const clearFilters = useCallback(() => {
        setSearch('')
        setType('')
        setCategory('')
        setPaymentMethod('')
        setStatus('')
        fetchStatements(1, {})
    }, [fetchStatements])

    return {
        statements,
        isLoading,
        isFetchingMore,
        hasMore,
        meta,
        summary,
        search,
        type,
        category,
        paymentMethod,
        status,
        setSearch,
        setType,
        setCategory,
        setPaymentMethod,
        setStatus,
        fetchStatements,
        loadMore,
        applyFilters,
        clearFilters,
    }
}
