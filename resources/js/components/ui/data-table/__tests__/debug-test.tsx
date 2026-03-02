import { render } from '@testing-library/react'
import { DataTable } from '../data-table'
import type { Column } from '../types'

interface TestData {
  id: number
  name: string
}

const columns: Column<TestData>[] = [
  { key: 'col-0', header: 'Header 0', accessorKey: 'name', hidden: false },
  { key: 'col-1', header: 'Header 1', accessorKey: 'name', hidden: true },
]

const data: TestData[] = [{ id: 1, name: 'Test' }]

const { container } = render(
  <DataTable<TestData> data={data} columns={columns} keyExtractor={(item) => item.id} />
)

const headerCells = container.querySelectorAll('thead th')

