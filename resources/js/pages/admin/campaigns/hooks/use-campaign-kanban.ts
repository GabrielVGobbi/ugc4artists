import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { httpGet } from '@/lib/http'
import type { PaginatedResponse } from '@/lib/http'
import type {
	Campaign,
	CampaignFilterParams,
	CampaignKanbanColumn,
	UseCampaignKanbanReturn,
} from '@/types/campaign'
import {
	CAMPAIGN_STATUS_LABELS,
	KANBAN_COLUMN_STATUSES,
} from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CAMPAIGNS_ENDPOINT = '/api/v1/admin/campaigns'
const KANBAN_PAGE_SIZE = 200
const KANBAN_POLLING_INTERVAL = 15_000
const KANBAN_MAX_CONSECUTIVE_ERRORS = 3

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseCampaignKanbanProps {
	/** Filter params from useCampaignFilters hook */
	filterParams: CampaignFilterParams
	/** Enable query only when kanban view is active */
	enabled: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Groups a flat list of campaigns into kanban columns based on
 * `KANBAN_COLUMN_STATUSES`. Campaigns whose status is not in the
 * column list are silently excluded.
 */
const groupCampaignsByStatus = (
	campaigns: Campaign[],
): CampaignKanbanColumn[] =>
	KANBAN_COLUMN_STATUSES.map((status) => ({
		status,
		label: CAMPAIGN_STATUS_LABELS[status],
		campaigns: campaigns.filter(
			(campaign) => campaign.status.value === status,
		),
	}))

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all visible campaigns for the kanban view using a single
 * `useQuery` call with a high `per_page` value.
 *
 * Unlike the table view (which uses `useInfiniteQuery` for progressive
 * loading), the kanban needs every campaign upfront so it can group
 * them into status columns.
 *
 * The queryKey includes `'kanban'` to keep its cache independent from
 * the table view while sharing the `'admin-campaigns'` base key.
 *
 * @param props.filterParams - Filter parameters from `useCampaignFilters`
 * @param props.enabled - Whether the query should be active (true when view === 'kanban')
 * @returns Columns, flat campaigns list, loading/error states, and refetch
 *
 * @example
 * const { filterParams } = useCampaignFilters()
 * const { columns, isLoading, refetch } = useCampaignKanban({
 *   filterParams,
 *   enabled: activeView === 'kanban',
 * })
 */
export function useCampaignKanban({
	filterParams,
	enabled,
}: UseCampaignKanbanProps): UseCampaignKanbanReturn {
	const query = useQuery({
		queryKey: ['admin-campaigns', 'kanban', filterParams],
		queryFn: () =>
			httpGet<PaginatedResponse<Campaign>>(CAMPAIGNS_ENDPOINT, {
				params: {
					...filterParams,
					per_page: KANBAN_PAGE_SIZE,
				},
			}),
		enabled,
		staleTime: 30 * 1000,
		refetchInterval: (query) => {
			if (!enabled) return false
			// Pause polling during drag to prevent lag
			if (document.body.dataset.dragging === 'true') return false
			const errorCount = query.state.errorUpdateCount
			if (errorCount >= KANBAN_MAX_CONSECUTIVE_ERRORS) {
				return KANBAN_POLLING_INTERVAL * 2
			}
			return KANBAN_POLLING_INTERVAL
		},
		refetchOnWindowFocus: true,
	})

	const campaigns = useMemo(
		() => query.data?.data ?? [],
		[query.data],
	)

	const columns = useMemo(
		() => groupCampaignsByStatus(campaigns),
		[campaigns],
	)

	return {
		columns,
		campaigns,
		isLoading: query.isLoading,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	}
}
