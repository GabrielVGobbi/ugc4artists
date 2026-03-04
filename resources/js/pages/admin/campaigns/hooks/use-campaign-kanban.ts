import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { httpPatch } from '@/lib/http'
import type { PaginatedResponse } from '@/lib/http'
import type {
	Campaign,
	CampaignFilterParams,
	CampaignMutationResponse,
	CampaignStatusValue,
} from '@/types/campaign'
import { CAMPAIGN_STATUS_LABELS } from '@/types/campaign'

import {
	kanbanColumnQueryKey,
	insertCampaignIntoPages,
	removeCampaignFromPages,
} from './use-kanban-column'
import { useKanbanColumnsConfig } from './use-kanban-columns-config'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CAMPAIGNS_ENDPOINT = '/api/v1/admin/campaigns'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseCampaignKanbanProps {
	filterParams: CampaignFilterParams
}

export interface UseCampaignKanbanReturn {
	columnsConfig: ReturnType<typeof useKanbanColumnsConfig>
	optimisticMove: (
		campaignUuid: string,
		fromStatus: CampaignStatusValue,
		toStatus: CampaignStatusValue,
		creatorIds?: number[],
	) => Promise<void>
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Orchestrates the kanban board configuration and optimistic drag transitions.
 *
 * Per-column data fetching is handled by `useKanbanColumn` inside each
 * `KanbanColumn` component — this avoids calling hooks inside `.map()`,
 * which would violate React's rules of hooks.
 *
 * This hook is responsible for:
 * - Column visibility/collapse state (via `useKanbanColumnsConfig`)
 * - Optimistic cache mutations for drag-and-drop status transitions
 *
 * @param props.filterParams - Filter params from useCampaignFilters
 */
export function useCampaignKanban({
	filterParams,
}: UseCampaignKanbanProps): UseCampaignKanbanReturn {
	const queryClient = useQueryClient()
	const columnsConfig = useKanbanColumnsConfig()

	// ── Optimistic drag-and-drop ──────────────────────────────────────

	const optimisticMove = useCallback(
		async (
			campaignUuid: string,
			fromStatus: CampaignStatusValue,
			toStatus: CampaignStatusValue,
			creatorIds?: number[],
		) => {
			const fromKey = kanbanColumnQueryKey(fromStatus, filterParams)
			const toKey = kanbanColumnQueryKey(toStatus, filterParams)

			type Pages = { pages: PaginatedResponse<Campaign>[]; pageParams: unknown[] }

			// Snapshot both columns for rollback
			const snapshotFrom = queryClient.getQueryData<Pages>(fromKey)
			const snapshotTo = queryClient.getQueryData<Pages>(toKey)

			// Find the campaign in the from column cache
			const campaign = snapshotFrom?.pages
				.flatMap((p) => p.data)
				.find((c) => c.uuid === campaignUuid)

			if (!campaign) return

			// Build updated campaign with new status
			const updatedCampaign: Campaign = {
				...campaign,
				status: {
					...campaign.status,
					value: toStatus,
					label: CAMPAIGN_STATUS_LABELS[toStatus],
				},
			}

			// Optimistic update — remove from source, insert into destination
			if (snapshotFrom) {
				queryClient.setQueryData<Pages>(fromKey, {
					...snapshotFrom,
					pages: removeCampaignFromPages(snapshotFrom.pages, campaignUuid),
				})
			}

			if (snapshotTo) {
				queryClient.setQueryData<Pages>(toKey, {
					...snapshotTo,
					pages: insertCampaignIntoPages(snapshotTo.pages, updatedCampaign),
				})
			} else {
				// Destination column not yet loaded — initialise with this one campaign
				queryClient.setQueryData<Pages>(toKey, {
					pages: insertCampaignIntoPages([], updatedCampaign),
					pageParams: [1],
				})
			}

			// Fire API silently in background
			try {
				await httpPatch<CampaignMutationResponse>(
					`${CAMPAIGNS_ENDPOINT}/${campaignUuid}/status`,
					{
						status: toStatus,
						...(creatorIds && creatorIds.length > 0
							? { creator_ids: creatorIds }
							: {}),
					},
				)
			} catch (error) {
				// Rollback both columns on failure
				if (snapshotFrom) queryClient.setQueryData(fromKey, snapshotFrom)
				if (snapshotTo) queryClient.setQueryData(toKey, snapshotTo)

				const message =
					error instanceof Error
						? error.message
						: 'Não foi possível atualizar o status da campanha.'
				toast.error(message)
				throw error
			}
		},
		[queryClient, filterParams],
	)

	return {
		columnsConfig,
		optimisticMove,
	}
}
