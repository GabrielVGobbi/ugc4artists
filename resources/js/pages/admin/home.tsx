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
import { Head, Link } from '@inertiajs/react'
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
    ExternalLink,
    ShieldCheck,
    Mail,
    CalendarDays,
    Icon,
    Music,
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
import { StatustoPresenterArray, toPresenterArray } from '@/types/app'

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
    status: StatustoPresenterArray
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

interface RecentUserItem {
    id: number
    uuid: string
    name: string
    email: string
    account_type: toPresenterArray
    account_type_value: string | null
    avatar: string | null
    email_verified: boolean
    created_at: string
    created_at_formatted: string
}

interface RecentUsersResponse {
    summary: {
        total_today: number
        total_this_month: number
        total: number
    }
    data: RecentUserItem[]
}

interface RecentWaitlistItem {
    id: number
    stage_name: string
    contact_email: string
    city_state: string | null
    creation_availability: string
    artist_types: string[]
    email_sent: boolean
    created_at: string
    created_at_formatted: string
}

interface RecentWaitlistResponse {
    summary: {
        total_today: number
        total_this_month: number
        total: number
    }
    data: RecentWaitlistItem[]
}

interface CampaignStatusItem {
    status: string
    label: string
    amount_cents: number
    color: string
}

interface PlatformBreakdownItem {
    platform: string
    amount_cents: number
    percentage: number
    color: string
}

interface CampaignsStatsResponse {
    total_allocated_cents: number
    growth_rate: number
    status_breakdown: CampaignStatusItem[]
    platform_breakdown: PlatformBreakdownItem[]
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

const ACCOUNT_TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    artist: { bg: 'bg-violet-50 border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
    brand: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    company: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    admin: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
}

function getAccountTypeStyle(value: string | null) {
    if (!value) return { bg: 'bg-zinc-50 border-zinc-200', text: 'text-zinc-600', dot: 'bg-zinc-400' }
    return ACCOUNT_TYPE_STYLES[value] ?? { bg: 'bg-zinc-50 border-zinc-200', text: 'text-zinc-600', dot: 'bg-zinc-400' }
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
}

const AVATAR_GRADIENTS = [
    'from-violet-400 to-purple-600',
    'from-blue-400 to-cyan-600',
    'from-emerald-400 to-teal-600',
    'from-orange-400 to-red-500',
    'from-pink-400 to-rose-600',
    'from-amber-400 to-yellow-600',
    'from-indigo-400 to-blue-600',
    'from-teal-400 to-emerald-600',
]

function getAvatarGradient(id: number): string {
    //return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length]
    return 'from-amber-400 to-yellow-600';
}

function UserAvatar({ user }: { user: RecentUserItem }) {
    if (user.avatar) {
        return (
            <img
                src={user.avatar}
                alt={user.name}
                className="size-9 rounded-full object-cover ring-2 ring-white"
            />
        )
    }
    return (
        <div
            className={`size-9 rounded-full bg-gradient-to-br ${getAvatarGradient(user.id)} flex items-center justify-center ring-2 ring-white`}
        >
            <span className="text-[11px] font-bold text-white">
                {getInitials(user.name)}
            </span>
        </div>
    )
}

function RecentUsersSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 animate-pulse">
                    <div className="size-9 rounded-full bg-zinc-100 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="h-3 bg-zinc-100 rounded w-2/5" />
                        <div className="h-2.5 bg-zinc-100 rounded w-3/5" />
                    </div>
                    <div className="h-5 w-16 bg-zinc-100 rounded-full shrink-0" />
                </div>
            ))}
        </div>
    )
}

function RecentUsersWidget() {
    const query = useQuery({
        queryKey: ['admin-dashboard-recent-users'],
        queryFn: async () => {
            const res = await http.get<RecentUsersResponse>(
                '/api/v1/admin/dashboard/recent-users',
                { params: { limit: 8 } },
            )
            return res.data
        },
        refetchInterval: 60_000,
    })

    const summary = query.data?.summary
    const users = query.data?.data ?? []

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-3">

                    <div>
                        <h3 className="text-base font-bold text-zinc-900 leading-tight">
                            Últimos Usuários Cadastros
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Usuários mais recentes do sistema
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => query.refetch()}
                        disabled={query.isFetching}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-40"
                        aria-label="Atualizar lista de usuários"
                    >
                        <RefreshCw className={`size-3.5 ${query.isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                        aria-label="Ver todos os usuários"
                    >
                        Ver todos
                        <ExternalLink className="size-3" />
                    </Link>
                </div>
            </div>

            {/* Summary pills */}
            {summary && (
                <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50/60 border-b border-zinc-100">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <CalendarDays className="size-3.5 text-zinc-400" />
                        <span className="font-semibold text-zinc-900">{summary.total_today}</span>
                        <span>hoje</span>
                    </div>
                    <span className="text-zinc-200">·</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <span className="font-semibold text-zinc-900">{summary.total_this_month}</span>
                        <span>este mês</span>
                    </div>
                    <span className="text-zinc-200">·</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <Users className="size-3.5 text-zinc-400" />
                        <span className="font-semibold text-zinc-900">{summary.total.toLocaleString('pt-BR')}</span>
                        <span>total</span>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="divide-y divide-zinc-50">
                {query.isLoading ? (
                    <div className="py-2">
                        <RecentUsersSkeleton />
                    </div>
                ) : query.isError ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400">
                        <XCircle className="size-8 text-rose-300" />
                        <p className="text-sm">Falha ao carregar usuários</p>
                        <button
                            type="button"
                            onClick={() => query.refetch()}
                            className="text-xs text-zinc-500 underline hover:text-zinc-800"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400">
                        <Users className="size-8" />
                        <p className="text-sm">Nenhum usuário cadastrado ainda</p>
                    </div>
                ) : (
                    users.map((user) => {
                        return (
                            <div
                                key={user.id}
                                className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50/70 transition-colors group"
                            >
                                <div className="relative shrink-0">
                                    <UserAvatar user={user} />
                                    {user.email_verified && (
                                        <span
                                            className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-white flex items-center justify-center"
                                            title="E-mail verificado"
                                        >
                                            <ShieldCheck className="size-2.5 text-emerald-500" />
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-zinc-900 truncate leading-tight">
                                        {user.name}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                        {user.email}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    {user.account_type && (
                                        <Badge className={`${user.account_type.classes} gap-1 border`}>
                                            {user.account_type.label}
                                        </Badge>
                                    )}
                                    <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                                        {user.created_at}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Footer */}
            {!query.isLoading && users.length > 0 && (
                <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/40">
                    <Link
                        href="/admin/users"
                        className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors w-full"
                        aria-label="Ver todos os usuários cadastrados"
                    >
                        Ver todos os usuários cadastrados
                        <ArrowUpRight className="size-3" />
                    </Link>
                </div>
            )}
        </div>
    )
}

function WaitlistAvatar({ registration }: { registration: RecentWaitlistItem }) {
    return (
        <div
            className={`size-9 rounded-full bg-gradient-to-br ${getAvatarGradient(registration.id)} flex items-center justify-center ring-2 ring-white`}
        >
            <span className="text-[11px] font-bold text-white">
                {getInitials(registration.stage_name)}
            </span>
        </div>
    )
}

function RecentWaitlistSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 animate-pulse">
                    <div className="size-9 rounded-full bg-zinc-100 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="h-3 bg-zinc-100 rounded w-2/5" />
                        <div className="h-2.5 bg-zinc-100 rounded w-3/5" />
                    </div>
                    <div className="h-5 w-16 bg-zinc-100 rounded-full shrink-0" />
                </div>
            ))}
        </div>
    )
}

const AVAILABILITY_LABELS: Record<string, string> = {
    immediate: 'Imediato',
    '1-2_weeks': '1-2 semanas',
    '1_month': '1 mês',
    not_sure: 'Não tenho certeza',
}

function RecentWaitlistWidget() {
    const query = useQuery({
        queryKey: ['admin-dashboard-recent-waitlist'],
        queryFn: async () => {
            const res = await http.get<RecentWaitlistResponse>(
                '/api/v1/admin/dashboard/recent-waitlist',
                { params: { limit: 8 } },
            )
            return res.data
        },
        refetchInterval: 60_000,
    })

    const summary = query.data?.summary
    const registrations = query.data?.data ?? []

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 leading-tight">
                            Últimos Cadastros na Waitlist
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Artistas mais recentes na lista de espera
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => query.refetch()}
                        disabled={query.isFetching}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-40"
                        aria-label="Atualizar lista de waitlist"
                    >
                        <RefreshCw className={`size-3.5 ${query.isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        href="/admin/waitlist"
                        className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                        aria-label="Ver todos os cadastros"
                    >
                        Ver todos
                        <ExternalLink className="size-3" />
                    </Link>
                </div>
            </div>

            {/* Summary pills */}
            {summary && (
                <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50/60 border-b border-zinc-100">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <CalendarDays className="size-3.5 text-zinc-400" />
                        <span className="font-semibold text-zinc-900">{summary.total_today}</span>
                        <span>hoje</span>
                    </div>
                    <span className="text-zinc-200">·</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <span className="font-semibold text-zinc-900">{summary.total_this_month}</span>
                        <span>este mês</span>
                    </div>
                    <span className="text-zinc-200">·</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <Music className="size-3.5 text-zinc-400" />
                        <span className="font-semibold text-zinc-900">{summary.total.toLocaleString('pt-BR')}</span>
                        <span>total</span>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="divide-y divide-zinc-50">
                {query.isLoading ? (
                    <div className="py-2">
                        <RecentWaitlistSkeleton />
                    </div>
                ) : query.isError ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400">
                        <XCircle className="size-8 text-rose-300" />
                        <p className="text-sm">Falha ao carregar cadastros</p>
                        <button
                            type="button"
                            onClick={() => query.refetch()}
                            className="text-xs text-zinc-500 underline hover:text-zinc-800"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400">
                        <Music className="size-8" />
                        <p className="text-sm">Nenhum cadastro na waitlist ainda</p>
                    </div>
                ) : (
                    registrations.map((registration) => {
                        return (
                            <div
                                key={registration.id}
                                className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50/70 transition-colors group"
                            >
                                <div className="relative shrink-0">
                                    <WaitlistAvatar registration={registration} />
                                    {registration.email_sent && (
                                        <span
                                            className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-white flex items-center justify-center"
                                            title="E-mail enviado"
                                        >
                                            <Mail className="size-2.5 text-emerald-500" />
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-zinc-900 truncate leading-tight">
                                        {registration.stage_name}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                        {registration.contact_email}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    {registration.creation_availability && (
                                        <Badge variant="outline" className="border-zinc-200 text-zinc-700 text-[10px]">
                                            {AVAILABILITY_LABELS[registration.creation_availability] || registration.creation_availability}
                                        </Badge>
                                    )}
                                    <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                                        {registration.created_at}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Footer */}
            {!query.isLoading && registrations.length > 0 && (
                <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/40">
                    <Link
                        href="/admin/waitlist"
                        className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors w-full"
                        aria-label="Ver todos os cadastros da waitlist"
                    >
                        Ver todos os cadastros da waitlist
                        <ArrowUpRight className="size-3" />
                    </Link>
                </div>
            )}
        </div>
    )
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

    const campaignsStatsQuery = useQuery({
        queryKey: ['admin-dashboard-campaigns-stats'],
        queryFn: async () => {
            const res = await http.get<CampaignsStatsResponse>(
                '/api/v1/admin/dashboard/campaigns-stats',
            )
            return res.data
        },
        refetchInterval: 60_000,
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
                        <Badge className={`${info.bg} ${row.status.classes} gap-1 border`}>
                            <StatusIcon className="size-3" />
                            {row.status.label}
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

    // Campaign stats data
    const campaignsStats = campaignsStatsQuery.data
    const statusBreakdown = campaignsStats?.status_breakdown ?? []
    const platformBreakdown = campaignsStats?.platform_breakdown ?? []
    const totalAllocated = campaignsStats?.total_allocated_cents ?? 0
    const growthRate = campaignsStats?.growth_rate ?? 0

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl px-5 pt-5 space-y-7">

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

                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <section
                            aria-label="Status das campanhas"
                            className="rounded-2xl border border-zinc-200/80"
                        >
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Status das Campanhas</h3>
                                    <button
                                        type="button"
                                        onClick={() => campaignsStatsQuery.refetch()}
                                        className="px-3 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        {campaignsStatsQuery.isFetching ? 'Atualizando...' : 'Atualizar'}
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-1">Total alocado</p>
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="text-3xl font-bold text-gray-900">
                                            {formatCurrency(totalAllocated)}
                                        </h4>
                                        {growthRate !== 0 && (
                                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                                growthRate > 0
                                                    ? 'text-green-600 bg-green-50'
                                                    : 'text-red-600 bg-red-50'
                                            }`}>
                                                {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {statusBreakdown.length > 0 && (
                                    <>
                                        <div className="flex h-3 rounded-full overflow-hidden mb-8">
                                            {statusBreakdown.map((item, idx) => {
                                                const percentage = totalAllocated > 0
                                                    ? (item.amount_cents / totalAllocated) * 100
                                                    : 0
                                                return percentage > 0 ? (
                                                    <div
                                                        key={idx}
                                                        className={item.color}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                ) : null
                                            })}
                                        </div>

                                        <div className="space-y-4">
                                            {statusBreakdown.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                                        <span className="text-gray-600">{item.label}</span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900">
                                                        {formatCurrency(item.amount_cents)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {statusBreakdown.length === 0 && !campaignsStatsQuery.isLoading && (
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm">Nenhuma campanha cadastrada ainda</p>
                                    </div>
                                )}

                                {campaignsStatsQuery.isLoading && (
                                    <div className="text-center py-8">
                                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section
                            aria-label="Investimento por plataforma"
                            className="rounded-2xl border border-zinc-200/80"
                        >
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <h3 className="text-lg font-bold text-gray-900 mb-5">Investimento por Plataforma</h3>

                                {platformBreakdown.length > 0 && (
                                    <div className="space-y-6">
                                        {platformBreakdown.map((item, index) => (
                                            <div key={index}>
                                                <div className="flex justify-between items-center mb-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                                        <span className="font-medium text-gray-700">
                                                            {item.platform}{' '}
                                                            <span className="text-gray-400 font-normal">
                                                                ({item.percentage.toFixed(0)}%)
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-gray-900">
                                                        {formatCurrency(item.amount_cents)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                    <div
                                                        className={`${item.color} h-1.5 rounded-full`}
                                                        style={{ width: `${item.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {platformBreakdown.length === 0 && !campaignsStatsQuery.isLoading && (
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm">Nenhum dado de plataforma disponível</p>
                                    </div>
                                )}

                                {campaignsStatsQuery.isLoading && (
                                    <div className="text-center py-8">
                                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ── Últimos Usuários Cadastrados ────────────────── */}

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <section aria-label="Últimos usuários cadastrados">
                        <RecentUsersWidget />
                    </section>

                    <section aria-label="Últimos cadastros da waitlist">
                        <RecentWaitlistWidget />
                    </section>
                </div>

            </div>
        </AppLayout>
    )
}
