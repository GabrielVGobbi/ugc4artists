import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
	/** Lucide icon component to display */
	icon: React.ElementType
	/** Label text shown above the value */
	label: string
	/** Numeric value to display */
	value: number
	/** Tailwind text color class for the icon (e.g. "text-primary") */
	color: string
	/** Tailwind background color class for the icon container */
	bgColor: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Skeleton placeholder for a StatCard while data is loading.
 */
function StatCardSkeleton() {
	return (
		<Card className="p-4 border-border">
			<div className="flex items-center gap-3">
				<Skeleton className="size-10 rounded-lg" />
				<div className="flex-1 min-w-0 space-y-1.5">
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-7 w-12" />
				</div>
			</div>
		</Card>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Displays a single campaign statistic with an icon, label, and value.
 *
 * Validates: Requirements 1.1, 6.1
 *
 * @example
 * <StatCard
 *   icon={TrendingUp}
 *   label="Total"
 *   value={42}
 *   color="text-primary"
 *   bgColor="bg-primary/10"
 * />
 */
function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
	return (
		<Card className="p-4 border-border">
			<div className="flex items-center gap-3">
				<div
					className={`flex items-center justify-center size-10 rounded-lg ${bgColor}`}
				>
					<Icon className={`size-5 ${color}`} strokeWidth={2} />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-xs font-medium text-muted-foreground">
						{label}
					</p>
					<p className="text-2xl font-bold text-foreground">
						{value}
					</p>
				</div>
			</div>
		</Card>
	)
}

export { StatCard, StatCardSkeleton }
export type { StatCardProps }
