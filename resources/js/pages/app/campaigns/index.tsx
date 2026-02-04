import { useState, useCallback, useEffect, useRef } from 'react'
import { Head } from '@inertiajs/react'
import { Plus, Search, LayoutGrid, List, Filter, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { useCampaigns, useCampaignMutations } from '@/hooks/use-campaigns'
import type { CampaignStatus } from '@/types/campaign'
import { CAMPAIGN_STATUS_LABELS } from '@/types/campaign'

import {
    CampaignCard,
    CampaignTableRow,
    CampaignStats,
    CampaignEmptyState,
    CampaignGridSkeleton,
    CampaignTableSkeleton,
} from './components'
import { CreateCampaignModal } from './components/create-campaign-modal'

type ViewMode = 'grid' | 'table'

export default function CampaignsIndex() {
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const loadMoreRef = useRef<HTMLDivElement>(null)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const {
        campaigns,
        isLoading,
        isFetchingMore,
        hasMore,
        loadMore,
        refetch,
        total,
    } = useCampaigns({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
    })

    const {
        deleteCampaign,
        duplicateCampaign,
        submitCampaign,
        isDeleting,
        isDuplicating,
        isSubmitting,
    } = useCampaignMutations()

    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        try {
            await refetch()
        } catch {
            toast.error('Erro ao atualizar lista.')
        } finally {
            setIsRefreshing(false)
        }
    }, [refetch])

    // Infinite scroll with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current)
        }

        return () => observer.disconnect()
    }, [hasMore, isFetchingMore, loadMore])

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return

        try {
            await deleteCampaign(deleteTarget)
            toast.success('Campanha excluída com sucesso!')
        } catch {
            toast.error('Erro ao excluir campanha.')
        } finally {
            setDeleteTarget(null)
        }
    }, [deleteTarget, deleteCampaign])

    const handleDuplicate = useCallback(async (key: string) => {
        try {
            await duplicateCampaign(key)
            toast.success('Campanha duplicada com sucesso!')
        } catch {
            toast.error('Erro ao duplicar campanha.')
        }
    }, [duplicateCampaign])

    const handleSubmit = useCallback(async (key: string) => {
        try {
            await submitCampaign(key)
            toast.success('Campanha enviada para revisão!')
        } catch {
            toast.error('Erro ao enviar campanha. Verifique se todos os campos estão preenchidos.')
        }
    }, [submitCampaign])

    const handleClearFilters = useCallback(() => {
        setSearchTerm('')
        setDebouncedSearch('')
        setStatusFilter('all')
    }, [])

    const hasFilters = debouncedSearch !== '' || statusFilter !== 'all'

    return (
        <AppLayout>
            <Head title="Campanhas" />

            <div className="space-y-8 animate-in fade-in duration-700 pb-20">
                {/* Stats */}
                <CampaignStats />

                {/* Header Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1 flex items-center gap-4 max-w-3xl">
                        {/* Search */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <Input
                                type="text"
                                placeholder="Buscar campanhas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border-border rounded-2xl py-3.5 pl-14 pr-6 text-xs font-medium focus:ring-4 focus:ring-primary/5 transition-all shadow-sm h-auto"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as CampaignStatus | 'all')}
                        >
                            <SelectTrigger className="cursor-pointer w-48 bg-white rounded-2xl h-auto py-3.5 border-border shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Filter size={14} className="text-muted-foreground" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Status</SelectItem>
                                {Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* View Toggle */}
                        <div className="flex items-center bg-white p-1 rounded-xl border border-border shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`cursor-pointer p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-secondary text-secondary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`cursor-pointer p-2.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-secondary text-secondary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing || isLoading}
                            className="cursor-pointer p-3 bg-white rounded-xl border border-border shadow-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Atualizar lista"
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {/* Create Button */}
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] flex items-center justify-center gap-2.5 hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-xl shadow-primary/15 active:scale-95 group h-auto"
                    >
                        <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        <span>Criar Campanha</span>
                    </Button>
                </div>

                {/* Results count */}
                {!isLoading && campaigns.length > 0 && (
                    <div className="hidden flex items-center justify-between">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {total} campanha{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Content Area */}
                {isLoading ? (
                    viewMode === 'grid' ? <CampaignGridSkeleton /> : <CampaignTableSkeleton />
                ) : campaigns.length > 0 ? (
                    viewMode === 'grid' ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {campaigns.map((campaign) => (
                                    <CampaignCard key={campaign.id} campaign={campaign} />
                                ))}
                            </div>

                            {/* Load More Trigger */}
                            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                                {isFetchingMore && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 size={20} className="animate-spin" />
                                        <span className="text-sm font-medium">Carregando mais...</span>
                                    </div>
                                )}
                                {!hasMore && campaigns.length > 12 && (
                                    <p className="text-sm text-muted-foreground">
                                        Você chegou ao fim da lista
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border/50 bg-muted/30">
                                                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                                    Informações
                                                </th>
                                                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                                    Financeiro
                                                </th>
                                                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                                    Engajamento
                                                </th>
                                                <th className="px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                                    Deadline
                                                </th>
                                                <th className="px-8 py-6" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {campaigns.map((campaign) => (
                                                <CampaignTableRow
                                                    key={campaign.id}
                                                    campaign={campaign}
                                                    onDelete={(key) => setDeleteTarget(key)}
                                                    onDuplicate={handleDuplicate}
                                                    onSubmit={handleSubmit}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Load More for Table */}
                                <div ref={loadMoreRef} className="h-16 flex items-center justify-center border-t border-border/50">
                                    {isFetchingMore && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span className="text-xs font-medium">Carregando mais...</span>
                                        </div>
                                    )}
                                    {hasMore && !isFetchingMore && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={loadMore}
                                            className="text-xs"
                                        >
                                            Carregar mais
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )
                ) : (
                    <CampaignEmptyState
                        hasFilters={hasFilters}
                        onClearFilters={handleClearFilters}
                    />
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Campanha?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A campanha será excluída permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Excluindo...
                                </>
                            ) : (
                                'Excluir'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Campaign Modal */}
            <CreateCampaignModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
            />
        </AppLayout>
    )
}
