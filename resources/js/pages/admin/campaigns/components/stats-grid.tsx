import {
	TrendingUp,
	AlertCircle,
	CheckCircle2,
	Clock,
	CheckCheck,
	XCircle,
} from 'lucide-react'

import type { CampaignStatsResponse } from '@/types/campaign'
import { useCampaignStats } from '../hooks/use-campaign-stats'
import { StatCard, StatCardSkeleton } from './stat-card'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StatDefinition {
	key: keyof CampaignStatsResponse
	label: string
	icon: React.ElementType
	color: string
	bgColor: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STAT_DEFINITIONS: StatDefinition[] = [
	{
		key: 'total',
		label: 'Total',
		icon: TrendingUp,
		color: 'text-primary',
		bgColor: 'bg-primary/10',
	},
	{
		key: 'under_review',
		label: 'Em Análise',
		icon: AlertCircle,
		color: 'text-amber-600',
		bgColor: 'bg-amber-50',
	},
	{
		key: 'approved',
		label: 'Aprovadas',
		icon: CheckCircle2,
		color: 'text-blue-600',
		bgColor: 'bg-blue-50',
	},
	{
		key: 'active',
		label: 'Ativas',
		icon: Clock,
		color: 'text-emerald-600',
		bgColor: 'bg-emerald-50',
	},
	{
		key: 'completed',
		label: 'Finalizadas',
		icon: CheckCheck,
		color: 'text-green-600',
		bgColor: 'bg-green-50',
	},
	{
		key: 'refused',
		label: 'Recusadas',
		icon: XCircle,
		color: 'text-red-600',
		bgColor: 'bg-red-50',
	},
]

const SKELETON_COUNT = STAT_DEFINITIONS.length

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a responsive grid of campaign statistics cards.
 *
 * Fetches stats from the server via `useCampaignStats` and displays
 * skeleton placeholders while loading. Shows 6 cards: Total, Em Análise,
 * Aprovadas, Ativas, Finalizadas, and Recusadas.
 *
 * Validates: Requirements 1.1, 1.2, 6.1, 6.2, 6.3
 *
 * @example
 * <StatsGrid />
 */
function StatsGrid() {
	const { data, isLoading } = useCampaignStats()

	if (isLoading || !data) {
		return (
			<div
				className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
				aria-busy="true"
				aria-label="Carregando estatísticas de campanhas"
			>
				{Array.from({ length: SKELETON_COUNT }, (_, index) => (
					<StatCardSkeleton key={index} />
				))}
			</div>
		)
	}

	return (
		<div
			className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
			role="region"
			aria-label="Estatísticas de campanhas"
		>
			{STAT_DEFINITIONS.map((stat) => (
				<StatCard
					key={stat.key}
					icon={stat.icon}
					label={stat.label}
					value={data[stat.key]}
					color={stat.color}
					bgColor={stat.bgColor}
				/>
			))}
		</div>
	)
}

export { StatsGrid }
