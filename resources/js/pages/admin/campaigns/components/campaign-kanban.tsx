import { useCallback, useMemo, useState } from 'react'
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    DragOverlay,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useQueryClient } from '@tanstack/react-query'
import {
    Calendar,
    DollarSign,
    GripVertical,
    Megaphone,
    User,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    useAdminCampaigns,
    useAdminCampaignMutations,
} from '@/hooks/use-admin-campaigns'
import type {
    Campaign,
    CampaignIndexFilters,
    CampaignStatusValue,
} from '@/types/campaign'

import { StatusBadge } from './status-badge'
import { formatCurrency } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Kanban Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

type KanbanColumnId =
    | 'pendente'
    | 'aprovada'
    | 'em_andamento'
    | 'finalizada'
    | 'recusada'

interface KanbanColumnConfig {
    id: KanbanColumnId
    title: string
    statuses: CampaignStatusValue[]
    colorClass: string
    headerBg: string
    dropHighlight: string
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
    {
        id: 'pendente',
        title: 'Pendente',
        statuses: ['draft', 'pending', 'under_review', 'awaiting_payment'],
        colorClass: 'text-amber-700',
        headerBg: 'bg-amber-50 border-amber-200',
        dropHighlight: 'ring-amber-400',
    },
    {
        id: 'aprovada',
        title: 'Aprovada',
        statuses: ['approved', 'sent_to_creators'],
        colorClass: 'text-blue-700',
        headerBg: 'bg-blue-50 border-blue-200',
        dropHighlight: 'ring-blue-400',
    },
    {
        id: 'em_andamento',
        title: 'Em Andamento',
        statuses: ['in_progress'],
        colorClass: 'text-emerald-700',
        headerBg: 'bg-emerald-50 border-emerald-200',
        dropHighlight: 'ring-emerald-400',
    },
    {
        id: 'finalizada',
        title: 'Finalizada',
        statuses: ['completed'],
        colorClass: 'text-zinc-700',
        headerBg: 'bg-zinc-50 border-zinc-200',
        dropHighlight: 'ring-zinc-400',
    },
    {
        id: 'recusada',
        title: 'Recusada',
        statuses: ['refused', 'cancelled'],
        colorClass: 'text-rose-700',
        headerBg: 'bg-rose-50 border-rose-200',
        dropHighlight: 'ring-rose-400',
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// Valid Status Transitions (mirrors CampaignStatus::getAvailableTransitions)
// ─────────────────────────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<
    CampaignStatusValue,
    CampaignStatusValue[]
> = {
    draft: [],
    pending: [
        'approved',
        'refused',
        'sent_to_creators',
        'draft',
        'cancelled',
    ],
    under_review: [
        'approved',
        'refused',
        'sent_to_creators',
        'draft',
        'cancelled',
    ],
    approved: ['sent_to_creators', 'in_progress', 'cancelled'],
    refused: [],
    awaiting_payment: [],
    sent_to_creators: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
}

/**
 * Resolves the target status when a card is dropped on a column.
 * Each column may group multiple statuses — we pick the primary one.
 */
const COLUMN_TARGET_STATUS: Record<KanbanColumnId, CampaignStatusValue> =
{
    pendente: 'pending',
    aprovada: 'approved',
    em_andamento: 'in_progress',
    finalizada: 'completed',
    recusada: 'refused',
}

const isValidTransition = (
    from: CampaignStatusValue,
    to: CampaignStatusValue,
): boolean => {
    const allowed = VALID_TRANSITIONS[from]
    return allowed?.includes(to) ?? false
}

const findColumnForStatus = (
    status: CampaignStatusValue,
): KanbanColumnId | null => {
    const column = KANBAN_COLUMNS.find((col) =>
        col.statuses.includes(status),
    )
    return column?.id ?? null
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const parseApiErrorMessage = (error: unknown): string => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
    ) {
        return (error as { message: string }).message
    }

    if (typeof error === 'object' && error !== null && 'errors' in error) {
        const errors = (error as { errors?: Record<string, string> })
            .errors
        const first = errors ? Object.values(errors)[0] : null
        if (first) return first
    }

    return 'Não foi possível atualizar o status da campanha.'
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignKanbanProps {
    filters: CampaignIndexFilters
    onPreview?: (campaign: Campaign) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface KanbanCardProps {
    campaign: Campaign
    isDragOverlay?: boolean
    onPreview?: (campaign: Campaign) => void
}

function KanbanCard({ campaign, isDragOverlay = false, onPreview }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: String(campaign.id),
        data: {
            campaignId: campaign.id,
            currentStatus: campaign.status.value,
        },
    })

    const style = isDragOverlay
        ? undefined
        : {
            transform: CSS.Translate.toString(transform),
            opacity: isDragging ? 0.3 : 1,
        }

    const handleCardClick = useCallback(() => {
        if (!isDragging && onPreview) {
            onPreview(campaign)
        }
    }, [isDragging, onPreview, campaign])

    return (
        <div
            ref={isDragOverlay ? undefined : setNodeRef}
            style={style}
            {...(isDragOverlay ? {} : listeners)}
            {...(isDragOverlay ? {} : attributes)}
            onClick={isDragOverlay ? undefined : handleCardClick}
            className={`
				group relative rounded-xl border bg-white p-3.5
				shadow-sm transition-all duration-200
				${isDragOverlay
                    ? 'rotate-2 scale-105 shadow-xl ring-2 ring-primary/30'
                    : 'hover:shadow-md hover:border-zinc-300 cursor-grab active:cursor-grabbing'
                }
				${isDragging && !isDragOverlay ? 'opacity-30' : ''}
			`}
            role="article"
            aria-label={`Campanha: ${campaign.name}`}
        >
            {/* Drag handle indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="size-3.5 text-zinc-300" />
            </div>

            {/* Campaign name + status */}
            <div className="mb-2.5 flex items-start justify-between gap-2 pr-4">
                <h4 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug">
                    {campaign.name}
                </h4>
            </div>

            <StatusBadge
                status={campaign.status}
                className="mb-3 text-[10px]"
            />

            {/* Meta info */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <User className="size-3 shrink-0" />
                    <span className="truncate">
                        {campaign.user?.name ?? 'Sem anunciante'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <DollarSign className="size-3 shrink-0" />
                    <span className="font-medium text-zinc-700 tabular-nums">
                        {formatCurrency(campaign.total_budget)}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar className="size-3 shrink-0" />
                    <span className="tabular-nums">
                        {(campaign.created_at)}
                    </span>
                </div>
            </div>
        </div>
    )
}

interface KanbanColumnComponentProps {
    config: KanbanColumnConfig
    campaigns: Campaign[]
    isOver: boolean
    onPreview?: (campaign: Campaign) => void
}

function KanbanColumn({
    config,
    campaigns,
    isOver,
    onPreview,
}: KanbanColumnComponentProps) {
    const { setNodeRef } = useDroppable({ id: config.id })

    return (
        <div
            ref={setNodeRef}
            className={`
				flex flex-col rounded-2xl border transition-all duration-200
				bg-zinc-50/80 min-h-[400px]
				${isOver ? `ring-2 ${config.dropHighlight} border-transparent` : 'border-zinc-200/80'}
			`}
            role="region"
            aria-label={`Coluna ${config.title}`}
        >
            {/* Column header */}
            <div
                className={`
					flex items-center justify-between rounded-t-2xl
					border-b px-4 py-3 ${config.headerBg}
				`}
            >
                <h3
                    className={`text-sm font-semibold ${config.colorClass}`}
                >
                    {config.title}
                </h3>
                <Badge
                    variant="secondary"
                    className="tabular-nums text-[10px] font-semibold"
                >
                    {campaigns.length}
                </Badge>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2.5 p-3 overflow-y-auto">
                {campaigns.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-zinc-100">
                            <Megaphone className="size-4 text-zinc-300" />
                        </div>
                        <p className="text-xs text-zinc-400">
                            Nenhuma campanha
                        </p>
                    </div>
                )}
                {campaigns.map((campaign) => (
                    <KanbanCard
                        key={campaign.id}
                        campaign={campaign}
                        onPreview={onPreview}
                    />
                ))}
            </div>
        </div>
    )
}

function KanbanSkeleton() {
    return (
        <div
            className="grid gap-4 lg:grid-cols-5"
            role="status"
            aria-label="Carregando campanhas"
        >
            {KANBAN_COLUMNS.map((col) => (
                <div
                    key={col.id}
                    className="flex flex-col rounded-2xl border border-zinc-200/80 bg-zinc-50/80 min-h-[400px]"
                >
                    <div
                        className={`
							flex items-center justify-between rounded-t-2xl
							border-b px-4 py-3 ${col.headerBg}
						`}
                    >
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-6 rounded-md" />
                    </div>
                    <div className="space-y-2.5 p-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={`${col.id}-skeleton-${index}`}
                                className="rounded-xl border bg-white p-3.5 space-y-3"
                            >
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-5 w-16 rounded-md" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3 w-2/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kanban board for campaign management with drag-and-drop status transitions.
 * Uses TanStack React Query for data fetching and @dnd-kit for DnD.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 11.5
 */
function CampaignKanban({ filters, onPreview }: CampaignKanbanProps) {
    const queryClient = useQueryClient()
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [overColumnId, setOverColumnId] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    // ── Data fetching ────────────────────────────────────────────────

    const statusFilter = filters.statuses.length > 0
        ? filters.statuses as CampaignStatusValue[]
        : undefined

    // Debug: Log dos filtros
    console.log('[Kanban Debug] Filtros aplicados:', {
        statusFilter,
        search: filters.search || undefined,
        originalStatuses: filters.statuses
    })

    const campaignsQuery = useAdminCampaigns({
        status: statusFilter,
        search: filters.search || undefined,
    })

    const { updateCampaignStatus } = useAdminCampaignMutations()

    const allCampaigns: Campaign[] = useMemo(() => {
        const campaigns = campaignsQuery.data ?? []

        // Debug: Log para verificar dados recebidos
        console.log('[Kanban Debug] Query status:', {
            isLoading: campaignsQuery.isLoading,
            isError: campaignsQuery.isError,
            dataExists: !!campaignsQuery.data,
            campaignsCount: campaigns.length,
            campaigns: campaigns.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status.value
            }))
        })

        return campaigns
    }, [campaignsQuery.data, campaignsQuery.isLoading, campaignsQuery.isError])

    // ── Group campaigns by column ────────────────────────────────────

    const campaignsByColumn = useMemo(() => {
        const grouped: Record<KanbanColumnId, Campaign[]> = {
            pendente: [],
            aprovada: [],
            em_andamento: [],
            finalizada: [],
            recusada: [],
        }

        console.log(allCampaigns);

        for (const campaign of allCampaigns) {
            const columnId = findColumnForStatus(campaign.status.value)
            if (columnId) {
                grouped[columnId].push(campaign)
            } else {
                // Debug: Status não mapeado
                console.warn('[Kanban] Status não mapeado:', campaign.status.value, 'para campanha:', campaign.name)
            }
        }

        // Debug: Log do agrupamento
        console.log('[Kanban Debug] Agrupamento por coluna:', {
            pendente: grouped.pendente.length,
            aprovada: grouped.aprovada.length,
            em_andamento: grouped.em_andamento.length,
            finalizada: grouped.finalizada.length,
            recusada: grouped.recusada.length,
        })

        return grouped
    }, [allCampaigns])

    // ── Active drag campaign (for overlay) ───────────────────────────

    const activeDragCampaign = useMemo(() => {
        if (!activeDragId) return null
        return allCampaigns.find(
            (c) => String(c.id) === activeDragId,
        ) ?? null
    }, [activeDragId, allCampaigns])

    // ── DnD sensors ──────────────────────────────────────────────────

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    )

    // ── Optimistic update helpers ────────────────────────────────────

    type QuerySnapshot = {
        queryKey: readonly unknown[]
        previous: { data: Campaign[] } | undefined
    }

    const snapshotQueries = useCallback((): QuerySnapshot[] => {
        const entries = queryClient.getQueriesData<{
            data: Campaign[]
        }>({ queryKey: ['admin-campaigns'] })

        return entries.map(([queryKey, previous]) => ({
            queryKey,
            previous,
        }))
    }, [queryClient])

    const applyOptimisticMove = useCallback(
        (campaignId: number, targetStatus: CampaignStatusValue) => {
            queryClient.setQueriesData<{ data: Campaign[] }>(
                { queryKey: ['admin-campaigns'] },
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: old.data.map((campaign) => {
                            if (campaign.id !== campaignId) {
                                return campaign
                            }

                            return {
                                ...campaign,
                                status: {
                                    ...campaign.status,
                                    value: targetStatus,
                                },
                            }
                        }),
                    }
                },
            )
        },
        [queryClient],
    )

    const rollbackSnapshots = useCallback(
        (snapshots: QuerySnapshot[]) => {
            for (const { queryKey, previous } of snapshots) {
                queryClient.setQueryData(queryKey, previous)
            }
        },
        [queryClient],
    )

    // ── Drag handlers ────────────────────────────────────────────────

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveDragId(String(event.active.id))
    }, [])

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            setOverColumnId(
                event.over ? String(event.over.id) : null,
            )
        },
        [],
    )

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            setActiveDragId(null)
            setOverColumnId(null)

            if (isPending) return

            const campaignId = Number(
                event.active.data.current?.campaignId,
            )
            const currentStatus = event.active.data.current
                ?.currentStatus as CampaignStatusValue | undefined
            const targetColumnId = event.over?.id as
                | KanbanColumnId
                | undefined

            if (
                !campaignId ||
                !currentStatus ||
                !targetColumnId
            ) {
                return
            }

            const targetStatus =
                COLUMN_TARGET_STATUS[targetColumnId]
            if (!targetStatus) return

            // Same column — no-op
            const sourceColumn = findColumnForStatus(currentStatus)
            if (sourceColumn === targetColumnId) return

            // Validate transition client-side
            if (!isValidTransition(currentStatus, targetStatus)) {
                toast.error(
                    `Transição inválida: não é possível mover de "${currentStatus}" para "${targetStatus}".`,
                )
                return
            }

            // Optimistic update
            const snapshots = snapshotQueries()
            applyOptimisticMove(campaignId, targetStatus)
            setIsPending(true)

            try {
                await updateCampaignStatus.mutateAsync({
                    campaignId,
                    status: targetStatus,
                })
                toast.success('Status atualizado com sucesso.')
                queryClient.invalidateQueries({
                    queryKey: ['admin-campaigns'],
                })
            } catch (error) {
                rollbackSnapshots(snapshots)
                toast.error(parseApiErrorMessage(error))
            } finally {
                setIsPending(false)
            }
        },
        [
            isPending,
            snapshotQueries,
            applyOptimisticMove,
            rollbackSnapshots,
            updateCampaignStatus,
            queryClient,
        ],
    )

    const handleDragCancel = useCallback(() => {
        setActiveDragId(null)
        setOverColumnId(null)
    }, [])

    // ── Loading state ────────────────────────────────────────────────

    if (campaignsQuery.isLoading) {
        return <KanbanSkeleton />
    }

    // ── Error state ──────────────────────────────────────────────────

    if (campaignsQuery.isError) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                    <Megaphone className="size-8 text-red-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                    Erro ao carregar campanhas
                </h3>
                <p className="text-sm text-zinc-500 max-w-md">
                    {campaignsQuery.error instanceof Error
                        ? campaignsQuery.error.message
                        : 'Não foi possível carregar as campanhas. Tente novamente.'}
                </p>
            </div>
        )
    }

    // ── Render ────────────────────────────────────────────────────────

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div
                className="grid gap-4 lg:grid-cols-5"
                role="region"
                aria-label="Kanban de campanhas"
            >
                {KANBAN_COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        config={column}
                        campaigns={
                            campaignsByColumn[column.id] ?? []
                        }
                        isOver={overColumnId === column.id}
                        onPreview={onPreview}
                    />
                ))}
            </div>

            {/* Drag overlay — renders a floating copy of the card */}
            <DragOverlay dropAnimation={null}>
                {activeDragCampaign ? (
                    <KanbanCard
                        campaign={activeDragCampaign}
                        isDragOverlay
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

export { CampaignKanban, KANBAN_COLUMNS, VALID_TRANSITIONS }
export type { CampaignKanbanProps, KanbanColumnId }
