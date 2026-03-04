import { useCallback } from 'react'
import { Check, LayoutGrid, RotateCcw, Settings2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { CampaignStatusValue } from '@/types/campaign'
import type { KanbanColumnOption } from '../hooks/use-kanban-columns-config'

// ─────────────────────────────────────────────────────────────────────────────
// Status dot colors
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_DOT_COLORS: Record<string, string> = {
	under_review: 'bg-amber-400',
	approved: 'bg-blue-400',
	sent_to_creators: 'bg-violet-400',
	in_progress: 'bg-emerald-400',
	completed: 'bg-zinc-400',
	refused: 'bg-rose-400',
	awaiting_payment: 'bg-orange-400',
	cancelled: 'bg-zinc-300',
	draft: 'bg-zinc-300',
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface KanbanColumnManagerProps {
	columns: KanbanColumnOption[]
	onToggleColumn: (status: CampaignStatusValue) => void
	onResetToDefault: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Popover for managing which status columns are visible in the kanban board.
 *
 * Displays a list of all available statuses with toggle switches.
 * Visible count is shown in the trigger badge.
 */
export function KanbanColumnManager({
	columns,
	onToggleColumn,
	onResetToDefault,
}: KanbanColumnManagerProps) {
	const visibleCount = columns.filter((c) => c.isVisible).length

	const handleToggle = useCallback(
		(status: CampaignStatusValue) => {
			onToggleColumn(status)
		},
		[onToggleColumn],
	)

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="hidden gap-2 text-xs font-medium"
					aria-label="Gerenciar colunas do kanban"
				>
					<Settings2 className="size-3.5" />
					<span className="hidden sm:inline">Colunas</span>
					<Badge
						variant="secondary"
						className="px-1.5 py-0 text-[10px] font-semibold tabular-nums"
					>
						{visibleCount}
					</Badge>
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-64 p-0">
				{/* Header */}
				<div className="flex items-center justify-between px-3 py-2.5 border-b">
					<div className="flex items-center gap-2">
						<LayoutGrid className="size-3.5 text-zinc-500" />
						<span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
							Colunas visíveis
						</span>
					</div>
					<button
						type="button"
						onClick={onResetToDefault}
						className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
						aria-label="Restaurar colunas padrão"
					>
						<RotateCcw className="size-3" />
						Padrão
					</button>
				</div>

				{/* Column list */}
				<div className="p-1.5 space-y-0.5 max-h-72 overflow-y-auto">
					{columns.map((col) => (
						<button
							key={col.status}
							type="button"
							className={cn(
								'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2',
								'text-xs transition-colors text-left',
								col.isVisible
									? 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
									: 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900',
							)}
							onClick={() => handleToggle(col.status)}
							aria-pressed={col.isVisible}
							aria-label={`${col.isVisible ? 'Ocultar' : 'Mostrar'} coluna ${col.label}`}
						>
							{/* Status dot */}
							<span
								className={cn(
									'size-2 rounded-full shrink-0 transition-opacity',
									STATUS_DOT_COLORS[col.status] ?? 'bg-zinc-300',
									!col.isVisible && 'opacity-30',
								)}
							/>

							{/* Label */}
							<span className="flex-1 font-medium">{col.label}</span>

							{/* Check indicator */}
							<span
								className={cn(
									'size-4 rounded flex items-center justify-center transition-all',
									col.isVisible
										? 'bg-primary text-primary-foreground'
										: 'border border-zinc-200 dark:border-zinc-700',
								)}
							>
								{col.isVisible && <Check className="size-2.5" />}
							</span>
						</button>
					))}
				</div>

				{/* Footer */}
				<div className="border-t px-3 py-2 text-[10px] text-zinc-400 dark:text-zinc-500">
					{visibleCount} de {columns.length} colunas visíveis
				</div>
			</PopoverContent>
		</Popover>
	)
}
