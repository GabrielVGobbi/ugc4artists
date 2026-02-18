/**
 * Property-Based Tests for DataTable Component
 *
 * Feature: reusable-data-table, Property 1: Column Rendering Correctness
 *
 * *For any* array of column definitions and data items, the DataTable component
 * SHALL render exactly the number of visible columns specified, and each cell
 * SHALL display either the result of the `cell` function (if provided) or the
 * value at `accessorKey` (if provided).
 *
 * **Validates: Requirements 1.2, 1.3, 1.4**
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'

import { DataTable } from '../data-table'
import type { Column } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Test Model Types
// ─────────────────────────────────────────────────────────────────────────────

interface TestItem {
	id: number
	name: string
	email: string
	status: string
	count: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Arbitraries (Generators)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Arbitrary for generating valid item IDs.
 */
const itemIdArbitrary = fc.integer({ min: 1, max: 10000 })

/**
 * Arbitrary for generating valid names (non-empty, trimmed strings).
 */
const nameArbitrary = fc
	.string({ minLength: 1, maxLength: 30 })
	.filter((s) => s.trim().length > 0)
	.map((s) => s.trim().replace(/[<>&"']/g, ''))

/**
 * Arbitrary for generating valid email addresses.
 */
const emailArbitrary = fc
	.tuple(
		fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z]+$/.test(s)),
		fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z]+$/.test(s)),
	)
	.map(([local, domain]) => `${local}@${domain}.com`)

/**
 * Arbitrary for generating status values.
 */
const statusArbitrary = fc.constantFrom('active', 'inactive', 'pending')

/**
 * Arbitrary for generating count values.
 */
const countArbitrary = fc.integer({ min: 0, max: 1000 })

/**
 * Arbitrary for generating a complete TestItem.
 */
const testItemArbitrary: fc.Arbitrary<TestItem> = fc.record({
	id: itemIdArbitrary,
	name: nameArbitrary,
	email: emailArbitrary,
	status: statusArbitrary,
	count: countArbitrary,
})

/**
 * Arbitrary for generating an array of TestItems with unique IDs.
 */
const testItemListArbitrary = (minLength = 0, maxLength = 10) =>
	fc
		.array(testItemArbitrary, { minLength: maxLength, maxLength: maxLength * 2 })
		.map((items) => {
			const seen = new Set<number>()
			const unique: TestItem[] = []
			for (const item of items) {
				if (!seen.has(item.id) && unique.length < maxLength) {
					seen.add(item.id)
					unique.push(item)
				}
			}
			return unique
		})
		.filter((items) => items.length >= minLength)

/**
 * Arbitrary for column alignment.
 */
const alignArbitrary = fc.constantFrom('left', 'center', 'right') as fc.Arbitrary<
	'left' | 'center' | 'right'
>

/**
 * Arbitrary for generating a column key (valid identifier).
 */
const columnKeyArbitrary = fc.constantFrom('name', 'email', 'status', 'count')

/**
 * Arbitrary for generating column header text.
 */
const headerArbitrary = fc
	.string({ minLength: 1, maxLength: 20 })
	.filter((s) => s.trim().length > 0)
	.map((s) => s.trim().replace(/[<>&"']/g, ''))

/**
 * Arbitrary for generating a column definition with accessorKey.
 */
const accessorKeyColumnArbitrary: fc.Arbitrary<Column<TestItem>> = fc.record({
	key: fc.uuid(),
	header: headerArbitrary,
	accessorKey: columnKeyArbitrary as fc.Arbitrary<keyof TestItem>,
	sortable: fc.boolean(),
	align: fc.option(alignArbitrary, { nil: undefined }),
	hidden: fc.constant(false),
	hideOnMobile: fc.option(fc.boolean(), { nil: undefined }),
})

/**
 * Arbitrary for generating a column definition with cell function.
 * The cell function returns a predictable string based on the item.
 */
const cellFunctionColumnArbitrary: fc.Arbitrary<Column<TestItem>> = fc
	.record({
		key: fc.uuid(),
		header: headerArbitrary,
		sortable: fc.boolean(),
		align: fc.option(alignArbitrary, { nil: undefined }),
		hidden: fc.constant(false),
		hideOnMobile: fc.option(fc.boolean(), { nil: undefined }),
		// We'll use a marker to identify which field to render
		fieldToRender: columnKeyArbitrary,
	})
	.map(({ fieldToRender, ...rest }) => ({
		...rest,
		// Create a cell function that renders a specific format
		cell: (item: TestItem) => `[${fieldToRender}:${String(item[fieldToRender])}]`,
	}))

/**
 * Arbitrary for generating a mixed array of column definitions.
 * Ensures we have a mix of accessorKey and cell function columns.
 */
const columnDefsArbitrary = (minLength = 1, maxLength = 5) =>
	fc
		.array(
			fc.oneof(accessorKeyColumnArbitrary, cellFunctionColumnArbitrary),
			{ minLength, maxLength },
		)
		.map((columns) => {
			// Ensure unique keys
			const seen = new Set<string>()
			return columns.filter((col) => {
				if (seen.has(col.key)) return false
				seen.add(col.key)
				return true
			})
		})
		.filter((columns) => columns.length >= minLength)

// ─────────────────────────────────────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the expected cell value based on column definition.
 */
function getExpectedCellValue(
	item: TestItem,
	column: Column<TestItem>,
	index: number,
): string {
	if (column.cell) {
		const result = column.cell(item, index)
		return String(result ?? '')
	}
	if (column.accessorKey) {
		return String(item[column.accessorKey] ?? '')
	}
	return ''
}

/**
 * Key extractor for TestItem.
 */
const keyExtractor = (item: TestItem): number => item.id

// ─────────────────────────────────────────────────────────────────────────────
// Property Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Feature: reusable-data-table, Property 1: Column Rendering Correctness', () => {
	/**
	 * Property 1.1: Visible column count matches specification
	 *
	 * For any array of column definitions (where hidden !== true),
	 * the DataTable SHALL render exactly that number of column headers.
	 */
	it('should render exactly the number of visible columns specified', () => {
		fc.assert(
			fc.property(
				columnDefsArbitrary(1, 6),
				testItemListArbitrary(1, 5),
				(columns, data) => {
					const visibleColumns = columns.filter((col) => !col.hidden)

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					// Count header cells (th elements)
					const headerCells = container.querySelectorAll('thead th')
					expect(headerCells.length).toBe(visibleColumns.length)
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 1.2: Cell content matches accessorKey value
	 *
	 * For any column with accessorKey (and no cell function),
	 * each cell SHALL display the value at that key from the data object.
	 */
	it('should display accessorKey value when cell function is not provided', () => {
		fc.assert(
			fc.property(
				fc.array(accessorKeyColumnArbitrary, { minLength: 1, maxLength: 4 })
					.map((cols) => {
						const seen = new Set<string>()
						return cols.filter((c) => {
							if (seen.has(c.key)) return false
							seen.add(c.key)
							return true
						})
					})
					.filter((cols) => cols.length >= 1),
				testItemListArbitrary(1, 5),
				(columns, data) => {
					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					// Get all data rows (tbody tr)
					const rows = container.querySelectorAll('tbody tr')

					// For non-empty data, verify each cell
					if (data.length > 0) {
						expect(rows.length).toBe(data.length)

						data.forEach((item, rowIndex) => {
							const row = rows[rowIndex]
							const cells = row.querySelectorAll('td')

							columns.forEach((column, colIndex) => {
								if (!column.hidden && column.accessorKey) {
									const expectedValue = String(item[column.accessorKey] ?? '')
									const cellText = cells[colIndex]?.textContent ?? ''
									expect(cellText).toBe(expectedValue)
								}
							})
						})
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 1.3: Cell content matches cell function result
	 *
	 * For any column with a cell function, each cell SHALL display
	 * the result of calling that function with the item and index.
	 */
	it('should display cell function result when cell function is provided', () => {
		fc.assert(
			fc.property(
				fc.array(cellFunctionColumnArbitrary, { minLength: 1, maxLength: 4 })
					.map((cols) => {
						const seen = new Set<string>()
						return cols.filter((c) => {
							if (seen.has(c.key)) return false
							seen.add(c.key)
							return true
						})
					})
					.filter((cols) => cols.length >= 1),
				testItemListArbitrary(1, 5),
				(columns, data) => {
					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					const rows = container.querySelectorAll('tbody tr')

					if (data.length > 0) {
						expect(rows.length).toBe(data.length)

						data.forEach((item, rowIndex) => {
							const row = rows[rowIndex]
							const cells = row.querySelectorAll('td')

							columns.forEach((column, colIndex) => {
								if (!column.hidden && column.cell) {
									const expectedValue = String(column.cell(item, rowIndex) ?? '')
									const cellText = cells[colIndex]?.textContent ?? ''
									expect(cellText).toBe(expectedValue)
								}
							})
						})
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 1.4: Mixed columns render correctly
	 *
	 * For any mix of columns (some with accessorKey, some with cell function),
	 * each cell SHALL display the appropriate content based on its definition.
	 */
	it('should correctly render mixed accessorKey and cell function columns', () => {
		fc.assert(
			fc.property(
				columnDefsArbitrary(2, 5),
				testItemListArbitrary(1, 5),
				(columns, data) => {
					const visibleColumns = columns.filter((col) => !col.hidden)

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					const rows = container.querySelectorAll('tbody tr')

					if (data.length > 0) {
						expect(rows.length).toBe(data.length)

						data.forEach((item, rowIndex) => {
							const row = rows[rowIndex]
							const cells = row.querySelectorAll('td')

							expect(cells.length).toBe(visibleColumns.length)

							visibleColumns.forEach((column, colIndex) => {
								const expectedValue = getExpectedCellValue(item, column, rowIndex)
								const cellText = cells[colIndex]?.textContent ?? ''
								expect(cellText).toBe(expectedValue)
							})
						})
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 1.5: Row count matches data length
	 *
	 * For any data array, the DataTable SHALL render exactly
	 * data.length rows in the tbody (excluding empty state).
	 */
	it('should render exactly data.length rows', () => {
		fc.assert(
			fc.property(
				columnDefsArbitrary(1, 4),
				testItemListArbitrary(1, 10),
				(columns, data) => {
					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					const rows = container.querySelectorAll('tbody tr')
					expect(rows.length).toBe(data.length)
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 1.6: Empty data shows empty state
	 *
	 * When data array is empty, the DataTable SHALL render
	 * a single row with the empty message.
	 */
	it('should show empty state when data is empty', () => {
		fc.assert(
			fc.property(
				columnDefsArbitrary(1, 4),
				fc.string({ minLength: 1, maxLength: 50 }).map((s) => s.trim() || 'No data'),
				(columns, emptyMessage) => {
					const { container } = render(
						<DataTable
							data={[]}
							columns={columns}
							keyExtractor={keyExtractor}
							emptyMessage={emptyMessage}
						/>,
					)

					const rows = container.querySelectorAll('tbody tr')
					expect(rows.length).toBe(1)

					const emptyCell = rows[0].querySelector('td')
					expect(emptyCell?.textContent).toBe(emptyMessage)
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 1.7: Column headers match column definitions
	 *
	 * For any array of column definitions, the header text
	 * SHALL match the header property of each visible column.
	 */
	it('should render correct header text for each column', () => {
		fc.assert(
			fc.property(
				columnDefsArbitrary(1, 5),
				testItemListArbitrary(0, 3),
				(columns, data) => {
					const visibleColumns = columns.filter((col) => !col.hidden)

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					const headerCells = container.querySelectorAll('thead th')

					visibleColumns.forEach((column, index) => {
						const headerText = headerCells[index]?.textContent ?? ''
						// Header text should contain the column header
						// (may also contain sort icons, so we check for inclusion)
						expect(headerText).toContain(String(column.header))
					})
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 1.8: Cell count per row matches visible column count
	 *
	 * For any data row, the number of cells SHALL equal
	 * the number of visible columns.
	 */
	it('should render correct number of cells per row', () => {
		fc.assert(
			fc.property(
				columnDefsArbitrary(1, 6),
				testItemListArbitrary(1, 5),
				(columns, data) => {
					const visibleColumns = columns.filter((col) => !col.hidden)

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					const rows = container.querySelectorAll('tbody tr')

					rows.forEach((row) => {
						const cells = row.querySelectorAll('td')
						expect(cells.length).toBe(visibleColumns.length)
					})
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 1.9: Cell function receives correct arguments
	 *
	 * When a column has a cell function, it SHALL be called with
	 * the correct item and index arguments.
	 */
	it('should pass correct item and index to cell function', () => {
		fc.assert(
			fc.property(
				testItemListArbitrary(1, 5),
				(data) => {
					// Track cell function calls
					const cellCalls: Array<{ item: TestItem; index: number }> = []

					const columns: Column<TestItem>[] = [
						{
							key: 'test-col',
							header: 'Test',
							cell: (item, index) => {
								cellCalls.push({ item, index })
								return `${item.name}-${index}`
							},
						},
					]

					render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					// Verify cell function was called for each data item
					expect(cellCalls.length).toBe(data.length)

					// Verify each call received correct arguments
					data.forEach((item, index) => {
						expect(cellCalls[index].item).toEqual(item)
						expect(cellCalls[index].index).toBe(index)
					})
				},
			),
			{ numRuns: 100 },
		)
	})
})


// ─────────────────────────────────────────────────────────────────────────────
// Feature: reusable-data-table, Property 2: Hidden Column Exclusion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Property-Based Tests for Hidden Column Exclusion
 *
 * Feature: reusable-data-table, Property 2: Hidden Column Exclusion
 *
 * *For any* column definition with `hidden: true`, the rendered DataTable
 * SHALL NOT include that column in the DOM, and the total rendered column
 * count SHALL equal the count of columns where `hidden !== true`.
 *
 * **Validates: Requirements 2.1, 2.2**
 */

// ─────────────────────────────────────────────────────────────────────────────
// Additional Arbitraries for Hidden Column Tests
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Arbitrary for generating a column definition that may be hidden.
 * Uses the `hidden` property from the Column interface.
 */
const columnWithHiddenArbitrary: fc.Arbitrary<Column<TestItem>> = fc.record({
	key: fc.uuid(),
	header: headerArbitrary,
	accessorKey: columnKeyArbitrary as fc.Arbitrary<keyof TestItem>,
	sortable: fc.boolean(),
	align: fc.option(alignArbitrary, { nil: undefined }),
	hidden: fc.boolean(), // Can be true or false
	hideOnMobile: fc.option(fc.boolean(), { nil: undefined }),
})

/**
 * Arbitrary for generating an array of columns with some hidden.
 * Ensures at least one visible column exists.
 */
const columnsWithHiddenArbitrary = (minLength = 2, maxLength = 8) =>
	fc
		.array(columnWithHiddenArbitrary, { minLength, maxLength })
		.map((columns) => {
			// Ensure unique keys
			const seen = new Set<string>()
			const unique = columns.filter((col) => {
				if (seen.has(col.key)) return false
				seen.add(col.key)
				return true
			})
			// Ensure at least one visible column
			const hasVisible = unique.some((col) => !col.hidden)
			if (!hasVisible && unique.length > 0) {
				unique[0].hidden = false
			}
			return unique
		})
		.filter((columns) => columns.length >= minLength)

/**
 * Arbitrary for generating column visibility state.
 * Maps column keys to boolean visibility values.
 */
const columnVisibilityArbitrary = (columns: Column<TestItem>[]) =>
	fc
		.array(fc.boolean(), { minLength: columns.length, maxLength: columns.length })
		.map((visibilities) => {
			const visibility: Record<string, boolean> = {}
			columns.forEach((col, index) => {
				visibility[col.key] = visibilities[index]
			})
			return visibility
		})

/**
 * Arbitrary for generating columns with a specific hidden pattern.
 * Guarantees a mix of hidden and visible columns.
 */
const mixedHiddenColumnsArbitrary = fc
	.tuple(
		fc.integer({ min: 1, max: 4 }), // Number of visible columns
		fc.integer({ min: 1, max: 4 }), // Number of hidden columns
	)
	.chain(([visibleCount, hiddenCount]) => {
		const visibleColumns = fc.array(
			fc.record({
				key: fc.uuid(),
				header: headerArbitrary,
				accessorKey: columnKeyArbitrary as fc.Arbitrary<keyof TestItem>,
				sortable: fc.boolean(),
				align: fc.option(alignArbitrary, { nil: undefined }),
				hidden: fc.constant(false),
				hideOnMobile: fc.option(fc.boolean(), { nil: undefined }),
			}),
			{ minLength: visibleCount, maxLength: visibleCount },
		)

		const hiddenColumns = fc.array(
			fc.record({
				key: fc.uuid(),
				header: headerArbitrary,
				accessorKey: columnKeyArbitrary as fc.Arbitrary<keyof TestItem>,
				sortable: fc.boolean(),
				align: fc.option(alignArbitrary, { nil: undefined }),
				hidden: fc.constant(true),
				hideOnMobile: fc.option(fc.boolean(), { nil: undefined }),
			}),
			{ minLength: hiddenCount, maxLength: hiddenCount },
		)

		return fc.tuple(visibleColumns, hiddenColumns).map(([visible, hidden]) => {
			// Shuffle the columns to mix hidden and visible
			const all = [...visible, ...hidden]
			// Simple shuffle using sort with random comparator
			return all.sort(() => Math.random() - 0.5)
		})
	})
	.map((columns) => {
		// Ensure unique keys
		const seen = new Set<string>()
		return columns.filter((col) => {
			if (seen.has(col.key)) return false
			seen.add(col.key)
			return true
		})
	})
	.filter((columns) => {
		const visibleCount = columns.filter((c) => !c.hidden).length
		const hiddenCount = columns.filter((c) => c.hidden).length
		return visibleCount >= 1 && hiddenCount >= 1
	})

// ─────────────────────────────────────────────────────────────────────────────
// Property Tests for Hidden Column Exclusion
// ─────────────────────────────────────────────────────────────────────────────

describe('Feature: reusable-data-table, Property 2: Hidden Column Exclusion', () => {
	/**
	 * Property 2.1: Hidden columns are not rendered in the DOM
	 *
	 * For any column definition with `hidden: true`, the rendered DataTable
	 * SHALL NOT include that column in the DOM.
	 */
	it('should not render columns with hidden: true', () => {
		fc.assert(
			fc.property(
				mixedHiddenColumnsArbitrary,
				testItemListArbitrary(1, 5),
				(columns, data) => {
					const visibleColumns = columns.filter((col) => !col.hidden)

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					// Get all header cells
					const headerCells = container.querySelectorAll('thead th')

					// The primary property: rendered column count equals visible column count
					expect(headerCells.length).toBe(visibleColumns.length)

					// Verify data rows also have correct cell count
					if (data.length > 0) {
						const dataCells = container.querySelectorAll('tbody tr:first-child td')
						expect(dataCells.length).toBe(visibleColumns.length)
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 2.2: Rendered column count equals visible column count
	 *
	 * The total rendered column count SHALL equal the count of columns
	 * where `hidden !== true`.
	 */
	it('should render exactly the count of columns where hidden !== true', () => {
		fc.assert(
			fc.property(
				columnsWithHiddenArbitrary(2, 8),
				testItemListArbitrary(0, 5),
				(columns, data) => {
					const expectedVisibleCount = columns.filter((col) => !col.hidden).length

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					// Count header cells
					const headerCells = container.querySelectorAll('thead th')
					expect(headerCells.length).toBe(expectedVisibleCount)

					// If there's data, verify cell count per row matches
					if (data.length > 0) {
						const rows = container.querySelectorAll('tbody tr')
						rows.forEach((row) => {
							const cells = row.querySelectorAll('td')
							expect(cells.length).toBe(expectedVisibleCount)
						})
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 2.3: columnVisibility prop hides columns dynamically
	 *
	 * When columnVisibility prop is provided with a column key set to false,
	 * that column SHALL NOT be rendered in the DOM.
	 */
	it('should hide columns when columnVisibility[key] is false', () => {
		fc.assert(
			fc.property(
				// Generate columns without hidden property (all visible by default)
				fc.array(accessorKeyColumnArbitrary, { minLength: 2, maxLength: 6 })
					.map((cols) => {
						const seen = new Set<string>()
						return cols.filter((c) => {
							if (seen.has(c.key)) return false
							seen.add(c.key)
							return true
						})
					})
					.filter((cols) => cols.length >= 2),
				testItemListArbitrary(1, 5),
				// Generate a random subset of columns to hide
				fc.integer({ min: 1, max: 3 }),
				(columns, data, hideCount) => {
					// Determine which columns to hide (up to hideCount, but leave at least 1 visible)
					const maxHide = Math.min(hideCount, columns.length - 1)
					const columnsToHide = columns.slice(0, maxHide)
					const columnsToShow = columns.slice(maxHide)

					// Create columnVisibility object
					const columnVisibility: Record<string, boolean> = {}
					columnsToHide.forEach((col) => {
						columnVisibility[col.key] = false
					})
					columnsToShow.forEach((col) => {
						columnVisibility[col.key] = true
					})

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
							columnVisibility={columnVisibility}
						/>,
					)

					// The primary property: rendered column count equals visible column count
					const headerCells = container.querySelectorAll('thead th')
					expect(headerCells.length).toBe(columnsToShow.length)

					// Verify data rows also have correct cell count
					if (data.length > 0) {
						const dataCells = container.querySelectorAll('tbody tr:first-child td')
						expect(dataCells.length).toBe(columnsToShow.length)
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 2.4: Combined hidden property and columnVisibility
	 *
	 * When both `hidden: true` on column definition AND columnVisibility prop
	 * are used, columns should be hidden if EITHER condition is true.
	 */
	it('should hide columns when hidden property OR columnVisibility is false', () => {
		fc.assert(
			fc.property(
				columnsWithHiddenArbitrary(3, 6),
				testItemListArbitrary(1, 5),
				(columns, data) => {
					// Create columnVisibility that hides some additional columns
					const columnVisibility: Record<string, boolean> = {}
					columns.forEach((col, index) => {
						// Hide every other column via columnVisibility
						columnVisibility[col.key] = index % 2 === 0
					})

					// A column is visible only if:
					// 1. hidden !== true AND
					// 2. columnVisibility[key] !== false
					const expectedVisibleColumns = columns.filter((col) => {
						if (col.hidden) return false
						if (columnVisibility[col.key] === false) return false
						return true
					})

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
							columnVisibility={columnVisibility}
						/>,
					)

					const headerCells = container.querySelectorAll('thead th')
					expect(headerCells.length).toBe(expectedVisibleColumns.length)
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 2.5: All columns hidden except one shows single column
	 *
	 * When all columns except one have `hidden: true`, the DataTable
	 * SHALL render exactly one column.
	 */
	it('should render single column when all others are hidden', () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 2, max: 6 }),
				testItemListArbitrary(1, 5),
				(totalColumns, data) => {
					// Create columns where only the first is visible
					const columns: Column<TestItem>[] = Array.from(
						{ length: totalColumns },
						(_, index) => ({
							key: `col-${index}`,
							header: `Header ${index}`,
							accessorKey: 'name' as keyof TestItem,
							hidden: index !== 0, // Only first column is visible
						}),
					)

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					const headerCells = container.querySelectorAll('thead th')
					expect(headerCells.length).toBe(1)
					expect(headerCells[0].textContent).toContain('Header 0')
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 2.6: Hidden columns don't affect cell data rendering
	 *
	 * When some columns are hidden, the visible columns SHALL still
	 * render their cell data correctly.
	 */
	it('should render correct cell data for visible columns when some are hidden', () => {
		fc.assert(
			fc.property(
				mixedHiddenColumnsArbitrary,
				testItemListArbitrary(1, 5),
				(columns, data) => {
					const visibleColumns = columns.filter((col) => !col.hidden)

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
						/>,
					)

					const rows = container.querySelectorAll('tbody tr')
					expect(rows.length).toBe(data.length)

					// Verify each visible column's data is rendered correctly
					data.forEach((item, rowIndex) => {
						const row = rows[rowIndex]
						const cells = row.querySelectorAll('td')

						expect(cells.length).toBe(visibleColumns.length)

						visibleColumns.forEach((column, colIndex) => {
							if (column.accessorKey) {
								const expectedValue = String(item[column.accessorKey] ?? '')
								const cellText = cells[colIndex]?.textContent ?? ''
								expect(cellText).toBe(expectedValue)
							}
						})
					})
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 2.7: columnVisibility with undefined values treats as visible
	 *
	 * When columnVisibility is provided but a column key is not present,
	 * that column SHALL be treated as visible.
	 */
	it('should treat columns as visible when not in columnVisibility', () => {
		fc.assert(
			fc.property(
				fc.array(accessorKeyColumnArbitrary, { minLength: 3, maxLength: 6 })
					.map((cols) => {
						const seen = new Set<string>()
						return cols.filter((c) => {
							if (seen.has(c.key)) return false
							seen.add(c.key)
							return true
						})
					})
					.filter((cols) => cols.length >= 3),
				testItemListArbitrary(1, 5),
				(columns, data) => {
					// Only specify visibility for the first column (hide it)
					// Other columns should remain visible by default
					const columnVisibility: Record<string, boolean> = {
						[columns[0].key]: false,
					}

					const expectedVisibleCount = columns.length - 1

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
							columnVisibility={columnVisibility}
						/>,
					)

					const headerCells = container.querySelectorAll('thead th')
					expect(headerCells.length).toBe(expectedVisibleCount)
				},
			),
			{ numRuns: 100 },
		)
	})

	/**
	 * Property 2.8: Selection checkbox column is not affected by hidden columns
	 *
	 * When selectable is true and some columns are hidden, the selection
	 * checkbox column SHALL still be rendered as the first column.
	 */
	it('should render selection checkbox regardless of hidden columns', () => {
		fc.assert(
			fc.property(
				mixedHiddenColumnsArbitrary,
				testItemListArbitrary(1, 5),
				(columns, data) => {
					const visibleColumns = columns.filter((col) => !col.hidden)
					const selectedIds = new Set<number | string>()

					const { container } = render(
						<DataTable
							data={data}
							columns={columns}
							keyExtractor={keyExtractor}
							selectable
							selectedIds={selectedIds}
							onSelectionChange={() => {}}
						/>,
					)

					// Header should have visible columns + 1 for checkbox
					const headerCells = container.querySelectorAll('thead th')
					expect(headerCells.length).toBe(visibleColumns.length + 1)

					// Each data row should have visible columns + 1 for checkbox
					const rows = container.querySelectorAll('tbody tr')
					rows.forEach((row) => {
						const cells = row.querySelectorAll('td')
						expect(cells.length).toBe(visibleColumns.length + 1)
					})
				},
			),
			{ numRuns: 100 },
		)
	})
})
