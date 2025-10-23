import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { TransactionFilters } from '@/components/TransactionFilters'
import { renderWithProviders, mockApiResponses } from '@/test/test-utils'
import { usePaineis } from '@/hooks/usePaineis'
import { useCategorias } from '@/hooks/useCategorias'

vi.mock('@/hooks/usePaineis')
vi.mock('@/hooks/useCategorias')

describe('TransactionFilters', () => {
  const mockOnFilter = vi.fn()
  const mockTransactions = [mockApiResponses.transactions.data[0]]

  beforeEach(() => {
    vi.clearAllMocks()

    ;(usePaineis as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockApiResponses.paineis.data,
      isLoading: false,
      error: null
    })

    ;(useCategorias as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockApiResponses.categorias.data,
      isLoading: false,
      error: null
    })
  })

  it('should render all filter controls', () => {
    renderWithProviders(
      <TransactionFilters
        transactions={mockTransactions}
        onFilter={mockOnFilter}
      />
    )

    expect(screen.getByText('Cartão')).toBeInTheDocument()
    expect(screen.getByText('Período')).toBeInTheDocument()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Local')).toBeInTheDocument()
  })
})
