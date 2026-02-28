import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { ViewMode } from '@/types/campaign'
import { Kanban, LayoutList } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ViewToggleProps {
	value: ViewMode
	onChange: (mode: ViewMode) => void
	className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toggle between table and kanban view modes.
 *
 * Validates: Requirement 4.1
 */
function ViewToggle({ value, onChange, className }: ViewToggleProps) {
	const handleValueChange = (next: string) => {
		if (next === 'table' || next === 'kanban') {
			onChange(next)
		}
	}

	return (
		<TooltipProvider delayDuration={300}>
			<ToggleGroup
				type="single"
				value={value}
				onValueChange={handleValueChange}
				variant="outline"
				size="sm"
				className={className}
				aria-label="Modo de visualização"
			>
				<Tooltip>
					<TooltipTrigger asChild>
						<ToggleGroupItem
							value="table"
							aria-label="Visualização em tabela"
							aria-pressed={value === 'table'}
						>
							<LayoutList className="size-4" />
						</ToggleGroupItem>
					</TooltipTrigger>
					<TooltipContent side="bottom">Tabela</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<ToggleGroupItem
							value="kanban"
							aria-label="Visualização Kanban"
							aria-pressed={value === 'kanban'}
						>
							<Kanban className="size-4" />
						</ToggleGroupItem>
					</TooltipTrigger>
					<TooltipContent side="bottom">Kanban</TooltipContent>
				</Tooltip>
			</ToggleGroup>
		</TooltipProvider>
	)
}

export { ViewToggle }
export type { ViewToggleProps }
