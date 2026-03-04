import { useQuery } from '@tanstack/react-query'

import { httpGet } from '@/lib/http'
import type {
	CampaignStatsResponse,
	UseCampaignStatsReturn,
} from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATS_ENDPOINT = '/api/v1/admin/campaigns/stats'
const STATS_STALE_TIME = 60 * 1000 // 60 seconds
const STATS_POLLING_INTERVAL = 30_000 // 60 seconds
const STATS_MAX_CONSECUTIVE_ERRORS = 3

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches campaign statistics from the dedicated stats endpoint.
 *
 * Stats include counts for each campaign status: total, under_review,
 * approved, active, completed, and refused.
 *
 * Uses a 60-second `staleTime` since stats don't change frequently,
 * avoiding unnecessary refetches when navigating between views.
 *
 * @returns Stats data, loading/error states, and refetch function
 *
 * @example
 * const { data, isLoading, error, refetch } = useCampaignStats()
 *
 * if (isLoading) return <Skeleton />
 * if (data) return <StatsGrid stats={data} />
 */
export function useCampaignStats(): UseCampaignStatsReturn {
	const query = useQuery({
		queryKey: ['admin-campaigns', 'stats'],
		queryFn: () => httpGet<CampaignStatsResponse>(STATS_ENDPOINT),
		staleTime: STATS_STALE_TIME,
		refetchInterval: (query) => {
			const errorCount = query.state.errorUpdateCount
			if (errorCount >= STATS_MAX_CONSECUTIVE_ERRORS) {
				return STATS_POLLING_INTERVAL * 2
			}
			return STATS_POLLING_INTERVAL
		},
		refetchOnWindowFocus: true,
	})

	return {
		data: query.data,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	}
}
