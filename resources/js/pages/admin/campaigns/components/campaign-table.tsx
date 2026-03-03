import { useCallback, useMemo } from 'react'
import { Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FlexibleDataTable } from '@/components/ui/data-table'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Column } from '@/components/ui/data-table/types'
import type { UseResourceListReturn } from '@/hooks/resources/generic/use-resource-list'
import type { Campaign } from '@/types/campaign'

import { StatusBadge } from './status-badge'

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
})

const formatCurrency = (value: number): string =>
	currencyFormatter.format(value / 100)

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

interface CampaignTableProps {
	/** Resource from useCampaignTableResource hook */
	resource: UseResourceListReturn<Campaign>
	/** Callback when a campaign row is clicked */
	onCampaignClick: (campaign: Campaign) => void
}

// ─────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────

/**
 * Campaign listing table using FlexibleDataTable with infinite scroll.
 *
 * Delegates loading states (skeleton, fetching indicator, end-of-list
 * message) and error/retry handling entirely to FlexibleDataTable
 * via the `resource` prop.
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 9.3, 9.5
 */
function CampaignTable({
	resource,
	onCampaignClick,
}: CampaignTableProps) {
	// ── Row click handler ────────────────────────────────────────────

	const handleRowClick = useCallback(
		(campaign: Campaign) => {
			onCampaignClick(campaign)
		},
		[onCampaignClick],
	)

	// ── Preview button handler (stops row propagation) ───────────────

	const handlePreviewClick = useCallback(
		(campaign: Campaign, event: React.MouseEvent) => {
			event.stopPropagation()
			onCampaignClick(campaign)
		},
		[onCampaignClick],
	)

	// ── Column definitions ───────────────────────────────────────────

	const columns: Column<Campaign>[] = useMemo(
		() => [
			{
				key: 'name',
				header: 'Campanha',
				sortable: true,
				cell: (campaign) => (
					<div className="min-w-[160px]">
						<span
							className="font-medium text-foreground line-clamp-1"
						>
							{campaign.name}
						</span>
					</div>
				),
			},
			{
				key: 'user',
				header: 'Anunciante',
				hideOnMobile: true,
				cell: (campaign) => (
					<span className="text-muted-foreground">
						{campaign.user?.name ?? '—'}
					</span>
				),
			},
			{
				key: 'status',
				header: 'Status',
				cell: (campaign) => (
					<StatusBadge status={campaign.status} />
				),
			},
			{
				key: 'total_budget',
				header: 'Orçamento',
				sortable: true,
				align: 'right' as const,
				hideOnMobile: true,
				cell: (campaign) => (
					<span className="font-medium tabular-nums">
						{formatCurrency(campaign.total_budget)}
					</span>
				),
			},
			{
				key: 'slots_to_approve',
				header: 'Vagas',
				sortable: true,
				align: 'center' as const,
				hideOnMobile: true,
				cell: (campaign) => (
					<span className="tabular-nums">
						{campaign.slots_to_approve}
					</span>
				),
			},
			{
				key: 'created_at',
				header: 'Criação',
				sortable: true,
				hideOnMobile: true,
				cell: (campaign) => (
					<span
						className="text-muted-foreground tabular-nums"
					>
						{campaign.created_at}
					</span>
				),
			},
			{
				key: 'actions',
				header: 'Ações',
				align: 'center' as const,
				width: '80px',
				cell: (campaign) => (
					<TooltipProvider delayDuration={300}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-8"
									onClick={(e) =>
										handlePreviewClick(campaign, e)
									}
									aria-label={
										`Visualizar campanha ${campaign.name}`
									}
								>
									<Eye className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="left">
								Visualizar
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				),
			},
		],
		[handlePreviewClick],
	)

	// ── Render ────────────────────────────────────────────────────────

	return (
		<FlexibleDataTable<Campaign>
			mode="infinite-scroll"
			resource={resource}
			columns={columns}
			keyExtractor={(campaign) => campaign.uuid}
			onRowClick={handleRowClick}
			infiniteScrollConfig={{
				height: 'calc(100vh - 320px)',
				endOfListMessage:
					'Todas as campanhas foram carregadas.',
			}}
			emptyMessage="Nenhuma campanha encontrada"
		/>
	)
}

export { CampaignTable, formatCurrency }
export type { CampaignTableProps }
