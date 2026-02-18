import { RefreshCw } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'

import { AdvancedFilterPanel } from '@/components/ui/advanced-filter-panel'
import { Button } from '@/components/ui/button'
import { QuickFilters } from '@/components/ui/quick-filter-select'
import { cn } from '@/lib/utils'
import type {
    FlexibleDataTableMode,
    FlexibleDataTableProps,
} from '@/types/flexible-data-table'

import { DataTable } from './data-table'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { DataTableColumnToggle } from './data-table-column-toggle'
import { DataTablePagination } from './data-table-pagination'
import { DataTableSearch } from './data-table-search'
import { InfiniteScrollContainer } from './infinite-scroll-container'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default mode for the flexible data table.
 * @requirement 1.4 - Default to pagination mode
 */
const DEFAULT_MODE: FlexibleDataTableMode = 'pagination'

/**
 * Default height for infinite scroll container.
 * @requirement 5.2 - Sensible default height
 */
const DEFAULT_INFINITE_SCROLL_HEIGHT = '70vh'

/**
 * Default threshold for triggering load more.
 * @requirement 2.5 - Configurable rootMargin
 */
const DEFAULT_LOAD_MORE_THRESHOLD = '200px'

/**
 * Default end of list message.
 * @requirement 6.3 - End of list indicator
 */
const DEFAULT_END_OF_LIST_MESSAGE = 'Todos os itens foram carregados.'

// ─────────────────────────────────────────────────────────────────────────────
// FlexibleDataTable Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Flexible data table component that supports both pagination and infinite scroll modes.
 *
 * This component extends the DataTableComposite functionality by adding support for
 * infinite scroll mode while maintaining full backward compatibility with pagination mode.
 *
 * Features:
 * - Mode selection: 'pagination' (default) or 'infinite-scroll'
 * - Sticky header support (always enabled in infinite-scroll mode)
 * - All existing DataTableComposite features (search, sort, selection, bulk actions)
 * - Configurable scroll container height and load threshold
 *
 * @template TData - The data model type
 *
 * @example
 * ```tsx
 * // Pagination mode (default)
 * <FlexibleDataTable
 *   data={clients}
 *   columns={columns}
 *   keyExtractor={(item) => item.id}
 *   meta={meta}
 *   paginationConfig={paginationConfig}
 * />
 *
 * // Infinite scroll mode
 * <FlexibleDataTable
 *   mode="infinite-scroll"
 *   data={clients}
 *   columns={columns}
 *   keyExtractor={(item) => item.id}
 *   infiniteScrollConfig={{
 *     onLoadMore: fetchNextPage,
 *     hasMore: hasNextPage,
 *     isFetchingMore: isFetchingNextPage,
 *   }}
 * />
 * ```
 *
 * @requirement 1.1 - Accept mode prop with 'pagination' | 'infinite-scroll'
 * @requirement 1.2 - Render pagination controls in pagination mode
 * @requirement 1.3 - Hide pagination and enable automatic loading in infinite-scroll mode
 * @requirement 1.4 - Default to pagination mode
 * @requirement 1.5 - Reset data state when mode changes
 */
export function FlexibleDataTable<TData>({
    // Mode configuration
    mode = DEFAULT_MODE,
    paginationConfig,
    infiniteScrollConfig: infiniteScrollConfigOverrides,
    stickyHeader = false,
    onModeChange,

    // Resource data (recommended way)
    resource,

    // Manual data props (fallback when not using resource)
    data: manualData,
    isLoading: manualIsLoading = false,
    isFetching: manualIsFetching = false,
    meta: manualMeta,

    // Core props
    columns,
    keyExtractor,

    // Feature configurations
    searchConfig,
    selectionConfig,
    bulkActions,
    sortConfig,
    columnVisibilityConfig,
    refreshConfig,
    filterConfig,

    // Custom slots
    toolbarLeft,
    toolbarRight,

    // Empty state
    emptyMessage = 'Nenhum registro encontrado',
    emptyComponent,

    // Styling
    className,

    // Row interaction
    onRowClick,
}: FlexibleDataTableProps<TData>) {
    // ─────────────────────────────────────────────────────────────────────────
    // Resolve Data Source (resource prop takes precedence)
    // ─────────────────────────────────────────────────────────────────────────

    const data = resource?.data ?? manualData ?? []
    const isLoading = resource?.isLoading ?? manualIsLoading
    const isFetching = resource?.isFetchingNextPage ?? manualIsFetching
    const meta = resource?.meta ?? manualMeta

    // Auto-configure infinite scroll from resource
    const infiniteScrollConfig = resource ? {
        onLoadMore: resource.fetchNextPage,
        hasMore: resource.hasNextPage,
        isFetchingMore: resource.isFetchingNextPage,
        loadedCount: resource.data.length,
        totalCount: resource.total,
        // Apply overrides
        ...infiniteScrollConfigOverrides,
    } : infiniteScrollConfigOverrides as typeof infiniteScrollConfigOverrides & {
        onLoadMore: () => void
        hasMore: boolean
        isFetchingMore: boolean
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Mode Change Detection
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Track the previous mode to detect changes.
     * Uses a ref to persist across renders without causing re-renders.
     * @requirement 1.5 - Reset data state when mode changes
     */
    const previousModeRef = useRef<FlexibleDataTableMode>(mode)

    /**
     * Effect to detect mode changes and notify the parent component.
     * When mode changes, the parent should reset data state and reload from the beginning.
     * @requirement 1.5 - Reset data state when mode changes
     */
    useEffect(() => {
        const previousMode = previousModeRef.current

        // Only trigger callback if mode actually changed (not on initial mount)
        if (previousMode !== mode) {
            // Notify parent about mode change so it can reset data state
            onModeChange?.(mode, previousMode)

            // Update the ref to track the new mode
            previousModeRef.current = mode
        }
    }, [mode, onModeChange])
    // ─────────────────────────────────────────────────────────────────────────
    // Derived State
    // ─────────────────────────────────────────────────────────────────────────

    const isPaginationMode = mode === 'pagination'
    const isInfiniteScrollMode = mode === 'infinite-scroll'

    const hasSelection = Boolean(selectionConfig)
    const selectedCount = selectionConfig?.selectedIds.size ?? 0
    const showBulkActions = hasSelection && selectedCount > 0 && bulkActions && bulkActions.length > 0
    const showToolbar = searchConfig || filterConfig || columnVisibilityConfig || refreshConfig || toolbarLeft || toolbarRight
    const showPagination = isPaginationMode && paginationConfig && meta

    // In infinite scroll mode, sticky header is always enabled
    const effectiveStickyHeader = isInfiniteScrollMode || stickyHeader

    // ─────────────────────────────────────────────────────────────────────────
    // Render Toolbar
    // ─────────────────────────────────────────────────────────────────────────

    const renderToolbar = (): ReactNode => {
        if (!showToolbar) return null

        // Render custom filter component if provided
        const renderAdvancedFilters = (): ReactNode => {
            if (!filterConfig) return null

            // Use custom component if provided
            if (filterConfig.customComponent) {
                return filterConfig.customComponent
            }

            // Render AdvancedFilterPanel
            return (
                <AdvancedFilterPanel
                    categories={filterConfig.categories}
                    values={filterConfig.values}
                    onChange={filterConfig.onChange}
                    onReset={filterConfig.onReset}
                    showGlobalSearch={filterConfig.showGlobalSearch ?? false}
                    globalSearchPlaceholder={filterConfig.globalSearchPlaceholder}
                    showDateFilter={filterConfig.showDateFilter}
                    dateFilterColumns={filterConfig.dateFilterColumns}
                    dateFilterPresets={filterConfig.dateFilterPresets}
                    defaultDateColumn={filterConfig.defaultDateColumn}
                    showActiveFilters={filterConfig.showActiveFilters ?? true}
                    width={filterConfig.width}
                />
            )
        }

        // Render quick filters (inline filters beside search)
        const renderQuickFilters = (): ReactNode => {
            if (!filterConfig?.quickFilters || filterConfig.quickFilters.length === 0) {
                return null
            }

            return (
                <QuickFilters
                    filters={filterConfig.quickFilters}
                    values={filterConfig.values}
                    onChange={filterConfig.onChange}
                />
            )
        }

        // Determine quick filters position (default: after search)
        const quickFiltersPosition = filterConfig?.quickFiltersPosition ?? 'after'

        return (
            <div
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-1"
                role="toolbar"
                aria-label="Controles da tabela"
            >
                {/* Left side: Search + Quick Filters + Advanced Filters + Custom Left Slot */}
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    {toolbarLeft}

                    {/* Quick filters before search (if configured) */}
                    {quickFiltersPosition === 'before' && renderQuickFilters()}

                    {searchConfig && (
                        <div className="relative flex-1 sm:max-w-sm">
                            <DataTableSearch
                                value={searchConfig.value}
                                onChange={searchConfig.onChange}
                                placeholder={searchConfig.placeholder}
                                debounceMs={searchConfig.debounceMs}
                                className={cn('w-full bg-background shadow-xs border-sidebar-border/70 rounded-lg', searchConfig.className)}
                            />
                        </div>
                    )}

                    {/* Quick filters after search (default) */}
                    {quickFiltersPosition === 'after' && renderQuickFilters()}

                    {/* Advanced filter panel */}
                    {renderAdvancedFilters()}

                    {isFetching && !isLoading && (
                        <span className="text-xs text-muted-foreground animate-pulse">
                            Atualizando...
                        </span>
                    )}
                </div>

                {/* Right side: Custom Right Slot + Refresh + Column Toggle */}
                <div className="flex items-center gap-2">
                    {toolbarRight}

                    {columnVisibilityConfig && (
                        <DataTableColumnToggle
                            columns={columns}
                            columnVisibility={columnVisibilityConfig.visibility}
                            onColumnVisibilityChange={columnVisibilityConfig.onToggle}
                        />
                    )}

                    {refreshConfig && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-9 rounded-lg border-sidebar-border/70 text-muted-foreground hover:bg-muted/50"
                            onClick={refreshConfig.onRefresh}
                            disabled={refreshConfig.isRefreshing}
                            aria-label="Atualizar tabela"
                        >
                            <RefreshCw
                                className={cn(
                                    'size-4',
                                    refreshConfig.isRefreshing && 'animate-spin'
                                )}
                            />
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render Data Table
    // ─────────────────────────────────────────────────────────────────────────

    const renderDataTable = (): ReactNode => (
        <DataTable<TData>
            data={data}
            columns={columns}
            keyExtractor={keyExtractor}
            isLoading={isLoading}
            isFetching={isFetching}
            emptyMessage={emptyMessage}
            emptyComponent={emptyComponent}
            sortBy={sortConfig?.sortBy}
            sortDirection={sortConfig?.sortDirection}
            onSort={sortConfig?.onSort}
            onRowClick={onRowClick}
            selectable={hasSelection}
            selectedIds={selectionConfig?.selectedIds}
            onSelectionChange={selectionConfig?.onSelectionChange}
            columnVisibility={columnVisibilityConfig?.visibility}
            stickyHeader={effectiveStickyHeader}
        />
    )

    // ─────────────────────────────────────────────────────────────────────────
    // Render Infinite Scroll Mode
    // ─────────────────────────────────────────────────────────────────────────

    const renderInfiniteScrollMode = (): ReactNode => {
        if (!infiniteScrollConfig) {
            console.warn(
                'FlexibleDataTable: infiniteScrollConfig is required when mode is "infinite-scroll"'
            )
            return renderDataTable()
        }

        const {
            height = DEFAULT_INFINITE_SCROLL_HEIGHT,
            loadMoreThreshold = DEFAULT_LOAD_MORE_THRESHOLD,
            scrollContainerRef,
            onLoadMore,
            hasMore,
            isFetchingMore,
            endOfListMessage = DEFAULT_END_OF_LIST_MESSAGE,
            loadedCount,
            totalCount,
        } = infiniteScrollConfig

        return (
            <InfiniteScrollContainer
                height={height}
                isLoadingMore={isFetchingMore}
                hasMore={hasMore}
                onLoadMore={onLoadMore}
                threshold={loadMoreThreshold}
                endMessage={endOfListMessage}
                externalScrollRef={scrollContainerRef}
                loadedCount={loadedCount}
                totalCount={totalCount}
            >
                {renderDataTable()}
            </InfiniteScrollContainer>
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render Pagination Mode
    // ─────────────────────────────────────────────────────────────────────────

    const renderPaginationMode = (): ReactNode => (
        <>
            {renderDataTable()}

            {showPagination && (
                <DataTablePagination
                    currentPage={paginationConfig.page}
                    lastPage={meta.last_page}
                    perPage={paginationConfig.perPage}
                    total={meta.total}
                    from={meta.from}
                    to={meta.to}
                    onPageChange={paginationConfig.onPageChange}
                    onPerPageChange={paginationConfig.onPerPageChange}
                    perPageOptions={paginationConfig.perPageOptions}
                />
            )}
        </>
    )

    // ─────────────────────────────────────────────────────────────────────────
    // Main Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {/* Bulk Actions Toolbar */}
            {showBulkActions && bulkActions && selectionConfig && (
                <DataTableBulkActions
                    selectedCount={selectedCount}
                    onClearSelection={selectionConfig.onClearSelection}
                    actions={bulkActions}
                />
            )}

            {/* Toolbar Section */}
            {renderToolbar()}

            {/* Table Content - Mode-specific rendering */}
            {isInfiniteScrollMode ? renderInfiniteScrollMode() : renderPaginationMode()}
        </div>
    )
}

export default FlexibleDataTable
