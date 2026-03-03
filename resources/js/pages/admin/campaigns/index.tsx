import { useCallback, useState } from 'react'
import { Head } from '@inertiajs/react'

import AppLayout from '@/layouts/app2-layout'
import type { BreadcrumbItem } from '@/types'
import type { Campaign, ViewMode } from '@/types/campaign'

import { ApproveDialog } from './components/approve-dialog'
import { CampaignFilters } from './components/campaign-filters'
import { CampaignKanban } from './components/campaign-kanban'
import { CampaignPreviewModal } from './components/campaign-preview-modal'
import { CampaignTable } from './components/campaign-table'
import { RejectDialog } from './components/reject-dialog'
import { StatsGrid } from './components/stats-grid'
import { ViewToggle } from './components/view-toggle'
import { useCampaignFilters } from './hooks/use-campaign-filters'
import { useCampaignKanban } from './hooks/use-campaign-kanban'
import { useCampaignMutations } from './hooks/use-campaign-mutations'
import { useCampaignTableResource } from './hooks/use-campaign-table-resource'

// ──────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Campanhas', href: '/admin/campaigns' },
]

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

/**
 * Admin campaigns index page — lightweight layout orchestrator.
 *
 * Delegates data fetching and mutations to dedicated hooks and
 * renders composed UI components for stats, filters, views,
 * and modals.
 */
export default function CampaignsIndex() {
    // ── View mode ─────────────────────────────────────────
    const [viewMode, setViewMode] = useState<ViewMode>('table')

    // ── Modal state ───────────────────────────────────────
    const [previewCampaign, setPreviewCampaign] =
        useState<Campaign | null>(null)
    const [approveCampaign, setApproveCampaign] =
        useState<Campaign | null>(null)
    const [rejectCampaign, setRejectCampaign] =
        useState<Campaign | null>(null)

    // ── Hooks ─────────────────────────────────────────────
    const {
        filters,
        filterParams,
        setSearch,
        setStatuses,
        setDateFrom,
        setDateTo,
        clearFilters,
        hasActiveFilters,
    } = useCampaignFilters()

    const resource = useCampaignTableResource({
        filterParams,
        enabled: viewMode === 'table',
    })

    const {
        columns,
        isLoading: isKanbanLoading,
    } = useCampaignKanban({
        filterParams,
        enabled: viewMode === 'kanban',
    })

    const {
        approve,
        refuse,
        updateStatus,
    } = useCampaignMutations()

    // ── View mode toggle ──────────────────────────────────
    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            setViewMode(mode)
        },
        [],
    )

    // ── Campaign click (opens preview) ────────────────────
    const handleCampaignClick = useCallback(
        (campaign: Campaign) => {
            setPreviewCampaign(campaign)
        },
        [],
    )

    const handleClosePreview = useCallback(() => {
        setPreviewCampaign(null)
    }, [])

    // ── Approve / Reject (from preview → dialog) ──────────
    const handleApprove = useCallback(
        (campaign: Campaign) => {
            setPreviewCampaign(null)
            setApproveCampaign(campaign)
        },
        [],
    )

    const handleReject = useCallback(
        (campaign: Campaign) => {
            setPreviewCampaign(null)
            setRejectCampaign(campaign)
        },
        [],
    )

    const handleCloseApprove = useCallback(() => {
        setApproveCampaign(null)
    }, [])

    const handleCloseReject = useCallback(() => {
        setRejectCampaign(null)
    }, [])

    // ── Render ─────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Campanhas" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* ── Stats ─────────────────────────────── */}
                <StatsGrid />

                {/* ── Filters + ViewToggle ──────────────── */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">
                            Filtros
                        </h3>
                        <ViewToggle
                            value={viewMode}
                            onChange={handleViewModeChange}
                        />
                    </div>

                    <CampaignFilters
                        filters={filters}
                        setSearch={setSearch}
                        setStatuses={setStatuses}
                        setDateFrom={setDateFrom}
                        setDateTo={setDateTo}
                        clearFilters={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                    />
                </div>

                {/* ── Content (Table or Kanban) ─────────── */}
                {viewMode === 'table' ? (
                    <CampaignTable
                        resource={resource}
                        onCampaignClick={handleCampaignClick}
                    />
                ) : (
                    <CampaignKanban
                        columns={columns}
                        isLoading={isKanbanLoading}
                        onCampaignClick={handleCampaignClick}
                        onUpdateStatus={updateStatus}
                    />
                )}
            </div>

            {/* ── Preview Modal ─────────────────────────── */}
            <CampaignPreviewModal
                campaign={previewCampaign}
                isOpen={previewCampaign !== null}
                onClose={handleClosePreview}
                onApprove={handleApprove}
                onReject={handleReject}
            />

            {/* ── Approve / Reject Dialogs ──────────────── */}
            <ApproveDialog
                campaign={approveCampaign}
                isOpen={approveCampaign !== null}
                onClose={handleCloseApprove}
                onApprove={approve}
            />
            <RejectDialog
                campaign={rejectCampaign}
                isOpen={rejectCampaign !== null}
                onClose={handleCloseReject}
                onRefuse={refuse}
            />
        </AppLayout>
    )
}
