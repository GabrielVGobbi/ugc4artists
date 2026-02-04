import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Bell, Check, CheckCheck, Trash2, ExternalLink, Loader2, AlertCircle,
    Info, CheckCircle, XCircle, Megaphone, CreditCard, Settings,
    ArrowLeft, Clock
} from 'lucide-react'
import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/hooks/use-notifications'
import type { Notification, NotificationType } from '@/types/notification'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Icon & Color mapping
// ─────────────────────────────────────────────────────────────────────────────

const typeIcons: Record<NotificationType, typeof Info> = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    campaign: Megaphone,
    payment: CreditCard,
    system: Settings,
}

const typeColors: Record<NotificationType, string> = {
    info: 'text-blue-500 bg-blue-50',
    success: 'text-emerald-500 bg-emerald-50',
    warning: 'text-amber-500 bg-amber-50',
    error: 'text-red-500 bg-red-50',
    campaign: 'text-purple-500 bg-purple-50',
    payment: 'text-green-500 bg-green-50',
    system: 'text-zinc-500 bg-zinc-50',
}

const typeLabels: Record<NotificationType, string> = {
    info: 'Informação',
    success: 'Sucesso',
    warning: 'Atenção',
    error: 'Erro',
    campaign: 'Campanha',
    payment: 'Pagamento',
    system: 'Sistema',
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Detail View
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationDetailProps {
    notification: Notification
    onBack: () => void
    onDelete: (id: number) => void
}

function NotificationDetail({ notification, onBack, onDelete }: NotificationDetailProps) {
    const Icon = typeIcons[notification.type] || Info
    const colorClass = typeColors[notification.type] || typeColors.info

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                <button
                    onClick={onBack}
                    className="p-1.5 -ml-1.5 rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <span className="text-sm font-medium text-zinc-700">Detalhes</span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Type badge & Icon */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClass)}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <span className={cn(
                            'inline-block px-2.5 py-1 text-xs font-medium rounded-full',
                            colorClass
                        )}>
                            {typeLabels[notification.type]}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h4 className="text-lg font-semibold text-zinc-900 mb-2">
                    {notification.title}
                </h4>

                {/* Message */}
                <p className="text-sm text-zinc-600 leading-relaxed mb-4">
                    {notification.message}
                </p>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                    <Clock size={14} />
                    <span>{notification.time_ago}</span>
                </div>

                {/* Action button */}
                {notification.action_url && (
                    <Link
                        href={notification.action_url}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        {notification.action_label || 'Ver detalhes'}
                        <ExternalLink size={16} />
                    </Link>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50/30">
                <button
                    onClick={() => onDelete(notification.id)}
                    className="cursor-pointer flex items-center gap-2 text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                    <Trash2 size={14} />
                    Remover notificação
                </button>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Item (List)
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationItemProps {
    notification: Notification
    onSelect: (notification: Notification) => void
}

function NotificationItem({ notification, onSelect }: NotificationItemProps) {
    const Icon = typeIcons[notification.type] || Info
    const colorClass = typeColors[notification.type] || typeColors.info

    return (
        <div
            className="group flex gap-3 p-3 hover:bg-zinc-50 transition-colors cursor-pointer border-b border-zinc-100 last:border-0"
            onClick={() => onSelect(notification)}
        >
            {/* Icon */}
            <div className={cn('flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center', colorClass)}>
                <Icon size={20} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-900 line-clamp-1">
                        {notification.title}
                    </p>
                    <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-primary rounded-full animate-pulse" />
                </div>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">
                    {notification.message}
                </p>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                    {notification.time_ago}
                </span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function NotificationsDropdown() {
    const [open, setOpen] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

    const {
        notifications,
        unreadCount,
        isLoading,
        isFetchingMore,
        hasMore,
        error,
        loadMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch,
    } = useNotifications({ enabled: open, unreadOnly: true })

    // Handle notification selection
    const handleSelectNotification = useCallback(async (notification: Notification) => {
        setSelectedNotification(notification)
        if (!notification.is_read) {
            await markAsRead(notification.id)
        }
    }, [markAsRead])

    // Handle delete request (opens confirmation)
    const handleDeleteRequest = useCallback((id: number) => {
        setDeleteId(id)
    }, [])

    // Handle delete confirmation
    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteId) return

        setIsDeleting(true)
        try {
            await deleteNotification(deleteId)
            if (selectedNotification?.id === deleteId) {
                setSelectedNotification(null)
            }
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }, [deleteId, deleteNotification, selectedNotification])

    // Handle back from detail view
    const handleBack = useCallback(() => {
        setSelectedNotification(null)
    }, [])

    // Infinite scroll
    useEffect(() => {
        if (!open || !loadMoreTriggerRef.current || selectedNotification) return

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (entry.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
                    loadMore()
                }
            },
            {
                root: scrollRef.current,
                rootMargin: '100px',
                threshold: 0,
            }
        )

        observer.observe(loadMoreTriggerRef.current)
        return () => observer.disconnect()
    }, [open, hasMore, isFetchingMore, isLoading, loadMore, selectedNotification])

    // Reset selection when closing
    const handleOpenChange = useCallback((isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) {
            refetch()
        } else {
            setSelectedNotification(null)
        }
    }, [refetch])

    return (
        <>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center">Remover notificação?</DialogTitle>
                        <DialogDescription className="text-center">
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Removendo...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remover
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DropdownMenu open={open} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="cursor-pointer relative p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-zinc-600 hover:text-primary group h-auto w-auto"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full border-2 border-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                        <span className="sr-only">Notificações</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-[380px] p-0 overflow-hidden"
                    sideOffset={8}
                >
                    {selectedNotification ? (
                        <NotificationDetail
                            notification={selectedNotification}
                            onBack={handleBack}
                            onDelete={handleDeleteRequest}
                        />
                    ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-zinc-900">Notificações</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                                        {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                                    </span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="cursor-pointer flex items-center gap-1 text-xs text-zinc-500 hover:text-primary transition-colors"
                                >
                                    <CheckCheck size={14} />
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div
                            ref={scrollRef}
                            className="max-h-[400px] overflow-y-auto overscroll-contain"
                        >
                            {isLoading && notifications.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                                    <p className="text-sm text-zinc-500">{error}</p>
                                    <button
                                        onClick={() => refetch()}
                                        className="mt-2 text-xs text-primary hover:underline"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                                        <Check className="w-8 h-8 text-zinc-400" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-600">Tudo em dia!</p>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Você não tem notificações pendentes
                                    </p>
                                    <Link
                                        href="/app/notifications"
                                        className="mt-4 text-xs text-primary hover:underline font-medium"
                                    >
                                        Ver todas as notificações
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onSelect={handleSelectNotification}
                                        />
                                    ))}

                                    <div ref={loadMoreTriggerRef} className="h-1" />

                                    {isFetchingMore && (
                                        <div className="flex items-center justify-center py-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                                        </div>
                                    )}

                                    {!hasMore && notifications.length > 0 && (
                                        <div className="py-3 text-center border-t border-zinc-100">
                                            <Link
                                                href="/app/notifications"
                                                className="text-xs text-primary hover:underline font-medium"
                                            >
                                                Ver todas as notificações
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}
