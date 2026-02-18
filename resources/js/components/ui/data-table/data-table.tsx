import { ArrowUpDown, ArrowUp, ArrowDown, Minus, Search } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

import { DataTableSkeleton } from './data-table-skeleton'
import type { DataTableProps, Column } from './types'

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    isLoading = false,
    isFetching = false,
    emptyMessage = 'Nenhum registro encontrado',
    emptyComponent,
    sortBy,
    sortDirection,
    onSort,
    onRowClick,
    selectable = false,
    selectedIds,
    onSelectionChange,
    columnVisibility,
    className,
    stickyHeader = false,
}: DataTableProps<T>) {
    if (isLoading) {
        return <DataTableSkeleton columns={columns.length} rows={5} />
    }

    const visibleColumns = columns.filter((column) => {
        // Permanently hidden columns
        if (column.hidden === true) {
            return false
        }
        // Check explicit visibility state
        if (columnVisibility && column.key in columnVisibility) {
            return columnVisibility[column.key] !== false
        }
        // Check defaultHidden (hidden by default but toggleable)
        if (column.defaultHidden === true) {
            return false
        }
        return true
    })

    const handleSort = (column: Column<T>) => {
        if (column.sortable && onSort) {
            onSort(column.key)
        }
    }

    const renderSortIcon = (column: Column<T>) => {
        if (!column.sortable) return null
        if (sortBy !== column.key) {
            return <ArrowUpDown className="ml-2 size-4 text-muted-foreground" />
        }
        return sortDirection === 'asc'
            ? <ArrowUp className="ml-2 size-4" />
            : <ArrowDown className="ml-2 size-4" />
    }

    const getCellValue = (item: T, column: Column<T>, index: number) => {
        if (column.cell) {
            return column.cell(item, index)
        }
        if (column.accessorKey) {
            return String(item[column.accessorKey] ?? '')
        }
        return ''
    }

    const alignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    }

    /**
     * Handles "select all" checkbox click.
     * In infinite scroll mode, this selects all currently loaded data (across all pages).
     * The selectedIds Set persists when new pages are loaded, maintaining selections.
     * @requirement 7.1 - Support row selection across all loaded pages
     */
    const handleSelectAll = () => {
        if (!onSelectionChange) return
        const allIds = data.map((item) => keyExtractor(item))
        const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds?.has(id))
        if (allSelected) {
            onSelectionChange(new Set())
        } else {
            onSelectionChange(new Set(allIds))
        }
    }

    /**
     * Handles individual row selection toggle.
     * Selections persist across page loads in infinite scroll mode.
     * @requirement 7.1 - Support row selection across all loaded pages
     */    const handleRowSelect = (id: string | number, event: React.MouseEvent) => {
        event.stopPropagation()
        if (!onSelectionChange || !selectedIds) return
        const newSelectedIds = new Set(selectedIds)
        if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id)
        } else {
            newSelectedIds.add(id)
        }
        onSelectionChange(newSelectedIds)
    }

    const getHeaderCheckboxState = (): 'checked' | 'indeterminate' | 'unchecked' => {
        if (!selectedIds || data.length === 0) return 'unchecked'
        const allIds = data.map((item) => keyExtractor(item))
        const selectedCount = allIds.filter((id) => selectedIds.has(id)).length
        if (selectedCount === 0) return 'unchecked'
        if (selectedCount === allIds.length) return 'checked'
        return 'indeterminate'
    }

    const headerCheckboxState = getHeaderCheckboxState()

    const getResponsiveClasses = (column: Column<T>) => {
        if (column.hideOnMobile) {
            return 'hidden md:table-cell'
        }
        return ''
    }

    const totalColumns = visibleColumns.length + (selectable ? 1 : 0)

    return (
        <div className={cn('relative w-full rounded-xl border border-sidebar-border/70 bg-background shadow-sm', className)}>
            {isFetching && !isLoading && (
                <div className="absolute inset-x-0 top-0 z-20">
                    <div className="h-0.5 w-full overflow-hidden bg-primary/10">
                        <div className="h-full w-1/3 animate-[shimmer_1.5s_ease-in-out_infinite] bg-primary/40" />
                    </div>
                </div>
            )}
            <div className={cn(
                // Only apply overflow-x-auto when NOT using sticky header
                // because overflow creates a new scroll context that breaks sticky positioning
                !stickyHeader && 'overflow-x-auto',
                // For infinite scroll, we rely on parent container scrolling, so we don't hide overflow
                // This ensures sticky header works within the parent container
                stickyHeader && 'overflow-visible'
            )}>
                <table className="w-full caption-bottom text-sm">
                    <thead
                        className={cn(
                            '[&_tr]:border-b [&_tr]:border-sidebar-border/70 ',
                            stickyHeader && 'sticky top-0 z-10 bg-primary backdrop-blur  supports-backdrop-filter:bg-primary'
                        )}
                    >
                        <tr className="border-b border-sidebar-border/70 transition-colors data-[state=selected]:bg-muted">
                            {selectable && (
                                <th className="h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0">
                                    <div className="flex items-center justify-center">
                                        {headerCheckboxState === 'indeterminate' ? (
                                            <button
                                                type="button"
                                                onClick={handleSelectAll}
                                                className={cn(
                                                    'flex size-4 items-center justify-center rounded-sm border border-primary',
                                                    'bg-primary text-primary-foreground',
                                                    'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1',
                                                    'shadow-sm'
                                                )}
                                                aria-label="Selecionar todos"
                                                aria-checked="mixed"
                                                role="checkbox"
                                            >
                                                <Minus className="size-3" />
                                            </button>
                                        ) : (
                                            <Checkbox
                                                checked={headerCheckboxState === 'checked'}
                                                onCheckedChange={handleSelectAll}
                                                aria-label="Selecionar todos"
                                            />
                                        )}
                                    </div>
                                </th>
                            )}
                            {visibleColumns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'h-12 px-4 text-left align-middle font-medium text-white [&:has([role=checkbox])]:pr-0',
                                        // Add rounded corners to first and last columns since we removed overflow-hidden from container
                                        'first:rounded-tl-xl last:rounded-tr-xl',
                                        alignmentClasses[column.align ?? 'left'],
                                        column.sortable && 'cursor-pointer select-none hover:text-primary-foreground/80 transition-colors',
                                        column.className,
                                        getResponsiveClasses(column)
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => handleSort(column)}
                                    onKeyDown={(e) => {
                                        if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault()
                                            handleSort(column)
                                        }
                                    }}
                                    tabIndex={column.sortable ? 0 : undefined}
                                    role={column.sortable ? 'button' : undefined}
                                    aria-sort={
                                        column.sortable && sortBy === column.key
                                            ? sortDirection === 'asc' ? 'ascending' : 'descending'
                                            : undefined
                                    }
                                >
                                    <span className="inline-flex items-center gap-2">
                                        {column.header}
                                        {renderSortIcon(column)}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={totalColumns} className="p-8 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-muted/50">
                                            <Search size={38} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground text-lg">{typeof emptyMessage === 'string' ? emptyMessage : 'Nenhum registro encontrado'}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Tente ajustar seus filtros de busca</p>
                                        </div>
                                        {emptyComponent}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {
                                const rowId = keyExtractor(item)
                                const isSelected = selectedIds?.has(rowId) ?? false
                                return (
                                    <tr
                                        key={rowId}
                                        className={cn(
                                            'border-b border-sidebar-border/70 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                                            onRowClick && 'cursor-pointer',
                                            isSelected && 'bg-muted/50'
                                        )}
                                        onClick={() => onRowClick?.(item)}
                                        onKeyDown={(e) => {
                                            if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                                                e.preventDefault()
                                                onRowClick(item)
                                            }
                                        }}
                                        tabIndex={onRowClick ? 0 : undefined}
                                        role={onRowClick ? 'button' : undefined}
                                        aria-selected={selectable ? isSelected : undefined}
                                        data-state={isSelected ? 'selected' : undefined}
                                    >
                                        {selectable && (
                                            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-center w-12.5">
                                                <div
                                                    className="flex items-center justify-center"
                                                    onClick={(e) => handleRowSelect(rowId, e)}
                                                    role="presentation"
                                                >
                                                    <Checkbox checked={isSelected} aria-label={`Selecionar linha ${index + 1}`} />
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={cn(
                                                    'p-4 align-middle [&:has([role=checkbox])]:pr-0 text-foreground',
                                                    alignmentClasses[column.align ?? 'left'],
                                                    column.className,
                                                    getResponsiveClasses(column)
                                                )}
                                            >
                                                {getCellValue(item, column, index)}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
