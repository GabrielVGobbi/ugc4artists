import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Props for the DataTableEndOfList component.
 */
export interface DataTableEndOfListProps {
	/** Custom message to display (default: "Todos os itens foram carregados.") */
	message?: string

	/** Additional CSS classes */
	className?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * End of list indicator for infinite scroll tables.
 *
 * Displays a subtle message when all data has been loaded in infinite scroll mode.
 * Features a visual separator and muted text styling to indicate the end of the list
 * without being visually intrusive.
 *
 * @example
 * ```tsx
 * // Default message in Portuguese
 * <DataTableEndOfList />
 *
 * // Custom message
 * <DataTableEndOfList message="No more items to load" />
 *
 * // With custom styling
 * <DataTableEndOfList className="my-8" />
 * ```
 *
 * @requirement 6.3 - Display "End of list" indicator when all data has been loaded
 */
export function DataTableEndOfList({
	message = 'Todos os itens foram carregados.',
	className,
}: DataTableEndOfListProps) {
	return (
		<div
			className={cn(
				'flex items-center justify-center py-6',
				className
			)}
		>
			{/* Left separator line */}
			<div className="h-px flex-1 bg-border/50" />

			{/* End message
			<span className="px-4 text-sm text-muted-foreground">
				{message}
			</span>
 */}
			{/* Right separator line */}
			<div className="h-px flex-1 bg-border/50" />
		</div>
	)
}

export default DataTableEndOfList
