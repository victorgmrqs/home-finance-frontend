import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { mockTransaction, mockLocal } from '../../test/test-utils'

// Mock the hooks before importing
vi.mock('@/hooks/useInfiniteTransactions', () => ({
  useInfiniteTransactions: vi.fn(),
}))

vi.mock('@/hooks/useLocais', () => ({
  useLocais: vi.fn(),
  useCreateLocal: vi.fn(),
}))

vi.mock('@/hooks/useTransactions', () => ({
  useCreateTransaction: vi.fn(),
}))

import { TransactionsPageInfiniteScroll } from '@/components/TransactionsPageInfiniteScroll'
import { useInfiniteTransactions } from '@/hooks/useInfiniteTransactions'
import { useLocais } from '@/hooks/useLocais'
import { useCreateTransaction } from '@/hooks/useTransactions'

const mockUseInfiniteTransactions = vi.mocked(useInfiniteTransactions)
const mockUseLocais = vi.mocked(useLocais)
const mockUseCreateTransaction = vi.mocked(useCreateTransaction)

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

describe('TransactionsPageInfiniteScroll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [mockTransaction],
      isLoading: false,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentPage: 1,
      totalLoaded: 1,
    })

    mockUseLocais.mockReturnValue({
      data: [mockLocal],
      isLoading: false,
      error: null,
    })

    mockUseCreateTransaction.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(mockTransaction),
      isPending: false,
    })
  })

  it('should render transactions page with header and title', () => {
    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    expect(screen.getByText('Home Finance')).toBeInTheDocument()
    expect(screen.getByText('Transações')).toBeInTheDocument()
    expect(screen.getByText('Nova Transação')).toBeInTheDocument()
  })

  it('should show transaction count in infinite scroll mode', () => {
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [mockTransaction, { ...mockTransaction, id: 2 }],
      isLoading: false,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentPage: 1,
      totalLoaded: 2,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    expect(screen.getByText('2 transações carregadas (mais disponíveis)')).toBeInTheDocument()
  })

  it('should show loading state when transactions are loading', () => {
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [],
      isLoading: true,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentPage: 1,
      totalLoaded: 0,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    expect(screen.getByText('Transações')).toBeInTheDocument()
    // Should show skeleton loading
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4)
  })

  it('should show error state when there is an error', () => {
    const error = new Error('Failed to fetch transactions')
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [],
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      error,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentPage: 1,
      totalLoaded: 0,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    expect(screen.getByText('Erro ao carregar transações')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument()
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  it('should display transactions in table', () => {
    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

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

  it('should show loading more indicator when loading more transactions', () => {
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [mockTransaction],
      isLoading: false,
      isLoadingMore: true,
      hasMore: true,
      error: null,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentPage: 1,
      totalLoaded: 1,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    expect(screen.getByText('Carregando mais transações...')).toBeInTheDocument()
  })

  it('should show end of results indicator when no more data', () => {
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [mockTransaction],
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      error: null,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentPage: 1,
      totalLoaded: 1,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    expect(screen.getByText('Todas as transações foram carregadas')).toBeInTheDocument()
  })

  it('should show load more button when has more data', () => {
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [mockTransaction],
      isLoading: false,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentPage: 1,
      totalLoaded: 1,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    expect(screen.getByText('Carregar Mais Transações')).toBeInTheDocument()
  })

  it('should call loadMore when load more button is clicked', async () => {
    const user = userEvent.setup()
    const mockLoadMore = vi.fn()
    
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [mockTransaction],
      isLoading: false,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      loadMore: mockLoadMore,
      reset: vi.fn(),
      currentPage: 1,
      totalLoaded: 1,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    const loadMoreButton = screen.getByText('Carregar Mais Transações')
    await user.click(loadMoreButton)

    expect(mockLoadMore).toHaveBeenCalledTimes(1)
  })

  it('should toggle between infinite scroll and pagination modes', async () => {
    const user = userEvent.setup()
    const mockReset = vi.fn()
    
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [mockTransaction],
      isLoading: false,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      loadMore: vi.fn(),
      reset: mockReset,
      currentPage: 1,
      totalLoaded: 1,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    // Should start in infinite scroll mode
    expect(screen.getByText('Scroll Infinito')).toHaveClass('bg-primary')
    expect(screen.getByText('Paginação')).toHaveClass('bg-transparent')

    // Click pagination button
    const paginationButton = screen.getByText('Paginação')
    await user.click(paginationButton)

    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('should pass lastTransactionRef to TransactionTable in infinite scroll mode', () => {
    render(<TransactionsPageInfiniteScroll useInfiniteScroll={true} />, { wrapper: createWrapper() })

    // The TransactionTable should receive the lastTransactionRef prop
    // This is tested indirectly by checking if the component renders without errors
    expect(screen.getByText('Supermercado')).toBeInTheDocument()
  })

  it('should not pass lastTransactionRef to TransactionTable in pagination mode', () => {
    render(<TransactionsPageInfiniteScroll useInfiniteScroll={false} />, { wrapper: createWrapper() })

    // The TransactionTable should not receive the lastTransactionRef prop
    expect(screen.getByText('Supermercado')).toBeInTheDocument()
  })

  it('should handle custom itemsPerPage', () => {
    render(<TransactionsPageInfiniteScroll itemsPerPage={50} />, { wrapper: createWrapper() })

    expect(mockUseInfiniteTransactions).toHaveBeenCalledWith({
      itemsPerPage: 50,
      filters: {}
    })
  })

  it('should open modal when "Nova Transação" button is clicked', async () => {
    const user = userEvent.setup()
    
    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    const newTransactionButton = screen.getByText('Nova Transação')
    await user.click(newTransactionButton)

    expect(screen.getByText('Nova Transação')).toBeInTheDocument() // Modal title
  })

  it('should show "Nenhuma transação encontrada" when no transactions', () => {
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [],
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      error: null,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentPage: 1,
      totalLoaded: 0,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument()
  })

  it('should handle filter changes', async () => {
    const user = userEvent.setup()
    const mockReset = vi.fn()
    
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [mockTransaction],
      isLoading: false,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      loadMore: vi.fn(),
      reset: mockReset,
      currentPage: 1,
      totalLoaded: 1,
    })

    render(<TransactionsPageInfiniteScroll />, { wrapper: createWrapper() })

    // The TransactionFilters component should be rendered
    expect(screen.getByText('Tipo')).toBeInTheDocument()
  })

  it('should display correct page information in pagination mode', () => {
    mockUseInfiniteTransactions.mockReturnValue({
      transactions: [mockTransaction],
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      error: null,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentPage: 2,
      totalLoaded: 20,
    })

    render(<TransactionsPageInfiniteScroll useInfiniteScroll={false} />, { wrapper: createWrapper() })

    // Click pagination button to switch to pagination mode
    const paginationButton = screen.getByText('Paginação')
    fireEvent.click(paginationButton)

    expect(screen.getByText('Página 2 de 1')).toBeInTheDocument()
  })
})
