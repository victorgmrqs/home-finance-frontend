import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, ApiError } from '@/services/api'
import { mockApiResponse, mockTransaction, mockLocal } from '../../test/test-utils'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Transactions API', () => {
    describe('list', () => {
      it('should fetch transactions list successfully', async () => {
        const mockResponse = {
          code: 'SUCCESS',
          message: 'Transações listadas com sucesso',
          data: [mockTransaction],
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const result = await api.transactions.list()

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/transactions',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        )
        expect(result).toEqual([mockTransaction])
      })

      it('should fetch transactions with filters', async () => {
        const mockResponse = {
          code: 'SUCCESS',
          message: 'Transações listadas com sucesso',
          data: [mockTransaction],
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const filters = {
          limit: 10,
          offset: 0,
          tipo: 'SAIDA' as const,
          categoria: 'Alimentação',
        }

        await api.transactions.list(filters)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/transactions?limit=10&tipo=SAIDA&categoria=Alimenta%C3%A7%C3%A3o',
          expect.any(Object)
        )
      })

      it('should handle API errors', async () => {
        const errorResponse = {
          code: 'VALIDATION_ERROR',
          message: 'Parâmetros inválidos',
        }

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => errorResponse,
        })

        await expect(api.transactions.list()).rejects.toThrow(ApiError)
      })
    })

    describe('create', () => {
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

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse,
        })

        const result = await api.transactions.create(transactionData)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/transactions',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(transactionData),
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        )
        expect(result).toEqual(mockTransaction)
      })

      it('should handle creation errors', async () => {
        const transactionData = {
          data: '2024-01-15',
          descricao: '',
          valor: 150.50,
          tipo: 'SAIDA' as const,
          categoria: 'Alimentação',
        }

        const errorResponse = {
          code: 'VALIDATION_ERROR',
          message: 'Descrição é obrigatória',
        }

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 422,
          json: async () => errorResponse,
        })

        await expect(api.transactions.create(transactionData)).rejects.toThrow(ApiError)
      })
    })

    describe('get', () => {
      it('should fetch single transaction', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse,
        })

        const result = await api.transactions.get(1)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/transactions/1',
          expect.any(Object)
        )
        expect(result).toEqual(mockTransaction)
      })
    })

    describe('update', () => {
      it('should update transaction successfully', async () => {
        const updateData = {
          descricao: 'Supermercado Atualizado',
          valor: 200.00,
        }

        const updatedTransaction = { ...mockTransaction, ...updateData }
        const mockResponse = {
          code: 'SUCCESS',
          message: 'Transação atualizada com sucesso',
          data: updatedTransaction,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const result = await api.transactions.update(1, updateData)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/transactions/1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updateData),
          })
        )
        expect(result).toEqual(updatedTransaction)
      })
    })

    describe('delete', () => {
      it('should delete transaction successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ code: 'SUCCESS', message: 'Transação removida com sucesso', data: null }),
        })

        await api.transactions.delete(1)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/transactions/1',
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    })
  })

  describe('Locais API', () => {
    describe('list', () => {
      it('should fetch locais list successfully', async () => {
        const mockResponse = {
          code: 'SUCCESS',
          message: 'Locais listados com sucesso',
          data: [mockLocal],
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const result = await api.locais.list()

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/locais',
          expect.any(Object)
        )
        expect(result).toEqual([mockLocal])
      })
    })

    describe('create', () => {
      it('should create local successfully', async () => {
        const localData = {
          nome_fantasia: 'Novo Local',
          categoria: 'Comércio',
        }

        const mockResponse = {
          code: 'SUCCESS',
          message: 'Local criado com sucesso',
          data: { id: 2, ...localData },
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const result = await api.locais.create(localData)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/locais',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(localData),
          })
        )
        expect(result).toEqual({ id: 2, ...localData })
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(api.transactions.list()).rejects.toThrow('Network error: Network error')
    })

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      await expect(api.transactions.list()).rejects.toThrow()
    })
  })
})
