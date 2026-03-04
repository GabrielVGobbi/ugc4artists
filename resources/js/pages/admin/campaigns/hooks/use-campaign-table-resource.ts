import { useMemo } from 'react'

import { useResourceList, type UseResourceListReturn } from '@/hooks/resources/generic/use-resource-list'
import type { Campaign, CampaignFilterParams } from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CAMPAIGNS_ENDPOINT = '/api/v1/admin/campaigns'
const PAGE_SIZE = 20
const TABLE_POLLING_INTERVAL = 30_000 // 30 segundos

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseCampaignTableResourceProps {
	/** Filter params from useCampaignFilters hook */
	filterParams: CampaignFilterParams
	/** Enable query only when table view is active */
	enabled: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps `useResourceList` for the campaigns table view with infinite scroll.
 *
 * Uses `useInfiniteQuery` under the hood via `useResourceList`, fetching
 * campaigns from the admin API with 20 items per page. The query is only
 * enabled when the active view is `table`.
 *
 * The queryKey includes `'table'` to differentiate from the kanban query,
 * ensuring independent cache entries for each view mode.
 *
 * @param props.filterParams - Filter parameters from `useCampaignFilters`
 * @param props.enabled - Whether the query should be active (true when view === 'table')
 * @returns The same shape as `UseResourceListReturn<Campaign>`, compatible with FlexibleDataTable's `resource` prop
 *
 * @example
 * const { filterParams } = useCampaignFilters()
 * const resource = useCampaignTableResource({
 *   filterParams,
 *   enabled: activeView === 'table',
 * })
 *
 * <FlexibleDataTable mode="infinite-scroll" resource={resource} ... />
 */
export function useCampaignTableResource({
	filterParams,
	enabled,
}: UseCampaignTableResourceProps): UseResourceListReturn<Campaign> {
	// Separate search and sort from the remaining filter params
	// so useResourceList can handle them via its dedicated config props
	const {
		search,
		sort_by: sortBy,
		sort_direction: sortDirection,
		...restFilters
	} = filterParams

	// Build a stable filters object keyed on individual values
	const filters = useMemo(
		() => {
			const result: Record<string, unknown> = {}
			if (restFilters.status) result.status = restFilters.status
			if (restFilters.date_from) result.date_from = restFilters.date_from
			if (restFilters.date_to) result.date_to = restFilters.date_to
			return result
		},
		[restFilters.status, restFilters.date_from, restFilters.date_to],
	)

	return useResourceList<Campaign>({
		endpoint: CAMPAIGNS_ENDPOINT,
		queryKey: ['admin-campaigns', 'table', filterParams],
		pageSize: PAGE_SIZE,
		search,
		sortBy,
		sortDirection,
		filters,
		enabled,
		refetchInterval: enabled ? TABLE_POLLING_INTERVAL : false,
	})
}
