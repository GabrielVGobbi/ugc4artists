import { Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { Column } from './types'

/**
 * Props for the DataTableColumnToggle component.
 *
 * @template TData - The data type for the columns
 */
export interface DataTableColumnToggleProps<TData> {
	/** Array of column definitions */
	columns: Column<TData>[]
	/** Current column visibility state - keys are column keys, values are visibility */
	columnVisibility: Record<string, boolean>
	/** Handler called when a column's visibility is toggled */
	onColumnVisibilityChange: (key: string) => void
}

/**
 * Extracts the display label from a column header.
 * Handles both string headers and ReactNode headers.
 *
 * @param header - The column header (string or ReactNode)
 * @returns The display label as a string
 */
function getColumnLabel<TData>(column: Column<TData>): string {
	const { header } = column

	// If header is a string, return it directly
	if (typeof header === 'string') {
		return header
	}

	// For ReactNode headers, use the column key as fallback
	// This handles cases where header is a complex component
	return column.key
}

/**
 * Determines if a column is currently visible based on visibility state.
 * Considers defaultHidden for initial state.
 *
 * @param column - The column to check
 * @param columnVisibility - The current visibility state
 * @returns true if the column is visible, false otherwise
 */
function isColumnVisible<TData>(
	column: Column<TData>,
	columnVisibility: Record<string, boolean>
): boolean {
	// If explicitly set in visibility state, use that
	if (column.key in columnVisibility) {
		return columnVisibility[column.key] !== false
	}

	// Otherwise, check if column has defaultHidden
	if (column.defaultHidden) {
		return false
	}

	// Default to visible
	return true
}

/**
 * DataTableColumnToggle component provides a dropdown menu for toggling
 * column visibility in a DataTable.
 *
 * Features:
 * - Dropdown menu with checkboxes for each column
 * - Toggle column visibility on click
 * - Shows column header text as label
 * - Supports defaultHidden columns (hidden by default but toggleable)
 *
 * @template TData - The data type for the columns
 *
 * @example
 * ```tsx
 * <DataTableColumnToggle
 *   columns={columns}
 *   columnVisibility={columnVisibility}
 *   onColumnVisibilityChange={(key) => toggleColumnVisibility(key)}
 * />
 * ```
 *
 * @requirement 2.3 - THE DataTable_Component SHALL provide a column visibility toggle UI component
 * @requirement 2.4 - WHEN a user toggles column visibility, THE Table_Store SHALL persist the preference
 */
export function DataTableColumnToggle<TData>({
	columns,
	columnVisibility,
	onColumnVisibilityChange,
}: DataTableColumnToggleProps<TData>) {
	/**
	 * Handles the checkbox change event for a column.
	 * Calls the onColumnVisibilityChange handler with the column key.
	 */
	const handleCheckedChange = (columnKey: string) => {
		onColumnVisibilityChange(columnKey)
	}

	// Filter out columns that are permanently hidden (hidden: true)
	// Columns with defaultHidden: true SHOULD appear in the toggle menu
	const toggleableColumns = columns.filter((column) => column.hidden !== true)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="ml-auto h-8 gap-1"
					aria-label="Alternar visibilidade das colunas"
				>
					<Settings2 className="size-4" />
					<span className="hidden sm:inline">Colunas</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuLabel>Alternar colunas</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{toggleableColumns.map((column) => {
					const label = getColumnLabel(column)
					const isVisible = isColumnVisible(column, columnVisibility)

					return (
						<DropdownMenuCheckboxItem
							key={column.key}
							checked={isVisible}
							onCheckedChange={() => handleCheckedChange(column.key)}
							className="capitalize"
						>
							{label}
						</DropdownMenuCheckboxItem>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
