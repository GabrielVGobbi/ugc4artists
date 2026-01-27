import { useCallback, useEffect, useRef, useState } from 'react'
import type { ApiError } from '@/lib/api'
import { apiGet, createAbortController, isApiError } from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface QueryOptions<T> {
    enabled?: boolean
    initialData?: T
    onSuccess?: (data: T) => void
    onError?: (error: ApiError) => void
    refetchOnMount?: boolean
}

interface QueryState<T> {
    data: T | undefined
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    error: ApiError | null
    isSuccess: boolean
}

interface QueryReturn<T> extends QueryState<T> {
    refetch: () => Promise<T | undefined>
    setData: React.Dispatch<React.SetStateAction<T | undefined>>
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useApiQuery<T>(
    url: string | null,
    params?: Record<string, unknown>,
    options?: QueryOptions<T>
): QueryReturn<T> {
    const {
        enabled = true,
        initialData,
        onSuccess,
        onError,
        refetchOnMount = true,
    } = options ?? {}

    const [data, setData] = useState<T | undefined>(initialData)
    const [isLoading, setIsLoading] = useState(!initialData && enabled)
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)

    const abortRef = useRef<AbortController | null>(null)
    const mountedRef = useRef(true)
    const hasInitialFetch = useRef(false)

    const fetchData = useCallback(async (): Promise<T | undefined> => {
        if (!url) return undefined

        // Cancel previous request
        abortRef.current?.abort()
        abortRef.current = createAbortController()

        setIsFetching(true)
        if (!data) setIsLoading(true)
        setError(null)

        try {
            const result = await apiGet<T>(url, params, {
                signal: abortRef.current.signal,
            })

            if (!mountedRef.current) return undefined

            setData(result)
            setIsLoading(false)
            setIsFetching(false)
            onSuccess?.(result)
            return result
        } catch (e) {
            if (!mountedRef.current) return undefined

            // Ignore abort errors
            if ((e as Error).name === 'AbortError' || (e as Error).name === 'CanceledError') {
                return undefined
            }

            const apiError = isApiError(e)
                ? e
                : { type: 'server' as const, status: 500, message: 'Erro inesperado' }

            setError(apiError)
            setIsLoading(false)
            setIsFetching(false)
            onError?.(apiError)
            return undefined
        }
    }, [url, JSON.stringify(params), data, onSuccess, onError])

    // Initial fetch
    useEffect(() => {
        mountedRef.current = true

        if (enabled && url && (refetchOnMount || !hasInitialFetch.current)) {
            hasInitialFetch.current = true
            fetchData()
        }

        return () => {
            mountedRef.current = false
            abortRef.current?.abort()
        }
    }, [enabled, url, fetchData, refetchOnMount])

    return {
        data,
        isLoading,
        isFetching,
        isError: !!error,
        error,
        isSuccess: !!data && !error,
        refetch: fetchData,
        setData,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Lazy Query (fetch manual)
// ─────────────────────────────────────────────────────────────────────────────

export function useApiLazyQuery<T, TParams = Record<string, unknown>>(): {
    fetch: (url: string, params?: TParams) => Promise<T | undefined>
    data: T | undefined
    isLoading: boolean
    error: ApiError | null
    reset: () => void
} {
    const [data, setData] = useState<T | undefined>()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)

    const abortRef = useRef<AbortController | null>(null)

    const fetch = useCallback(async (url: string, params?: TParams): Promise<T | undefined> => {
        abortRef.current?.abort()
        abortRef.current = createAbortController()

        setIsLoading(true)
        setError(null)

        try {
            const result = await apiGet<T>(url, params as Record<string, unknown>, {
                signal: abortRef.current.signal,
            })
            setData(result)
            setIsLoading(false)
            return result
        } catch (e) {
            if ((e as Error).name === 'AbortError' || (e as Error).name === 'CanceledError') {
                return undefined
            }

            const apiError = isApiError(e)
                ? e
                : { type: 'server' as const, status: 500, message: 'Erro inesperado' }

            setError(apiError)
            setIsLoading(false)
            return undefined
        }
    }, [])

    const reset = useCallback(() => {
        setData(undefined)
        setError(null)
        setIsLoading(false)
    }, [])

    return { fetch, data, isLoading, error, reset }
}
