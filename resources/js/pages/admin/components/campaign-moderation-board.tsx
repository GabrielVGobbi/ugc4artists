import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useAdminCampaignMutations, useAdminCampaigns, useCreatorOptions } from '@/hooks/use-admin-campaigns'
import { useDebounce } from '@/hooks/use-debounce'
import type { Campaign, CampaignStatus } from '@/types/campaign'
import { useQueryClient } from '@tanstack/react-query'
import {
    DndContext,
    type DragEndEvent,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    CreditCard,
    DollarSign,
    MoveRight,
    Search,
    User,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react'
import { type ComponentType, useMemo, useState } from 'react'
import { toast } from 'sonner'

type ModerationColumn = {
    status: CampaignStatus
    title: string
    icon: ComponentType<{ className?: string }>
}

const COLUMNS: ModerationColumn[] = [
    { status: 'pending', title: 'Pendentes', icon: Clock3 },
    { status: 'approved', title: 'Aprovadas', icon: CheckCircle2 },
    { status: 'in_progress', title: 'Em andamento', icon: MoveRight },
    { status: 'completed', title: 'Concluidas', icon: UserCheck },
    { status: 'refused', title: 'Recusadas', icon: XCircle },
]

type OptimisticContext = {
    queryKey: readonly unknown[]
    previous: { data: Campaign[] } | undefined
}

function normalizeStatus(status: CampaignStatus): CampaignStatus {
    if (status === 'under_review') return 'pending'
    if (status === 'sent_to_creators') return 'approved'
    return status
}

function statusBadgeClass(status: CampaignStatus): string {
    if (status === 'pending' || status === 'under_review') return 'bg-amber-500/15 text-amber-700 border-amber-500/30'
    if (status === 'approved' || status === 'sent_to_creators') return 'bg-blue-500/15 text-blue-700 border-blue-500/30'
    if (status === 'in_progress') return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
    if (status === 'completed') return 'bg-zinc-900/15 text-zinc-800 border-zinc-500/30'
    if (status === 'refused' || status === 'cancelled') return 'bg-rose-500/15 text-rose-700 border-rose-500/30'
    return 'bg-zinc-500/15 text-zinc-700 border-zinc-500/30'
}

function statusLabel(status: CampaignStatus): string {
    if (status === 'pending' || status === 'under_review') return 'Pendente'
    if (status === 'approved' || status === 'sent_to_creators') return 'Aprovada'
    if (status === 'in_progress') return 'Em andamento'
    if (status === 'completed') return 'Concluida'
    if (status === 'refused') return 'Recusada'
    if (status === 'cancelled') return 'Cancelada'
    return status
}

function formatMoney(value: number | undefined): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value ?? 0)
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 py-2 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium text-zinc-900">{value}</span>
        </div>
    )
}

function CampaignDetailsSheet({
    campaign,
    open,
    onOpenChange,
}: {
    campaign: Campaign | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const normalizedStatus = campaign ? normalizeStatus(campaign.status.value) : null

    const paymentStatus = campaign
        ? campaign.review?.approved_at
            ? 'Pago e aprovado'
            : campaign.status.value === 'awaiting_payment'
                ? 'Aguardando pagamento'
                : campaign.review?.submitted_at
                    ? 'Pagamento enviado'
                    : 'Nao pago'
        : '-'

    const grandTotal = campaign?.summary?.grand_total ?? campaign?.total_budget ?? 0

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>Detalhes da campanha</SheetTitle>
                    <SheetDescription>
                        Visualizacao rapida para analise administrativa.
                    </SheetDescription>
                </SheetHeader>

                {!campaign && <p className="p-4 text-sm text-muted-foreground">Nenhuma campanha selecionada.</p>}

                {campaign && (
                    <div className="space-y-6 px-4 pb-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-lg font-semibold text-zinc-900">{campaign.name}</h3>
                                <Badge className={statusBadgeClass(normalizedStatus ?? campaign.status.value)}>
                                    {statusLabel(campaign.status.value)}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Slug: {campaign.slug}</p>
                        </div>

                        <section className="rounded-xl border bg-zinc-50 p-3">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800">
                                <User className="size-4" /> Quem criou
                            </div>
                            <InfoRow label="Nome" value={campaign.user?.name ?? 'Nao informado'} />
                            <InfoRow label="Instagram" value={campaign.brand_instagram ?? 'Nao informado'} />
                            <InfoRow label="Criada em" value={campaign.created_at ? new Date(campaign.created_at).toLocaleString('pt-BR') : '-'} />
                        </section>

                        <section className="rounded-xl border bg-zinc-50 p-3">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800">
                                <DollarSign className="size-4" /> Orcamento
                            </div>
                            <InfoRow label="Vagas" value={String(campaign.slots_to_approve)} />
                            <InfoRow label="Valor por creator" value={formatMoney(campaign.price_per_influencer)} />
                            <InfoRow label="Taxa de publicacao" value={formatMoney(campaign.publication_fee)} />
                            <InfoRow label="Total estimado" value={formatMoney(campaign.summary?.estimated_total)} />
                            <InfoRow label="Total geral" value={formatMoney(grandTotal)} />
                        </section>

                        <section className="rounded-xl border bg-zinc-50 p-3">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800">
                                <CreditCard className="size-4" /> Pagamento e revisao
                            </div>
                            <InfoRow label="Status pagamento" value={paymentStatus} />
                            <InfoRow label="Enviado para revisao" value={campaign.review?.submitted_at ?? '-'} />
                            <InfoRow label="Analisado em" value={campaign.review?.reviewed_at ?? '-'} />
                            <InfoRow label="Aprovado em" value={campaign.review?.approved_at ?? '-'} />
                            <InfoRow label="Recusado em" value={campaign.review?.rejected_at ?? '-'} />
                            <InfoRow label="Motivo recusa" value={campaign.review?.reason_for_refusal ?? campaign.review?.rejection_reason ?? '-'} />
                        </section>

                        <section className="rounded-xl border bg-zinc-50 p-3">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800">
                                <Users className="size-4" /> Creators
                            </div>
                            <InfoRow label="Aprovados" value={String(campaign.approved_creators_count ?? 0)} />
                            <div className="mt-2 space-y-2">
                                {(campaign.approved_creators ?? []).length === 0 && (
                                    <p className="text-sm text-muted-foreground">Nenhum creator aprovado.</p>
                                )}
                                {(campaign.approved_creators ?? []).map((creator) => (
                                    <div key={creator.id} className="rounded-lg border bg-white px-3 py-2">
                                        <p className="text-sm font-medium">{creator.name}</p>
                                        <p className="text-xs text-muted-foreground">{creator.email}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

function CampaignCard({
    campaign,
    onOpenDetails,
}: {
    campaign: Campaign
    onOpenDetails: (campaign: Campaign) => void
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: String(campaign.id),
        data: { campaignId: campaign.id, currentStatus: normalizeStatus(campaign.status.value) },
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    }

    const normalizedStatus = normalizeStatus(campaign.status.value)

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => {
                if (!isDragging) onOpenDetails(campaign)
            }}
            className="cursor-grab rounded-xl border border-zinc-200 bg-white p-3 shadow-sm active:cursor-grabbing"
        >
            <div className="mb-2 flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{campaign.name}</p>
                <Badge className={statusBadgeClass(normalizedStatus)}>{statusLabel(campaign.status.value)}</Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
                <p>Artista: {campaign.user?.name ?? 'Nao informado'}</p>
                <p>Slots: {campaign.slots_to_approve}</p>
                <p>Criadores aprovados: {campaign.approved_creators_count ?? 0}</p>
            </div>
        </div>
    )
}

function KanbanColumn({
    status,
    title,
    campaigns,
    onOpenDetails,
}: {
    status: CampaignStatus
    title: string
    campaigns: Campaign[]
    onOpenDetails: (campaign: Campaign) => void
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status })

    return (
        <div ref={setNodeRef} className={`rounded-2xl border bg-zinc-50 p-3 ${isOver ? 'border-primary' : 'border-zinc-200'}`}>
            <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-800">{title}</h4>
                <Badge variant="secondary">{campaigns.length}</Badge>
            </div>
            <div className="space-y-2">
                {campaigns.length === 0 && <p className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground">Sem campanhas</p>}
                {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} onOpenDetails={onOpenDetails} />
                ))}
            </div>
        </div>
    )
}

export function CampaignModerationBoard() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')

    const [approveOpen, setApproveOpen] = useState(false)
    const [refuseOpen, setRefuseOpen] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(false)

    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
    const [selectedCreatorIds, setSelectedCreatorIds] = useState<number[]>([])
    const [refusalReason, setRefusalReason] = useState('')

    const [creatorSearch, setCreatorSearch] = useState('')
    const debouncedCreatorSearch = useDebounce(creatorSearch, 250)

    const campaignsQuery = useAdminCampaigns({ search })
    const creatorsQuery = useCreatorOptions(debouncedCreatorSearch, approveOpen)

    const { approveCampaign, refuseCampaign, updateCampaignStatus } = useAdminCampaignMutations()

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

    const allCampaigns = useMemo(() => campaignsQuery.data ?? [], [campaignsQuery.data?.data])

    const pendingCampaigns = useMemo(
        () => allCampaigns.filter((campaign) => normalizeStatus(campaign.status.value) === 'pending'),
        [allCampaigns],
    )

    const campaignsByColumn = useMemo(() => {
        return COLUMNS.reduce<Record<string, Campaign[]>>((acc, column) => {
            acc[column.status] = allCampaigns.filter((campaign) => normalizeStatus(campaign.status.value) === column.status)
            return acc
        }, {
            pending: [],
            approved: [],
            in_progress: [],
            completed: [],
            refused: [],
        } as Record<string, Campaign[]>)
    }, [allCampaigns])

    const openDetails = (campaign: Campaign) => {
        setSelectedCampaign(campaign)
        setDetailsOpen(true)
    }

    const toggleCreator = (creatorId: number) => {
        setSelectedCreatorIds((current) =>
            current.includes(creatorId) ? current.filter((id) => id !== creatorId) : [...current, creatorId],
        )
    }

    const openApprove = (campaign: Campaign) => {
        setSelectedCampaign(campaign)
        setSelectedCreatorIds((campaign.approved_creators ?? []).map((creator) => creator.id))
        setApproveOpen(true)
    }

    const openRefuse = (campaign: Campaign) => {
        setSelectedCampaign(campaign)
        setRefusalReason(campaign.review?.rejection_reason ?? '')
        setRefuseOpen(true)
    }

    const closeModals = () => {
        setApproveOpen(false)
        setRefuseOpen(false)
        setCreatorSearch('')
        setSelectedCreatorIds([])
        setRefusalReason('')
    }

    const snapshotAllAdminCampaignQueries = (): OptimisticContext[] => {
        const entries = queryClient.getQueriesData<{ data: Campaign[] }>({ queryKey: ['admin-campaigns'] })

        return entries.map(([queryKey, previous]) => ({ queryKey, previous }))
    }

    const applyOptimisticMove = (campaignId: number, nextStatus: CampaignStatus) => {
        const normalized = normalizeStatus(nextStatus)

        queryClient.setQueriesData<{ data: Campaign[] }>({ queryKey: ['admin-campaigns'] }, (old) => {
            if (!old?.data) return old

            return {
                ...old,
                data: old.data.map((campaign) => {
                    if (campaign.id !== campaignId) return campaign

                    return {
                        ...campaign,
                        status: {
                            ...campaign.status,
                            value: normalized,
                            label: statusLabel(normalized),
                        },
                    }
                }),
            }
        })
    }

    const rollbackSnapshots = (snapshots: OptimisticContext[]) => {
        snapshots.forEach(({ queryKey, previous }) => {
            queryClient.setQueryData(queryKey, previous)
        })
    }

    const parseApiErrorMessage = (error: unknown): string => {
        if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
            return (error as { message: string }).message
        }

        if (typeof error === 'object' && error && 'errors' in error) {
            const errors = (error as { errors?: Record<string, string> }).errors
            const first = errors ? Object.values(errors)[0] : null
            if (first) return first
        }

        return 'Nao foi possivel concluir a operacao.'
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const campaignId = Number(event.active.data.current?.campaignId)
        const sourceStatus = event.active.data.current?.currentStatus as CampaignStatus | undefined
        const destinationStatus = event.over?.id as CampaignStatus | undefined

        if (!campaignId || !sourceStatus || !destinationStatus || sourceStatus === destinationStatus) {
            return
        }

        const snapshots = snapshotAllAdminCampaignQueries()
        applyOptimisticMove(campaignId, destinationStatus)

        try {
            await updateCampaignStatus.mutateAsync({ campaignId, status: destinationStatus })
            queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] })
        } catch (error) {
            rollbackSnapshots(snapshots)
            toast.error(parseApiErrorMessage(error))
        }
    }

    const onApproveCampaign = async () => {
        if (!selectedCampaign) return

        if (selectedCreatorIds.length === 0) {
            toast.error('Selecione ao menos um creator para aprovar a campanha.')
            return
        }

        try {
            await approveCampaign.mutateAsync({
                campaignId: selectedCampaign.id,
                creatorIds: selectedCreatorIds,
            })
            toast.success('Campanha aprovada com sucesso.')
            closeModals()
            queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] })
        } catch (error) {
            toast.error(parseApiErrorMessage(error))
        }
    }

    const onRefuseCampaign = async () => {
        if (!selectedCampaign) return

        const reason = refusalReason.trim()
        if (reason.length < 5) {
            toast.error('Informe uma justificativa com no minimo 5 caracteres.')
            return
        }

        try {
            await refuseCampaign.mutateAsync({
                campaignId: selectedCampaign.id,
                reason,
            })
            toast.success('Campanha recusada com sucesso.')
            closeModals()
            queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] })
        } catch (error) {
            toast.error(parseApiErrorMessage(error))
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Pendencias de triagem</CardTitle>
                    <CardDescription>Campanhas pendentes de avaliacao administrativa.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-3 flex items-center gap-2">
                        <Search className="size-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar campanha"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {campaignsQuery.isLoading && <p className="text-sm text-muted-foreground">Carregando campanhas...</p>}

                    {!campaignsQuery.isLoading && pendingCampaigns.length === 0 && (
                        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Nenhuma campanha pendente.</p>
                    )}

                    <div className="grid gap-3 md:grid-cols-2">
                        {pendingCampaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                onClick={() => openDetails(campaign)}
                                className="cursor-pointer rounded-xl border bg-white p-4 transition hover:border-primary/40"
                            >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <h4 className="font-semibold">{campaign.name}</h4>
                                    <Badge className={statusBadgeClass(campaign.status.value)}>{statusLabel(campaign.status.value)}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Artista: {campaign.user?.name ?? 'Nao informado'}</p>
                                <p className="mb-3 text-xs text-muted-foreground">Criada em: {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString('pt-BR') : '-'}</p>
                                <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                                    <Button size="sm" onClick={() => openApprove(campaign)}>
                                        Aprovar
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => openRefuse(campaign)}>
                                        Recusar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Painel Kanban de campanhas</CardTitle>
                    <CardDescription>
                        Arraste os cards entre colunas para alterar status. A interface aplica update otimista e rollback em caso de erro.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <div className="grid gap-4 lg:grid-cols-5">
                            {COLUMNS.map((column) => {
                                const Icon = column.icon
                                return (
                                    <div key={column.status} className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                            <Icon className="size-4" />
                                            {column.title}
                                        </div>
                                        <KanbanColumn
                                            status={column.status}
                                            title={column.title}
                                            campaigns={campaignsByColumn[column.status] ?? []}
                                            onOpenDetails={openDetails}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </DndContext>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="size-4" />
                        Movimentos invalidos sao revertidos automaticamente e exibem erro.
                    </div>
                </CardContent>
            </Card>

            <Dialog open={approveOpen} onOpenChange={(open) => (!open ? closeModals() : setApproveOpen(open))}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Aprovar campanha</DialogTitle>
                        <DialogDescription>
                            Selecione um ou mais creators aptos para participar da campanha.
                        </DialogDescription>
                    </DialogHeader>

                    <Input
                        placeholder="Buscar creators"
                        value={creatorSearch}
                        onChange={(event) => setCreatorSearch(event.target.value)}
                    />

                    <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
                        {creatorsQuery.isLoading && <p className="text-sm text-muted-foreground">Carregando creators...</p>}
                        {(creatorsQuery.data?.data ?? []).map((creator) => {
                            const checked = selectedCreatorIds.includes(creator.id)

                            return (
                                <label key={creator.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                                    <div>
                                        <p className="text-sm font-medium">{creator.name}</p>
                                        <p className="text-xs text-muted-foreground">{creator.email}</p>
                                    </div>
                                    <Checkbox checked={checked} onCheckedChange={() => toggleCreator(creator.id)} />
                                </label>
                            )
                        })}
                        {!creatorsQuery.isLoading && (creatorsQuery.data?.data ?? []).length === 0 && (
                            <p className="text-sm text-muted-foreground">Nenhum creator encontrado.</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closeModals}>
                            Cancelar
                        </Button>
                        <Button onClick={onApproveCampaign} disabled={approveCampaign.isPending}>
                            Confirmar aprovacao
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={refuseOpen} onOpenChange={(open) => (!open ? closeModals() : setRefuseOpen(open))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Recusar campanha</DialogTitle>
                        <DialogDescription>Informe o motivo da recusa. Esse texto fica salvo no historico.</DialogDescription>
                    </DialogHeader>

                    <Textarea
                        placeholder="Motivo da recusa"
                        value={refusalReason}
                        onChange={(event) => setRefusalReason(event.target.value)}
                        rows={5}
                    />

                    <DialogFooter>
                        <Button variant="outline" onClick={closeModals}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={onRefuseCampaign} disabled={refuseCampaign.isPending}>
                            Confirmar recusa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CampaignDetailsSheet campaign={selectedCampaign} open={detailsOpen} onOpenChange={setDetailsOpen} />
        </div>
    )
}
