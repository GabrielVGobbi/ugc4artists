import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
    InfiniteData,
} from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import type { PaginatedResponse } from '@/types'
import type { Campaign, CampaignStats, CampaignFormData, CampaignStatus } from '@/types/campaign'
import campaignsNamespace from '@/routes/api/campaigns'

type CampaignsInfiniteData = InfiniteData<PaginatedResponse<Campaign>, number>

const PER_PAGE = 12
const CAMPAIGNS_KEY = ['campaigns']
const STATS_KEY = ['campaigns', 'stats']

export interface UseCampaignsOptions {
    enabled?: boolean
    status?: CampaignStatus | CampaignStatus[]
    search?: string
}

export function useCampaigns(options?: UseCampaignsOptions) {
    const queryClient = useQueryClient()
    const enabled = options?.enabled ?? true
    const status = options?.status
    const search = options?.search

    // Fetch campaigns with infinite scroll
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: [...CAMPAIGNS_KEY, { status, search }],
        queryFn: async ({ pageParam = 1 }) => {
            const url = campaignsNamespace.index.url({
                query: {
                    page: pageParam,
                    per_page: PER_PAGE,
                    ...(status && { status: Array.isArray(status) ? status.join(',') : status }),
                    ...(search && { search }),
                },
            })
            return apiGet<PaginatedResponse<Campaign>>(url)
        },
        getNextPageParam: (lastPage) => {
            const { current_page, last_page } = lastPage.meta
            return current_page < last_page ? current_page + 1 : undefined
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 2, // 2 minutes
        enabled,
    })

    // Flatten campaigns from all pages
    const campaigns = data?.pages.flatMap((page) => page.data) ?? []

    return {
        campaigns,
        isLoading,
        isFetchingMore: isFetchingNextPage,
        hasMore: !!hasNextPage,
        error: error?.message ?? null,
        loadMore: () => hasNextPage && fetchNextPage(),
        refetch,
        total: data?.pages[0]?.meta.total ?? 0,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCampaignStats() {
    return useQuery({
        queryKey: STATS_KEY,
        queryFn: async () => {
            const url = campaignsNamespace.stats.url()
            return apiGet<CampaignStats>(url)
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Single Campaign Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCampaign(key: string, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [...CAMPAIGNS_KEY, key],
        queryFn: async () => {
            const url = campaignsNamespace.show.url(key)
            const response = await apiGet<{ campaign: Campaign }>(url)
            return response.campaign
        },
        staleTime: 1000 * 60 * 2,
        enabled: options?.enabled ?? !!key,
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

export function useCampaignMutations() {
    const queryClient = useQueryClient()

    const invalidateCampaigns = () => {
        queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
        queryClient.invalidateQueries({ queryKey: STATS_KEY })
    }

    // Create campaign
    const createMutation = useMutation({
        mutationFn: async (data: CampaignFormData) => {
            const url = campaignsNamespace.store.url()

            // Handle file upload with FormData
            if (data.cover_image instanceof File) {
                const formData = new FormData()
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        if (value instanceof File) {
                            formData.append(key, value)
                        } else if (Array.isArray(value)) {
                            value.forEach((v, i) => formData.append(`${key}[${i}]`, String(v)))
                        } else {
                            formData.append(key, String(value))
                        }
                    }
                })
                return apiPost<{ message: string; campaign: Campaign }>(url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
            }

            return apiPost<{ message: string; campaign: Campaign }>(url, data)
        },
        onSuccess: () => {
            invalidateCampaigns()
        },
    })

    // Create draft campaign (only name)
    const createDraftMutation = useMutation({
        mutationFn: async (name: string) => {
            const url = campaignsNamespace.store.url()
            return apiPost<{ message: string; campaign: Campaign }>(url, { name })
        },
        onSuccess: () => {
            invalidateCampaigns()
        },
    })

    // Update campaign
    const updateMutation = useMutation({
        mutationFn: async ({ key, data }: { key: string; data: Partial<CampaignFormData> }) => {
            const url = campaignsNamespace.update.url(key)

            // Handle file upload with FormData
            if (data.cover_image instanceof File) {
                const formData = new FormData()
                formData.append('_method', 'PUT')
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        if (value instanceof File) {
                            formData.append(key, value)
                        } else if (Array.isArray(value)) {
                            value.forEach((v, i) => formData.append(`${key}[${i}]`, String(v)))
                        } else {
                            formData.append(key, String(value))
                        }
                    }
                })
                return apiPost<{ message: string; campaign: Campaign }>(url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
            }

            return apiPut<{ message: string; campaign: Campaign }>(url, data)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, variables.key] })
            invalidateCampaigns()
        },
    })

    // Silent update for autosave (doesn't invalidate list)
    const silentUpdateMutation = useMutation({
        mutationFn: async ({ key, data }: { key: string; data: Record<string, unknown> }) => {
            const url = campaignsNamespace.update.url(key)

            // Handle file upload with FormData
            if (data.cover_image instanceof File) {
                const formData = new FormData()
                formData.append('_method', 'PUT')
                Object.entries(data).forEach(([fieldKey, value]) => {
                    if (value !== undefined && value !== null) {
                        if (value instanceof File) {
                            formData.append(fieldKey, value)
                        } else if (Array.isArray(value)) {
                            value.forEach((v, i) => formData.append(`${fieldKey}[${i}]`, String(v)))
                        } else {
                            formData.append(fieldKey, String(value))
                        }
                    }
                })
                return apiPost<{ message: string; campaign: Campaign }>(url, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
            }

            return apiPut<{ message: string; campaign: Campaign }>(url, data)
        },
        // No invalidation for autosave - just update local cache
        onSuccess: (response, variables) => {
            queryClient.setQueryData([...CAMPAIGNS_KEY, variables.key], response.campaign)
        },
    })

    // Delete campaign
    const deleteMutation = useMutation({
        mutationFn: async (key: string) => {
            const url = campaignsNamespace.destroy.url(key)
            return apiDelete<{ message: string }>(url)
        },
        onMutate: async (key) => {
            await queryClient.cancelQueries({ queryKey: CAMPAIGNS_KEY })

            // Optimistic update - remove from all campaign lists
            const allQueries = queryClient.getQueriesData<CampaignsInfiniteData>({ queryKey: CAMPAIGNS_KEY })
            allQueries.forEach(([queryKey, data]) => {
                if (!data?.pages) return

                queryClient.setQueryData<CampaignsInfiniteData>(queryKey, (old) => {
                    if (!old?.pages) return old
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.filter((c) => c.uuid !== key && String(c.id) !== key),
                        })),
                    }
                })
            })

            return { allQueries }
        },
        onError: (_, __, context) => {
            context?.allQueries?.forEach(([queryKey, data]) => {
                if (data) {
                    queryClient.setQueryData(queryKey, data)
                }
            })
        },
        onSettled: () => {
            invalidateCampaigns()
        },
    })

    // Submit campaign for review
    const submitMutation = useMutation({
        mutationFn: async (key: string) => {
            const url = campaignsNamespace.submit.url(key)
            return apiPost<{ message: string; campaign: Campaign }>(url)
        },
        onSuccess: (_, key) => {
            queryClient.invalidateQueries({ queryKey: [...CAMPAIGNS_KEY, key] })
            invalidateCampaigns()
        },
    })

    // Duplicate campaign
    const duplicateMutation = useMutation({
        mutationFn: async (key: string) => {
            const url = campaignsNamespace.duplicate.url(key)
            return apiPost<{ message: string; campaign: Campaign }>(url)
        },
        onSuccess: () => {
            invalidateCampaigns()
        },
    })

    return {
        createCampaign: createMutation.mutateAsync,
        createDraftCampaign: createDraftMutation.mutateAsync,
        updateCampaign: updateMutation.mutateAsync,
        updateCampaignSilent: silentUpdateMutation.mutateAsync,
        deleteCampaign: deleteMutation.mutateAsync,
        submitCampaign: submitMutation.mutateAsync,
        duplicateCampaign: duplicateMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isCreatingDraft: createDraftMutation.isPending,
        isUpdating: updateMutation.isPending,
        isSilentUpdating: silentUpdateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isSubmitting: submitMutation.isPending,
        isDuplicating: duplicateMutation.isPending,
    }
}
