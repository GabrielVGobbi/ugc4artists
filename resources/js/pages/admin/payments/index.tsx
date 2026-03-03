import { Head, Link } from '@inertiajs/react'
import { Eye } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { CopyText } from '@/components/copy-text'
import { Button } from '@/components/ui/button'
import { FlexibleDataTable, type Column } from '@/components/ui/data-table'
import { useTableFilters } from '@/hooks/use-table-filters'
import type {
    DateColumn,
    FilterCategoryConfig,
    QuickFilter,
} from '@/types/filters'
import { filterValuesToQueryParams } from '@/types/filters'
import { AdminLayoutWrapper } from '@/components/admin-layout'
import { useGenericResource } from '@/hooks/resources/generic'
import { Badge } from '@/components/ui/badge'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentStatus {
    value: string
    label: string
    color: string
    icon: string
}

interface PaymentMethod {
    value: string
    label: string
    color: string
    icon: string
}

interface Payment {
    id: number
    uuid: string
    amount_formatted: string
    amount: number
    status: PaymentStatus
    payment_method: PaymentMethod | null
    gateway: string | null
    gateway_reference: string | null
    user: {
        id: number
        name: string
        email: string
        avatar: string | null
    } | null
    created_at: string
    paid_at: string | null
}

interface PageProps {
    statusOptions: Array<{ value: string; label: string; color: string }>
    methodOptions: Array<{ value: string; label: string; color: string }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Status badge color mapping
 */
const STATUS_COLORS: Record<string, string> = {
    gray: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
}

/**
 * Payment method badge color mapping
 */
const METHOD_COLORS: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    teal: 'bg-teal-100 text-teal-700 border-teal-300',
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentsIndex({ statusOptions, methodOptions }: PageProps) {
    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<string>('created_at')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    // ─────────────────────────────────────────────────────────────────────────
    // Filters Configuration
    // ─────────────────────────────────────────────────────────────────────────

    const filterCategories: FilterCategoryConfig[] = [
        {
            id: 'status',
            title: 'Status',
            type: 'multi-select',
            options: statusOptions.map(s => ({
                value: s.value,
                label: s.label,
            })),
        },
        {
            id: 'payment_method',
            title: 'Método de Pagamento',
            type: 'multi-select',
            options: methodOptions.map(m => ({
                value: m.value,
                label: m.label,
            })),
        },
        {
            id: 'gateway',
            title: 'Gateway',
            type: 'select',
            options: [
                { value: 'asaas', label: 'Asaas' },
                { value: 'stripe', label: 'Stripe' },
            ],
        },
    ]

    const dateFilterColumns: DateColumn[] = [
        { value: 'created_at', label: 'Data de Criação' },
        { value: 'paid_at', label: 'Data de Pagamento' },
    ]

    const quickFilters: QuickFilter[] = []

    // ─────────────────────────────────────────────────────────────────────────
    // Filters Hook
    // ─────────────────────────────────────────────────────────────────────────
    const filters = useTableFilters({
        categories: filterCategories,
        cacheKey: 'payments',
        cacheConfig: {
            ttl: 24 * 60 * 60 * 1000,
            version: 1,
        },
    })

    const filterParams = useMemo(() => {
        return filterValuesToQueryParams(filters.values, filterCategories)
    }, [filters.values])

    // ─────────────────────────────────────────────────────────────────────────
    // Data Fetching
    // ─────────────────────────────────────────────────────────────────────────
    const payments = useGenericResource<Payment>('admin/payments', {
        search,
        sortBy,
        sortDirection,
        filters: filterParams,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // Handlers
    // ─────────────────────────────────────────────────────────────────────────
    const handleSort = useCallback(
        (columnKey: string) => {
            if (sortBy === columnKey) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
            } else {
                setSortBy(columnKey)
                setSortDirection('asc')
            }
        },
        [sortBy]
    )

    // ─────────────────────────────────────────────────────────────────────────
    // Columns Definition
    // ─────────────────────────────────────────────────────────────────────────

    const columns: Column<Payment>[] = [
        {
            key: 'uuid',
            header: 'ID',
            cell: (payment: Payment) => (
                <div className="font-mono text-xs">
                    <CopyText text={payment.uuid}>
                        {payment.uuid.slice(0, 8)}...
                    </CopyText>
                </div>
            ),
        },
        {
            key: 'user',
            header: 'Usuário',
            cell: (payment: Payment) => (
                <div>
                    {payment.user ? (
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {payment.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{payment.user.name}</span>
                                <span className="text-xs text-muted-foreground">{payment.user.email}</span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            ),
            hideOnMobile: true,
        },
        {
            key: 'amount',
            header: 'Valor',
            sortable: true,
            cell: (payment: Payment) => (
                <span className="font-semibold text-green-600">{payment.amount_formatted}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (payment: Payment) => (
                <Badge className={`border ${STATUS_COLORS[payment.status.color] || STATUS_COLORS.gray}`}>
                    {payment.status.label}
                </Badge>
            ),
        },
        {
            key: 'payment_method',
            header: 'Método',
            cell: (payment: Payment) => (
                payment.payment_method ? (
                    <Badge className={`border ${METHOD_COLORS[payment.payment_method.color] || METHOD_COLORS.blue}`}>
                         {payment.payment_method.label}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            ),
            hideOnMobile: true,
        },
        {
            key: 'gateway',
            header: 'Gateway',
            cell: (payment: Payment) => (
                <span className="font-mono text-xs uppercase">{payment.gateway || '-'}</span>
            ),
            hideOnMobile: true,
        },
        {
            key: 'created_at',
            header: 'Criado em',
            sortable: true,
            cell: (payment: Payment) => (
                <span className="text-sm">{new Date(payment.created_at).toLocaleString('pt-BR')}</span>
            ),
            hideOnMobile: true,
        },
        {
            key: 'actions',
            header: 'Ações',
            align: 'right',
            width: '100px',
            cell: (payment: Payment) => (
                <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/payments/${payment.id}`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 hover:bg-primary/10 hover:text-primary"
                            aria-label="Ver detalhes"
                        >
                            <Eye className="size-4" />
                        </Button>
                    </Link>
                </div>
            ),
        },
    ]

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AdminLayoutWrapper title="Pagamentos">
            <Head title="Pagamentos" />

            <div className="mx-auto max-w-7xl px-4 lg:px-8 pt-5">
                <FlexibleDataTable<Payment>
                    mode="infinite-scroll"
                    resource={payments}
                    columns={columns}
                    keyExtractor={(payment) => payment.id}
                    searchConfig={{
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Buscar por UUID, referência ou usuário...',
                        className: 'sm:w-96 rounded-lg'
                    }}
                    sortConfig={{
                        sortBy,
                        sortDirection,
                        onSort: handleSort,
                    }}
                    filterConfig={{
                        categories: filters.categories,
                        values: filters.values,
                        onChange: filters.setValue,
                        onReset: filters.clearAll,
                        showDateFilter: true,
                        dateFilterColumns,
                        showActiveFilters: true,
                        quickFilters,
                        quickFiltersPosition: 'after',
                    }}
                    infiniteScrollConfig={{
                        height: 'calc(100vh - 280px)',
                        endOfListMessage: 'Todos os pagamentos foram carregados.',
                    }}
                    emptyMessage="Nenhum pagamento encontrado"
                />
            </div>
        </AdminLayoutWrapper>
    )
}
