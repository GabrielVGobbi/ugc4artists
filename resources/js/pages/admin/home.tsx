import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    DataTable,
    DataTablePagination,
    type Column,
} from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { http } from '@/lib/http'
import AppLayout from '@/layouts/app2-layout'
import { CampaignModerationBoard } from '@/pages/admin/components/campaign-moderation-board'
import { type BreadcrumbItem } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { Head } from '@inertiajs/react'
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    DollarSign,
    RefreshCw,
    Search,
    TrendingUp,
    UserPlus,
    Users,
    Wallet,
    Zap,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
} from 'lucide-react'
import { useMemo, useState, useCallback } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type DashboardPeriod = 'day' | 'week' | 'month' | 'custom'

interface DashboardFilterState {
    period: DashboardPeriod
    startDate: string
    endDate: string
    search: string
    page: number
    perPage: number
}

interface PaymentRow {
    id: number
    uuid: string
    user_name: string | null
    user_email: string | null
    status: string
    payment_method: string | null
    gateway: string | null
    amount_cents: number
    gateway_amount_cents: number
    wallet_applied_cents: number
    due_date: string | null
    paid_at: string | null
    created_at: string | null
}

interface WaitlistRow {
    id: number
    stage_name: string
    contact_email: string
    city_state: string | null
    creation_availability: string
    artist_types: string[]
    participation_types: string[]
    created_at: string | null
}

interface ApiTableMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

interface StatusBreakdownItem {
    status: string
    total: number
    amount_cents: number
}

interface AvailabilityBreakdownItem {
    creation_availability: string
    total: number
}

interface PaymentsResponse {
    summary: {
        total_payments: number
        paid_payments: number
        pending_payments: number
        failed_payments: number
        paid_revenue_cents: number
        wallet_applied_cents: number
        gateway_amount_cents: number
        average_ticket_cents: number
        paid_conversion_rate: number
        status_breakdown?: StatusBreakdownItem[]
    }
    series: Array<{
        date: string
        payments_count: number
        paid_revenue_cents: number
    }>
    table: {
        data: PaymentRow[]
        meta: ApiTableMeta
    }
}

interface WaitlistResponse {
    summary: {
        total_registrations: number
        unique_emails: number
        registrations_today: number
        availability_breakdown?: AvailabilityBreakdownItem[]
    }
    series: Array<{
        date: string
        registrations_count: number
    }>
    table: {
        data: WaitlistRow[]
        meta: ApiTableMeta
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '' },
]

const PERIOD_OPTIONS: {
    label: string
    value: DashboardPeriod
}[] = [
        { label: 'Hoje', value: 'day' },
        { label: 'Semana', value: 'week' },
        { label: 'Mês', value: 'month' },
        { label: 'Período', value: 'custom' },
    ]

const STATUS_MAP: Record<string, {
    label: string
    color: string
    bg: string
    icon: typeof CheckCircle2
}> = {
    paid: {
        label: 'Pago',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
        icon: CheckCircle2,
    },
    pending: {
        label: 'Pendente',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
        icon: Clock,
    },
    requires_action: {
        label: 'Ação necessária',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
        icon: AlertTriangle,
    },
    draft: {
        label: 'Rascunho',
        color: 'text-zinc-600',
        bg: 'bg-zinc-50 border-zinc-200',
        icon: Clock,
    },
    failed: {
        label: 'Falhou',
        color: 'text-rose-700',
        bg: 'bg-rose-50 border-rose-200',
        icon: XCircle,
    },
    canceled: {
        label: 'Cancelado',
        color: 'text-zinc-600',
        bg: 'bg-zinc-100 border-zinc-300',
        icon: XCircle,
    },
    refunded: {
        label: 'Reembolsado',
        color: 'text-violet-700',
        bg: 'bg-violet-50 border-violet-200',
        icon: ArrowDownRight,
    },
}

const PIE_COLORS = [
    '#059669', '#d97706', '#e11d48',
    '#7c3aed', '#0891b2', '#64748b',
]

const MONEY_FMT = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
})

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
})

function formatCurrency(cents: number): string {
    return MONEY_FMT.format((cents ?? 0) / 100)
}

function formatDate(date: string | null): string {
    if (!date) return '—'
    return DATE_FMT.format(new Date(date))
}

function getStatusInfo(status: string) {
    return STATUS_MAP[status] ?? {
        label: status,
        color: 'text-zinc-600',
        bg: 'bg-zinc-50 border-zinc-200',
        icon: Activity,
    }
}

function buildFilterParams(
    filters: DashboardFilterState,
): Record<string, string | number> {
    const params: Record<string, string | number> = {
        period: filters.period,
        page: filters.page,
        per_page: filters.perPage,
    }
    if (filters.search.trim().length > 0) {
        params.search = filters.search.trim()
    }
    if (filters.period === 'custom') {
        if (filters.startDate) params.start_date = filters.startDate
        if (filters.endDate) params.end_date = filters.endDate
    }
    return params
}

function paginationBounds(meta: ApiTableMeta) {
    if (meta.total === 0) return { from: null, to: null }
    const from = (meta.current_page - 1) * meta.per_page + 1
    const to = Math.min(
        meta.current_page * meta.per_page,
        meta.total,
    )
    return { from, to }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface MetricCardProps {
    label: string
    value: string | number
    icon: typeof DollarSign
    accent?: string
    trend?: number | null
    subtitle?: string
}

function MetricCard({
    label,
    value,
    icon: Icon,
    accent = 'bg-primary/10 text-primary',
    trend = null,
    subtitle,
}: MetricCardProps) {
    const isPositive = trend !== null && trend >= 0
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50">
            <div className="absolute -right-4 -top-4 size-24 rounded-full bg-gradient-to-br from-zinc-100/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                        {label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-zinc-900 xl:text-3xl">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-zinc-500">{subtitle}</p>
                    )}
                    {trend !== null && (
                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isPositive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                            }`}>
                            {isPositive
                                ? <ArrowUpRight className="size-3" />
                                : <ArrowDownRight className="size-3" />
                            }
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div className={`hidden rounded-xl p-2.5 ${accent}`}>
                    <Icon className="size-5" />
                </div>
            </div>

        </div>
    )
}

interface PeriodSelectorProps {
    value: DashboardPeriod
    onChange: (period: DashboardPeriod) => void
}

function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
    return (
        <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50/50 p-1">
            {PERIOD_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${value === opt.value
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                    aria-label={`Filtrar por ${opt.label}`}
                    tabIndex={0}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    )
}

interface SectionHeaderProps {
    title: string
    subtitle?: string
    icon: typeof TrendingUp
    iconColor?: string
    children?: React.ReactNode
}

function SectionHeader({
    title,
    subtitle,
    icon: Icon,
    iconColor = 'text-primary',
    children,
}: SectionHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-zinc-900 p-2">
                    <Icon className={`size-4 ${iconColor}`} />
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm text-zinc-500">{subtitle}</p>
                    )}
                </div>
            </div>
            {children && (
                <div className="flex flex-wrap items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
    backgroundColor: '#18181b',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
    fontSize: '12px',
    color: '#fafafa',
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: DashboardFilterState = {
    period: 'month',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    perPage: 10,
}

export default function Dashboard() {
    const [paymentFilters, setPaymentFilters] =
        useState<DashboardFilterState>({ ...DEFAULT_FILTERS })
    const [waitlistFilters, setWaitlistFilters] =
        useState<DashboardFilterState>({ ...DEFAULT_FILTERS })

    // ── Data fetching ──────────────────────────────────────────────────
    const paymentsQuery = useQuery({
        queryKey: ['admin-dashboard-payments', paymentFilters],
        queryFn: async () => {
            const res = await http.get<PaymentsResponse>(
                '/api/v1/admin/dashboard/payments',
                { params: buildFilterParams(paymentFilters) },
            )
            return res.data
        },
    })

    const waitlistQuery = useQuery({
        queryKey: ['admin-dashboard-waitlist', waitlistFilters],
        queryFn: async () => {
            const res = await http.get<WaitlistResponse>(
                '/api/v1/admin/dashboard/waitlist',
                { params: buildFilterParams(waitlistFilters) },
            )
            return res.data
        },
    })

    // ── Handlers ───────────────────────────────────────────────────────
    const handlePaymentPeriodChange = useCallback(
        (period: DashboardPeriod) => {
            setPaymentFilters((prev) => ({
                ...prev,
                period,
                page: 1,
            }))
        },
        [],
    )

    const handleWaitlistPeriodChange = useCallback(
        (period: DashboardPeriod) => {
            setWaitlistFilters((prev) => ({
                ...prev,
                period,
                page: 1,
            }))
        },
        [],
    )

    const handlePaymentSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setPaymentFilters((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
            }))
        },
        [],
    )

    const handleWaitlistSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setWaitlistFilters((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
            }))
        },
        [],
    )

    const handlePaymentPageChange = useCallback(
        (page: number) => {
            setPaymentFilters((prev) => ({ ...prev, page }))
        },
        [],
    )

    const handlePaymentPerPageChange = useCallback(
        (perPage: number) => {
            setPaymentFilters((prev) => ({
                ...prev,
                perPage,
                page: 1,
            }))
        },
        [],
    )

    const handleWaitlistPageChange = useCallback(
        (page: number) => {
            setWaitlistFilters((prev) => ({ ...prev, page }))
        },
        [],
    )

    const handleWaitlistPerPageChange = useCallback(
        (perPage: number) => {
            setWaitlistFilters((prev) => ({
                ...prev,
                perPage,
                page: 1,
            }))
        },
        [],
    )

    const handleRefreshPayments = useCallback(() => {
        paymentsQuery.refetch()
    }, [paymentsQuery])

    const handleRefreshWaitlist = useCallback(() => {
        waitlistQuery.refetch()
    }, [waitlistQuery])

    // ── Columns ────────────────────────────────────────────────────────
    const paymentColumns = useMemo<Column<PaymentRow>[]>(
        () => [
            {
                key: 'user',
                header: 'Usuário',
                cell: (row) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-zinc-900">
                            {row.user_name ?? 'Sem usuário'}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                            {row.user_email ?? '—'}
                        </span>
                    </div>
                ),
            },
            {
                key: 'status',
                header: 'Status',
                cell: (row) => {
                    const info = getStatusInfo(row.status)
                    const StatusIcon = info.icon
                    return (
                        <Badge className={`${info.bg} ${info.color} gap-1 border`}>
                            <StatusIcon className="size-3" />
                            {info.label}
                        </Badge>
                    )
                },
            },
            {
                key: 'amount_cents',
                header: 'Valor',
                cell: (row) => (
                    <span className="font-semibold tabular-nums text-zinc-900">
                        {formatCurrency(row.amount_cents)}
                    </span>
                ),
            },
            {
                key: 'wallet_applied_cents',
                header: 'Carteira',
                cell: (row) => (
                    <span className="tabular-nums text-zinc-600">
                        {formatCurrency(row.wallet_applied_cents)}
                    </span>
                ),
                hideOnMobile: true,
            },
            {
                key: 'payment_method',
                header: 'Método',
                cell: (row) => (
                    <span className="text-zinc-600">
                        {row.payment_method ?? '—'}
                    </span>
                ),
                hideOnMobile: true,
            },
            {
                key: 'created_at',
                header: 'Data',
                cell: (row) => (
                    <span className="tabular-nums text-zinc-500">
                        {formatDate(row.created_at)}
                    </span>
                ),
                hideOnMobile: true,
            },
        ],
        [],
    )

    const waitlistColumns = useMemo<Column<WaitlistRow>[]>(
        () => [
            {
                key: 'stage_name',
                header: 'Nome artístico',
                cell: (row) => (
                    <span className="font-medium text-zinc-900">
                        {row.stage_name}
                    </span>
                ),
            },
            {
                key: 'contact_email',
                header: 'Contato',
                accessorKey: 'contact_email',
                hideOnMobile: true,
            },
            {
                key: 'city_state',
                header: 'Cidade/UF',
                cell: (row) => (
                    <span className="text-zinc-600">
                        {row.city_state ?? '—'}
                    </span>
                ),
                hideOnMobile: true,
            },
            {
                key: 'creation_availability',
                header: 'Disponibilidade',
                cell: (row) => (
                    <Badge
                        variant="outline"
                        className="border-zinc-200 text-zinc-700"
                    >
                        {row.creation_availability}
                    </Badge>
                ),
            },
            {
                key: 'artist_types',
                header: 'Tipo',
                cell: (row) => (
                    <div className="flex flex-wrap gap-1">
                        {(row.artist_types ?? []).slice(0, 2).map(
                            (type) => (
                                <Badge
                                    key={type}
                                    variant="secondary"
                                    className="text-[10px]"
                                >
                                    {type}
                                </Badge>
                            ),
                        )}
                    </div>
                ),
                hideOnMobile: true,
            },
            {
                key: 'created_at',
                header: 'Cadastro',
                cell: (row) => (
                    <span className="tabular-nums text-zinc-500">
                        {formatDate(row.created_at)}
                    </span>
                ),
            },
        ],
        [],
    )

    // ── Derived data ──────────────────────────────────────────────────
    const paymentsMeta = paymentsQuery.data?.table.meta
    const waitlistMeta = waitlistQuery.data?.table.meta
    const paymentBounds = paymentsMeta
        ? paginationBounds(paymentsMeta)
        : { from: null, to: null }
    const waitlistBounds = waitlistMeta
        ? paginationBounds(waitlistMeta)
        : { from: null, to: null }

    const summary = paymentsQuery.data?.summary
    const waitlistSummary = waitlistQuery.data?.summary

    const statusPieData = useMemo(
        () =>
            (summary?.status_breakdown ?? []).map((item) => ({
                name: getStatusInfo(item.status).label,
                value: item.total,
                amount: item.amount_cents,
                status: item.status,
            })),
        [summary?.status_breakdown],
    )

    const availabilityPieData = useMemo(
        () =>
            (waitlistSummary?.availability_breakdown ?? []).map(
                (item) => ({
                    name: item.creation_availability,
                    value: item.total,
                }),
            ),
        [waitlistSummary?.availability_breakdown],
    )

    const RECENT_PROPOSALS = [
        { id: 'PRP-001', artist: 'Banda Fator X', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', campaign: 'Lançamento Single "Neon"', platform: 'TikTok', value: 'R$ 850,00' },
        { id: 'PRP-002', artist: 'DJ Clara', avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d', campaign: 'Trend Challenge "Verão"', platform: 'Reels', value: 'R$ 1.200,00' },
        { id: 'PRP-003', artist: 'MC Silva', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', campaign: 'Divulgação EP Acústico', platform: 'Shorts', value: 'R$ 500,00' },
        { id: 'PRP-004', artist: 'Ana & Vitória', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', campaign: 'Lançamento Single "Neon"', platform: 'TikTok', value: 'R$ 900,00' },
        { id: 'PRP-005', artist: 'Grupo Sambô', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', campaign: 'Cobertura de Show', platform: 'Reels', value: 'R$ 2.500,00' },
    ];

    const BUDGET_BREAKDOWN = [
        { category: 'TikTok Creators', value: 'R$ 22.900', percentage: 50, color: 'bg-black' },
        { category: 'Instagram Reels', value: 'R$ 13.740', percentage: 30, color: 'bg-[#ff7900]' },
        { category: 'YouTube Shorts', value: 'R$ 6.870', percentage: 15, color: 'bg-gray-300' },
        { category: 'Outros (Twitch, etc)', value: 'R$ 2.290', percentage: 5, color: 'bg-gray-800' },
    ];

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl pt-5 space-y-7">

                <div className="flex flex-1 flex-col gap-8 ">
                    {/* ━━━ Hero metrics ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                    <section aria-label="Métricas principais">
                        <div className="mb-6 flex items-end justify-between">

                            <PeriodSelector
                                value={paymentFilters.period}
                                onChange={handlePaymentPeriodChange}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                label="Receita aprovada"
                                value={formatCurrency(
                                    summary?.paid_revenue_cents ?? 0,
                                )}
                                icon={DollarSign}
                                accent="bg-emerald-100 text-emerald-700"
                                subtitle={`${summary?.paid_payments ?? 0} pagamentos`}
                            />
                            <MetricCard
                                label="Ticket médio"
                                value={formatCurrency(
                                    summary?.average_ticket_cents ?? 0,
                                )}
                                icon={Wallet}
                                accent="bg-cyan-100 text-cyan-700"
                            />
                            <MetricCard
                                label="Taxa de conversão"
                                value={`${summary?.paid_conversion_rate ?? 0}%`}
                                icon={Zap}
                                accent="bg-amber-100 text-amber-700"
                                subtitle={`${summary?.total_payments ?? 0} total`}
                            />
                            <MetricCard
                                label="Artistas na base"
                                value={
                                    waitlistSummary?.total_registrations ?? 0
                                }
                                icon={Users}
                                accent="bg-primary/10 text-primary"
                                subtitle={`${waitlistSummary?.registrations_today ?? 0} novos hoje`}
                            />
                        </div>
                    </section>



                </div>

                <div className=" ">

                    <div className=" grid grid-cols-1 md:grid-cols-2 gap-3">
                        <section
                            aria-label="Moderação de campanhas"
                            className="rounded-2xl border border-zinc-200/80 "
                        >
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Status das Campanhas</h3>
                                    <button className="px-3 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50">
                                        Geral
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-1">Total alocado</p>
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="text-3xl font-bold text-gray-900">R$ 45.800,00</h4>
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+5.2%</span>
                                    </div>
                                </div>

                                {/* Progress Bar Stacked */}
                                <div className="flex h-3 rounded-full overflow-hidden mb-8">
                                    <div className="bg-black w-[45%]"></div>
                                    <div className="bg-[#ff7900] w-[30%]"></div>
                                    <div className="bg-yellow-400 w-[15%]"></div>
                                    <div className="bg-gray-300 w-[10%]"></div>
                                </div>

                                {/* Legend List */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-black"></div>
                                            <span className="text-gray-600">Em Andamento</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">R$ 20.610</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#ff7900]"></div>
                                            <span className="text-gray-600">Aprovadas (Pagar)</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">R$ 13.740</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                            <span className="text-gray-600">Em Análise</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">R$ 6.870</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                            <span className="text-gray-600">Rascunho</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">R$ 4.580</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section aria-label="Moderação de campanhas"
                            className="rounded-2xl border border-zinc-200/80 ">

                            {/* Breakdown List */}
                            <div className="bg-white p-6 rounded-2xl  border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <h3 className="text-lg font-bold text-gray-900 mb-5 ">Investimento por Plataforma</h3>

                                <div className="space-y-6">
                                    {BUDGET_BREAKDOWN.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between items-center mb-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                                    <span className="font-medium text-gray-700">{item.category} <span className="text-gray-400 font-normal">({item.percentage}%)</span></span>
                                                </div>
                                                <span className="font-bold text-gray-900">{item.value}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>



                            </div>
                        </section>

                    </div>
                </div>

                <div className=" hidden ">

                    <div className=" grid grid-cols-1 md:grid-cols-2 gap-3">
                        <section
                            aria-label="Moderação de campanhas"
                            className="rounded-2xl border border-zinc-200/80 "
                        >
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Status das Campanhas</h3>
                                    <button className="px-3 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50">
                                        Geral
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-1">Total alocado</p>
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="text-3xl font-bold text-gray-900">R$ 45.800,00</h4>
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+5.2%</span>
                                    </div>
                                </div>

                                {/* Progress Bar Stacked */}
                                <div className="flex h-3 rounded-full overflow-hidden mb-8">
                                    <div className="bg-black w-[45%]"></div>
                                    <div className="bg-[#ff7900] w-[30%]"></div>
                                    <div className="bg-yellow-400 w-[15%]"></div>
                                    <div className="bg-gray-300 w-[10%]"></div>
                                </div>

                                {/* Legend List */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-black"></div>
                                            <span className="text-gray-600">Em Andamento</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">R$ 20.610</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#ff7900]"></div>
                                            <span className="text-gray-600">Aprovadas (Pagar)</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">R$ 13.740</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                            <span className="text-gray-600">Em Análise</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">R$ 6.870</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                            <span className="text-gray-600">Rascunho</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">R$ 4.580</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section aria-label="Moderação de campanhas"
                            className="rounded-2xl border border-zinc-200/80 ">

                            {/* Breakdown List */}
                            <div className="bg-white p-6 rounded-2xl  border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <h3 className="text-lg font-bold text-gray-900 mb-5 ">Investimento por Plataforma</h3>

                                <div className="space-y-6">
                                    {BUDGET_BREAKDOWN.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between items-center mb-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                                    <span className="font-medium text-gray-700">{item.category} <span className="text-gray-400 font-normal">({item.percentage}%)</span></span>
                                                </div>
                                                <span className="font-bold text-gray-900">{item.value}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>



                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
