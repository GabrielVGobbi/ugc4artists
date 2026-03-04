import { useMemo } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { httpGet } from '@/lib/http'
import type { PaginatedResponse } from '@/lib/http'
import type {
	Campaign,
	CampaignFilterParams,
	CampaignStatusValue,
} from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CAMPAIGNS_ENDPOINT = '/api/v1/admin/campaigns'
const PER_PAGE = 15

// ─────────────────────────────────────────────────────────────────────────────
// Query Key Factory
// ─────────────────────────────────────────────────────────────────────────────

export const kanbanColumnQueryKey = (
	status: CampaignStatusValue,
	filterParams: CampaignFilterParams,
) => ['admin-campaigns', 'kanban-column', status, filterParams] as const

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseKanbanColumnProps {
	status: CampaignStatusValue
	filterParams: CampaignFilterParams
	enabled: boolean
}

export interface UseKanbanColumnReturn {
	campaigns: Campaign[]
	totalCount: number
	loadedCount: number
	hasNextPage: boolean
	isFetchingNextPage: boolean
	isLoading: boolean
	fetchNextPage: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Infinite query for a single kanban column.
 *
 * Fetches campaigns for one specific status using cursor-based pagination.
 * Each column is independent — loading more in one column does not affect others.
 *
 * @example
 * const { campaigns, totalCount, loadedCount, fetchNextPage } = useKanbanColumn({
 *   status: 'under_review',
 *   filterParams,
 *   enabled: true,
 * })
 */
export function useKanbanColumn({
	status,
	filterParams,
	enabled,
}: UseKanbanColumnProps): UseKanbanColumnReturn {
	const query = useInfiniteQuery({
		queryKey: kanbanColumnQueryKey(status, filterParams),
		queryFn: ({ pageParam }) =>
			httpGet<PaginatedResponse<Campaign>>(CAMPAIGNS_ENDPOINT, {
				params: {
					...filterParams,
					status,
					page: pageParam,
					per_page: PER_PAGE,
				},
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { current_page, last_page } = lastPage.meta
			return current_page < last_page ? current_page + 1 : undefined
		},
		enabled,
		staleTime: 30_000,
	})

	const campaigns = useMemo(
		() => query.data?.pages.flatMap((page) => page.data) ?? [],
		[query.data],
	)

	const totalCount = useMemo(
		() => query.data?.pages[0]?.meta.total ?? 0,
		[query.data],
	)

	const loadedCount = campaigns.length

	return {
		campaigns,
		totalCount,
		loadedCount,
		hasNextPage: query.hasNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		isLoading: query.isLoading,
		fetchNextPage: query.fetchNextPage,
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Optimistic update helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Removes a campaign from a column's cached pages.
 */
export function removeCampaignFromPages(
	pages: PaginatedResponse<Campaign>[],
	campaignUuid: string,
): PaginatedResponse<Campaign>[] {
	return pages.map((page) => ({
		...page,
		data: page.data.filter((c) => c.uuid !== campaignUuid),
		meta: {
			...page.meta,
			total: Math.max(0, page.meta.total - 1),
		},
	}))
}

/**
 * Inserts a campaign at the top of the first page in a column's cached pages.
 */
export function insertCampaignIntoPages(
	pages: PaginatedResponse<Campaign>[],
	campaign: Campaign,
): PaginatedResponse<Campaign>[] {
	if (pages.length === 0) {
		return [
			{
				data: [campaign],
				meta: {
					current_page: 1,
					last_page: 1,
					per_page: PER_PAGE,
					total: 1,
					from: 1,
					to: 1 as number | null,
				},
				links: { first: null, last: null, prev: null, next: null },
			},
		]
	}

	return pages.map((page, index) => {
		if (index !== 0) return page
		return {
			...page,
			data: [campaign, ...page.data],
			meta: {
				...page.meta,
				total: page.meta.total + 1,
			},
		}
	})
}

/**
 * Hook to get queryClient for optimistic updates.
 * Used in useCampaignKanban to perform silent drag-and-drop transitions.
 */
export function useKanbanQueryClient() {
	return useQueryClient()
}
