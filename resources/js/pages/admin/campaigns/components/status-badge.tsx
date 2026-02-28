import { Badge } from '@/components/ui/badge'
import type { CampaignStatusDisplay } from '@/types/campaign'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Color mapping: API color key → Tailwind classes
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_BADGE_CLASSES: Record<string, string> = {
	gray: 'bg-zinc-100 text-zinc-700 border-zinc-200',
	warning: 'bg-amber-100 text-amber-700 border-amber-200',
	info: 'bg-blue-100 text-blue-700 border-blue-200',
	success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
	danger: 'bg-rose-100 text-rose-700 border-rose-200',
}

const FALLBACK_CLASSES = 'bg-zinc-100 text-zinc-700 border-zinc-200'

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
	status: Pick<CampaignStatusDisplay, 'value' | 'label' | 'color'>
	className?: string
}

/**
 * Renders a colored badge based on the campaign status color key.
 *
 * Validates: Requirement 11.2
 */
function StatusBadge({ status, className }: StatusBadgeProps) {
	const colorClasses = STATUS_BADGE_CLASSES[status.color] ?? FALLBACK_CLASSES

	return (
		<Badge
			variant="outline"
			className={cn(colorClasses, className)}
			role="status"
			aria-label={`Status: ${status.label}`}
		>
			{status.label}
		</Badge>
	)
}

export { StatusBadge, STATUS_BADGE_CLASSES, FALLBACK_CLASSES }
export type { StatusBadgeProps }
