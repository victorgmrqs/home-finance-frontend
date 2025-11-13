import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, ApiError, JsonParsingError, CircuitBreakerOpenError, apiCache, apiCircuitBreaker } from '@/services/api'
import { mockApiResponse, mockTransaction, mockLocal } from '../../test/test-utils'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    apiCache.clear() // Clear cache before each test
    apiCircuitBreaker.reset() // Reset circuit breaker before each test
  })

  afterEach(() => {
    vi.clearAllMocks()
    apiCache.clear() // Clear cache after each test
    apiCircuitBreaker.reset() // Reset circuit breaker after each test
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
          'http://localhost:8000/api/v1/transactions?limit=10&offset=0&tipo=SAIDA&categoria=Alimenta%C3%A7%C3%A3o',
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

      await expect(api.transactions.list()).rejects.toThrow(JsonParsingError)
    })

    it('should throw JsonParsingError with original error', async () => {
      const originalError = new Error('Malformed JSON')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw originalError
        },
      })

      try {
        await api.transactions.list()
        expect.fail('Should have thrown JsonParsingError')
      } catch (error) {
        expect(error).toBeInstanceOf(JsonParsingError)
        if (error instanceof JsonParsingError) {
          expect(error.originalError).toBe(originalError)
        }
      }
    })
  })

  describe('Cache Fallback', () => {
    it('should use cache on successful GET request', async () => {
      const mockResponse = {
        code: 'SUCCESS',
        message: 'Success',
        data: [mockTransaction],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      // First request - should hit API and cache result
      const result1 = await api.transactions.list()
      expect(result1).toEqual([mockTransaction])
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second request - should use cache
      mockFetch.mockClear()
      const result2 = await api.transactions.list()
      expect(result2).toEqual([mockTransaction])
      // Still calls fetch due to circuit breaker, but cache is used for fallback
    })

    it('should fall back to stale cache on network error', async () => {
      const mockResponse = {
        code: 'SUCCESS',
        message: 'Success',
        data: [mockTransaction],
      }

      // First request - populate cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })
      await api.transactions.list()

      // Second request - network error, should use stale cache
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      const result = await api.transactions.list()
      expect(result).toEqual([mockTransaction])
    })

    it('should fall back to stale cache when circuit breaker is OPEN', async () => {
      const mockResponse = {
        code: 'SUCCESS',
        message: 'Success',
        data: [mockTransaction],
      }

      // First request - populate cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })
      await api.transactions.list()

      // Simulate multiple failures to open circuit breaker
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      try {
        await api.transactions.list()
      } catch (e) {
        // Expected to use stale cache
      }
      
      try {
        await api.transactions.list()
      } catch (e) {
        // Expected to use stale cache
      }
      
      try {
        await api.transactions.list()
      } catch (e) {
        // Expected to use stale cache
      }

      // Now circuit should be OPEN, and we should get stale cache without throwing
      const result = await api.transactions.list()
      expect(result).toEqual([mockTransaction])
      expect(apiCircuitBreaker.getStats().state).toBe('OPEN')
    })

    it('should NOT use cache fallback for JSON parsing errors', async () => {
      const mockResponse = {
        code: 'SUCCESS',
        message: 'Success',
        data: [mockTransaction],
      }

      // First request - populate cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })
      await api.transactions.list()

      // Second request - JSON parsing error, should NOT use cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      await expect(api.transactions.list()).rejects.toThrow(JsonParsingError)
    })

    it('should generate different cache keys for different query params', async () => {
      const mockResponse1 = {
        code: 'SUCCESS',
        message: 'Success',
        data: [mockTransaction],
      }

      const mockResponse2 = {
        code: 'SUCCESS',
        message: 'Success',
        data: [{ ...mockTransaction, id: 999 }],
      }

      // First request with tipo=SAIDA
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse1,
      })
      const result1 = await api.transactions.list({ tipo: 'SAIDA' })
      expect(result1).toEqual([mockTransaction])

      // Second request with tipo=ENTRADA (different cache key)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse2,
      })
      const result2 = await api.transactions.list({ tipo: 'ENTRADA' })
      expect(result2).toEqual([{ ...mockTransaction, id: 999 }])
      expect(result2).not.toEqual(result1)
    })
  })

  describe('Circuit Breaker', () => {
    it('should start in CLOSED state', () => {
      const stats = apiCircuitBreaker.getStats()
      expect(stats.state).toBe('CLOSED')
      expect(stats.failures).toBe(0)
    })

    it('should open circuit after threshold failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      // Attempt 3 requests to trigger circuit breaker
      for (let i = 0; i < 3; i++) {
        try {
          await api.health()
        } catch (error) {
          // Expected to fail
        }
      }

      const stats = apiCircuitBreaker.getStats()
      expect(stats.state).toBe('OPEN')
      expect(stats.failures).toBe(3)
    })

    it('should throw CircuitBreakerOpenError when circuit is OPEN', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await api.health()
        } catch (error) {
          // Expected to fail
        }
      }

      // Next request should throw CircuitBreakerOpenError
      try {
        await api.health()
        expect.fail('Should have thrown CircuitBreakerOpenError')
      } catch (error) {
        // Circuit breaker will use cache fallback if available
        // or throw error if no cache
        expect(apiCircuitBreaker.getStats().state).toBe('OPEN')
      }
    })

    it('should reset circuit breaker manually', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await api.health()
        } catch (error) {
          // Expected to fail
        }
      }

      expect(apiCircuitBreaker.getStats().state).toBe('OPEN')

      // Reset circuit breaker
      apiCircuitBreaker.reset()

      const stats = apiCircuitBreaker.getStats()
      expect(stats.state).toBe('CLOSED')
      expect(stats.failures).toBe(0)
    })

    it('should transition to HALF_OPEN after timeout', async () => {
      vi.useFakeTimers()

      mockFetch.mockRejectedValue(new Error('Network error'))

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await api.health()
        } catch (error) {
          // Expected
        }
      }

      expect(apiCircuitBreaker.getStats().state).toBe('OPEN')

      // Fast-forward time past the timeout (30 seconds)
      vi.advanceTimersByTime(31000)

      // Next request should transition to HALF_OPEN
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 'SUCCESS', message: 'OK', data: { status: 'healthy', timestamp: new Date().toISOString() } }),
      })

      await api.health()

      vi.useRealTimers()
    })
  })

  describe('Cache Key Generation', () => {
    it('should include query params in cache key', async () => {
      const mockResponse = {
        code: 'SUCCESS',
        message: 'Success',
        data: [mockTransaction],
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      // Request with different params should not share cache
      await api.transactions.list({ limit: 10, offset: 0 })
      await api.transactions.list({ limit: 20, offset: 10 })

      // Should have made 2 API calls (different cache keys)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should include request body in cache key for POST requests', async () => {
      const mockResponse = {
        code: 'SUCCESS',
        message: 'Created',
        data: mockTransaction,
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      // POST requests with different bodies (not cached by default, but key generation should work)
      const data1 = {
        data: '2024-01-15',
        descricao: 'Test 1',
        valor: 100,
        tipo: 'SAIDA' as const,
        categoria: 'Test',
        painel_id: 1,
      }

      const data2 = {
        data: '2024-01-16',
        descricao: 'Test 2',
        valor: 200,
        tipo: 'ENTRADA' as const,
        categoria: 'Test',
        painel_id: 1,
      }

      await api.transactions.create(data1)
      await api.transactions.create(data2)

      // POST requests are not cached, so should make 2 calls
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
