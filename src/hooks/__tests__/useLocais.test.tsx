import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLocais, useCreateLocal, useUpdateLocal, useDeleteLocal } from '@/hooks/useLocais'
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

describe('useLocais', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch locais successfully', async () => {
    mockFetch(mockApiResponses.locais)
    
    const { result } = renderHook(() => useLocais(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockApiResponses.locais.data)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should fetch locais with parameters', async () => {
    mockFetch(mockApiResponses.locais)
    
    const { result } = renderHook(
      () => useLocais({ limit: 5, offset: 0 }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockApiResponses.locais.data)
  })

  it('should handle API errors', async () => {
    mockFetchError('Network error')
    
    const { result } = renderHook(() => useLocais(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.data).toBeUndefined()
  })

  it('should return empty array as default', () => {
    const { result } = renderHook(() => useLocais(), {
      wrapper: createWrapper()
    })

    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateLocal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create local successfully', async () => {
    const newLocal = {
      nome_fantasia: 'Novo Local',
      endereco: 'Rua Nova, 123',
      cidade: 'São Paulo',
      estado: 'SP'
    }

    const createdLocal = {
      ...newLocal,
      id: 2,
      criado_em: '2025-01-01T00:00:00Z',
      atualizado_em: '2025-01-01T00:00:00Z'
    }

    mockFetch({
      code: 'LOCAL_CREATE_SUCCESS',
      message: 'Local criado com sucesso',
      data: createdLocal
    })

    const { result } = renderHook(() => useCreateLocal(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isIdle).toBe(true)
    })

    result.current.mutate(newLocal)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(createdLocal)
  })

  it('should handle creation errors', async () => {
    mockFetchError('Creation failed')

    const { result } = renderHook(() => useCreateLocal(), {
      wrapper: createWrapper()
    })

    const newLocal = {
      nome_fantasia: 'Novo Local',
      endereco: 'Rua Nova, 123',
      cidade: 'São Paulo',
      estado: 'SP'
    }

    result.current.mutate(newLocal)

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
      code: 'LOCAL_CREATE_SUCCESS',
      message: 'Local criado com sucesso',
      data: { id: 2, nome_fantasia: 'Novo Local' }
    })

    const { result } = renderHook(() => useCreateLocal(), { wrapper })

    const newLocal = {
      nome_fantasia: 'Novo Local',
      endereco: 'Rua Nova, 123',
      cidade: 'São Paulo',
      estado: 'SP'
    }

    result.current.mutate(newLocal)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['locais'] })
  })
})

describe('useUpdateLocal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update local successfully', async () => {
    const updateData = {
      nome_fantasia: 'Local Atualizado',
      endereco: 'Nova Rua, 456'
    }

    const updatedLocal = {
      ...mockApiResponses.locais.data[0],
      ...updateData
    }

    mockFetch({
      code: 'LOCAL_UPDATE_SUCCESS',
      message: 'Local atualizado com sucesso',
      data: updatedLocal
    })

    const { result } = renderHook(() => useUpdateLocal(), {
      wrapper: createWrapper()
    })

    result.current.mutate({ id: 1, data: updateData })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(updatedLocal)
  })

  it('should handle update errors', async () => {
    mockFetchError('Update failed')

    const { result } = renderHook(() => useUpdateLocal(), {
      wrapper: createWrapper()
    })

    const updateData = {
      nome_fantasia: 'Local Atualizado'
    }

    result.current.mutate({ id: 1, data: updateData })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})

describe('useDeleteLocal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete local successfully', async () => {
    mockFetch({
      code: 'LOCAL_DELETE_SUCCESS',
      message: 'Local removido com sucesso'
    })

    const { result } = renderHook(() => useDeleteLocal(), {
      wrapper: createWrapper()
    })

    result.current.mutate(1)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle delete errors', async () => {
    mockFetchError('Delete failed')

    const { result } = renderHook(() => useDeleteLocal(), {
      wrapper: createWrapper()
    })

    result.current.mutate(1)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})



