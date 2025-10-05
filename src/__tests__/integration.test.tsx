import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { TransactionsPageIntegrated } from '@/components/TransactionsPageIntegrated'
import { api } from '@/services/api'
import { mockTransaction, mockLocal } from '../../test/test-utils'

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    transactions: {
      list: vi.fn(),
      create: vi.fn(),
    },
    locais: {
      list: vi.fn(),
      create: vi.fn(),
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

describe('Transaction Creation Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup API mocks
    vi.mocked(api.transactions.list).mockResolvedValue([mockTransaction])
    vi.mocked(api.locais.list).mockResolvedValue([mockLocal])
    vi.mocked(api.transactions.create).mockResolvedValue(mockTransaction)
    vi.mocked(api.locais.create).mockResolvedValue({ id: 2, nome_fantasia: 'Novo Local' })
  })

  it('should create a complete transaction flow', async () => {
    const user = userEvent.setup()
    
    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Supermercado')).toBeInTheDocument()
    })

    // Open modal
    const newTransactionButton = screen.getByText('Nova Transação')
    await user.click(newTransactionButton)

    // Fill transaction form
    await user.type(screen.getByLabelText('Descrição'), 'Farmácia')
    await user.type(screen.getByLabelText('Valor'), '75.30')
    
    // Select tipo
    const tipoSelect = screen.getByRole('combobox', { name: /tipo/i })
    await user.click(tipoSelect)
    await user.click(screen.getByText('Saída'))
    
    // Select categoria
    const categoriaSelect = screen.getByRole('combobox', { name: /categoria/i })
    await user.click(categoriaSelect)
    await user.click(screen.getByText('Saúde'))
    
    // Select recorrência
    const recorrênciaSelect = screen.getByRole('combobox', { name: /recorrência/i })
    await user.click(recorrênciaSelect)
    await user.click(screen.getByText('Ocasional'))

    // Add new location
    const locationButton = screen.getByText('Selecione ou digite um local...')
    await user.click(locationButton)
    
    const searchInput = screen.getByPlaceholderText('Buscar local...')
    await user.type(searchInput, 'Farmácia Nova')
    
    await user.click(screen.getByText('Cadastrar novo local "Farmácia Nova"'))

    // Submit form
    const submitButton = screen.getByText('Salvar')
    await user.click(submitButton)

    // Verify API calls
    await waitFor(() => {
      expect(api.locais.create).toHaveBeenCalledWith({
        nome_fantasia: 'Farmácia Nova',
      })
    })

    await waitFor(() => {
      expect(api.transactions.create).toHaveBeenCalledWith({
        data: expect.any(String),
        descricao: 'Farmácia',
        valor: 75.30,
        tipo: 'SAIDA',
        categoria: 'Saúde',
        recorrencia: 'OCASIONAL',
        local_id: 2,
      })
    })

    // Verify transactions list is refreshed
    await waitFor(() => {
      expect(api.transactions.list).toHaveBeenCalledTimes(2) // Initial load + after creation
    })
  })

  it('should handle transaction creation with existing location', async () => {
    const user = userEvent.setup()
    
    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Supermercado')).toBeInTheDocument()
    })

    // Open modal
    const newTransactionButton = screen.getByText('Nova Transação')
    await user.click(newTransactionButton)

    // Fill transaction form
    await user.type(screen.getByLabelText('Descrição'), 'Compra no Supermercado')
    await user.type(screen.getByLabelText('Valor'), '200.00')
    
    // Select tipo
    const tipoSelect = screen.getByRole('combobox', { name: /tipo/i })
    await user.click(tipoSelect)
    await user.click(screen.getByText('Saída'))
    
    // Select categoria
    const categoriaSelect = screen.getByRole('combobox', { name: /categoria/i })
    await user.click(categoriaSelect)
    await user.click(screen.getByText('Alimentação'))
    
    // Select recorrência
    const recorrênciaSelect = screen.getByRole('combobox', { name: /recorrência/i })
    await user.click(recorrênciaSelect)
    await user.click(screen.getByText('Semanal'))

    // Select existing location
    const locationButton = screen.getByText('Selecione ou digite um local...')
    await user.click(locationButton)
    
    await user.click(screen.getByText('Supermercado ABC'))

    // Submit form
    const submitButton = screen.getByText('Salvar')
    await user.click(submitButton)

    // Verify API calls
    await waitFor(() => {
      expect(api.transactions.create).toHaveBeenCalledWith({
        data: expect.any(String),
        descricao: 'Compra no Supermercado',
        valor: 200.00,
        tipo: 'SAIDA',
        categoria: 'Alimentação',
        recorrencia: 'SEMANAL',
        local_id: 1, // Existing local ID
      })
    })

    // Should not create new local
    expect(api.locais.create).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    vi.mocked(api.transactions.create).mockRejectedValue(new Error('API Error'))
    
    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Supermercado')).toBeInTheDocument()
    })

    // Open modal
    const newTransactionButton = screen.getByText('Nova Transação')
    await user.click(newTransactionButton)

    // Fill transaction form
    await user.type(screen.getByLabelText('Descrição'), 'Test Transaction')
    await user.type(screen.getByLabelText('Valor'), '100.00')
    
    // Select tipo
    const tipoSelect = screen.getByRole('combobox', { name: /tipo/i })
    await user.click(tipoSelect)
    await user.click(screen.getByText('Entrada'))
    
    // Select categoria
    const categoriaSelect = screen.getByRole('combobox', { name: /categoria/i })
    await user.click(categoriaSelect)
    await user.click(screen.getByText('Salário'))
    
    // Select recorrência
    const recorrênciaSelect = screen.getByRole('combobox', { name: /recorrência/i })
    await user.click(recorrênciaSelect)
    await user.click(screen.getByText('Mensal'))

    // Submit form
    const submitButton = screen.getByText('Salvar')
    await user.click(submitButton)

    // Verify API was called
    await waitFor(() => {
      expect(api.transactions.create).toHaveBeenCalled()
    })

    // Modal should still be open due to error
    expect(screen.getByText('Nova Transação')).toBeInTheDocument()
  })
})
