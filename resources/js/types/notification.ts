export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'campaign' | 'payment' | 'system'

export interface Notification {
    id: number
    type: NotificationType
    title: string
    message: string
    icon: string | null
    action_url: string | null
    action_label: string | null
    data: Record<string, unknown> | null
    is_read: boolean
    read_at: string | null
    created_at: string
    time_ago: string
}

export interface NotificationUnreadCount {
    count: number
}
