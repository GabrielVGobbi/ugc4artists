import { useCallback, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Column } from '@/components/ui/data-table/types'
import type {
    Campaign,
    CampaignIndexFilters,
} from '@/types/campaign'
import type { PaginatedResponse } from '@/types'

import { StatusBadge } from './status-badge'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
})

const formatCurrency = (value: number): string =>
    currencyFormatter.format(value / 100)

const formatDate = (iso: string): string =>
    dateFormatter.format(new Date(iso))

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignTableProps {
    campaigns: PaginatedResponse<Campaign>
    filters: CampaignIndexFilters
    isLoading?: boolean
    onPreview: (campaign: Campaign) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Campaign listing table with sortable columns, server-side pagination,
 * empty state, and skeleton loading.
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 11.5
 */
function CampaignTable({
    campaigns,
    filters,
    isLoading = false,
    onPreview,
}: CampaignTableProps) {
    const { data, meta } = campaigns

    // ── Sorting ──────────────────────────────────────────────────────────

    const handleSort = useCallback(
        (columnKey: string) => {
            const isSameColumn = filters.sort_by === columnKey
            const nextDir =
                isSameColumn && filters.sort_dir === 'asc'
                    ? 'desc'
                    : 'asc'

            router.get(
                window.location.pathname,
                {
                    ...filters,
                    sort_by: columnKey,
                    sort_dir: nextDir,
                    page: 1,
                },
                { preserveState: true, preserveScroll: true },
            )
        },
        [filters],
    )

    // ── Pagination ───────────────────────────────────────────────────────

    const handlePageChange = useCallback(
        (page: number) => {
            router.get(
                window.location.pathname,
                { ...filters, page },
                { preserveState: true, preserveScroll: true },
            )
        },
        [filters],
    )

    const handlePerPageChange = useCallback(
        (perPage: number) => {
            router.get(
                window.location.pathname,
                { ...filters, per_page: perPage, page: 1 },
                { preserveState: true, preserveScroll: true },
            )
        },
        [filters],
    )

    // ── Preview handler (stop row propagation) ───────────────────────────

    const handlePreviewClick = useCallback(
        (campaign: Campaign, event: React.MouseEvent) => {
            event.stopPropagation()
            onPreview(campaign)
        },
        [onPreview],
    )

    // ── Column definitions ───────────────────────────────────────────────

    const columns: Column<Campaign>[] = useMemo(
        () => [
            {
                key: 'name',
                header: 'Campanha',
                sortable: true,
                cell: (campaign) => (
                    <div className="min-w-[160px]">
                        <span className="font-medium text-foreground line-clamp-1">
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
                    <span className="text-muted-foreground tabular-nums">
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
                                    aria-label={`Visualizar campanha ${campaign.name}`}
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

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className="space-y-0">
            <DataTable<Campaign>
                data={data}
                columns={columns}
                keyExtractor={(campaign) => campaign.id}
                isLoading={isLoading}
                emptyMessage="Nenhuma campanha encontrada"
                sortBy={filters.sort_by}
                sortDirection={filters.sort_dir}
                onSort={handleSort}
            />

            {!isLoading && meta.total > 0 && (
                <div className="border-x border-b border-sidebar-border/70 rounded-b-xl bg-background">
                    <DataTablePagination
                        currentPage={meta.current_page}
                        lastPage={meta.last_page}
                        perPage={meta.per_page}
                        total={meta.total}
                        from={meta.from}
                        to={meta.to}
                        onPageChange={handlePageChange}
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            )}
        </div>
    )
}

export { CampaignTable, formatCurrency, formatDate }
export type { CampaignTableProps }
