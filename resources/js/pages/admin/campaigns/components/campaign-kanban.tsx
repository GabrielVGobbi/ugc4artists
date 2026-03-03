import { useCallback, useMemo, useState } from 'react'
import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	DragOverlay,
	KeyboardSensor,
	PointerSensor,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
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
import type {
	Campaign,
	CampaignKanbanColumn,
	CampaignStatusValue,
	UpdateCampaignStatusInput,
} from '@/types/campaign'
import {
	isValidStatusTransition,
	CAMPAIGN_STATUS_LABELS,
} from '@/types/campaign'
import { formatCurrency } from '@/lib/utils'

import { StatusBadge } from './status-badge'

// ─────────────────────────────────────────────────────────────────────────────
// Column Color Config
// ─────────────────────────────────────────────────────────────────────────────

interface ColumnColorConfig {
	colorClass: string
	headerBg: string
	dropHighlight: string
}

/**
 * Maps each kanban-visible status to its column color scheme.
 * Falls back to neutral zinc tones for unmapped statuses.
 */
const COLUMN_COLORS: Record<string, ColumnColorConfig> = {
	under_review: {
		colorClass: 'text-amber-700 dark:text-amber-400',
		headerBg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
		dropHighlight: 'ring-amber-400',
	},
	approved: {
		colorClass: 'text-blue-700 dark:text-blue-400',
		headerBg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
		dropHighlight: 'ring-blue-400',
	},
	sent_to_creators: {
		colorClass: 'text-violet-700 dark:text-violet-400',
		headerBg: 'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800',
		dropHighlight: 'ring-violet-400',
	},
	in_progress: {
		colorClass: 'text-emerald-700 dark:text-emerald-400',
		headerBg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
		dropHighlight: 'ring-emerald-400',
	},
	completed: {
		colorClass: 'text-zinc-700 dark:text-zinc-300',
		headerBg: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700',
		dropHighlight: 'ring-zinc-400',
	},
	refused: {
		colorClass: 'text-rose-700 dark:text-rose-400',
		headerBg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800',
		dropHighlight: 'ring-rose-400',
	},
}

const DEFAULT_COLUMN_COLORS: ColumnColorConfig = {
	colorClass: 'text-zinc-700 dark:text-zinc-300',
	headerBg: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700',
	dropHighlight: 'ring-zinc-400',
}

const getColumnColors = (
	status: CampaignStatusValue,
): ColumnColorConfig =>
	COLUMN_COLORS[status] ?? DEFAULT_COLUMN_COLORS

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
		const errors = (error as { errors?: Record<string, string> }).errors
		const first = errors ? Object.values(errors)[0] : null
		if (first) return first
	}

	return 'Não foi possível atualizar o status da campanha.'
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignKanbanProps {
	/** Kanban columns from useCampaignKanban hook */
	columns: CampaignKanbanColumn[]
	/** Whether the initial data load is in progress */
	isLoading: boolean
	/** Callback when a campaign card is clicked */
	onCampaignClick?: (campaign: Campaign) => void
	/** Callback to update campaign status (from useCampaignMutations) */
	onUpdateStatus: (input: UpdateCampaignStatusInput) => Promise<void>
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface KanbanCardProps {
	campaign: Campaign
	isDragOverlay?: boolean
	onCampaignClick?: (campaign: Campaign) => void
}

function KanbanCard ({
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
			className={`
				group relative rounded-xl border bg-white p-3.5
				shadow-sm transition-all duration-200
				dark:bg-zinc-900 dark:border-zinc-700
				${isDragOverlay
					? 'rotate-2 scale-105 shadow-xl ring-2 ring-primary/30'
					: 'hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1'
				}
				${isDragging && !isDragOverlay ? 'opacity-30' : ''}
			`}
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

			{/* Campaign name + status */}
			<div className="mb-2.5 flex items-start justify-between gap-2 pr-4">
				<h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
					{campaign.name}
				</h4>
			</div>

			<StatusBadge
				status={campaign.status}
				className="mb-3 text-[10px]"
			/>

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
					<span className="tabular-nums">
						{campaign.created_at}
					</span>
				</div>
			</div>
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Kanban Column
// ─────────────────────────────────────────────────────────────────────────────

interface KanbanColumnComponentProps {
	column: CampaignKanbanColumn
	isOver: boolean
	onCampaignClick?: (campaign: Campaign) => void
}

function KanbanColumn ({
	column,
	isOver,
	onCampaignClick,
}: KanbanColumnComponentProps) {
	const { setNodeRef } = useDroppable({ id: column.status })
	const colors = getColumnColors(column.status)

	return (
		<div
			ref={setNodeRef}
			className={`
				flex flex-col rounded-2xl border transition-all duration-200
				bg-zinc-50/80 dark:bg-zinc-900/50 min-h-[400px]
				min-w-[260px] snap-start
				${isOver
					? `ring-2 ${colors.dropHighlight} border-transparent`
					: 'border-zinc-200/80 dark:border-zinc-700/80'
				}
			`}
			role="region"
			aria-label={`Coluna ${column.label}`}
			aria-roledescription="coluna do kanban"
		>
			{/* Column header */}
			<div
				className={`
					flex items-center justify-between rounded-t-2xl
					border-b px-4 py-3 ${colors.headerBg}
				`}
			>
				<h3
					className={`text-sm font-semibold ${colors.colorClass}`}
				>
					{column.label}
				</h3>
				<Badge
					variant="secondary"
					className="tabular-nums text-[10px] font-semibold"
				>
					{column.campaigns.length}
				</Badge>
			</div>

			{/* Cards */}
			<div
				className="flex-1 space-y-2.5 p-3 overflow-y-auto"
				role="list"
				aria-label={`Campanhas em ${column.label}`}
			>
				{column.campaigns.length === 0 && (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
							<Megaphone className="size-4 text-zinc-300 dark:text-zinc-600" />
						</div>
						<p className="text-xs text-zinc-400 dark:text-zinc-500">
							Nenhuma campanha
						</p>
					</div>
				)}
				{column.campaigns.map((campaign) => (
					<div key={campaign.uuid} role="listitem">
						<KanbanCard
							campaign={campaign}
							onCampaignClick={onCampaignClick}
						/>
					</div>
				))}
			</div>
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function KanbanSkeleton () {
	const skeletonColumns = [
		'under_review',
		'approved',
		'sent_to_creators',
		'in_progress',
		'completed',
		'refused',
	] as const

	return (
		<div
			className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-6 lg:overflow-x-visible lg:pb-0"
			role="status"
			aria-label="Carregando campanhas"
		>
			{skeletonColumns.map((status) => {
				const colors = getColumnColors(status)
				return (
					<div
						key={status}
						className="flex flex-col rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-900/50 min-h-[400px] min-w-[260px] snap-start"
					>
						<div
							className={`
								flex items-center justify-between rounded-t-2xl
								border-b px-4 py-3 ${colors.headerBg}
							`}
						>
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-5 w-6 rounded-md" />
						</div>
						<div className="space-y-2.5 p-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<div
									key={`${status}-skeleton-${index}`}
									className="rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-700 p-3.5 space-y-3"
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
				)
			})}
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kanban board for campaign management with drag-and-drop status transitions.
 *
 * Uses `@dnd-kit/core` for drag-and-drop with `PointerSensor` (8px activation
 * distance) and `KeyboardSensor` for accessibility. Status transitions are
 * validated client-side via `isValidStatusTransition` before calling the
 * mutation. The `onUpdateStatus` callback (from `useCampaignMutations`) handles
 * optimistic updates and rollback internally.
 *
 * Validates: Requirements 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 9.1, 9.2, 9.4
 */
function CampaignKanban ({
	columns,
	isLoading,
	onCampaignClick,
	onUpdateStatus,
}: CampaignKanbanProps) {
	const [activeDragId, setActiveDragId] = useState<string | null>(null)
	const [overColumnId, setOverColumnId] = useState<string | null>(null)

	// ── Flat campaigns list (for drag overlay lookup) ────────────────

	const allCampaigns = useMemo(
		() => columns.flatMap((col) => col.campaigns),
		[columns],
	)

	// ── Active drag campaign (for overlay) ───────────────────────────

	const activeDragCampaign = useMemo(() => {
		if (!activeDragId) return null
		return allCampaigns.find(
			(c) => c.uuid === activeDragId,
		) ?? null
	}, [activeDragId, allCampaigns])

	// ── DnD sensors ──────────────────────────────────────────────────

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(KeyboardSensor),
	)

	// ── Drag handlers ────────────────────────────────────────────────

	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveDragId(String(event.active.id))
	}, [])

	const handleDragOver = useCallback((event: DragOverEvent) => {
		setOverColumnId(
			event.over ? String(event.over.id) : null,
		)
	}, [])

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			setActiveDragId(null)
			setOverColumnId(null)

			const campaignUuid = String(event.active.id)
			const currentStatus = event.active.data.current
				?.currentStatus as CampaignStatusValue | undefined
			const targetStatus = event.over?.id as
				CampaignStatusValue | undefined

			if (!campaignUuid || !currentStatus || !targetStatus) {
				return
			}

			// Same column — no-op
			if (currentStatus === targetStatus) return

			// Validate transition client-side
			if (!isValidStatusTransition(currentStatus, targetStatus)) {
				toast.error(
					`Transição inválida: não é possível mover de "${CAMPAIGN_STATUS_LABELS[currentStatus]}" para "${CAMPAIGN_STATUS_LABELS[targetStatus]}".`,
				)
				return
			}

			// Call mutation — hook handles optimistic update + rollback
			try {
				await onUpdateStatus({
					campaignUuid,
					status: targetStatus,
				})
				toast.success('Status atualizado com sucesso.')
			} catch (error) {
				toast.error(parseApiErrorMessage(error))
			}
		},
		[onUpdateStatus],
	)

	const handleDragCancel = useCallback(() => {
		setActiveDragId(null)
		setOverColumnId(null)
	}, [])

	// ── Loading state ────────────────────────────────────────────────

	if (isLoading) {
		return <KanbanSkeleton />
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
				className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-6 lg:overflow-x-visible lg:pb-0"
				role="region"
				aria-label="Kanban de campanhas"
				aria-roledescription="quadro kanban"
				aria-live="polite"
			>
				{columns.map((column) => (
					<KanbanColumn
						key={column.status}
						column={column}
						isOver={overColumnId === column.status}
						onCampaignClick={onCampaignClick}
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

export { CampaignKanban }
export type { CampaignKanbanProps }
