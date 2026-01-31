import { useInfiniteQuery, useMutation, useQuery, useQueryClient, InfiniteData } from '@tanstack/react-query'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import type { PaginatedResponse } from '@/types'
import type { Notification, NotificationUnreadCount } from '@/types/notification'
import notificationsNamespace from '@/routes/api/notifications'

type NotificationsInfiniteData = InfiniteData<PaginatedResponse<Notification>, number>

const PER_PAGE = 15
const NOTIFICATIONS_KEY = ['notifications']
const UNREAD_COUNT_KEY = ['notifications', 'unread-count']

export function useNotifications(options?: { enabled?: boolean; unreadOnly?: boolean }) {
    const queryClient = useQueryClient()
    const enabled = options?.enabled ?? true
    const unreadOnly = options?.unreadOnly ?? false

    // Fetch notifications with infinite scroll
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: [...NOTIFICATIONS_KEY, { unreadOnly }],
        queryFn: async ({ pageParam = 1 }) => {
            const url = notificationsNamespace.index.url({
                query: {
                    page: pageParam,
                    per_page: PER_PAGE,
                    ...(unreadOnly && { unread_only: 1 })
                }
            })
            return apiGet<PaginatedResponse<Notification>>(url)
        },
        getNextPageParam: (lastPage) => {
            const { current_page, last_page } = lastPage.meta
            return current_page < last_page ? current_page + 1 : undefined
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 2,
        enabled,
    })

    // Fetch unread count - sempre busca para mostrar o badge
    const { data: unreadData, refetch: refetchUnreadCount } = useQuery({
        queryKey: UNREAD_COUNT_KEY,
        queryFn: async () => {
            const url = notificationsNamespace.unreadCount.url()
            return apiGet<NotificationUnreadCount>(url)
        },
        staleTime: 1000 * 60 * 2,
        retry: 1,
        retryDelay: 1000,
    })

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (id: number) => {
            const url = notificationsNamespace.markRead.url(id)
            return apiPost(url)
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY })

            // Update all notification list caches (not unread-count)
            const allQueries = queryClient.getQueriesData<NotificationsInfiniteData>({ queryKey: NOTIFICATIONS_KEY })
            allQueries.forEach(([queryKey, data]) => {
                // Skip if not an infinite query (e.g., unread-count)
                if (!data?.pages) return

                queryClient.setQueryData<NotificationsInfiniteData>(queryKey, (old) => {
                    if (!old?.pages) return old
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.map((n) =>
                                n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
                            ),
                        })),
                    }
                })
            })

            queryClient.setQueryData(UNREAD_COUNT_KEY, (old: NotificationUnreadCount | undefined) =>
                old ? { count: Math.max(0, old.count - 1) } : old
            )
        },
        onError: (error) => {
            console.error('[markAsRead] Error:', error)
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
            queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
        },
    })

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            const url = notificationsNamespace.markAllRead.url()
            return apiPost(url)
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY })

            // Update all notification list caches (not unread-count)
            const allQueries = queryClient.getQueriesData<NotificationsInfiniteData>({ queryKey: NOTIFICATIONS_KEY })
            allQueries.forEach(([queryKey, data]) => {
                // Skip if not an infinite query
                if (!data?.pages) return

                queryClient.setQueryData<NotificationsInfiniteData>(queryKey, (old) => {
                    if (!old?.pages) return old
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.map((n) => ({
                                ...n,
                                is_read: true,
                                read_at: new Date().toISOString(),
                            })),
                        })),
                    }
                })
            })

            queryClient.setQueryData(UNREAD_COUNT_KEY, { count: 0 })
        },
        onError: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
            queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
        },
    })

    // Delete notification mutation
    const deleteNotificationMutation = useMutation({
        mutationFn: async (id: number) => {
            const url = notificationsNamespace.destroy.url(id)
            return apiDelete(url)
        },
        onMutate: async (id) => {
            // Cancel all notification queries
            await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY })

            // Get all notification query caches
            const allQueries = queryClient.getQueriesData<NotificationsInfiniteData>({ queryKey: NOTIFICATIONS_KEY })
            let wasUnread = false

            // Update all notification list caches (not unread-count)
            allQueries.forEach(([queryKey, data]) => {
                // Skip if not an infinite query
                if (!data?.pages) return

                queryClient.setQueryData<NotificationsInfiniteData>(queryKey, (old) => {
                    if (!old?.pages) return old
                    return {
                        ...old,
                        pages: old.pages.map((page) => {
                            const notification = page.data.find((n) => n.id === id)
                            if (notification && !notification.is_read) wasUnread = true
                            return {
                                ...page,
                                data: page.data.filter((n) => n.id !== id),
                            }
                        }),
                    }
                })
            })

            if (wasUnread) {
                queryClient.setQueryData(UNREAD_COUNT_KEY, (old: NotificationUnreadCount | undefined) =>
                    old ? { count: Math.max(0, old.count - 1) } : old
                )
            }

            return { allQueries }
        },
        onError: (_, __, context) => {
            // Restore all caches on error
            context?.allQueries?.forEach(([queryKey, data]) => {
                if (data) {
                    queryClient.setQueryData(queryKey, data)
                }
            })
            queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
        },
    })

    // Clear read notifications mutation
    const clearReadMutation = useMutation({
        mutationFn: async () => {
            const url = notificationsNamespace.clearRead.url()
            return apiDelete(url)
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY })

            const previousData = queryClient.getQueryData(NOTIFICATIONS_KEY)

            queryClient.setQueryData<NotificationsInfiniteData>(NOTIFICATIONS_KEY, (old) => {
                if (!old) return old
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        data: page.data.filter((n) => !n.is_read),
                    })),
                }
            })

            return { previousData }
        },
        onError: (_, __, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(NOTIFICATIONS_KEY, context.previousData)
            }
        },
    })

    // Flatten notifications from all pages
    const notifications = data?.pages.flatMap(page => page.data) ?? []

    return {
        notifications,
        unreadCount: unreadData?.count ?? 0,
        isLoading,
        isFetchingMore: isFetchingNextPage,
        hasMore: !!hasNextPage,
        error: error?.message ?? null,
        loadMore: () => hasNextPage && fetchNextPage(),
        markAsRead: (id: number) => markAsReadMutation.mutateAsync(id),
        markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
        deleteNotification: (id: number) => deleteNotificationMutation.mutateAsync(id),
        clearRead: () => clearReadMutation.mutateAsync(),
        refetch,
        refetchUnreadCount,
    }
}
