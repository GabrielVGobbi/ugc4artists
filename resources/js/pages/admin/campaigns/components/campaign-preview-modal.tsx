import { useCallback, useMemo } from 'react'
import { Link } from '@inertiajs/react'
import {
	Calendar,
	CheckCircle2,
	DollarSign,
	ExternalLink,
	Globe,
	Megaphone,
	Target,
	Users,
	XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { Campaign, CampaignStatusValue } from '@/types/campaign'

import { StatusBadge } from './status-badge'
import { formatCurrency } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Status transition rules (subset for approve/reject actions)
// ─────────────────────────────────────────────────────────────────────────────

const APPROVABLE_STATUSES: CampaignStatusValue[] = [
	'pending',
	'under_review',
]

const REJECTABLE_STATUSES: CampaignStatusValue[] = [
	'pending',
	'under_review',
]

const canApprove = (status: CampaignStatusValue): boolean =>
	APPROVABLE_STATUSES.includes(status)

const canReject = (status: CampaignStatusValue): boolean =>
	REJECTABLE_STATUSES.includes(status)

// ─────────────────────────────────────────────────────────────────────────────
// Content platform labels
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
	instagram: 'Instagram',
	tiktok: 'TikTok',
	youtube: 'YouTube',
	youtube_shorts: 'YouTube Shorts',
}

const formatPlatforms = (platforms: string[]): string => {
	if (platforms.length === 0) return '—'
	return platforms
		.map((p) => PLATFORM_LABELS[p] ?? p)
		.join(', ')
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignPreviewModalProps {
	campaign: Campaign | null
	isOpen: boolean
	isLoading?: boolean
	onClose: () => void
	onApprove: (campaign: Campaign) => void
	onReject: (campaign: Campaign) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface DetailRowProps {
	icon: React.ReactNode
	label: string
	children: React.ReactNode
}

function DetailRow ({ icon, label, children }: DetailRowProps) {
	return (
		<div className="flex items-start gap-3 py-2">
			<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
				{icon}
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
					{label}
				</p>
				<div className="mt-0.5 text-sm text-zinc-800">
					{children}
				</div>
			</div>
		</div>
	)
}

function PreviewSkeleton () {
	return (
		<div
			className="space-y-4"
			role="status"
			aria-label="Carregando dados da campanha"
		>
			{/* Header skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-6 w-3/4" />
				<Skeleton className="h-5 w-20 rounded-full" />
			</div>

			<div className="h-px bg-zinc-100" />

			{/* Detail rows skeleton */}
			{Array.from({ length: 6 }).map((_, index) => (
				<div
					key={`skeleton-row-${index}`}
					className="flex items-start gap-3 py-2"
				>
					<Skeleton className="size-8 rounded-lg" />
					<div className="flex-1 space-y-1.5">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</div>
			))}

			<div className="h-px bg-zinc-100" />

			{/* Footer skeleton */}
			<div className="flex gap-2">
				<Skeleton className="h-10 flex-1 rounded-2xl" />
				<Skeleton className="h-10 w-24 rounded-2xl" />
			</div>
		</div>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Preview modal for quick campaign inspection without leaving
 * the listing page. Shows summary data and contextual action
 * buttons based on the campaign status.
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 11.5
 */
function CampaignPreviewModal ({
	campaign,
	isOpen,
	isLoading = false,
	onClose,
	onApprove,
	onReject,
}: CampaignPreviewModalProps) {
	const isApprovable = useMemo(
		() => campaign !== null && canApprove(campaign.status.value),
		[campaign],
	)

	const isRejectable = useMemo(
		() => campaign !== null && canReject(campaign.status.value),
		[campaign],
	)

	const handleApprove = useCallback(() => {
		if (campaign) onApprove(campaign)
	}, [campaign, onApprove])

	const handleReject = useCallback(() => {
		if (campaign) onReject(campaign)
	}, [campaign, onReject])

	return (
		<Dialog open={isOpen} onOpenChange={(open) => {
			if (!open) onClose()
		}}>
			<DialogContent
				className="sm:max-w-lg max-h-[85vh] overflow-y-auto"
				aria-modal="true"
				aria-labelledby="campaign-preview-title"
				aria-describedby="campaign-preview-description"
			>
				{isLoading || campaign === null ? (
					<>
						<DialogHeader>
							<DialogTitle id="campaign-preview-title">
								Pré-visualização da Campanha
							</DialogTitle>
							<DialogDescription id="campaign-preview-description">
								Carregando dados da campanha...
							</DialogDescription>
						</DialogHeader>
						<PreviewSkeleton />
					</>
				) : (
					<>
						{/* ── Header ──────────────────────────── */}
						<DialogHeader>
							<div className="flex items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
									<Megaphone className="size-4 text-amber-400" />
								</div>
								<div className="min-w-0 flex-1">
									<DialogTitle
										id="campaign-preview-title"
										className="line-clamp-2 text-base"
									>
										{campaign.name}
									</DialogTitle>
									<DialogDescription
										id="campaign-preview-description"
										className="sr-only"
									>
										Pré-visualização dos dados da campanha {campaign.name}
									</DialogDescription>
									<div className="mt-1.5 flex items-center gap-2">
										<StatusBadge status={campaign.status} />
									</div>
								</div>
							</div>
						</DialogHeader>

						{/* ── Divider ─────────────────────────── */}
						<div className="h-px bg-zinc-100" />

						{/* ── Details ─────────────────────────── */}
						<div className="space-y-0.5">
							<DetailRow
								icon={<Users className="size-4" />}
								label="Anunciante"
							>
								{campaign.user?.name ?? '—'}
							</DetailRow>

							{campaign.description && (
								<DetailRow
									icon={<Megaphone className="size-4" />}
									label="Descrição"
								>
									<p className="line-clamp-3 text-zinc-600">
										{campaign.description}
									</p>
								</DetailRow>
							)}

							{campaign.objective && (
								<DetailRow
									icon={<Target className="size-4" />}
									label="Objetivo"
								>
									{campaign.objective}
								</DetailRow>
							)}

							<DetailRow
								icon={<Globe className="size-4" />}
								label="Plataformas"
							>
								{formatPlatforms(campaign.content_platforms)}
							</DetailRow>

							<DetailRow
								icon={<DollarSign className="size-4" />}
								label="Orçamento Total"
							>
								<span className="font-semibold tabular-nums">
									{formatCurrency(campaign.total_budget)}
								</span>
							</DetailRow>

							<DetailRow
								icon={<Users className="size-4" />}
								label="Vagas / Preço por Influenciador"
							>
								<span className="tabular-nums">
									{campaign.slots_to_approve} vagas
									{' · '}
									{formatCurrency(campaign.price_per_influencer)}/influenciador
								</span>
							</DetailRow>

							<DetailRow
								icon={<Calendar className="size-4" />}
								label="Datas"
							>
								<div className="space-y-0.5 text-xs text-zinc-600">
									<p>
										Criação: {campaign.created_at}
									</p>
									{campaign.applications_open_date && (
										<p>
											Abertura: {campaign.applications_open_date}
										</p>
									)}
									{campaign.applications_close_date && (
										<p>
											Encerramento: {campaign.applications_close_date}
										</p>
									)}
									{campaign.payment_date && (
										<p>
											Pagamento: {campaign.payment_date}
										</p>
									)}
								</div>
							</DetailRow>
						</div>

						{/* ── Divider ─────────────────────────── */}
						<div className="h-px bg-zinc-100" />

						{/* ── Actions ─────────────────────────── */}
						<DialogFooter className="flex-col gap-2 sm:flex-col">
							{/* Contextual action buttons */}
							{(isApprovable || isRejectable) && (
								<div className="flex w-full gap-2">
									{isApprovable && (
										<Button
											variant="default"
											size="sm"
											className="flex-1"
											onClick={handleApprove}
											aria-label={`Aprovar campanha ${campaign.name}`}
										>
											<CheckCircle2 className="size-4" />
											Aprovar
										</Button>
									)}
									{isRejectable && (
										<Button
											variant="destructive"
											size="sm"
											className="flex-1"
											onClick={handleReject}
											aria-label={`Recusar campanha ${campaign.name}`}
										>
											<XCircle className="size-4" />
											Recusar
										</Button>
									)}
								</div>
							)}

							{/* Always visible — navigate to full details */}
							<Button
								variant="outline"
								size="sm"
								className="w-full"
								asChild
							>
								<Link
									href={`/admin/campaigns/${campaign.id}`}
									aria-label={`Ver detalhes completos da campanha ${campaign.name}`}
								>
									<ExternalLink className="size-4" />
									Ver Detalhes Completos
								</Link>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}

export { CampaignPreviewModal, canApprove, canReject }
export type { CampaignPreviewModalProps }
