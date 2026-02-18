import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DataTableCompositeProps } from '@/types/data-table-composite'

import { DataTable } from './data-table'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { DataTableColumnToggle } from './data-table-column-toggle'
import { DataTablePagination } from './data-table-pagination'
import { DataTableSearch } from './data-table-search'

// ─────────────────────────────────────────────────────────────────────────────
// DataTableComposite Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unified DataTable composite component that combines all data table
 * sub-components into a single, configurable interface.
 *
 * Features are opt-in through configuration props:
 * - Search: Provide `searchConfig` to enable search input
 * - Pagination: Provide `paginationConfig` and `meta` to enable pagination
 * - Selection: Provide `selectionConfig` to enable row selection
 * - Bulk Actions: Provide `bulkActions` with selection to enable bulk actions
 * - Column Toggle: Provide `columnVisibilityConfig` to enable column visibility toggle
 * - Sorting: Provide `sortConfig` to enable column sorting
 *
 * @template TData - The data model type
 *
 * @example
 * ```tsx
 * <DataTableComposite
 *   data={clients}
 *   columns={columns}
 *   keyExtractor={(item) => item.id}
 *   meta={meta}
 *   isLoading={isLoading}
 *   searchConfig={searchConfig}
 *   paginationConfig={paginationConfig}
 *   selectionConfig={selectionConfig}
 *   bulkActions={bulkActions}
 *   sortConfig={sortConfig}
 *   columnVisibilityConfig={columnVisibilityConfig}
 *   toolbarRight={<Button>Novo</Button>}
 * />
 * ```
 *
 * @requirement 1.1-1.6, 7.1-7.3
 */
export function DataTableComposite<TData>({
	// Core data props
	data,
	columns,
	keyExtractor,

	// Loading states
	isLoading = false,
	isFetching = false,

	// Pagination metadata
	meta,

	// Feature configurations
	searchConfig,
	paginationConfig,
	selectionConfig,
	bulkActions,
	sortConfig,
	columnVisibilityConfig,
	refreshConfig,

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
}: DataTableCompositeProps<TData>) {
	// ─────────────────────────────────────────────────────────────────────────
	// Derived State
	// ─────────────────────────────────────────────────────────────────────────

	const hasSelection = Boolean(selectionConfig)
	const selectedCount = selectionConfig?.selectedIds.size ?? 0
	const showBulkActions = hasSelection && selectedCount > 0 && bulkActions && bulkActions.length > 0
	const showToolbar = searchConfig || columnVisibilityConfig || refreshConfig || toolbarLeft || toolbarRight
	const showPagination = paginationConfig && meta

	// ─────────────────────────────────────────────────────────────────────────
	// Render
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
			{showToolbar && (
				<div
					className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
					role="toolbar"
					aria-label="Controles da tabela"
				>
					{/* Left side: Search + Custom Left Slot */}
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
						{toolbarLeft}

						{searchConfig && (
							<DataTableSearch
								value={searchConfig.value}
								onChange={searchConfig.onChange}
								placeholder={searchConfig.placeholder}
								debounceMs={searchConfig.debounceMs}
								className={cn('sm:w-80', searchConfig.className)}
							/>
						)}

						{isFetching && !isLoading && (
							<span className="text-sm text-muted-foreground">
								Atualizando...
							</span>
						)}
					</div>

					{/* Right side: Custom Right Slot + Refresh + Column Toggle */}
					<div className="flex items-center gap-2">
						{toolbarRight}

						{refreshConfig && (
							<Button
								variant="outline"
								size="sm"
								className="h-8 gap-1"
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
								<span className="hidden sm:inline">Atualizar</span>
							</Button>
						)}

						{columnVisibilityConfig && (
							<DataTableColumnToggle
								columns={columns}
								columnVisibility={columnVisibilityConfig.visibility}
								onColumnVisibilityChange={columnVisibilityConfig.onToggle}
							/>
						)}
					</div>
				</div>
			)}

			{/* Data Table */}
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
			/>

			{/* Pagination */}
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
		</div>
	)
}
