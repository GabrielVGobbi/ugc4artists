import { Head, Link } from '@inertiajs/react'
import { Eye, } from 'lucide-react'
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
import { ExpandableTruncateControlled } from '@/components/ui/data-table/expanded-cell'
import { AdminLayoutWrapper } from '@/components/admin-layout'
import type { User } from '@/types'
import UsersController from '@/actions/App/Http/Controllers/Admin/UsersController'
import { useGenericResource } from '@/hooks/resources/generic'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

//const breadcrumbs: BreadcrumbItem[] = [
//    { title: 'Dashboard', href: '/dashboard' },
//    { title: 'Usuários', href: '/users' },
//]

/**
 * Filter categories configuration for users
 */
const filterCategories: FilterCategoryConfig[] = [
    {
        id: 'account_type',
        title: 'Tipo de Conta',
        type: 'select',
        options: [
            { value: 'artist', label: 'Artista' },
            { value: 'brand', label: 'Curador' },
            { value: 'company', label: 'Empresa' },
        ],
    },
    {
        id: 'email_verified',
        title: 'Email Verificado',
        type: 'select',
        options: [
            { value: 'verified', label: 'Verificado' },
            { value: 'unverified', label: 'Não Verificado' },
        ],
    },
    {
        id: 'onboarding_completed',
        title: 'Onboarding',
        type: 'select',
        options: [
            { value: 'completed', label: 'Completado' },
            { value: 'pending', label: 'Pendente' },
        ],
    },
]

/**
 * Date columns for the header date filter section
 */
const dateFilterColumns: DateColumn[] = [
    { value: 'created_at', label: 'Data de Criação' },
    { value: 'updated_at', label: 'Última Atualização' },
]

const quickFilters: QuickFilter[] = []

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function UsersIndex() {
    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<string>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [openId, setOpenId] = useState<string | number | null>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // Filters Hook
    // ─────────────────────────────────────────────────────────────────────────
    const filters = useTableFilters({
        categories: filterCategories,
        cacheKey: 'users',
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
    const users = useGenericResource<User>('users', {
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

    const columns: Column<User>[] = [
        {
            key: 'name',
            header: 'Nome',
            accessorKey: 'name',
            sortable: true,
            cell: (row) => {
                const name = row.name;
                const user = row;
                if (!name) return <span>-</span>;

                const uniqueRowId = row.id;

                return (

                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary">
                            {user.name.charAt(0).toUpperCase()}
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
                                {user.email}
                            </span>
                        </div>
                    </div>
                );
            }
        },

        {
            key: 'phone',
            header: 'Telefone',
            cell: (user: User) => (
                <div className="font-mono text-sm">
                    <span className="flex items-center gap-1">
                        <CopyText text={user.phone ?? ''}>
                            {user.phone}
                        </CopyText>
                    </span>
                </div>
            ),
            hideOnMobile: true,
        },

        {
            key: 'account_type',
            header: 'Tipo de Conta',
            cell: (user: User) => (
                <div className="font-mono text-sm">
                    <span className="flex items-center gap-1">
                        {user.account_type}
                    </span>
                </div>
            ),
            hideOnMobile: true,
        },

        {
            key: 'created_at',
            header: 'Criado em',
            sortable: true,
            cell: (user: User) => (
                <>{user.created_at}</>
            ),
            hideOnMobile: true,
        },
        {
            key: 'actions',
            header: 'Ações',
            align: 'right',
            width: '150px',
            cell: (user: User) => (
                <div className="flex items-center justify-end gap-1">
                    <Link href={UsersController.show(user.id)} prefetch>
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
        <AdminLayoutWrapper>
            <Head title="Usuários" />

            <div className="mx-auto  max-w-7xl px-4 lg:px-8 pt-5">

                {/* Table Container - now letting FlexibleDataTable handle the border/radius */}
                <FlexibleDataTable<User>
                    mode="infinite-scroll"
                    resource={users}
                    columns={columns}
                    keyExtractor={(users) => users.id}
                    searchConfig={{
                        value: search,
                        onChange: setSearch,
                        placeholder: 'Buscar por nome, email ou documento...',
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
                        // Quick filters appear beside search for instant access
                        quickFilters,
                        quickFiltersPosition: 'after',
                    }}
                    infiniteScrollConfig={{
                        height: 'calc(100vh - 280px)', // Dynamic height calculation
                        endOfListMessage: 'Todos os usuários foram carregados.',
                    }}
                    emptyMessage="Nenhum usuário encontrado"
                />
            </div>


        </AdminLayoutWrapper>
    )
}
