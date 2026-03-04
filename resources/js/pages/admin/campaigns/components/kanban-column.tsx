import { memo, useCallback, useEffect, useRef } from 'react'
import {
	useDroppable,
} from '@dnd-kit/core'
import {
	ChevronDown,
	ChevronRight,
	Loader2,
	Megaphone,
} from 'lucide-react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { Campaign, CampaignFilterParams, CampaignStatusValue } from '@/types/campaign'
import { CAMPAIGN_STATUS_LABELS } from '@/types/campaign'
import { useKanbanColumn } from '../hooks/use-kanban-column'

// ─────────────────────────────────────────────────────────────────────────────
// Column Color Config
// ─────────────────────────────────────────────────────────────────────────────

interface ColumnColorConfig {
	colorClass: string
	headerBg: string
	dropHighlight: string
	badgeBg: string
}

const COLUMN_COLORS: Record<string, ColumnColorConfig> = {
	under_review: {
		colorClass: 'text-amber-700 dark:text-amber-400',
		headerBg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
		dropHighlight: 'ring-amber-400',
		badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
	},
	approved: {
		colorClass: 'text-blue-700 dark:text-blue-400',
		headerBg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
		dropHighlight: 'ring-blue-400',
		badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
	},
	sent_to_creators: {
		colorClass: 'text-violet-700 dark:text-violet-400',
		headerBg: 'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800',
		dropHighlight: 'ring-violet-400',
		badgeBg: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
	},
	in_progress: {
		colorClass: 'text-emerald-700 dark:text-emerald-400',
		headerBg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
		dropHighlight: 'ring-emerald-400',
		badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
	},
	completed: {
		colorClass: 'text-zinc-700 dark:text-zinc-300',
		headerBg: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700',
		dropHighlight: 'ring-zinc-400',
		badgeBg: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
	},
	refused: {
		colorClass: 'text-rose-700 dark:text-rose-400',
		headerBg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800',
		dropHighlight: 'ring-rose-400',
		badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
	},
	awaiting_payment: {
		colorClass: 'text-orange-700 dark:text-orange-400',
		headerBg: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
		dropHighlight: 'ring-orange-400',
		badgeBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
	},
	cancelled: {
		colorClass: 'text-zinc-500 dark:text-zinc-400',
		headerBg: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/30 dark:border-zinc-700',
		dropHighlight: 'ring-zinc-300',
		badgeBg: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
	},
}

const DEFAULT_COLUMN_COLORS: ColumnColorConfig = {
	colorClass: 'text-zinc-700 dark:text-zinc-300',
	headerBg: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700',
	dropHighlight: 'ring-zinc-400',
	badgeBg: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}

const getColumnColors = (status: CampaignStatusValue): ColumnColorConfig =>
	COLUMN_COLORS[status] ?? DEFAULT_COLUMN_COLORS

// ─────────────────────────────────────────────────────────────────────────────
// Infinite Scroll Sentinel
// ─────────────────────────────────────────────────────────────────────────────

interface ScrollSentinelProps {
	hasNextPage: boolean
	isFetchingNextPage: boolean
	onIntersect: () => void
}

const ScrollSentinel = memo(function ScrollSentinel({
	hasNextPage,
	isFetchingNextPage,
	onIntersect,
}: ScrollSentinelProps) {
	const sentinelRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const el = sentinelRef.current
		if (!el || !hasNextPage) return

		// The scroll happens inside the Radix ScrollArea Viewport, not the window.
		// Walk up the DOM to find that viewport element and use it as the root
		// so IntersectionObserver fires relative to the actual scroll container.
		let scrollRoot: Element | null = el.parentElement
		while (scrollRoot && !scrollRoot.hasAttribute('data-radix-scroll-area-viewport')) {
			scrollRoot = scrollRoot.parentElement
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					onIntersect()
				}
			},
			{
				root: scrollRoot ?? null,
				threshold: 0.1,
			},
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [hasNextPage, isFetchingNextPage, onIntersect])

	if (!hasNextPage && !isFetchingNextPage) return null

	return (
		<div
			ref={sentinelRef}
			className="flex items-center justify-center py-3"
			aria-live="polite"
			aria-label="Carregando mais campanhas"
		>
			{isFetchingNextPage && (
				<Loader2 className="size-4 animate-spin text-zinc-400" />
			)}
		</div>
	)
})

// ─────────────────────────────────────────────────────────────────────────────
// Column Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function ColumnSkeleton({ colors }: { colors: ColumnColorConfig }) {
	return (
		<div className="space-y-2.5 p-3">
			{Array.from({ length: 3 }).map((_, index) => (
				<div
					key={`skeleton-${index}`}
					className="rounded-xl border bg-white dark:bg-zinc-900 dark:border-zinc-700 p-3.5 space-y-3"
				>
					<Skeleton className="h-4 w-3/4" style={{ background: colors.badgeBg.includes('amber') ? undefined : undefined }} />
					<Skeleton className="h-5 w-16 rounded-md" />
					<div className="space-y-1.5">
						<Skeleton className="h-3 w-2/3" />
						<Skeleton className="h-3 w-1/2" />
						<Skeleton className="h-3 w-1/3" />
					</div>
				</div>
			))}
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface KanbanColumnProps {
	status: CampaignStatusValue
	filterParams: CampaignFilterParams
	enabled: boolean
	isOver: boolean
	isCollapsed: boolean
	onToggleCollapse: (status: CampaignStatusValue) => void
	onCampaignClick?: (campaign: Campaign) => void
	renderCard: (campaign: Campaign) => React.ReactNode
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single kanban column with independent infinite scroll and collapse support.
 *
 * Calls `useKanbanColumn` internally — each column fetches its own paginated
 * data independently. This correctly follows React's Rules of Hooks since the
 * hook is always called at the top level of a component, not inside a loop.
 *
 * Badge shows `{loadedCount} / {totalCount}` — loaded campaigns vs server total.
 */
const KanbanColumn = memo(function KanbanColumn({
	status,
	filterParams,
	enabled,
	isOver,
	isCollapsed,
	onToggleCollapse,
	renderCard,
}: KanbanColumnProps) {
	const { setNodeRef } = useDroppable({ id: status })
	const colors = getColumnColors(status)
	const label = CAMPAIGN_STATUS_LABELS[status]

	const {
		campaigns,
		totalCount,
		loadedCount,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		fetchNextPage,
	} = useKanbanColumn({ status, filterParams, enabled })

	const handleToggleCollapse = useCallback(() => {
		onToggleCollapse(status)
	}, [onToggleCollapse, status])

	const handleFetchNextPage = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage])

	return (
		<div
			ref={setNodeRef}
			className={[
				'flex flex-col rounded-2xl border transition-all duration-200 shrink-0',
				'bg-zinc-50/80 dark:bg-zinc-900/50',
				'w-[272px] snap-start',
				// Collapsed: auto height. Expanded: fills the fixed-height board
				isCollapsed ? 'h-fit self-start' : 'h-full',
				isOver
					? `ring-2 ${colors.dropHighlight} border-transparent`
					: 'border-zinc-200/80 dark:border-zinc-700/80',
			].join(' ')}
			role="region"
			aria-label={`Coluna ${label}`}
			aria-roledescription="coluna do kanban"
			aria-expanded={!isCollapsed}
		>
			{/* Column header — shrink-0 prevents flex from compressing it */}
			<div
				className={[
					'flex items-center justify-between px-4 py-3 shrink-0',
					isCollapsed ? 'rounded-2xl border-b-0' : 'rounded-t-2xl border-b',
					colors.headerBg,
				].join(' ')}
			>
				<button
					type="button"
					className="flex items-center gap-2 min-w-0"
					onClick={handleToggleCollapse}
					aria-label={isCollapsed ? `Expandir coluna ${label}` : `Colapsar coluna ${label}`}
				>
					{isCollapsed ? (
						<ChevronRight className={`size-3.5 shrink-0 ${colors.colorClass}`} />
					) : (
						<ChevronDown className={`size-3.5 shrink-0 ${colors.colorClass}`} />
					)}
					<h3 className={`text-sm font-semibold truncate ${colors.colorClass}`}>
						{label}
					</h3>
				</button>

				{/* Badge: loaded / total */}
				<div className="flex items-center gap-1.5 shrink-0 ml-2">
					{isLoading ? (
						<Skeleton className="h-5 w-10 rounded-md" />
					) : (
						<span
							className={[
								'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5',
								'text-[10px] font-semibold tabular-nums',
								colors.badgeBg,
							].join(' ')}
							title={`${loadedCount} carregados de ${totalCount} total`}
						>
							<span>{loadedCount}</span>
							<span className="opacity-50">/</span>
							<span>{totalCount}</span>
						</span>
					)}
				</div>
			</div>

			{/* Cards (hidden when collapsed) */}
			{!isCollapsed && (
				<ScrollArea className="flex-1 min-h-0">
					<div
						className="p-3 space-y-2.5"
						role="list"
						aria-label={`Campanhas em ${label}`}
					>
						{isLoading && <ColumnSkeleton colors={colors} />}

						{!isLoading && campaigns.length === 0 && (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
									<Megaphone className="size-4 text-zinc-300 dark:text-zinc-600" />
								</div>
								<p className="text-xs text-zinc-400 dark:text-zinc-500">
									Nenhuma campanha
								</p>
							</div>
						)}

						{!isLoading &&
							campaigns.map((campaign) => (
								<div key={campaign.uuid} role="listitem">
									{renderCard(campaign)}
								</div>
							))}

						{/* Infinite scroll sentinel */}
						<ScrollSentinel
							hasNextPage={hasNextPage}
							isFetchingNextPage={isFetchingNextPage}
							onIntersect={handleFetchNextPage}
						/>
					</div>
				</ScrollArea>
			)}
		</div>
	)
})

export { KanbanColumn }
export type { KanbanColumnProps }
