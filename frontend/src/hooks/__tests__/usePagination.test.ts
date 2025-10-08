import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '../usePagination'

describe('usePagination Hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination())

    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(10)
    expect(result.current.total).toBe(0)
    expect(result.current.totalPages).toBe(0)
  })

  it('should initialize with custom values', () => {
    const { result } = renderHook(() =>
      usePagination({
        initialPage: 2,
        initialPageSize: 20,
        total: 100,
      })
    )

    expect(result.current.page).toBe(2)
    expect(result.current.pageSize).toBe(20)
    expect(result.current.total).toBe(100)
    expect(result.current.totalPages).toBe(5)
  })

  it('should update page', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }))

    act(() => {
      result.current.setPage(3)
    })

    expect(result.current.page).toBe(3)
  })

  it('should not allow page less than 1', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }))

    act(() => {
      result.current.setPage(0)
    })

    expect(result.current.page).toBe(1)

    act(() => {
      result.current.setPage(-5)
    })

    expect(result.current.page).toBe(1)
  })

  it('should not allow page greater than totalPages', () => {
    const { result } = renderHook(() => usePagination({ total: 50, initialPageSize: 10 }))

    // Total pages = 50/10 = 5
    expect(result.current.totalPages).toBe(5)

    act(() => {
      result.current.setPage(10)
    })

    expect(result.current.page).toBe(5)
  })

  it('should update pageSize and reset to page 1', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, initialPage: 3 })
    )

    expect(result.current.page).toBe(3)

    act(() => {
      result.current.setPageSize(25)
    })

    expect(result.current.pageSize).toBe(25)
    expect(result.current.page).toBe(1) // Reset to page 1
    expect(result.current.totalPages).toBe(4) // 100/25 = 4
  })

  it('should update total', () => {
    const { result } = renderHook(() => usePagination())

    act(() => {
      result.current.setTotal(150)
    })

    expect(result.current.total).toBe(150)
    expect(result.current.totalPages).toBe(15) // 150/10 = 15
  })

  it('should navigate to next page', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }))

    expect(result.current.page).toBe(1)

    act(() => {
      result.current.nextPage()
    })

    expect(result.current.page).toBe(2)

    act(() => {
      result.current.nextPage()
    })

    expect(result.current.page).toBe(3)
  })

  it('should not navigate past last page', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 30, initialPageSize: 10 })
    )

    // Total pages = 3
    expect(result.current.totalPages).toBe(3)

    act(() => {
      result.current.setPage(3)
    })

    act(() => {
      result.current.nextPage()
    })

    expect(result.current.page).toBe(3) // Should stay at page 3
  })

  it('should navigate to previous page', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, initialPage: 3 })
    )

    expect(result.current.page).toBe(3)

    act(() => {
      result.current.previousPage()
    })

    expect(result.current.page).toBe(2)

    act(() => {
      result.current.previousPage()
    })

    expect(result.current.page).toBe(1)
  })

  it('should not navigate before first page', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }))

    expect(result.current.page).toBe(1)

    act(() => {
      result.current.previousPage()
    })

    expect(result.current.page).toBe(1) // Should stay at page 1
  })

  it('should navigate to first page', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, initialPage: 5 })
    )

    expect(result.current.page).toBe(5)

    act(() => {
      result.current.firstPage()
    })

    expect(result.current.page).toBe(1)
  })

  it('should navigate to last page', () => {
    const { result } = renderHook(() => usePagination({ total: 100 }))

    expect(result.current.page).toBe(1)
    expect(result.current.totalPages).toBe(10)

    act(() => {
      result.current.lastPage()
    })

    expect(result.current.page).toBe(10)
  })

  it('should calculate offset correctly', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, initialPageSize: 20 })
    )

    expect(result.current.offset).toBe(0) // Page 1: (1-1) * 20 = 0

    act(() => {
      result.current.setPage(2)
    })

    expect(result.current.offset).toBe(20) // Page 2: (2-1) * 20 = 20

    act(() => {
      result.current.setPage(5)
    })

    expect(result.current.offset).toBe(80) // Page 5: (5-1) * 20 = 80
  })

  it('should provide pagination info', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 55, initialPageSize: 10, initialPage: 3 })
    )

    const info = result.current.paginationInfo

    expect(info.from).toBe(21) // (3-1) * 10 + 1
    expect(info.to).toBe(30) // 3 * 10
    expect(info.total).toBe(55)
    expect(info.currentPage).toBe(3)
    expect(info.totalPages).toBe(6)
    expect(info.hasNextPage).toBe(true)
    expect(info.hasPreviousPage).toBe(true)
  })

  it('should handle edge case with total 0', () => {
    const { result } = renderHook(() => usePagination({ total: 0 }))

    expect(result.current.totalPages).toBe(0)
    expect(result.current.paginationInfo.from).toBe(0)
    expect(result.current.paginationInfo.to).toBe(0)
    expect(result.current.paginationInfo.hasNextPage).toBe(false)
    expect(result.current.paginationInfo.hasPreviousPage).toBe(false)
  })

  it('should handle last page with partial items', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 55, initialPageSize: 10, initialPage: 6 })
    )

    // Last page with only 5 items
    const info = result.current.paginationInfo

    expect(info.from).toBe(51) // (6-1) * 10 + 1
    expect(info.to).toBe(55) // Should be 55, not 60
    expect(info.hasNextPage).toBe(false)
    expect(info.hasPreviousPage).toBe(true)
  })

  it('should reset page when total changes to lower value', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, initialPage: 8 })
    )

    expect(result.current.page).toBe(8)

    act(() => {
      result.current.setTotal(30) // Now only 3 pages
    })

    expect(result.current.page).toBe(3) // Should reset to last valid page
    expect(result.current.totalPages).toBe(3)
  })

  it('should provide range of pages for pagination UI', () => {
    const { result } = renderHook(() =>
      usePagination({ total: 150, initialPage: 5 })
    )

    const range = result.current.getPageRange(5) // Show 5 pages

    expect(range).toEqual([3, 4, 5, 6, 7]) // Current page in the middle

    act(() => {
      result.current.setPage(1)
    })

    const rangeAtStart = result.current.getPageRange(5)
    expect(rangeAtStart).toEqual([1, 2, 3, 4, 5]) // Start of pagination

    act(() => {
      result.current.setPage(15)
    })

    const rangeAtEnd = result.current.getPageRange(5)
    expect(rangeAtEnd).toEqual([11, 12, 13, 14, 15]) // End of pagination
  })
})