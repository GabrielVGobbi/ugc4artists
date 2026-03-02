import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats, type DashboardFilters, type DashboardStats } from '@/lib/api/dashboard'

// ─────────────────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const dashboardKeys = {
    all: ['dashboard'] as const,
    stats: (filters: DashboardFilters) => ['dashboard', 'stats', filters] as const,
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseDashboardResult {
    data: DashboardStats | undefined
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    error: unknown
    refetch: () => void
    lastUpdated: Date | undefined
}

/**
 * Hook principal do dashboard.
 *
 * - cache de 2 minutos (staleTime)
 * - auto-refresh a cada 5 minutos (refetchInterval)
 * - refetch ao focar a janela
 */
export function useDashboard(filters: DashboardFilters): UseDashboardResult {
    const query = useQuery({
        queryKey: dashboardKeys.stats(filters),
        queryFn: () => fetchDashboardStats(filters),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        refetchInterval: 1000 * 60 * 5,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 1,
    })

    return {
        data: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : undefined,
    }
}
