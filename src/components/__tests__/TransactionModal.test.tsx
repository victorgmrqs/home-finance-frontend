import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { TransactionModal } from '@/components/TransactionModal'

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

describe('TransactionModal', () => {
  const mockOnSubmit = vi.fn()
  const mockOnClose = vi.fn()
  const existingLocations = ['Supermercado ABC', 'Farmácia XYZ', 'Posto de Gasolina']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render modal when open', () => {
    render(
      <TransactionModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Nova Transação')).toBeInTheDocument()
    expect(screen.getByLabelText('Data')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Local')).toBeInTheDocument()
    expect(screen.getByText('Recorrência')).toBeInTheDocument()
  })

  it('should not render modal when closed', () => {
    render(
      <TransactionModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.queryByText('Nova Transação')).not.toBeInTheDocument()
  })

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    const cancelButton = screen.getByText('Cancelar')
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    // Fill form fields
    await user.type(screen.getByLabelText('Descrição'), 'Supermercado')
    await user.type(screen.getByLabelText('Valor'), '150.50')
    
    // Select tipo - use placeholder text to find the select
    const tipoSelect = screen.getByText('Selecione o tipo')
    await user.click(tipoSelect)
    await user.click(screen.getByText('Saída'))
    
    // Select categoria - use placeholder text to find the select
    const categoriaSelect = screen.getByText('Selecione a categoria')
    await user.click(categoriaSelect)
    await user.click(screen.getByText('Alimentação'))
    
    // Select recorrência - use placeholder text to find the select
    const recorrênciaSelect = screen.getByText('Selecione a recorrência')
    await user.click(recorrênciaSelect)
    await user.click(screen.getByText('Mensal'))

    // Submit form
    const submitButton = screen.getByText('Salvar')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        date: expect.any(String),
        description: 'Supermercado',
        value: 150.50,
        type: 'saida',
        category: 'Alimentação',
        location: '',
        recurrence: 'mensal',
      })
    })
  })

  it('should not submit form with missing required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    // Fill only description
    await user.type(screen.getByLabelText('Descrição'), 'Supermercado')

    // Try to submit form
    const submitButton = screen.getByText('Salvar')
    await user.click(submitButton)

    // Form should not submit because required fields are missing
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should filter locations based on search', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    // Open location dropdown
    const locationButton = screen.getByText('Selecione ou digite um local...')
    await user.click(locationButton)

    // Search for specific location
    const searchInput = screen.getByPlaceholderText('Buscar local...')
    await user.type(searchInput, 'Supermercado')

    // Should show filtered results
    expect(screen.getByText('Supermercado ABC')).toBeInTheDocument()
    expect(screen.queryByText('Farmácia XYZ')).not.toBeInTheDocument()
  })

  it('should allow creating new location', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    // Open location dropdown
    const locationButton = screen.getByText('Selecione ou digite um local...')
    await user.click(locationButton)

    // Type new location name
    const searchInput = screen.getByPlaceholderText('Buscar local...')
    await user.type(searchInput, 'Novo Local')

    // Should show option to create new location
    expect(screen.getByText('Cadastrar novo local "Novo Local"')).toBeInTheDocument()

    // Click to create new location
    await user.click(screen.getByText('Cadastrar novo local "Novo Local"'))

    // Should close dropdown and set the location
    expect(screen.getByText('Novo Local')).toBeInTheDocument()
  })

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    // Fill form
    await user.type(screen.getByLabelText('Descrição'), 'Supermercado')
    await user.type(screen.getByLabelText('Valor'), '150.50')
    
    const tipoSelect = screen.getByText('Selecione o tipo')
    await user.click(tipoSelect)
    await user.click(screen.getByText('Saída'))
    
    const categoriaSelect = screen.getByText('Selecione a categoria')
    await user.click(categoriaSelect)
    await user.click(screen.getByText('Alimentação'))
    
    const recorrênciaSelect = screen.getByText('Selecione a recorrência')
    await user.click(recorrênciaSelect)
    await user.click(screen.getByText('Mensal'))

    // Submit form
    const submitButton = screen.getByText('Salvar')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    // Form should be reset
    expect(screen.getByLabelText('Descrição')).toHaveValue('')
    expect(screen.getByLabelText('Valor')).toHaveValue('')
  })

  it('should set default date to today', () => {
    render(
      <TransactionModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    const dateInput = screen.getByLabelText('Data')
    const today = new Date().toISOString().split('T')[0]
    expect(dateInput).toHaveValue(today)
  })

  it('should handle location selection from existing locations', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        existingLocations={existingLocations}
      />,
      { wrapper: createWrapper() }
    )

    // Open location dropdown
    const locationButton = screen.getByText('Selecione ou digite um local...')
    await user.click(locationButton)

    // Select existing location
    await user.click(screen.getByText('Supermercado ABC'))

    // Should close dropdown and show selected location
    expect(screen.getByText('Supermercado ABC')).toBeInTheDocument()
  })
})
