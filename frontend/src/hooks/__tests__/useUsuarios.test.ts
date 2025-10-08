import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useUsuarios } from '../useUsuarios'
import * as usuarioService from '@services/usuarioService'

// Mock the usuario service
vi.mock('@services/usuarioService', () => ({
  getUsuarios: vi.fn(),
  getUsuarioById: vi.fn(),
  createUsuario: vi.fn(),
  updateUsuario: vi.fn(),
  deleteUsuario: vi.fn(),
}))

describe('useUsuarios Hook', () => {
  const mockUsuarios = [
    {
      id: '1',
      emailLogin: 'user1@example.com',
      nomeCompleto: 'User One',
      statusFinal: 'ATIVO',
    },
    {
      id: '2',
      emailLogin: 'user2@example.com',
      nomeCompleto: 'User Two',
      statusFinal: 'INATIVO',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch usuarios on mount', async () => {
    vi.mocked(usuarioService.getUsuarios).mockResolvedValue({
      data: mockUsuarios,
      total: 2,
      page: 1,
      pageSize: 10,
    })

    const { result } = renderHook(() => useUsuarios())

    // Initially loading
    expect(result.current.loading).toBe(true)
    expect(result.current.usuarios).toEqual([])

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.usuarios).toEqual(mockUsuarios)
    expect(result.current.total).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it('should handle filters', async () => {
    vi.mocked(usuarioService.getUsuarios).mockResolvedValue({
      data: [mockUsuarios[0]],
      total: 1,
      page: 1,
      pageSize: 10,
    })

    const { result, rerender } = renderHook(
      (props) => useUsuarios(props.filters),
      {
        initialProps: { filters: { statusFinal: 'ATIVO' } },
      }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(usuarioService.getUsuarios).toHaveBeenCalledWith(
      expect.objectContaining({
        statusFinal: 'ATIVO',
      }),
      1,
      10
    )

    // Change filters
    vi.mocked(usuarioService.getUsuarios).mockResolvedValue({
      data: [mockUsuarios[1]],
      total: 1,
      page: 1,
      pageSize: 10,
    })

    rerender({ filters: { statusFinal: 'INATIVO' } })

    await waitFor(() => {
      expect(usuarioService.getUsuarios).toHaveBeenCalledWith(
        expect.objectContaining({
          statusFinal: 'INATIVO',
        }),
        1,
        10
      )
    })
  })

  it('should handle pagination', async () => {
    vi.mocked(usuarioService.getUsuarios).mockResolvedValue({
      data: mockUsuarios,
      total: 20,
      page: 1,
      pageSize: 10,
    })

    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Change page
    await result.current.setPage(2)

    await waitFor(() => {
      expect(usuarioService.getUsuarios).toHaveBeenCalledWith({}, 2, 10)
    })

    // Change page size
    await result.current.setPageSize(20)

    await waitFor(() => {
      expect(usuarioService.getUsuarios).toHaveBeenLastCalledWith({}, 1, 20)
    })
  })

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch usuarios')
    vi.mocked(usuarioService.getUsuarios).mockRejectedValue(error)

    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch usuarios')
    expect(result.current.usuarios).toEqual([])
  })

  it('should create a new usuario', async () => {
    const newUsuario = {
      emailLogin: 'new@example.com',
      nomeCompleto: 'New User',
    }

    const createdUsuario = {
      id: '3',
      ...newUsuario,
      statusFinal: 'INATIVO',
    }

    vi.mocked(usuarioService.getUsuarios).mockResolvedValue({
      data: mockUsuarios,
      total: 2,
      page: 1,
      pageSize: 10,
    })

    vi.mocked(usuarioService.createUsuario).mockResolvedValue(createdUsuario)

    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.createUsuario(newUsuario)

    expect(usuarioService.createUsuario).toHaveBeenCalledWith(newUsuario)

    // Should refetch usuarios after creation
    await waitFor(() => {
      expect(usuarioService.getUsuarios).toHaveBeenCalledTimes(2)
    })
  })

  it('should update a usuario', async () => {
    const updatedData = {
      nomeCompleto: 'Updated Name',
    }

    vi.mocked(usuarioService.getUsuarios).mockResolvedValue({
      data: mockUsuarios,
      total: 2,
      page: 1,
      pageSize: 10,
    })

    vi.mocked(usuarioService.updateUsuario).mockResolvedValue({
      ...mockUsuarios[0],
      ...updatedData,
    })

    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.updateUsuario('1', updatedData)

    expect(usuarioService.updateUsuario).toHaveBeenCalledWith('1', updatedData)

    // Should refetch usuarios after update
    await waitFor(() => {
      expect(usuarioService.getUsuarios).toHaveBeenCalledTimes(2)
    })
  })

  it('should delete a usuario', async () => {
    vi.mocked(usuarioService.getUsuarios).mockResolvedValue({
      data: mockUsuarios,
      total: 2,
      page: 1,
      pageSize: 10,
    })

    vi.mocked(usuarioService.deleteUsuario).mockResolvedValue(undefined)

    const { result } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.deleteUsuario('1')

    expect(usuarioService.deleteUsuario).toHaveBeenCalledWith('1')

    // Should refetch usuarios after deletion
    await waitFor(() => {
      expect(usuarioService.getUsuarios).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle cache properly', async () => {
    vi.mocked(usuarioService.getUsuarios).mockResolvedValue({
      data: mockUsuarios,
      total: 2,
      page: 1,
      pageSize: 10,
    })

    const { result, rerender } = renderHook(() => useUsuarios())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(usuarioService.getUsuarios).toHaveBeenCalledTimes(1)

    // Rerender with same props should use cache
    rerender()

    expect(usuarioService.getUsuarios).toHaveBeenCalledTimes(1)

    // Force refresh
    await result.current.refresh()

    await waitFor(() => {
      expect(usuarioService.getUsuarios).toHaveBeenCalledTimes(2)
    })
  })
})