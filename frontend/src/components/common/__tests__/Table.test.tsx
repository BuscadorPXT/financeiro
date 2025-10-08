import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import Table from '../Table'

interface TestData {
  id: string
  name: string
  email: string
  status: string
  age: number
}

describe('Table Component', () => {
  const mockData: TestData[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', age: 30 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', age: 25 },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active', age: 35 },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'pending', age: 28 },
  ]

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'age', header: 'Age', sortable: true },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render table with data', () => {
    render(<Table data={mockData} columns={columns} />)

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()

    // Check data rows
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('35')).toBeInTheDocument()
  })

  it('should show empty state when no data', () => {
    render(<Table data={[]} columns={columns} emptyMessage="No data available" />)

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('should handle row selection', () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        data={mockData}
        columns={columns}
        selectable
        onSelectionChange={onSelectionChange}
      />
    )

    // Click on first row checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // First data row checkbox

    expect(onSelectionChange).toHaveBeenCalledWith(['1'])

    // Click on second row checkbox
    fireEvent.click(checkboxes[2])
    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2'])
  })

  it('should handle select all', () => {
    const onSelectionChange = vi.fn()
    render(
      <Table
        data={mockData}
        columns={columns}
        selectable
        onSelectionChange={onSelectionChange}
      />
    )

    // Click select all checkbox
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(selectAllCheckbox)

    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2', '3', '4'])
  })

  it('should sort data when clicking sortable columns', () => {
    const onSort = vi.fn()
    render(<Table data={mockData} columns={columns} onSort={onSort} />)

    // Click on Name header to sort
    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)

    expect(onSort).toHaveBeenCalledWith('name', 'asc')

    // Click again to reverse sort
    fireEvent.click(nameHeader)
    expect(onSort).toHaveBeenCalledWith('name', 'desc')
  })

  it('should display sort indicators on sortable columns', () => {
    render(
      <Table
        data={mockData}
        columns={columns}
        sortBy="name"
        sortDirection="asc"
      />
    )

    const nameHeader = screen.getByText('Name').closest('th')
    expect(nameHeader).toContainHTML('↑') // Up arrow for ascending
  })

  it('should handle pagination', () => {
    const onPageChange = vi.fn()
    render(
      <Table
        data={mockData}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 2,
          total: 4,
          onPageChange,
        }}
      />
    )

    // Should only show 2 rows (pageSize = 2)
    const rows = screen.getAllByRole('row')
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3)

    // Check pagination controls
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()

    // Click next page
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should render custom cell content', () => {
    const columnsWithRender = [
      {
        key: 'name',
        header: 'Name',
        render: (value: string) => <strong>{value.toUpperCase()}</strong>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (value: string) => (
          <span className={value === 'active' ? 'text-green-500' : 'text-gray-500'}>
            {value}
          </span>
        ),
      },
    ]

    render(<Table data={mockData} columns={columnsWithRender} />)

    // Check custom rendered content
    expect(screen.getByText('JOHN DOE')).toBeInTheDocument()
    const activeStatus = screen.getAllByText('active')[0]
    expect(activeStatus).toHaveClass('text-green-500')
  })

  it('should handle row click', () => {
    const onRowClick = vi.fn()
    render(<Table data={mockData} columns={columns} onRowClick={onRowClick} />)

    // Click on first data row
    const firstRow = screen.getByText('John Doe').closest('tr')
    if (firstRow) fireEvent.click(firstRow)

    expect(onRowClick).toHaveBeenCalledWith(mockData[0])
  })

  it('should apply hover styles on rows', () => {
    render(<Table data={mockData} columns={columns} hoverable />)

    const firstRow = screen.getByText('John Doe').closest('tr')
    expect(firstRow).toHaveClass('hover:bg-gray-50')
  })

  it('should apply striped styles', () => {
    render(<Table data={mockData} columns={columns} striped />)

    const rows = screen.getAllByRole('row')
    // Check alternating row colors (skip header)
    expect(rows[2]).toHaveClass('bg-gray-50') // Even row (0-indexed after header)
  })

  it('should handle loading state', () => {
    render(<Table data={[]} columns={columns} loading />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    // Could also check for loading spinner
    const spinner = document.querySelector('.animate-pulse')
    expect(spinner).toBeInTheDocument()
  })

  it('should support custom row actions', () => {
    const handleEdit = vi.fn()
    const handleDelete = vi.fn()

    const columnsWithActions = [
      ...columns,
      {
        key: 'actions',
        header: 'Actions',
        render: (_: any, row: TestData) => (
          <div>
            <button onClick={() => handleEdit(row)}>Edit</button>
            <button onClick={() => handleDelete(row)}>Delete</button>
          </div>
        ),
      },
    ]

    render(<Table data={mockData} columns={columnsWithActions} />)

    // Click edit on first row
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    expect(handleEdit).toHaveBeenCalledWith(mockData[0])

    // Click delete on second row
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[1])

    expect(handleDelete).toHaveBeenCalledWith(mockData[1])
  })

  it('should filter data based on search term', () => {
    const { rerender } = render(<Table data={mockData} columns={columns} />)

    // All rows should be visible initially
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()

    // Apply search filter
    rerender(<Table data={mockData} columns={columns} searchTerm="john" />)

    // Only matching rows should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Table data={mockData} columns={columns} className="custom-table" />)

    const table = screen.getByRole('table')
    expect(table).toHaveClass('custom-table')
  })
})