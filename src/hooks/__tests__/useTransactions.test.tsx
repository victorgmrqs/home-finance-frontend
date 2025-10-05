import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { api } from '@/services/api'
import { mockTransaction, mockApiResponse } from '../../test/test-utils'

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    transactions: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

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

describe('useTransactions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useTransactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = [mockTransaction]
      vi.mocked(api.transactions.list).mockResolvedValueOnce(mockTransactions)

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockTransactions)
      expect(api.transactions.list).toHaveBeenCalledWith(undefined)
    })

    it('should fetch transactions with filters', async () => {
      const mockTransactions = [mockTransaction]
      const filters = { tipo: 'SAIDA' as const, categoria: 'Alimentação' }
      
      vi.mocked(api.transactions.list).mockResolvedValueOnce(mockTransactions)

      const { result } = renderHook(() => useTransactions(filters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.transactions.list).toHaveBeenCalledWith(filters)
    })

    it('should handle fetch errors', async () => {
      const error = new Error('API Error')
      vi.mocked(api.transactions.list).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })
  })

  describe('useCreateTransaction', () => {
    it('should create transaction successfully', async () => {
      const transactionData = {
        data: '2024-01-15',
        descricao: 'Supermercado',
        valor: 150.50,
        tipo: 'SAIDA' as const,
        categoria: 'Alimentação',
        recorrencia: 'MENSAL' as const,
        local_id: 1,
      }

      vi.mocked(api.transactions.create).mockResolvedValueOnce(mockTransaction)

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        result.current.mutate(transactionData)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.transactions.create).toHaveBeenCalledWith(transactionData)
    })

    it('should handle creation errors', async () => {
      const transactionData = {
        data: '2024-01-15',
        descricao: 'Supermercado',
        valor: 150.50,
        tipo: 'SAIDA' as const,
        categoria: 'Alimentação',
      }

      const error = new Error('Creation failed')
      vi.mocked(api.transactions.create).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        result.current.mutate(transactionData)
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })
  })

  describe('useUpdateTransaction', () => {
    it('should update transaction successfully', async () => {
      const updateData = {
        descricao: 'Supermercado Atualizado',
        valor: 200.00,
      }

      const updatedTransaction = { ...mockTransaction, ...updateData }
      vi.mocked(api.transactions.update).mockResolvedValueOnce(updatedTransaction)

      const { result } = renderHook(() => useUpdateTransaction(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        result.current.mutate({ id: 1, data: updateData })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.transactions.update).toHaveBeenCalledWith(1, updateData)
    })
  })

  describe('useDeleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      vi.mocked(api.transactions.delete).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useDeleteTransaction(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        result.current.mutate(1)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.transactions.delete).toHaveBeenCalledWith(1)
    })
  })
})
