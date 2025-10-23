import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePaineis, useCreatePainel, useUpdatePainel, useDeletePainel } from '@/hooks/usePaineis'
import { mockApiResponses, mockFetch, mockFetchError } from '@/test/test-utils'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('usePaineis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch paineis successfully', async () => {
    mockFetch(mockApiResponses.paineis)
    
    const { result } = renderHook(() => usePaineis(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockApiResponses.paineis.data)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should fetch paineis with parameters', async () => {
    mockFetch(mockApiResponses.paineis)
    
    const { result } = renderHook(
      () => usePaineis({ limit: 5, offset: 0, usuario_id: 1 }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockApiResponses.paineis.data)
  })

  it('should handle API errors', async () => {
    mockFetchError('Network error')
    
    const { result } = renderHook(() => usePaineis(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.data).toBeUndefined()
  })

  it('should return empty array as default', () => {
    const { result } = renderHook(() => usePaineis(), {
      wrapper: createWrapper()
    })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreatePainel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create painel successfully', async () => {
    const newPainel = {
      nome: 'Novo Painel',
      descricao: 'Descrição do painel',
      usuario_id: 1
    }

    const createdPainel = {
      ...newPainel,
      id: 3,
      criado_em: '2025-01-01T00:00:00Z',
      atualizado_em: '2025-01-01T00:00:00Z'
    }

    mockFetch({
      code: 'PAINEL_CREATE_SUCCESS',
      message: 'Painel criado com sucesso',
      data: createdPainel
    })

    const { result } = renderHook(() => useCreatePainel(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isIdle).toBe(true)
    })

    result.current.mutate(newPainel)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(createdPainel)
  })

  it('should handle creation errors', async () => {
    mockFetchError('Creation failed')

    const { result } = renderHook(() => useCreatePainel(), {
      wrapper: createWrapper()
    })

    const newPainel = {
      nome: 'Novo Painel',
      descricao: 'Descrição do painel',
      usuario_id: 1
    }

    result.current.mutate(newPainel)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should invalidate queries on success', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    mockFetch({
      code: 'PAINEL_CREATE_SUCCESS',
      message: 'Painel criado com sucesso',
      data: { id: 3, nome: 'Novo Painel' }
    })

    const { result } = renderHook(() => useCreatePainel(), { wrapper })

    const newPainel = {
      nome: 'Novo Painel',
      descricao: 'Descrição do painel',
      usuario_id: 1
    }

    result.current.mutate(newPainel)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['paineis'] })
  })
})

describe('useUpdatePainel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update painel successfully', async () => {
    const updateData = {
      nome: 'Painel Atualizado',
      descricao: 'Nova descrição'
    }

    const updatedPainel = {
      ...mockApiResponses.paineis.data[0],
      ...updateData
    }

    mockFetch({
      code: 'PAINEL_UPDATE_SUCCESS',
      message: 'Painel atualizado com sucesso',
      data: updatedPainel
    })

    const { result } = renderHook(() => useUpdatePainel(), {
      wrapper: createWrapper()
    })

    result.current.mutate({ id: 1, data: updateData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(updatedPainel)
  })

  it('should handle update errors', async () => {
    mockFetchError('Update failed')

    const { result } = renderHook(() => useUpdatePainel(), {
      wrapper: createWrapper()
    })

    const updateData = {
      nome: 'Painel Atualizado'
    }

    result.current.mutate({ id: 1, data: updateData })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})

describe('useDeletePainel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete painel successfully', async () => {
    mockFetch({
      code: 'PAINEL_DELETE_SUCCESS',
      message: 'Painel removido com sucesso'
    })

    const { result } = renderHook(() => useDeletePainel(), {
      wrapper: createWrapper()
    })

    result.current.mutate(1)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle delete errors', async () => {
    mockFetchError('Delete failed')

    const { result } = renderHook(() => useDeletePainel(), {
      wrapper: createWrapper()
    })

    result.current.mutate(1)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})



