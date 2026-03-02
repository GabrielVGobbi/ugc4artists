import { Head, router } from '@inertiajs/react'
import { Calendar, Mail, MapPin, Music, User } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { CopyText } from '@/components/copy-text'
import { Badge } from '@/components/ui/badge'
import { FlexibleDataTable, type Column } from '@/components/ui/data-table'
import { useTableFilters } from '@/hooks/use-table-filters'
import type {
    DateColumn,
    FilterCategoryConfig,
    QuickFilter,
} from '@/types/filters'
import { filterValuesToQueryParams } from '@/types/filters'
import { ExpandableTruncateControlled } from '@/components/ui/data-table/expanded-cell'
import { AdminLayoutWrapper } from '@/components/admin-layout'
import type { WaitlistRegistration } from '@/types'
import { useGenericResource } from '@/hooks/resources/generic'
import WaitlistController from '@/actions/App/Http/Controllers/Admin/WaitlistController'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter categories configuration
 */
const filterCategories: FilterCategoryConfig[] = [
    {
        id: 'creation_availability',
        title: 'Disponibilidade',
        type: 'select',
        options: [
            { value: 'immediate', label: 'Imediato' },
            { value: '1-2_weeks', label: '1-2 semanas' },
            { value: '1_month', label: '1 mês' },
            { value: 'not_sure', label: 'Não tenho certeza' },
        ],
    },
    {
        id: 'email_sent',
        title: 'Email Enviado',
        type: 'select',
        options: [
            { value: 'sent', label: 'Enviado' },
            { value: 'pending', label: 'Pendente' },
        ],
    },
    {
        id: 'terms_accepted',
        title: 'Termos Aceitos',
        type: 'select',
        options: [
            { value: 'accepted', label: 'Aceito' },
            { value: 'pending', label: 'Pendente' },
        ],
    },
]

/**
 * Date columns for the header date filter section
 */
const dateFilterColumns: DateColumn[] = [
    { value: 'created_at', label: 'Data de Cadastro' },
]

const quickFilters: QuickFilter[] = []

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function WaitlistIndex() {
    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<string>('created_at')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [openId, setOpenId] = useState<string | number | null>(null)

    // ─────────────────────────────────────────────────────────────────────────
    // Filters Hook
    // ─────────────────────────────────────────────────────────────────────────
    const filters = useTableFilters({
        categories: filterCategories,
        cacheKey: 'waitlist',
        cacheConfig: {
            ttl: 24 * 60 * 60 * 1000, // 24 horas
            version: 1,
        },
    })

    // Convert filter values to query params for API
    const filterParams = useMemo(() => {
        return filterValuesToQueryParams(filters.values, filterCategories)
    }, [filters.values])

    // ─────────────────────────────────────────────────────────────────────────
    // Data Fetching
    // ─────────────────────────────────────────────────────────────────────────
    const waitlist = useGenericResource<WaitlistRegistration>('waitlist', {
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

    const handleRowClick = useCallback((registration: WaitlistRegistration) => {
        router.visit(WaitlistController.show(registration.id))
    }, [])

    // ─────────────────────────────────────────────────────────────────────────
    // Columns Definition
    // ─────────────────────────────────────────────────────────────────────────

    const columns: Column<WaitlistRegistration>[] = [
        {
            key: 'stage_name',
            header: 'Artista',
            accessorKey: 'stage_name',
            sortable: true,
            cell: (row) => {
                const name = row.stage_name
                if (!name) return <span>-</span>

                const uniqueRowId = row.id

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <ExpandableTruncateControlled
                                text={name}
                                maxWidth={150}
                                isOpen={openId === uniqueRowId}
                                onOpen={() => setOpenId(uniqueRowId)}
                                onClose={() => setOpenId(null)}
                            />
                            <span className="text-xs text-muted-foreground">
                                {row.contact_email}
                            </span>
                        </div>
                    </div>
                )
            },
        },

        {
            key: 'city_state',
            header: 'Localização',
            cell: (row: WaitlistRegistration) => (
                <div className="flex items-center gap-2 text-sm">
                    {row.city_state ? (
                        <>
                            <MapPin className="size-3.5 text-muted-foreground" />
                            <span>{row.city_state}</span>
                        </>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            ),
            hideOnMobile: true,
        },

        {
            key: 'artist_types',
            header: 'Tipos',
            cell: (row: WaitlistRegistration) => (
                <div className="flex flex-wrap gap-1">
                    {row.artist_types && row.artist_types.length > 0 ? (
                        row.artist_types.slice(0, 2).map((type, idx) => (
                            <Badge
                                key={idx}
                                variant="primary"
                                className="text-xs"
                            >
                                {type}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                    )}
                    {row.artist_types && row.artist_types.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{row.artist_types.length - 2}
                        </Badge>
                    )}
                </div>
            ),
            hideOnMobile: true,
        },

        {
            key: 'creation_availability',
            header: 'Disponibilidade',
            cell: (row: WaitlistRegistration) => {
                const availabilityLabels: Record<string, string> = {
                    immediate: 'Imediato',
                    '1-2_weeks': '1-2 semanas',
                    '1_month': '1 mês',
                    not_sure: 'Não tenho certeza',
                }

                return (
                    <span className="text-sm">
                        {row.creation_availability
                            ? availabilityLabels[row.creation_availability] ||
                              row.creation_availability
                            : '-'}
                    </span>
                )
            },
            hideOnMobile: true,
        },

        {
            key: 'status',
            header: 'Status',
            cell: (row: WaitlistRegistration) => (
                <div className="flex flex-col gap-1">
                    {row.email_sent ? (
                        <Badge
                            variant="default"
                            className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        >
                            <Mail className="size-3" />
                            Email enviado
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="gap-1 border-amber-500/20 bg-amber-500/10 text-amber-600"
                        >
                            <Mail className="size-3" />
                            Pendente
                        </Badge>
                    )}
                </div>
            ),
            hideOnMobile: true,
        },

        {
            key: 'created_at',
            header: 'Cadastrado',
            sortable: true,
            cell: (row: WaitlistRegistration) => (
                <span className="text-sm text-muted-foreground">
                    {row.created_at_human || row.created_at}
                </span>
            ),
            hideOnMobile: true,
        },
    ]

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AdminLayoutWrapper title="Lista de Espera">
            <Head title="Lista de Espera" />

            <div className="mx-auto max-w-7xl px-4 pt-5 lg:px-8">
                {/* Table Container */}
                <FlexibleDataTable<WaitlistRegistration>
                    mode="infinite-scroll"
                    resource={waitlist}
                    columns={columns}
                    keyExtractor={(registration) => registration.id}
                    onRowClick={handleRowClick}
                    searchConfig={{
                        value: search,
                        onChange: setSearch,
                        placeholder:
                            'Buscar por nome, email, cidade ou redes sociais...',
                        className: 'sm:w-96 rounded-lg',
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
                        endOfListMessage:
                            'Todos os cadastros foram carregados.',
                    }}
                    emptyMessage="Nenhum cadastro encontrado"
                />
            </div>
        </AdminLayoutWrapper>
    )
}
