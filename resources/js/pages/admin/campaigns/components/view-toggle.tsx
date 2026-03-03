import { useEffect, useCallback } from 'react'
import type { ViewMode } from '@/types/campaign'
import { Kanban, LayoutList } from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'admin-campaigns-view'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ViewToggleProps {
	value: ViewMode
	onChange: (mode: ViewMode) => void
	className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const isValidViewMode = (v: unknown): v is ViewMode =>
	v === 'table' || v === 'kanban'

const readStoredMode = (): ViewMode | null => {
	try {
		const stored = sessionStorage.getItem(SESSION_KEY)
		if (isValidViewMode(stored)) {
			return stored
		}
	} catch {
		// sessionStorage unavailable (SSR or privacy mode)
	}
	return null
}

const persistMode = (mode: ViewMode): void => {
	try {
		sessionStorage.setItem(SESSION_KEY, mode)
	} catch {
		// sessionStorage unavailable
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toggle between table and kanban view modes.
 * Persists the selected mode in sessionStorage and restores it on mount.
 *
 * Validates: Requirements 7.1, 7.2, 9.1
 */
function ViewToggle({ value, onChange, className }: ViewToggleProps) {
	// Restore persisted view mode on mount
	useEffect(() => {
		const stored = readStoredMode()
		if (stored && stored !== value) {
			onChange(stored)
		}
		// Only run on mount — intentionally omitting value/onChange
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleSelect = useCallback(
		(mode: ViewMode) => {
			persistMode(mode)
			onChange(mode)
		},
		[onChange],
	)

	const options: Array<{
		mode: ViewMode
		label: string
		icon: typeof LayoutList
	}> = [
		{ mode: 'table', label: 'Tabela', icon: LayoutList },
		{ mode: 'kanban', label: 'Kanban', icon: Kanban },
	]

	return (
		<TooltipProvider delayDuration={300}>
			<div
				role="tablist"
				aria-label="Alternar modo de visualização"
				className={cn(
					'inline-flex items-center rounded-md border border-border shadow-xs',
					className,
				)}
			>
				{options.map(({ mode, label, icon: Icon }) => {
					const isSelected = value === mode

					return (
						<Tooltip key={mode}>
							<TooltipTrigger asChild>
								<button
									type="button"
									role="tab"
									aria-selected={isSelected}
									aria-label={`Visualização ${label}`}
									tabIndex={isSelected ? 0 : -1}
									onClick={() => handleSelect(mode)}
									className={cn(
										'inline-flex items-center justify-center',
										'h-8 px-2.5 text-sm font-medium',
										'cursor-pointer transition-colors',
										'first:rounded-l-md last:rounded-r-md',
										'focus-visible:outline-none focus-visible:ring-2',
										'focus-visible:ring-ring focus-visible:ring-offset-2',
										isSelected
											? 'bg-accent text-accent-foreground'
											: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
									)}
								>
									<Icon className="size-4" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								{label}
							</TooltipContent>
						</Tooltip>
					)
				})}
			</div>
		</TooltipProvider>
	)
}

export { ViewToggle, SESSION_KEY }
export type { ViewToggleProps }
