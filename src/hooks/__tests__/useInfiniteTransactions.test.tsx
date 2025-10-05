import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { mockTransaction } from '../../test/test-utils'

// Mock the useTransactions hook before importing
vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
}))

import { useInfiniteTransactions } from '@/hooks/useInfiniteTransactions'
import { useTransactions } from '@/hooks/useTransactions'

const mockUseTransactions = vi.mocked(useTransactions)

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useInfiniteTransactions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty transactions', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    expect(result.current.transactions).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.hasMore).toBe(true)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.totalLoaded).toBe(0)
  })

  it('should call useTransactions with correct parameters', () => {
    const filters = { tipo: 'SAIDA' }
    const itemsPerPage = 10
    
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    renderHook(() => useInfiniteTransactions({ itemsPerPage, filters }), {
      wrapper: createWrapper(),
    })

    expect(mockUseTransactions).toHaveBeenCalledWith({
      limit: itemsPerPage,
      offset: 0,
      ...filters,
    })
  })

  it('should handle loading states correctly', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    })

    const { result } = renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isLoadingMore).toBe(false)
  })

  it('should handle errors', () => {
    const error = new Error('API Error')
    
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error,
    })

    const { result } = renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    expect(result.current.error).toEqual(error)
  })

  it('should provide loadMore function', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    expect(typeof result.current.loadMore).toBe('function')
  })

  it('should provide reset function', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    expect(typeof result.current.reset).toBe('function')
  })

  it('should use default itemsPerPage when not provided', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    expect(mockUseTransactions).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
    })
  })

  it('should use default empty filters when not provided', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    expect(mockUseTransactions).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
    })
  })

  it('should call loadMore without errors', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    expect(() => {
      act(() => {
        result.current.loadMore()
      })
    }).not.toThrow()
  })

  it('should call reset without errors', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    expect(() => {
      act(() => {
        result.current.reset()
      })
    }).not.toThrow()
  })

  it('should load first page of transactions', async () => {
    const firstPageData = Array.from({ length: 20 }, (_, i) =>
      mockTransaction({ id: i + 1 })
    )

    mockUseTransactions.mockReturnValue({
      data: firstPageData,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useInfiniteTransactions({ itemsPerPage: 20 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(20)
      expect(result.current.hasMore).toBe(true)
      expect(result.current.currentPage).toBe(1)
      expect(result.current.totalLoaded).toBe(20)
    })
  })

  it('should detect end of data when fewer items than requested are returned', async () => {
    const lastPageData = Array.from({ length: 5 }, (_, i) =>
      mockTransaction({ id: i + 1 })
    )

    mockUseTransactions.mockReturnValue({
      data: lastPageData,
      isLoading: false,
      error: null,
    })

    const { result } = renderHook(() => useInfiniteTransactions({ itemsPerPage: 20 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(5)
      expect(result.current.hasMore).toBe(false) // Should detect end
      expect(result.current.totalLoaded).toBe(5)
    })
  })

  it('should not load more if already loading', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    })

    const { result } = renderHook(() => useInfiniteTransactions(), {
      wrapper: createWrapper(),
    })

    const initialPage = result.current.currentPage

    act(() => {
      result.current.loadMore()
    })

    expect(result.current.currentPage).toBe(initialPage)
  })
})
