import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInfiniteTransactions } from '@/hooks/useInfiniteTransactions'
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

describe('useInfiniteTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty transactions', () => {
    const { result } = renderHook(
      () => useInfiniteTransactions({ filters: {} }),
      { wrapper: createWrapper() }
    )

    expect(result.current.transactions).toEqual([])
    expect(result.current.isLoading).toBe(true) // Should be loading because no painel_id
    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalLoaded).toBe(0)
  })

  it('should load transactions with valid filters', async () => {
    mockFetch(mockApiResponses.transactions)
    
    const { result } = renderHook(
      () => useInfiniteTransactions({ 
        filters: { painel_id: 1 },
        itemsPerPage: 10 
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.transactions).toEqual(mockApiResponses.transactions.data)
    expect(result.current.totalLoaded).toBe(1)
    expect(result.current.hasMore).toBe(false) // Only 1 item, less than page size
  })

  it('should handle pagination correctly', async () => {
    const firstPage = {
      ...mockApiResponses.transactions,
      data: Array.from({ length: 10 }, (_, i) => ({
        ...mockApiResponses.transactions.data[0],
        id: i + 1
      }))
    }

    const secondPage = {
      ...mockApiResponses.transactions,
      data: Array.from({ length: 5 }, (_, i) => ({
        ...mockApiResponses.transactions.data[0],
        id: i + 11
      }))
    }

    let callCount = 0
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(firstPage),
        })
      } else {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(secondPage),
        })
      }
    })

    const { result } = renderHook(
      () => useInfiniteTransactions({ 
        filters: { painel_id: 1 },
        itemsPerPage: 10 
      }),
      { wrapper: createWrapper() }
    )

    // Wait for first page
    await waitFor(() => {
      expect(result.current.transactions.length).toBe(10)
    })

    expect(result.current.hasMore).toBe(true)

    // Load more
    result.current.loadMore()

    await waitFor(() => {
      expect(result.current.transactions.length).toBe(15)
    })

    expect(result.current.hasMore).toBe(false) // No more data
  })

  it('should reset when filters change', async () => {
    mockFetch(mockApiResponses.transactions)
    
    const { result, rerender } = renderHook(
      ({ filters }) => useInfiniteTransactions({ filters }),
      { 
        wrapper: createWrapper(),
        initialProps: { filters: { painel_id: 1 } }
      }
    )

    await waitFor(() => {
      expect(result.current.transactions.length).toBe(1)
    })

    // Change filters
    rerender({ filters: { painel_id: 2 } })

    await waitFor(() => {
      expect(result.current.currentPage).toBe(1)
    })

    expect(result.current.transactions).toEqual([]) // Should be reset
  })

  it('should not load more when already loading', () => {
    const { result } = renderHook(
      () => useInfiniteTransactions({ 
        filters: { painel_id: 1 },
        itemsPerPage: 10 
      }),
      { wrapper: createWrapper() }
    )

    // Try to load more while loading
    result.current.loadMore()
    result.current.loadMore()
    result.current.loadMore()

    // Should only call API once
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('should handle errors gracefully', async () => {
    mockFetchError('Network error')
    
    const { result } = renderHook(
      () => useInfiniteTransactions({ 
        filters: { painel_id: 1 },
        itemsPerPage: 10 
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })

    expect(result.current.transactions).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })

  it('should prevent duplicate transactions on pagination', async () => {
    const transaction = mockApiResponses.transactions.data[0]
    
    // Mock API to return same transaction twice
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ...mockApiResponses.transactions,
        data: [transaction]
      }),
    })

    const { result } = renderHook(
      () => useInfiniteTransactions({ 
        filters: { painel_id: 1 },
        itemsPerPage: 10 
      }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.transactions.length).toBe(1)
    })

    // Load more (should not add duplicates)
    result.current.loadMore()

    await waitFor(() => {
      expect(result.current.transactions.length).toBe(1) // Still 1, no duplicates
    })
  })

  it('should reset correctly', () => {
    const { result } = renderHook(
      () => useInfiniteTransactions({ 
        filters: { painel_id: 1 },
        itemsPerPage: 10 
      }),
      { wrapper: createWrapper() }
    )

    // Manually set some state
    result.current.reset()

    expect(result.current.currentPage).toBe(1)
    expect(result.current.transactions).toEqual([])
    expect(result.current.hasMore).toBe(true)
    expect(result.current.isLoadingMore).toBe(false)
  })
})



