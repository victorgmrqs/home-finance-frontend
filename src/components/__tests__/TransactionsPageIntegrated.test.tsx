import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { TransactionsPageIntegrated } from '@/components/TransactionsPageIntegrated'
import { mockTransaction, mockLocal } from '../../test/test-utils'

// Mock the hooks
const mockUseTransactions = vi.fn()
const mockUseCreateTransaction = vi.fn()
const mockUseLocais = vi.fn()
const mockUseCreateLocal = vi.fn()

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: mockUseTransactions,
  useCreateTransaction: mockUseCreateTransaction,
}))

vi.mock('@/hooks/useLocais', () => ({
  useLocais: mockUseLocais,
  useCreateLocal: mockUseCreateLocal,
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

describe('TransactionsPageIntegrated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseTransactions.mockReturnValue({
      data: [mockTransaction],
      isLoading: false,
      error: null,
    })

    mockUseCreateTransaction.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(mockTransaction),
      isPending: false,
    })

    mockUseLocais.mockReturnValue({
      data: [mockLocal],
      isLoading: false,
      error: null,
    })

    mockUseCreateLocal.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 2, nome_fantasia: 'Novo Local' }),
      isPending: false,
    })
  })

  it('should render transactions page with header and title', () => {
    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    expect(screen.getByText('Home Finance')).toBeInTheDocument()
    expect(screen.getByText('Transações')).toBeInTheDocument()
    expect(screen.getByText('Nova Transação')).toBeInTheDocument()
  })

  it('should show loading state when transactions are loading', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    })

    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    expect(screen.getByText('Transações')).toBeInTheDocument()
    // Should show skeleton loading
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4)
  })

  it('should show error state when there is an error', () => {
    const error = new Error('Failed to fetch transactions')
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error,
    })

    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    expect(screen.getByText('Erro ao carregar transações')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument()
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  it('should open modal when "Nova Transação" button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    const newTransactionButton = screen.getByText('Nova Transação')
    await user.click(newTransactionButton)

    expect(screen.getByText('Nova Transação')).toBeInTheDocument() // Modal title
  })

  it('should display transactions in table', () => {
    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    // Check table headers
    expect(screen.getByText('Data')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(screen.getByText('Valor')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Local')).toBeInTheDocument()
    expect(screen.getByText('Recorrência')).toBeInTheDocument()

    // Check transaction data
    expect(screen.getByText('Supermercado')).toBeInTheDocument()
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
  })

  it('should show "Nenhuma transação encontrada" when no transactions', () => {
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument()
  })

  it('should handle transaction creation with existing local', async () => {
    const user = userEvent.setup()
    const mockCreateTransaction = vi.fn().mockResolvedValue(mockTransaction)
    
    mockUseCreateTransaction.mockReturnValue({
      mutateAsync: mockCreateTransaction,
      isPending: false,
    })

    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    // Open modal
    const newTransactionButton = screen.getByText('Nova Transação')
    await user.click(newTransactionButton)

    // Fill form
    await user.type(screen.getByLabelText('Descrição'), 'Test Transaction')
    await user.type(screen.getByLabelText('Valor'), '100.00')
    
    const tipoSelect = screen.getByRole('combobox', { name: /tipo/i })
    await user.click(tipoSelect)
    await user.click(screen.getByText('Entrada'))
    
    const categoriaSelect = screen.getByRole('combobox', { name: /categoria/i })
    await user.click(categoriaSelect)
    await user.click(screen.getByText('Salário'))
    
    const recorrênciaSelect = screen.getByRole('combobox', { name: /recorrência/i })
    await user.click(recorrênciaSelect)
    await user.click(screen.getByText('Mensal'))

    // Submit form
    const submitButton = screen.getByText('Salvar')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateTransaction).toHaveBeenCalledWith({
        data: expect.any(String),
        descricao: 'Test Transaction',
        valor: 100.00,
        tipo: 'ENTRADA',
        categoria: 'Salário',
        recorrencia: 'MENSAL',
        local_id: undefined,
      })
    })
  })

  it('should handle transaction creation with new local', async () => {
    const user = userEvent.setup()
    const mockCreateTransaction = vi.fn().mockResolvedValue(mockTransaction)
    const mockCreateLocal = vi.fn().mockResolvedValue({ id: 2, nome_fantasia: 'Novo Local' })
    
    mockUseCreateTransaction.mockReturnValue({
      mutateAsync: mockCreateTransaction,
      isPending: false,
    })

    mockUseCreateLocal.mockReturnValue({
      mutateAsync: mockCreateLocal,
      isPending: false,
    })

    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    // Open modal
    const newTransactionButton = screen.getByText('Nova Transação')
    await user.click(newTransactionButton)

    // Fill form with new location
    await user.type(screen.getByLabelText('Descrição'), 'Test Transaction')
    await user.type(screen.getByLabelText('Valor'), '100.00')
    
    const tipoSelect = screen.getByRole('combobox', { name: /tipo/i })
    await user.click(tipoSelect)
    await user.click(screen.getByText('Entrada'))
    
    const categoriaSelect = screen.getByRole('combobox', { name: /categoria/i })
    await user.click(categoriaSelect)
    await user.click(screen.getByText('Salário'))
    
    const recorrênciaSelect = screen.getByRole('combobox', { name: /recorrência/i })
    await user.click(recorrênciaSelect)
    await user.click(screen.getByText('Mensal'))

    // Add new location
    const locationButton = screen.getByText('Selecione ou digite um local...')
    await user.click(locationButton)
    
    const searchInput = screen.getByPlaceholderText('Buscar local...')
    await user.type(searchInput, 'Novo Local')
    
    await user.click(screen.getByText('Cadastrar novo local "Novo Local"'))

    // Submit form
    const submitButton = screen.getByText('Salvar')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateLocal).toHaveBeenCalledWith({
        nome_fantasia: 'Novo Local',
      })
    })

    await waitFor(() => {
      expect(mockCreateTransaction).toHaveBeenCalledWith({
        data: expect.any(String),
        descricao: 'Test Transaction',
        valor: 100.00,
        tipo: 'ENTRADA',
        categoria: 'Salário',
        recorrencia: 'MENSAL',
        local_id: 2,
      })
    })
  })

  it('should handle transaction creation error', async () => {
    const user = userEvent.setup()
    const error = new Error('Failed to create transaction')
    const mockCreateTransaction = vi.fn().mockRejectedValue(error)
    
    mockUseCreateTransaction.mockReturnValue({
      mutateAsync: mockCreateTransaction,
      isPending: false,
    })

    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    // Open modal
    const newTransactionButton = screen.getByText('Nova Transação')
    await user.click(newTransactionButton)

    // Fill form
    await user.type(screen.getByLabelText('Descrição'), 'Test Transaction')
    await user.type(screen.getByLabelText('Valor'), '100.00')
    
    const tipoSelect = screen.getByRole('combobox', { name: /tipo/i })
    await user.click(tipoSelect)
    await user.click(screen.getByText('Entrada'))
    
    const categoriaSelect = screen.getByRole('combobox', { name: /categoria/i })
    await user.click(categoriaSelect)
    await user.click(screen.getByText('Salário'))
    
    const recorrênciaSelect = screen.getByRole('combobox', { name: /recorrência/i })
    await user.click(recorrênciaSelect)
    await user.click(screen.getByText('Mensal'))

    // Submit form
    const submitButton = screen.getByText('Salvar')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateTransaction).toHaveBeenCalled()
    })

    // Modal should still be open due to error
    expect(screen.getByText('Nova Transação')).toBeInTheDocument()
  })

  it('should disable buttons when creating transaction', () => {
    mockUseCreateTransaction.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    })

    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    const newTransactionButton = screen.getByText('Nova Transação')
    expect(newTransactionButton).toBeDisabled()
  })

  it('should adapt transaction data correctly', () => {
    const apiTransaction = {
      id: 1,
      data: '2024-01-15',
      descricao: 'Supermercado',
      valor: 150.50,
      tipo: 'SAIDA',
      categoria: 'Alimentação',
      recorrencia: 'MENSAL',
      local_id: 1,
    }

    mockUseTransactions.mockReturnValue({
      data: [apiTransaction],
      isLoading: false,
      error: null,
    })

    render(<TransactionsPageIntegrated />, { wrapper: createWrapper() })

    // Check that the transaction is displayed with adapted data
    expect(screen.getByText('Supermercado')).toBeInTheDocument()
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Supermercado ABC')).toBeInTheDocument() // From mockLocal
  })
})
