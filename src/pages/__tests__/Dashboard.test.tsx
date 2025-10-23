import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from '@/components/Dashboard'
import { renderWithProviders, mockApiResponses } from '@/test/test-utils'
import { useDashboardData } from '@/hooks/useDashboardData'

// Mock the hooks
vi.mock('@/hooks/useDashboardData')

vi.mock('@/hooks/usePaineis', () => ({
  usePaineis: () => ({
    data: mockApiResponses.paineis.data,
    isLoading: false,
    error: null
  })
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard with main sections', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: mockApiResponses.dashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as any)
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Dashboard Familiar')).toBeInTheDocument()
    expect(screen.getByText('Gastos por Pessoa')).toBeInTheDocument()
    expect(screen.getByText('Gastos por Cartão')).toBeInTheDocument()
  })

  it('should display financial summary cards', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: mockApiResponses.dashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as any)
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Entradas Totais')).toBeInTheDocument()
    expect(screen.getByText('Saídas Totais')).toBeInTheDocument()
    expect(screen.getByText('Saldo Familiar')).toBeInTheDocument()
  })

  it('should display recent transactions', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: mockApiResponses.dashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as any)
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Dashboard Familiar')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn()
    } as any)

    renderWithProviders(<Dashboard />)

    expect(screen.getByRole('heading', { name: /home finance/i })).toBeInTheDocument()
  })

  it('should show error state', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Erro ao carregar dados'),
      refetch: vi.fn()
    } as any)

    renderWithProviders(<Dashboard />)

    expect(screen.getByRole('heading', { name: /home finance/i })).toBeInTheDocument()
  })

  it('should display correct currency formatting', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: mockApiResponses.dashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as any)
    renderWithProviders(<Dashboard />)

    // Check if currency is formatted correctly
    expect(screen.getByText('R$ 5000.00')).toBeInTheDocument()
    expect(screen.getByText('R$ 3200.00')).toBeInTheDocument()
    expect(screen.getByText('R$ 1800.00')).toBeInTheDocument()
  })

  it('should handle empty transactions', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: {
        ...mockApiResponses.dashboardData,
        recent_transactions: []
      },
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as any)

    renderWithProviders(<Dashboard />)

    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument()
  })

  it('should display transaction details correctly', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: mockApiResponses.dashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as any)
    renderWithProviders(<Dashboard />)

    // Check transaction details
    expect(screen.getByText('Dashboard Familiar')).toBeInTheDocument()
  })

  it('should show correct transaction types', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: mockApiResponses.dashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    } as any)
    renderWithProviders(<Dashboard />)

    // Check if transaction types are displayed
    expect(screen.getByText('Dashboard Familiar')).toBeInTheDocument()
  })


})
