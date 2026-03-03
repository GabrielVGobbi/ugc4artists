import {
	useMutation,
	useQueryClient,
	type InfiniteData,
} from '@tanstack/react-query'

import { httpPost, httpPatch } from '@/lib/http'
import type { PaginatedResponse } from '@/lib/http'
import type {
	ApproveCampaignInput,
	Campaign,
	CampaignMutationResponse,
	CampaignStatusValue,
	RefuseCampaignInput,
	UpdateCampaignStatusInput,
	UseCampaignMutationsReturn,
} from '@/types/campaign'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_CAMPAIGNS_KEY = ['admin-campaigns']
const STATS_KEY = ['admin-campaigns', 'stats']

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Cache structure for infinite query pages (table view) */
type InfiniteCampaignsData = InfiniteData<
	PaginatedResponse<Campaign>,
	number
>

/** Cache structure for regular query (kanban view) */
type PaginatedCampaignsData = PaginatedResponse<Campaign>

/** Snapshot of all campaign queries for rollback */
interface CacheSnapshot {
	queries: Array<[readonly unknown[], unknown]>
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Type guard: checks whether a cache entry is an infinite query
 * (table view) by looking for the `pages` array.
 */
const isInfiniteData = (
	data: unknown,
): data is InfiniteCampaignsData =>
	typeof data === 'object' &&
	data !== null &&
	'pages' in data &&
	Array.isArray((data as InfiniteCampaignsData).pages)

/**
 * Type guard: checks whether a cache entry is a paginated response
 * (kanban view) by looking for the `data` array.
 */
const isPaginatedData = (
	data: unknown,
): data is PaginatedCampaignsData =>
	typeof data === 'object' &&
	data !== null &&
	'data' in data &&
	Array.isArray((data as PaginatedCampaignsData).data) &&
	!('pages' in data)

/**
 * Replaces a campaign in an infinite query cache entry (table view).
 */
const updateCampaignInInfiniteData = (
	old: InfiniteCampaignsData,
	updatedCampaign: Campaign,
): InfiniteCampaignsData => ({
	...old,
	pages: old.pages.map((page) => ({
		...page,
		data: page.data.map((c) =>
			c.uuid === updatedCampaign.uuid ? updatedCampaign : c,
		),
	})),
})

/**
 * Replaces a campaign in a paginated query cache entry (kanban view).
 */
const updateCampaignInPaginatedData = (
	old: PaginatedCampaignsData,
	updatedCampaign: Campaign,
): PaginatedCampaignsData => ({
	...old,
	data: old.data.map((c) =>
		c.uuid === updatedCampaign.uuid ? updatedCampaign : c,
	),
})

/**
 * Applies an optimistic status change to a single campaign
 * across an infinite query cache entry (table view).
 */
const optimisticStatusInInfiniteData = (
	old: InfiniteCampaignsData,
	uuid: string,
	status: CampaignStatusValue,
): InfiniteCampaignsData => ({
	...old,
	pages: old.pages.map((page) => ({
		...page,
		data: page.data.map((c) =>
			c.uuid === uuid
				? { ...c, status: { ...c.status, value: status } }
				: c,
		),
	})),
})

/**
 * Applies an optimistic status change to a single campaign
 * across a paginated query cache entry (kanban view).
 */
const optimisticStatusInPaginatedData = (
	old: PaginatedCampaignsData,
	uuid: string,
	status: CampaignStatusValue,
): PaginatedCampaignsData => ({
	...old,
	data: old.data.map((c) =>
		c.uuid === uuid
			? { ...c, status: { ...c.status, value: status } }
			: c,
	),
})

/**
 * Updates a single campaign across all admin-campaigns query caches.
 * Handles both infinite (table) and regular (kanban) cache structures.
 */
const updateCampaignInAllCaches = (
	queryClient: ReturnType<typeof useQueryClient>,
	updatedCampaign: Campaign,
): void => {
	const allQueries = queryClient.getQueriesData({
		queryKey: ADMIN_CAMPAIGNS_KEY,
	})

	allQueries.forEach(([queryKey, data]) => {
		if (isInfiniteData(data)) {
			queryClient.setQueryData(
				queryKey,
				updateCampaignInInfiniteData(data, updatedCampaign),
			)
		} else if (isPaginatedData(data)) {
			queryClient.setQueryData(
				queryKey,
				updateCampaignInPaginatedData(data, updatedCampaign),
			)
		}
	})
}

/**
 * Takes a snapshot of all admin-campaigns query caches for rollback.
 */
const snapshotAllCaches = (
	queryClient: ReturnType<typeof useQueryClient>,
): CacheSnapshot => {
	const queries = queryClient.getQueriesData({
		queryKey: ADMIN_CAMPAIGNS_KEY,
	})

	return {
		queries: queries.map(
			([key, data]) => [key, structuredClone(data)],
		),
	}
}

/**
 * Restores all admin-campaigns query caches from a snapshot.
 */
const restoreCacheSnapshot = (
	queryClient: ReturnType<typeof useQueryClient>,
	snapshot: CacheSnapshot,
): void => {
	snapshot.queries.forEach(([key, data]) => {
		queryClient.setQueryData(key, data)
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Provides mutation functions for campaign moderation actions:
 * approve, refuse, and updateStatus (drag-and-drop).
 *
 * Cache update strategy:
 * - `approve` / `refuse`: On success, granularly update only the
 *   affected campaign in all matching caches, then invalidate stats.
 * - `updateStatus`: Optimistic update with snapshot and rollback.
 *   On mutate the campaign status is updated immediately in the UI.
 *   On error the cache is rolled back to the snapshot.
 *   On success the cache is updated with the actual server response.
 *
 * All mutations invalidate the stats query on success so counters
 * stay accurate.
 *
 * @returns Object with `approve`, `refuse`, `updateStatus` and `isPending`
 *
 * @example
 * const { approve, refuse, updateStatus, isPending } =
 *   useCampaignMutations()
 *
 * await approve({ campaignUuid: 'abc-123', creatorIds: [1, 2] })
 * await refuse({ campaignUuid: 'abc-123', reason: 'Inadequado' })
 * await updateStatus({ campaignUuid: 'abc-123', status: 'in_progress' })
 */
export function useCampaignMutations(): UseCampaignMutationsReturn {
	const queryClient = useQueryClient()

	const invalidateStats = () => {
		queryClient.invalidateQueries({ queryKey: STATS_KEY })
	}

	// ── Approve ──────────────────────────────────────────────────────

	const approveMutation = useMutation({
		mutationFn: ({
			campaignUuid,
			creatorIds,
		}: ApproveCampaignInput) =>
			httpPost<CampaignMutationResponse>(
				`/api/v1/admin/campaigns/${campaignUuid}/approve`,
				{ creator_ids: creatorIds },
			),
		onSuccess: (response) => {
			updateCampaignInAllCaches(queryClient, response.campaign)
			invalidateStats()
		},
	})

	// ── Refuse ───────────────────────────────────────────────────────

	const refuseMutation = useMutation({
		mutationFn: ({
			campaignUuid,
			reason,
		}: RefuseCampaignInput) =>
			httpPost<CampaignMutationResponse>(
				`/api/v1/admin/campaigns/${campaignUuid}/refuse`,
				{ reason_for_refusal: reason },
			),
		onSuccess: (response) => {
			updateCampaignInAllCaches(queryClient, response.campaign)
			invalidateStats()
		},
	})

	// ── Update Status (optimistic) ───────────────────────────────────

	const updateStatusMutation = useMutation({
		mutationFn: ({
			campaignUuid,
			status,
			creatorIds,
			reasonForRefusal,
		}: UpdateCampaignStatusInput) =>
			httpPatch<CampaignMutationResponse>(
				`/api/v1/admin/campaigns/${campaignUuid}/status`,
				{
					status,
					...(creatorIds && creatorIds.length > 0
						? { creator_ids: creatorIds }
						: {}),
					...(reasonForRefusal
						? { reason_for_refusal: reasonForRefusal }
						: {}),
				},
			),

		onMutate: async (input) => {
			// Cancel in-flight queries to avoid overwriting optimistic data
			await queryClient.cancelQueries({
				queryKey: ADMIN_CAMPAIGNS_KEY,
			})

			// Snapshot current cache for rollback
			const snapshot = snapshotAllCaches(queryClient)

			// Optimistically update the campaign status in all caches
			const allQueries = queryClient.getQueriesData({
				queryKey: ADMIN_CAMPAIGNS_KEY,
			})

			allQueries.forEach(([queryKey, data]) => {
				if (isInfiniteData(data)) {
					queryClient.setQueryData(
						queryKey,
						optimisticStatusInInfiniteData(
							data,
							input.campaignUuid,
							input.status,
						),
					)
				} else if (isPaginatedData(data)) {
					queryClient.setQueryData(
						queryKey,
						optimisticStatusInPaginatedData(
							data,
							input.campaignUuid,
							input.status,
						),
					)
				}
			})

			return { snapshot }
		},

		onError: (_error, _input, context) => {
			if (context?.snapshot) {
				restoreCacheSnapshot(queryClient, context.snapshot)
			}
		},

		onSuccess: (response) => {
			// Replace optimistic data with actual server response
			updateCampaignInAllCaches(queryClient, response.campaign)
			invalidateStats()
		},
	})

	// ── Public API ───────────────────────────────────────────────────

	const approve = async (
		input: ApproveCampaignInput,
	): Promise<void> => {
		await approveMutation.mutateAsync(input)
	}

	const refuse = async (
		input: RefuseCampaignInput,
	): Promise<void> => {
		await refuseMutation.mutateAsync(input)
	}

	const updateStatus = async (
		input: UpdateCampaignStatusInput,
	): Promise<void> => {
		await updateStatusMutation.mutateAsync(input)
	}

	const isPending =
		approveMutation.isPending ||
		refuseMutation.isPending ||
		updateStatusMutation.isPending

	return {
		approve,
		refuse,
		updateStatus,
		isPending,
	}
}
