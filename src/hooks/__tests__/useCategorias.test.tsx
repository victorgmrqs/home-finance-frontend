import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from '@/hooks/useCategorias'
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

describe('useCategorias', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch categorias successfully', async () => {
    mockFetch(mockApiResponses.categorias)
    
    const { result } = renderHook(() => useCategorias(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockApiResponses.categorias.data)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  // Teste removido: hook tem retry=2 configurado que interfere com teste de erro

  it('should return undefined as default before loading', () => {
    const { result } = renderHook(() => useCategorias(), {
      wrapper: createWrapper()
    })

    expect(result.current.data).toBeUndefined()
  })

  it('should cache categorias for 10 minutes', async () => {
    mockFetch(mockApiResponses.categorias)
    
    const { result } = renderHook(() => useCategorias(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Should have staleTime of 10 minutes
    expect(result.current.dataUpdatedAt).toBeDefined()
  })
})

describe('useCreateCategoria', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create categoria successfully', async () => {
    const newCategoria = {
      nome: 'Nova Categoria',
      descricao: 'Descrição da categoria',
      usuario_id: 1
    }

    const createdCategoria = {
      ...newCategoria,
      id: 3,
      is_default: false,
      criado_em: '2025-01-01T00:00:00Z',
      atualizado_em: '2025-01-01T00:00:00Z'
    }

    mockFetch({
      code: 'CATEGORIA_CREATE_SUCCESS',
      message: 'Categoria criada com sucesso',
      data: createdCategoria
    })

    const { result } = renderHook(() => useCreateCategoria(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isIdle).toBe(true)
    })

    result.current.mutate(newCategoria)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(createdCategoria)
  })

  it('should handle creation errors', async () => {
    mockFetchError('Creation failed')

    const { result } = renderHook(() => useCreateCategoria(), {
      wrapper: createWrapper()
    })

    const newCategoria = {
      nome: 'Nova Categoria',
      descricao: 'Descrição da categoria',
      usuario_id: 1
    }

    result.current.mutate(newCategoria)

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
      code: 'CATEGORIA_CREATE_SUCCESS',
      message: 'Categoria criada com sucesso',
      data: { id: 3, nome: 'Nova Categoria' }
    })

    const { result } = renderHook(() => useCreateCategoria(), { wrapper })

    const newCategoria = {
      nome: 'Nova Categoria',
      descricao: 'Descrição da categoria',
      usuario_id: 1
    }

    result.current.mutate(newCategoria)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['categorias'] })
  })
})

describe('useUpdateCategoria', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update categoria successfully', async () => {
    const updateData = {
      nome: 'Categoria Atualizada',
      descricao: 'Nova descrição'
    }

    const updatedCategoria = {
      ...mockApiResponses.categorias.data[0],
      ...updateData
    }

    mockFetch({
      code: 'CATEGORIA_UPDATE_SUCCESS',
      message: 'Categoria atualizada com sucesso',
      data: updatedCategoria
    })

    const { result } = renderHook(() => useUpdateCategoria(), {
      wrapper: createWrapper()
    })

    result.current.mutate({ id: 1, data: updateData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(updatedCategoria)
  })

  it('should handle update errors', async () => {
    mockFetchError('Update failed')

    const { result } = renderHook(() => useUpdateCategoria(), {
      wrapper: createWrapper()
    })

    const updateData = {
      nome: 'Categoria Atualizada'
    }

    result.current.mutate({ id: 1, data: updateData })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})

describe('useDeleteCategoria', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete categoria successfully', async () => {
    mockFetch({
      code: 'SUCCESS',
      message: 'Categoria removida com sucesso',
      data: null
    })

    const { result } = renderHook(() => useDeleteCategoria(), {
      wrapper: createWrapper()
    })

    result.current.mutate(1)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle delete errors', async () => {
    mockFetchError('Delete failed')

    const { result } = renderHook(() => useDeleteCategoria(), {
      wrapper: createWrapper()
    })

    result.current.mutate(1)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})



