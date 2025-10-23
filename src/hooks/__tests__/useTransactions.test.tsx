import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { mockApiResponses, mockFetch, mockFetchError } from '@/test/test-utils'

// Wrapper for React Query
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

describe('useTransactions Hook', () => {
  describe('useTransactions', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should fetch transactions successfully', async () => {
      mockFetch(mockApiResponses.transactions)

      const { result } = renderHook(() => useTransactions({ painel_id: 1 }), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      expect(result.current.data).toEqual(mockApiResponses.transactions.data)
    })

    it('should fetch transactions with filters', async () => {
      mockFetch(mockApiResponses.transactions)

      const { result } = renderHook(
        () => useTransactions({ painel_id: 1, mes: '2025-01' }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/transactions?painel_id=1&mes=2025-01'),
        expect.any(Object)
      )
    })

    it('should handle missing painel_id', () => {
      const { result } = renderHook(() => useTransactions({}), {
        wrapper: createWrapper(),
      })

      // Query should be disabled without painel_id
      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
    })
  })
});