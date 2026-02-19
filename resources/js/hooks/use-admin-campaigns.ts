import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPatch, apiPost } from '@/lib/api'
import type { Campaign, CampaignStatus } from '@/types/campaign'

export interface AdminCreator {
    id: number
    uuid: string
    name: string
    email: string
    avatar?: string | null
}

interface AdminCampaignsResponse {
    data: Campaign[]
}

interface CampaignActionResponse {
    message: string
    campaign: Campaign
}

const ADMIN_CAMPAIGNS_KEY = ['admin-campaigns']
const ADMIN_CREATORS_KEY = ['admin-campaigns', 'creators']

export function useAdminCampaigns(options?: { status?: CampaignStatus[]; search?: string; enabled?: boolean }) {
    const status = options?.status ?? []
    const search = options?.search?.trim() ?? ''

    return useQuery({
        queryKey: [...ADMIN_CAMPAIGNS_KEY, { status, search }],
        queryFn: async () => {
            const statusParam = status.length > 0 ? status.join(',') : undefined

            return apiGet<AdminCampaignsResponse>('/api/v1/admin/campaigns', {
                per_page: 100,
                ...(statusParam ? { status: statusParam } : {}),
                ...(search ? { search } : {}),
            })
        },
        enabled: options?.enabled ?? true,
    })
}

export function useCreatorOptions(search: string, enabled = true) {
    const safeSearch = search.trim()

    return useQuery({
        queryKey: [...ADMIN_CREATORS_KEY, safeSearch],
        queryFn: async () => {
            return apiGet<{ data: AdminCreator[] }>('/api/v1/admin/campaigns/creators', {
                search: safeSearch,
                limit: 25,
            })
        },
        staleTime: 1000 * 60 * 5,
        enabled,
    })
}

export function useAdminCampaignMutations() {
    const queryClient = useQueryClient()

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ADMIN_CAMPAIGNS_KEY })

    const approveMutation = useMutation({
        mutationFn: async ({ campaignId, creatorIds }: { campaignId: number; creatorIds: number[] }) => {
            return apiPost<CampaignActionResponse>(`/api/v1/admin/campaigns/${campaignId}/approve`, {
                creator_ids: creatorIds,
            })
        },
        onSuccess: invalidate,
    })

    const refuseMutation = useMutation({
        mutationFn: async ({ campaignId, reason }: { campaignId: number; reason: string }) => {
            return apiPost<CampaignActionResponse>(`/api/v1/admin/campaigns/${campaignId}/refuse`, {
                reason_for_refusal: reason,
            })
        },
        onSuccess: invalidate,
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({
            campaignId,
            status,
            creatorIds,
            reasonForRefusal,
        }: {
            campaignId: number
            status: CampaignStatus
            creatorIds?: number[]
            reasonForRefusal?: string
        }) => {
            return apiPatch<CampaignActionResponse>(`/api/v1/admin/campaigns/${campaignId}/status`, {
                status,
                ...(creatorIds && creatorIds.length > 0 ? { creator_ids: creatorIds } : {}),
                ...(reasonForRefusal ? { reason_for_refusal: reasonForRefusal } : {}),
            })
        },
    })

    return {
        approveCampaign: approveMutation,
        refuseCampaign: refuseMutation,
        updateCampaignStatus: updateStatusMutation,
    }
}
