import { memo, useCallback, useRef, useState } from 'react'
import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	DragOverlay,
	KeyboardSensor,
	PointerSensor,
	useDraggable,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
	Calendar,
	DollarSign,
	GripVertical,
	User,
} from 'lucide-react'
import { toast } from 'sonner'

import { Skeleton } from '@/components/ui/skeleton'
import type {
	Campaign,
	CampaignFilterParams,
	CampaignStatusValue,
} from '@/types/campaign'
import {
	isValidStatusTransition,
	CAMPAIGN_STATUS_LABELS,
} from '@/types/campaign'
import { formatCurrency } from '@/lib/utils'

import { StatusBadge } from './status-badge'
import { SelectCreatorsModal } from './select-creators-modal'
import { KanbanColumn } from './kanban-column'
import { KanbanColumnManager } from './kanban-column-manager'
import { useCampaignKanban } from '../hooks/use-campaign-kanban'
import type { UseKanbanColumnsConfigReturn } from '../hooks/use-kanban-columns-config'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignKanbanProps {
	filterParams: CampaignFilterParams
	enabled: boolean
	onCampaignClick?: (campaign: Campaign) => void
}

interface PendingTransition {
	campaignUuid: string
	fromStatus: CampaignStatusValue
	targetStatus: CampaignStatusValue
	slotsToApprove?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Kanban Card
// ─────────────────────────────────────────────────────────────────────────────

interface KanbanCardProps {
	campaign: Campaign
	isDragOverlay?: boolean
	onCampaignClick?: (campaign: Campaign) => void
}

const KanbanCard = memo(function KanbanCard({
	campaign,
	isDragOverlay = false,
	onCampaignClick,
}: KanbanCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		isDragging,
	} = useDraggable({
		id: campaign.uuid,
		data: {
			campaignUuid: campaign.uuid,
			currentStatus: campaign.status.value,
			slotsToApprove: campaign.slots_to_approve,
			campaign,
		},
	})

	const style = isDragOverlay
		? undefined
		: {
			transform: CSS.Translate.toString(transform),
			opacity: isDragging ? 0.3 : 1,
		}

	const handleCardClick = useCallback(() => {
		if (!isDragging && onCampaignClick) {
			onCampaignClick(campaign)
		}
	}, [isDragging, onCampaignClick, campaign])

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault()
				if (onCampaignClick) {
					onCampaignClick(campaign)
				}
			}
		},
		[onCampaignClick, campaign],
	)

	return (
		<div
			ref={isDragOverlay ? undefined : setNodeRef}
			style={style}
			{...(isDragOverlay ? {} : listeners)}
			{...(isDragOverlay ? {} : attributes)}
			onClick={isDragOverlay ? undefined : handleCardClick}
			onKeyDown={isDragOverlay ? undefined : handleKeyDown}
			tabIndex={isDragOverlay ? undefined : 0}
			className={[
				'group relative rounded-xl border bg-white p-3.5',
				'shadow-sm transition-all duration-200',
				'dark:bg-zinc-900 dark:border-zinc-700',
				isDragOverlay
					? 'rotate-2 scale-105 shadow-xl ring-2 ring-primary/30'
					: 'hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1',
				isDragging && !isDragOverlay ? 'opacity-30' : '',
			].join(' ')}
			role="article"
			aria-label={`Campanha: ${campaign.name}`}
			aria-roledescription="item arrastável"
		>
			{/* Drag handle indicator */}
			<div
				className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
				aria-hidden="true"
			>
				<GripVertical className="size-3.5 text-zinc-300 dark:text-zinc-600" />
			</div>

			{/* Campaign name */}
			<div className="mb-2.5 flex items-start justify-between gap-2 pr-4">
				<h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
					{campaign.name}
				</h4>
			</div>

			<StatusBadge status={campaign.status} className="mb-3 text-[10px]" />

			{/* Meta info */}
			<div className="space-y-1.5">
				<div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
					<User className="size-3 shrink-0" aria-hidden="true" />
					<span className="truncate">
						{campaign.user?.name ?? 'Sem anunciante'}
					</span>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
					<DollarSign className="size-3 shrink-0" aria-hidden="true" />
					<span className="font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">
						{formatCurrency(campaign.total_budget)}
					</span>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
					<Calendar className="size-3 shrink-0" aria-hidden="true" />
					<span className="tabular-nums">{campaign.created_at}</span>
				</div>
			</div>
		</div>
	)
})

// ─────────────────────────────────────────────────────────────────────────────
// Board Toolbar
// ─────────────────────────────────────────────────────────────────────────────

interface BoardToolbarProps {
	columnsConfig: UseKanbanColumnsConfigReturn
}

function BoardToolbar({ columnsConfig }: BoardToolbarProps) {
	return (
		<div className="flex items-center justify-end">
			<KanbanColumnManager
				columns={columnsConfig.allColumnOptions}
				onToggleColumn={columnsConfig.toggleColumn}
				onResetToDefault={columnsConfig.resetToDefault}
			/>
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Kanban Board (DnD + columns)
// ─────────────────────────────────────────────────────────────────────────────

interface KanbanBoardProps {
	visibleStatuses: CampaignStatusValue[]
	filterParams: CampaignFilterParams
	enabled: boolean
	columnsConfig: UseKanbanColumnsConfigReturn
	onCampaignClick?: (campaign: Campaign) => void
	onOptimisticMove: (
		campaignUuid: string,
		fromStatus: CampaignStatusValue,
		toStatus: CampaignStatusValue,
		creatorIds?: number[],
	) => Promise<void>
}

function KanbanBoard({
	visibleStatuses,
	filterParams,
	enabled,
	columnsConfig,
	onCampaignClick,
	onOptimisticMove,
}: KanbanBoardProps) {
	const [activeDragId, setActiveDragId] = useState<string | null>(null)
	const [overColumnId, setOverColumnId] = useState<string | null>(null)
	const [showCreatorsModal, setShowCreatorsModal] = useState(false)
	const pendingTransitionRef = useRef<PendingTransition | null>(null)
	const activeDragCampaignRef = useRef<Campaign | null>(null)

	const activeDragCampaign = activeDragCampaignRef.current

	// ── DnD sensors ──────────────────────────────────────────────────

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor),
	)

	// ── Drag handlers ─────────────────────────────────────────────────

	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveDragId(String(event.active.id))
		activeDragCampaignRef.current = (event.active.data.current?.campaign as Campaign) ?? null
		document.body.dataset.dragging = 'true'
	}, [])

	const handleDragOver = useCallback((event: DragOverEvent) => {
		setOverColumnId(event.over ? String(event.over.id) : null)
	}, [])

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			setActiveDragId(null)
			setOverColumnId(null)
			activeDragCampaignRef.current = null
			delete document.body.dataset.dragging

			const campaignUuid = String(event.active.id)
			const fromStatus = event.active.data.current?.currentStatus as CampaignStatusValue | undefined
			const toStatus = event.over?.id as CampaignStatusValue | undefined
			const slotsToApprove = event.active.data.current?.slotsToApprove as number | undefined

			if (!campaignUuid || !fromStatus || !toStatus) return
			if (fromStatus === toStatus) return

			if (!isValidStatusTransition(fromStatus, toStatus)) {
				toast.error(
					`Transição inválida: "${CAMPAIGN_STATUS_LABELS[fromStatus]}" → "${CAMPAIGN_STATUS_LABELS[toStatus]}".`,
				)
				return
			}

			// Special case: requires creator selection modal
			if (fromStatus === 'approved' && toStatus === 'sent_to_creators') {
				pendingTransitionRef.current = { campaignUuid, fromStatus, targetStatus: toStatus, slotsToApprove }
				setShowCreatorsModal(true)
				return
			}

			try {
				await onOptimisticMove(campaignUuid, fromStatus, toStatus)
				toast.success('Status atualizado com sucesso.')
			} catch {
				// Error toast handled inside optimisticMove
			}
		},
		[onOptimisticMove],
	)

	const handleDragCancel = useCallback(() => {
		setActiveDragId(null)
		setOverColumnId(null)
		activeDragCampaignRef.current = null
		delete document.body.dataset.dragging
	}, [])

	// ── Creators modal ────────────────────────────────────────────────

	const handleCreatorsConfirm = useCallback(
		async (creatorIds: number[]) => {
			const t = pendingTransitionRef.current
			if (!t) return
			try {
				await onOptimisticMove(t.campaignUuid, t.fromStatus, t.targetStatus, creatorIds)
				toast.success('Campanha enviada para creators com sucesso.')
			} catch {
				// Error handled inside optimisticMove
			} finally {
				pendingTransitionRef.current = null
			}
		},
		[onOptimisticMove],
	)

	const handleCreatorsModalClose = useCallback(() => {
		setShowCreatorsModal(false)
		pendingTransitionRef.current = null
	}, [])

	// ── Render card factory ───────────────────────────────────────────

	const renderCard = useCallback(
		(campaign: Campaign) => (
			<KanbanCard campaign={campaign} onCampaignClick={onCampaignClick} />
		),
		[onCampaignClick],
	)

	// ── Render ────────────────────────────────────────────────────────

	return (
		<>
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
			>
				{/*
				 * Board container: fixed viewport height so columns don't grow
				 * the page. Each column gets h-full, and its ScrollArea uses
				 * flex-1 min-h-0 to scroll independently.
				 */}
				<div
					className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory h-[calc(100svh-420px)] min-h-[480px]"
					role="region"
					aria-label="Kanban de campanhas"
					aria-roledescription="quadro kanban"
					aria-live="polite"
				>
					{visibleStatuses.map((status) => (
						<KanbanColumn
							key={status}
							status={status}
							filterParams={filterParams}
							enabled={enabled}
							isOver={overColumnId === status}
							isCollapsed={columnsConfig.collapsedStatuses.has(status)}
							onToggleCollapse={columnsConfig.toggleCollapse}
							onCampaignClick={onCampaignClick}
							renderCard={renderCard}
						/>
					))}
				</div>

				<DragOverlay dropAnimation={null}>
					{activeDragId && activeDragCampaign ? (
						<KanbanCard campaign={activeDragCampaign} isDragOverlay />
					) : null}
				</DragOverlay>
			</DndContext>

			<SelectCreatorsModal
				open={showCreatorsModal}
				onClose={handleCreatorsModalClose}
				onConfirm={handleCreatorsConfirm}
				maxSelections={pendingTransitionRef.current?.slotsToApprove}
			/>
		</>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kanban board for campaign management.
 *
 * Each column independently fetches its own paginated data via `useInfiniteQuery`
 * inside the `KanbanColumn` component. Drag-and-drop transitions are applied
 * optimistically — the card moves immediately and the API updates silently.
 * On failure, the cache rolls back. Column visibility and collapse state
 * are persisted in localStorage.
 */
function CampaignKanban({
	filterParams,
	enabled,
	onCampaignClick,
}: CampaignKanbanProps) {
	const { optimisticMove, columnsConfig } = useCampaignKanban({ filterParams })
	const { visibleStatuses } = columnsConfig

	if (!enabled) {
		return (
			<div className="space-y-3">
				<div className="flex justify-end">
					<Skeleton className="h-8 w-28 rounded-lg" />
				</div>
				<div className="flex gap-4 overflow-x-auto pb-4">
					{[...Array(6)].map((_, i) => (
						<div
							key={`sk-col-${i}`}
							className="flex flex-col rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/50 min-h-[400px] min-w-[260px]"
						>
							<div className="flex items-center justify-between rounded-t-2xl border-b px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-5 w-12 rounded-md" />
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-3">
			<BoardToolbar columnsConfig={columnsConfig} />
			<KanbanBoard
				visibleStatuses={visibleStatuses}
				filterParams={filterParams}
				enabled={enabled}
				columnsConfig={columnsConfig}
				onCampaignClick={onCampaignClick}
				onOptimisticMove={optimisticMove}
			/>
		</div>
	)
}

export { CampaignKanban }
export type { CampaignKanbanProps }
