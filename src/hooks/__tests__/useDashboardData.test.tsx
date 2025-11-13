import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardData } from '@/hooks/useDashboardData'
import { api } from '@/services/api'

// Mock do módulo api
vi.mock('@/services/api', () => ({
  api: {
    dashboard: {
      summary: vi.fn(),
    },
    paineis: {
      list: vi.fn(),
    },
  },
}))

describe('useDashboardData', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should be a function', () => {
    expect(typeof useDashboardData).toBe('function')
  })

  it('should return loading state initially', () => {
    vi.mocked(api.dashboard.summary).mockResolvedValue({
      total_entradas_familia: 0,
      total_saidas_familia: 0,
      saldo_familia: 0,
      gastos_por_painel: [],
      gastos_por_usuario: [],
      quantidade_transacoes: 0,
      quantidade_compartilhadas: 0,
    })

    vi.mocked(api.paineis.list).mockResolvedValue([])

    const { result } = renderHook(() => useDashboardData(), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })

  it('should fetch and aggregate dashboard data', async () => {
    const mockSummaryData = {
      total_entradas_familia: 5000,
      total_saidas_familia: 3000,
      saldo_familia: 2000,
      gastos_por_painel: [
        {
          painel_id: 1,
          painel_nome: 'Cartão Principal',
          painel_descricao: 'Cartão de crédito principal',
          painel_tipo_conta: 'CARTAO_CREDITO',
          painel_usuario_id: 1,
          total_entradas: 3000,
          total_saidas: 2000,
          saldo: 1000,
          total_pessoal: 1500,
          total_compartilhado: 500,
          valor_a_pagar: 1750,
        },
      ],
      gastos_por_usuario: [
        {
          usuario_id: 1,
          usuario_nome: 'João',
          total_gasto_pessoal: 1500,
          total_gasto_compartilhado: 500,
          total_a_pagar: 1750,
        },
      ],
      quantidade_transacoes: 10,
      quantidade_compartilhadas: 2,
    }

    const mockPaineis = [
      {
        id: 1,
        nome: 'Cartão Principal',
        descricao: 'Cartão de crédito principal',
        tipo_conta: 'CARTAO_CREDITO' as const,
        usuario_id: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ]

    vi.mocked(api.dashboard.summary).mockResolvedValue(mockSummaryData)
    vi.mocked(api.paineis.list).mockResolvedValue(mockPaineis)

    const { result } = renderHook(() => useDashboardData({ mes: '2024-01' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({
      total_entradas_familia: 5000,
      total_saidas_familia: 3000,
      saldo_familia: 2000,
      gastos_por_painel: [
        {
          painel: mockPaineis[0],
          total_entradas: 3000,
          total_saidas: 2000,
          saldo: 1000,
          total_pessoal: 1500,
          total_compartilhado: 500,
          valor_a_pagar: 1750,
        },
      ],
      gastos_por_usuario: [
        {
          usuario_id: 1,
          usuario_nome: 'João',
          total_gasto_pessoal: 1500,
          total_gasto_compartilhado: 500,
          total_a_pagar: 1750,
        },
      ],
      quantidade_transacoes: 10,
      quantidade_compartilhadas: 2,
    })
  })

  it('should use single API call instead of N+1 queries', async () => {
    const mockSummaryData = {
      total_entradas_familia: 5000,
      total_saidas_familia: 3000,
      saldo_familia: 2000,
      gastos_por_painel: [],
      gastos_por_usuario: [],
      quantidade_transacoes: 10,
      quantidade_compartilhadas: 2,
    }

    vi.mocked(api.dashboard.summary).mockResolvedValue(mockSummaryData)
    vi.mocked(api.paineis.list).mockResolvedValue([])

    renderHook(() => useDashboardData({ mes: '2024-01' }), { wrapper })

    await waitFor(() => {
      expect(api.dashboard.summary).toHaveBeenCalledTimes(1)
      expect(api.dashboard.summary).toHaveBeenCalledWith({ mes: '2024-01' })
    })
  })

  it('should handle errors gracefully', async () => {
    const mockError = new Error('API Error')
    
    vi.mocked(api.dashboard.summary).mockRejectedValue(mockError)
    vi.mocked(api.paineis.list).mockResolvedValue([])

    const { result } = renderHook(() => useDashboardData({ mes: '2024-01' }), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Deve retornar dados vazios em caso de erro
    expect(result.current.data).toEqual({
      total_entradas_familia: 0,
      total_saidas_familia: 0,
      saldo_familia: 0,
      gastos_por_painel: [],
      gastos_por_usuario: [],
      quantidade_transacoes: 0,
      quantidade_compartilhadas: 0,
    })

    // Deve expor o erro
    expect(result.current.error).toBeDefined()
  })
})
