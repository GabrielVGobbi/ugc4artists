import { useCallback, useMemo, useState } from 'react'
import { Head } from '@inertiajs/react'
import {
	Megaphone,
	TrendingUp,
	Clock,
	CheckCircle2,
	XCircle,
	AlertCircle,
	CheckCheck,
} from 'lucide-react'

import AppLayout from '@/layouts/app2-layout'
import { Card } from '@/components/ui/card'
import type { BreadcrumbItem, PaginatedResponse } from '@/types'
import type {
	Campaign,
	CampaignIndexFilters,
	CampaignStatusOption,
	ViewMode,
} from '@/types/campaign'

import { ApproveDialog } from './components/approve-dialog'
import { CampaignFilters } from './components/campaign-filters'
import { CampaignKanban } from './components/campaign-kanban'
import { CampaignPreviewModal } from './components/campaign-preview-modal'
import { CampaignTable } from './components/campaign-table'
import { RejectDialog } from './components/reject-dialog'
import { ViewToggle } from './components/view-toggle'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const BREADCRUMBS: BreadcrumbItem[] = [
	{ title: 'Admin', href: '/admin' },
	{ title: 'Campanhas', href: '/admin/campaigns' },
]

const SESSION_KEY = 'admin:campaigns:viewMode'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getInitialViewMode = (): ViewMode => {
	try {
		const stored = sessionStorage.getItem(SESSION_KEY)
		if (stored === 'table' || stored === 'kanban') {
			return stored
		}
	} catch {
		// sessionStorage unavailable (SSR or privacy mode)
	}
	return 'table'
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignsIndexProps {
	campaigns: PaginatedResponse<Campaign>
	filters: CampaignIndexFilters
	statusOptions: CampaignStatusOption[]
}

interface StatCardProps {
	icon: React.ElementType
	label: string
	value: number
	color: string
	bgColor: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stat card for campaign overview
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
					<p className="text-2xl font-bold text-foreground">{value}</p>
				</div>
			</div>
		</Card>
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin campaigns index page with table/kanban views, filters,
 * and preview modal support.
 *
 * Clean, modern design with stats overview.
 */
export default function CampaignsIndex({
	campaigns,
	filters,
	statusOptions,
}: CampaignsIndexProps) {
	const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode)
	const [previewCampaign, setPreviewCampaign] =
		useState<Campaign | null>(null)
	// State for approve/reject dialogs
	const [approveCampaign, setApproveCampaign] =
		useState<Campaign | null>(null)
	const [rejectCampaign, setRejectCampaign] =
		useState<Campaign | null>(null)

	// ── View mode toggle with sessionStorage persistence ─────────────

	const handleViewModeChange = useCallback((mode: ViewMode) => {
		setViewMode(mode)
		try {
			sessionStorage.setItem(SESSION_KEY, mode)
		} catch {
			// sessionStorage unavailable
		}
	}, [])

	// ── Preview handler ──────────────────────────────────────────

	const handlePreview = useCallback((campaign: Campaign) => {
		setPreviewCampaign(campaign)
	}, [])

	const handleClosePreview = useCallback(() => {
		setPreviewCampaign(null)
	}, [])

	// ── Approve / Reject handlers (prepare state for dialogs) ────

	const handleApprove = useCallback((campaign: Campaign) => {
		setPreviewCampaign(null)
		setApproveCampaign(campaign)
	}, [])

	const handleReject = useCallback((campaign: Campaign) => {
		setPreviewCampaign(null)
		setRejectCampaign(campaign)
	}, [])

	// ── Close approve/reject dialog handlers ─────────────────────

	const handleCloseApprove = useCallback(() => {
		setApproveCampaign(null)
	}, [])

	const handleCloseReject = useCallback(() => {
		setRejectCampaign(null)
	}, [])

	// ── Compute stats from campaigns data ────────────────────────

	const stats = useMemo(() => {
		const total = campaigns.meta.total || 0
		const underReview = campaigns.data.filter(
			(c) => c.status.value === 'under_review'
		).length
		const approved = campaigns.data.filter(
			(c) => c.status.value === 'approved'
		).length
		const active = campaigns.data.filter(
			(c) => c.status.value === 'sent_to_creators' || c.status.value === 'in_progress'
		).length
		const completed = campaigns.data.filter(
			(c) => c.status.value === 'completed'
		).length
		const refused = campaigns.data.filter(
			(c) => c.status.value === 'refused' || c.status.value === 'cancelled'
		).length

		return { total, underReview, approved, active, completed, refused }
	}, [campaigns])

	// ── Render ────────────────────────────────────────────────────────

	return (
		<AppLayout breadcrumbs={BREADCRUMBS}>
			<Head title="Campanhas" />

			<div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
				{/* ── Header with Stats ──────────────────────────────── */}
				<div className="space-y-4">
					{/* Stats Grid */}
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
						<StatCard
							icon={TrendingUp}
							label="Total"
							value={stats.total}
							color="text-primary"
							bgColor="bg-primary/10"
						/>
						<StatCard
							icon={AlertCircle}
							label="Em Análise"
							value={stats.underReview}
							color="text-amber-600"
							bgColor="bg-amber-50"
						/>
						<StatCard
							icon={CheckCircle2}
							label="Aprovadas"
							value={stats.approved}
							color="text-blue-600"
							bgColor="bg-blue-50"
						/>
						<StatCard
							icon={Clock}
							label="Ativas"
							value={stats.active}
							color="text-emerald-600"
							bgColor="bg-emerald-50"
						/>
						<StatCard
							icon={CheckCheck}
							label="Finalizadas"
							value={stats.completed}
							color="text-green-600"
							bgColor="bg-green-50"
						/>
						<StatCard
							icon={XCircle}
							label="Recusadas"
							value={stats.refused}
							color="text-red-600"
							bgColor="bg-red-50"
						/>
					</div>
				</div>

				{/* ── Filters with ViewToggle ─────────────────────────── */}
				<div className="bg-white rounded-2xl border border-border shadow-sm p-4 space-y-3">
					{/* Toolbar with ViewToggle */}
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-foreground">
							Filtros
						</h3>
						<ViewToggle
							value={viewMode}
							onChange={handleViewModeChange}
						/>
					</div>

					{/* Filters */}
					<CampaignFilters
						filters={filters}
						statusOptions={statusOptions}
					/>
				</div>

				{/* ── Content ─────────────────────────────────────────── */}
				{viewMode === 'table' ? (
					<CampaignTable
						campaigns={campaigns}
						filters={filters}
						onPreview={handlePreview}
					/>
				) : (
					<CampaignKanban
						filters={filters}
						onPreview={handlePreview}
					/>
				)}
			</div>

			{/* ── Preview Modal ───────────────────────────────────────── */}
			<CampaignPreviewModal
				campaign={previewCampaign}
				isOpen={previewCampaign !== null}
				onClose={handleClosePreview}
				onApprove={handleApprove}
				onReject={handleReject}
			/>

			{/* ── Approve / Reject Dialogs ────────────────────────────── */}
			{approveCampaign && (
				<ApproveDialog
					campaignId={approveCampaign.id}
					isOpen={approveCampaign !== null}
					onClose={handleCloseApprove}
				/>
			)}
			{rejectCampaign && (
				<RejectDialog
					campaignId={rejectCampaign.id}
					isOpen={rejectCampaign !== null}
					onClose={handleCloseReject}
				/>
			)}
		</AppLayout>
	)
}
