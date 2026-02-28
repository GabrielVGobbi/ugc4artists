import { useCallback, useState } from 'react'
import { Head } from '@inertiajs/react'
import { Megaphone } from 'lucide-react'

import AppLayout from '@/layouts/app2-layout'
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

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin campaigns index page with table/kanban views, filters,
 * and preview modal support.
 *
 * Validates: Requirements 2.1, 4.1, 4.2, 4.3
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

	// ── Render ────────────────────────────────────────────────────────

	return (
		<AppLayout breadcrumbs={BREADCRUMBS}>
			<Head title="Campanhas" />

			<div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
				{/* ── Header ──────────────────────────────────────────── */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-zinc-900 p-2.5">
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight text-zinc-900">
								Campanhas
							</h1>

						</div>
					</div>

					<ViewToggle
						value={viewMode}
						onChange={handleViewModeChange}
					/>
				</div>

				{/* ── Filters ─────────────────────────────────────────── */}
				<CampaignFilters
					filters={filters}
					statusOptions={statusOptions}
				/>

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
