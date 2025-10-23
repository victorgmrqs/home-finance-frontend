import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMoveTransaction } from '@/hooks/useMoveTransaction'
import { mockTransaction } from '@/test/test-utils'

// Mock fetch
global.fetch = vi.fn()

describe('useMoveTransaction', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('should move transaction successfully', async () => {
    const movedTransaction = { ...mockTransaction, painel_id: 2 }
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => movedTransaction,
    } as Response)

    const { result } = renderHook(() => useMoveTransaction(), { wrapper })

    result.current.mutate({
      id: 1,
      novo_painel_id: 2
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isPending).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle loading state during mutation', () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useMoveTransaction(), { wrapper })

    result.current.mutate({
      id: 1,
      novo_painel_id: 2
    })

    expect(result.current.isPending).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()
  })

  it('should handle error state', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useMoveTransaction(), { wrapper })

    result.current.mutate({
      id: 1,
      novo_painel_id: 2
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isPending).toBe(false)
  })

  it('should handle API error response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    } as Response)

    const { result } = renderHook(() => useMoveTransaction(), { wrapper })

    result.current.mutate({
      id: 1,
      novo_painel_id: 2
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should use correct API endpoint and method', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransaction,
    } as Response)

    const { result } = renderHook(() => useMoveTransaction(), { wrapper })

    result.current.mutate({
      id: 1,
      novo_painel_id: 2
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/transactions/1',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ painel_id: 2 }),
      })
    )
  })

  it('should handle invalid transaction ID', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    const { result } = renderHook(() => useMoveTransaction(), { wrapper })

    result.current.mutate({
      transactionId: 999,
      newPainelId: 2
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should handle invalid painel ID', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    } as Response)

    const { result } = renderHook(() => useMoveTransaction(), { wrapper })

    result.current.mutate({
      transactionId: 1,
      newPainelId: 999
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should handle malformed JSON response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON')
      },
    } as Response)

    const { result } = renderHook(() => useMoveTransaction(), { wrapper })

    result.current.mutate({
      id: 1,
      novo_painel_id: 2
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should reset error state on new mutation', async () => {
    // First mutation fails
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useMoveTransaction(), { wrapper })

    result.current.mutate({
      id: 1,
      novo_painel_id: 2
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    // Second mutation succeeds
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransaction,
    } as Response)

    result.current.mutate({
      transactionId: 1,
      newPainelId: 3
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.error).toBeNull()
  })
})
