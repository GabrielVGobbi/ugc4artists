import { useCallback, useEffect, useRef, useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
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
    Bell, Check, CheckCheck, Trash2, Loader2, AlertCircle,
    Info, CheckCircle, XCircle, Megaphone, CreditCard, Settings,
    Clock, Search, X, ExternalLink, ChevronRight
} from 'lucide-react'
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

const typeColors: Record<NotificationType, { bg: string; text: string; icon: string }> = {
    info: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100 text-blue-600' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100 text-emerald-600' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100 text-amber-600' },
    error: { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-100 text-red-600' },
    campaign: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100 text-purple-600' },
    payment: { bg: 'bg-green-50', text: 'text-green-600', icon: 'bg-green-100 text-green-600' },
    system: { bg: 'bg-zinc-50', text: 'text-zinc-600', icon: 'bg-zinc-100 text-zinc-600' },
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

type FilterType = 'all' | 'unread' | NotificationType

const filterOptions: { value: FilterType; label: string; icon?: typeof Info }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'unread', label: 'Não lidas' },
    { value: 'payment', label: 'Pagamentos', icon: CreditCard },
    { value: 'campaign', label: 'Campanhas', icon: Megaphone },
    { value: 'system', label: 'Sistema', icon: Settings },
]

// ─────────────────────────────────────────────────────────────────────────────
// Notification Card
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationCardProps {
    notification: Notification
    onMarkAsRead: (id: number) => void
    onDelete: (id: number) => void
    isSelected: boolean
    onSelect: (notification: Notification) => void
}

function NotificationCard({ notification, onMarkAsRead, onDelete, isSelected, onSelect }: NotificationCardProps) {
    const Icon = typeIcons[notification.type] || Info
    const colors = typeColors[notification.type] || typeColors.info

    return (
        <div
            className={cn(
                'group bg-white rounded-2xl border transition-all duration-200 cursor-pointer',
                isSelected
                    ? 'border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20'
                    : 'border-zinc-100 hover:border-zinc-200 hover:shadow-md',
                !notification.is_read && 'border-l-4 border-l-primary'
            )}
            onClick={() => onSelect(notification)}
        >
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className={cn('flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center', colors.icon)}>
                        <Icon size={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full', colors.bg, colors.text)}>
                                        {typeLabels[notification.type]}
                                    </span>
                                    {!notification.is_read && (
                                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    )}
                                </div>
                                <h4 className={cn('text-base font-bold text-zinc-900 line-clamp-1', !notification.is_read && 'text-secondary')}>
                                    {notification.title}
                                </h4>
                                <p className="text-sm text-zinc-500 line-clamp-2 mt-1">
                                    {notification.message}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.is_read && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onMarkAsRead(notification.id)
                                        }}
                                        className="cursor-pointer p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-emerald-600 transition-colors"
                                        title="Marcar como lida"
                                    >
                                        <Check size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete(notification.id)
                                    }}
                                    className="cursor-pointer p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                                    title="Remover"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50">
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <Clock size={14} />
                                <span>{notification.time_ago}</span>
                            </div>
                            {notification.action_url && (
                                <Link
                                    href={notification.action_url}
                                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {notification.action_label || 'Ver detalhes'}
                                    <ChevronRight size={14} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


// ─────────────────────────────────────────────────────────────────────────────
// Notification Detail Panel
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationDetailProps {
    notification: Notification
    onMarkAsRead: (id: number) => void
    onDelete: (id: number) => void
    onClose: () => void
}

function NotificationDetail({ notification, onMarkAsRead, onDelete, onClose }: NotificationDetailProps) {
    const Icon = typeIcons[notification.type] || Info
    const colors = typeColors[notification.type] || typeColors.info

    return (
        <div className="bg-white rounded-2xl border border-zinc-100 h-fit sticky top-6">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <h3 className="font-semibold text-zinc-900">Detalhes</h3>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Icon & Type */}
                <div className="flex items-center gap-4 mb-6">
                    <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', colors.icon)}>
                        <Icon size={28} />
                    </div>
                    <div>
                        <span className={cn('px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full', colors.bg, colors.text)}>
                            {typeLabels[notification.type]}
                        </span>
                        {!notification.is_read && (
                            <span className="ml-2 px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                                Nova
                            </span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h4 className="text-xl font-bold text-zinc-900 mb-3">
                    {notification.title}
                </h4>

                {/* Message */}
                <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                    {notification.message}
                </p>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
                    <Clock size={16} />
                    <span>{notification.time_ago}</span>
                </div>

                {/* Action button */}
                {notification.action_url && (
                    <Link
                        href={notification.action_url}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors w-full justify-center"
                    >
                        {notification.action_label || 'Ver detalhes'}
                        <ExternalLink size={16} />
                    </Link>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
                {!notification.is_read && (
                    <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="cursor-pointer flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-600 transition-colors"
                    >
                        <Check size={16} />
                        Marcar como lida
                    </button>
                )}
                <button
                    onClick={() => onDelete(notification.id)}
                    className="cursor-pointer flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors ml-auto"
                >
                    <Trash2 size={16} />
                    Remover
                </button>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Tabs
// ─────────────────────────────────────────────────────────────────────────────

interface FilterTabsProps {
    activeFilter: FilterType
    onFilterChange: (filter: FilterType) => void
    unreadCount: number
}

function FilterTabs({ activeFilter, onFilterChange, unreadCount }: FilterTabsProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {filterOptions.map((option) => {
                const isActive = activeFilter === option.value
                const IconComponent = option.icon

                return (
                    <button
                        key={option.value}
                        onClick={() => onFilterChange(option.value)}
                        className={cn(
                            'cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                            isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200'
                        )}
                    >
                        {IconComponent && <IconComponent size={16} />}
                        {option.label}
                        {option.value === 'unread' && unreadCount > 0 && (
                            <span className={cn(
                                'px-1.5 py-0.5 text-[10px] font-bold rounded-full',
                                isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                            )}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirmation Dialog
// ─────────────────────────────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    isDeleting: boolean
}

function DeleteConfirmDialog({ open, onOpenChange, onConfirm, isDeleting }: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Trash2 className="w-7 h-7 text-red-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Remover notificação?</DialogTitle>
                    <DialogDescription className="text-center">
                        Esta ação não pode ser desfeita. A notificação será removida permanentemente.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                        className="min-w-[100px]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 min-w-[100px]"
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
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<FilterType>('unread')
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
    } = useNotifications({ enabled: true })

    // Filter notifications
    const filteredNotifications = notifications.filter((notification) => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesSearch =
                notification.title.toLowerCase().includes(query) ||
                notification.message.toLowerCase().includes(query)
            if (!matchesSearch) return false
        }

        // Type filter
        if (activeFilter === 'all') return true
        if (activeFilter === 'unread') return !notification.is_read
        return notification.type === activeFilter
    })

    // Handle notification selection
    const handleSelectNotification = useCallback(async (notification: Notification) => {
        setSelectedNotification(notification)
        // Só marca como lida automaticamente se NÃO estiver no filtro de não lidas
        // Isso evita que a notificação suma da lista ao clicar
        if (!notification.is_read && activeFilter !== 'unread') {
            await markAsRead(notification.id)
            // Atualiza o estado local para refletir que foi lida
            setSelectedNotification(prev => prev ? { ...prev, is_read: true, read_at: new Date().toISOString() } : null)
        }
    }, [markAsRead, activeFilter])

    // Handle mark as read from detail panel
    const handleMarkAsRead = useCallback(async (id: number) => {
        await markAsRead(id)
        // Atualiza o selectedNotification se for o mesmo
        setSelectedNotification(prev => {
            if (prev?.id === id) {
                return { ...prev, is_read: true, read_at: new Date().toISOString() }
            }
            return prev
        })
    }, [markAsRead])

    // Handle delete request
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

    // Infinite scroll
    useEffect(() => {
        if (!loadMoreTriggerRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (entry.isIntersecting && hasMore && !isFetchingMore && !isLoading) {
                    loadMore()
                }
            },
            {
                root: scrollRef.current,
                rootMargin: '200px',
                threshold: 0,
            }
        )

        observer.observe(loadMoreTriggerRef.current)
        return () => observer.disconnect()
    }, [hasMore, isFetchingMore, isLoading, loadMore])

    return (
        <AppLayout>
            <Head title="Notificações" />

            <DeleteConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDeleteConfirm}
                isDeleting={isDeleting}
            />

            <div className="">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <p className="text-sm text-zinc-500 mt-1">
                            {unreadCount > 0
                                ? `Você tem ${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}`
                                : 'Todas as notificações foram lidas'}
                        </p>
                    </div>

                    {notifications.length > 0 && unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => markAllAsRead()}
                            className="flex items-center gap-2"
                        >
                            <CheckCheck size={16} />
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Buscar notificações..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 text-zinc-400"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <FilterTabs
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        unreadCount={unreadCount}
                    />
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Notifications List */}
                    <div className="lg:col-span-2">
                        <div ref={scrollRef} className="space-y-4">
                            {isLoading && notifications.length === 0 ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                                    <p className="text-zinc-600 mb-2">Erro ao carregar notificações</p>
                                    <p className="text-sm text-zinc-400 mb-4">{error}</p>
                                    <Button variant="outline" onClick={() => refetch()}>
                                        Tentar novamente
                                    </Button>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                                        <Bell className="w-10 h-10 text-zinc-300" />
                                    </div>
                                    <p className="text-lg font-medium text-zinc-600 mb-1">
                                        {searchQuery || activeFilter !== 'all'
                                            ? 'Nenhuma notificação encontrada'
                                            : 'Nenhuma notificação'}
                                    </p>
                                    <p className="text-sm text-zinc-400">
                                        {searchQuery || activeFilter !== 'all'
                                            ? 'Tente ajustar os filtros de busca'
                                            : 'Você não tem notificações no momento'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {filteredNotifications.map((notification) => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={handleMarkAsRead}
                                            onDelete={handleDeleteRequest}
                                            isSelected={selectedNotification?.id === notification.id}
                                            onSelect={handleSelectNotification}
                                        />
                                    ))}

                                    <div ref={loadMoreTriggerRef} className="h-1" />

                                    {isFetchingMore && (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                                        </div>
                                    )}

                                    {!hasMore && filteredNotifications.length > 0 && (
                                        <p className="text-center text-sm text-zinc-400 py-6">
                                            Você chegou ao fim das notificações
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Detail Panel */}
                    <div className="hidden lg:block">
                        {selectedNotification ? (
                            <NotificationDetail
                                notification={selectedNotification}
                                onMarkAsRead={handleMarkAsRead}
                                onDelete={handleDeleteRequest}
                                onClose={() => setSelectedNotification(null)}
                            />
                        ) : (
                            <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-8 h-8 text-zinc-300" />
                                </div>
                                <p className="text-sm text-zinc-500">
                                    Selecione uma notificação para ver os detalhes
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
