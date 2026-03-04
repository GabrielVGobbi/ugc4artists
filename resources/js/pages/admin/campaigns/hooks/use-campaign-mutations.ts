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
 * Uses shallow copy instead of structuredClone for better performance.
 */
const snapshotAllCaches = (
	queryClient: ReturnType<typeof useQueryClient>,
): CacheSnapshot => {
	const queries = queryClient.getQueriesData({
		queryKey: ADMIN_CAMPAIGNS_KEY,
	})

	return {
		queries: queries.map(([key, data]) => {
			// Shallow copy is enough for rollback - much faster than structuredClone
			if (isInfiniteData(data)) {
				return [
					key,
					{
						...data,
						pages: data.pages.map((page) => ({
							...page,
							data: [...page.data],
						})),
					},
				]
			}
			if (isPaginatedData(data)) {
				return [key, { ...data, data: [...data.data] }]
			}
			return [key, data]
		}),
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

	const invalidateStats = async () => {
		await queryClient.invalidateQueries({
			queryKey: STATS_KEY,
			refetchType: 'all',
		})
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
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: ADMIN_CAMPAIGNS_KEY,
			})
		},
		onSuccess: async (response) => {
			updateCampaignInAllCaches(queryClient, response.campaign)
			await invalidateStats()
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
		onMutate: async () => {
			await queryClient.cancelQueries({
				queryKey: ADMIN_CAMPAIGNS_KEY,
			})
		},
		onSuccess: async (response) => {
			updateCampaignInAllCaches(queryClient, response.campaign)
			await invalidateStats()
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

			// Also cancel stats queries for optimistic update
			await queryClient.cancelQueries({
				queryKey: STATS_KEY,
			})

			// Snapshot and update in a single iteration (performance optimization)
			const allQueries = queryClient.getQueriesData({
				queryKey: ADMIN_CAMPAIGNS_KEY,
			})

			const snapshot: CacheSnapshot = { queries: [] }

			// Find the campaign being updated to get its current status
			let previousStatus: CampaignStatusValue | null = null

			allQueries.forEach(([queryKey, data]) => {
				// Save snapshot (shallow copy)
				if (isInfiniteData(data)) {
					// Find campaign to get previous status
					if (!previousStatus) {
						for (const page of data.pages) {
							const campaign = page.data.find(
								(c) => c.uuid === input.campaignUuid,
							)
							if (campaign) {
								previousStatus = campaign.status.value
								break
							}
						}
					}

					snapshot.queries.push([
						queryKey,
						{
							...data,
							pages: data.pages.map((page) => ({
								...page,
								data: [...page.data],
							})),
						},
					])
					// Apply optimistic update
					queryClient.setQueryData(
						queryKey,
						optimisticStatusInInfiniteData(
							data,
							input.campaignUuid,
							input.status,
						),
					)
				} else if (isPaginatedData(data)) {
					// Find campaign to get previous status
					if (!previousStatus) {
						const campaign = data.data.find(
							(c) => c.uuid === input.campaignUuid,
						)
						if (campaign) {
							previousStatus = campaign.status.value
						}
					}

					snapshot.queries.push([
						queryKey,
						{ ...data, data: [...data.data] },
					])
					// Apply optimistic update
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

			// Optimistically update stats if we found the previous status
			if (previousStatus && previousStatus !== input.status) {
				const currentStats = queryClient.getQueryData(STATS_KEY)
				if (currentStats && typeof currentStats === 'object') {
					const stats = currentStats as Record<string, number>
					const updatedStats = { ...stats }

					/**
					 * Map campaign status values to stats response keys.
					 * Note: 'sent_to_creators' and 'in_progress' are aggregated
					 * into a single 'active' field in the backend.
					 */
					const mapStatusToStatsKey = (
						status: CampaignStatusValue,
					): keyof typeof updatedStats | null => {
						if (
							status === 'sent_to_creators' ||
							status === 'in_progress'
						) {
							return 'active'
						}
						if (status === 'refused') return 'refused'
						if (status === 'under_review') return 'under_review'
						if (status === 'approved') return 'approved'
						if (status === 'completed') return 'completed'
						return null // draft, awaiting_payment, cancelled not in stats
					}

					const prevKey = mapStatusToStatsKey(previousStatus)
					const nextKey = mapStatusToStatsKey(input.status)

					// Decrement previous status count
					if (prevKey && updatedStats[prevKey] !== undefined) {
						updatedStats[prevKey] = Math.max(
							0,
							updatedStats[prevKey] - 1,
						)
					}

					// Increment new status count
					if (nextKey && updatedStats[nextKey] !== undefined) {
						updatedStats[nextKey] =
							(updatedStats[nextKey] || 0) + 1
					}

					queryClient.setQueryData(STATS_KEY, updatedStats)
				}
			}

			return { snapshot }
		},

		onError: (_error, _input, context) => {
			if (context?.snapshot) {
				restoreCacheSnapshot(queryClient, context.snapshot)
			}
			// Force immediate refetch to ensure data consistency after failed optimistic mutation
			queryClient.invalidateQueries({ queryKey: ADMIN_CAMPAIGNS_KEY })
			queryClient.invalidateQueries({ queryKey: STATS_KEY })
		},

		onSuccess: async (response) => {
			// Replace optimistic data with actual server response
			updateCampaignInAllCaches(queryClient, response.campaign)
			await invalidateStats()
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
