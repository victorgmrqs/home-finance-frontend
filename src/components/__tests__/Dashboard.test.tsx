import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { Dashboard } from '@/components/Dashboard'
import { useDashboardData } from '@/hooks/useDashboardData'
import { renderWithProviders } from '@/test/test-utils'

vi.mock('@/hooks/useDashboardData')

const mockDashboardData = {
  total_entradas_familia: 5000,
  total_saidas_familia: 3200,
  saldo_familia: 1800,
  quantidade_transacoes: 25,
  quantidade_compartilhadas: 10,
  gastos_por_usuario: [
    {
      usuario_id: 1,
      usuario_nome: 'João Silva',
      total_gasto_pessoal: 800,
      total_gasto_compartilhado: 400,
      total_a_pagar: 1000
    }
  ],
  gastos_por_painel: [
    {
      painel: {
        id: 1,
        nome: 'Cartão Principal',
        descricao: 'Cartão principal da família',
        tipo_conta: 'CONTA_BANCARIA'
      },
      total_entradas: 2000,
      total_saidas: 1500,
      saldo: 500,
      total_pessoal: 800,
      total_compartilhado: 700,
      valor_a_pagar: 1000
    }
  ]
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard with loading state', () => {
    ;(useDashboardData as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Home Finance')).toBeInTheDocument()
    // Skeleton is shown during loading
  })

  it('should render dashboard with data', () => {
    ;(useDashboardData as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Dashboard Familiar')).toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Cartão Principal')).toBeInTheDocument()
  })

  it('should render balance cards', () => {
    ;(useDashboardData as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Entradas Totais')).toBeInTheDocument()
    expect(screen.getByText('Saídas Totais')).toBeInTheDocument()
  })

  it('should show user spending cards when data is available', () => {
    ;(useDashboardData as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<Dashboard />)

    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('should show panel spending cards when data is available', () => {
    ;(useDashboardData as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Cartão Principal')).toBeInTheDocument()
  })

  it('should handle error state', () => {
    ;(useDashboardData as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API Error'),
    })

    renderWithProviders(<Dashboard />)

    // Dashboard shows skeleton when no data, even on error
    expect(screen.getByText('Home Finance')).toBeInTheDocument()
  })
})
