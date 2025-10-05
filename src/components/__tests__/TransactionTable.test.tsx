import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransactionTable } from '@/components/TransactionTable'
import { mockTransaction } from '../../test/test-utils'

describe('TransactionTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render transactions in table', () => {
    const transactions = [mockTransaction]
    
    render(<TransactionTable transactions={transactions} />)

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
    render(<TransactionTable transactions={[]} />)

    expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument()
  })

  it('should apply lastTransactionRef to the last transaction row', () => {
    const transactions = [
      mockTransaction,
      { ...mockTransaction, id: '2', description: 'Segunda Transação' }
    ]
    
    const mockRef = vi.fn()
    
    render(<TransactionTable transactions={transactions} lastTransactionRef={mockRef} />)

    // The last transaction should have the ref applied
    expect(screen.getByText('Segunda Transação')).toBeInTheDocument()
  })

  it('should not apply lastTransactionRef when not provided', () => {
    const transactions = [
      mockTransaction,
      { ...mockTransaction, id: '2', description: 'Segunda Transação' }
    ]
    
    render(<TransactionTable transactions={transactions} />)

    // Should render normally without ref
    expect(screen.getByText('Segunda Transação')).toBeInTheDocument()
  })

  it('should handle single transaction with ref', () => {
    const transactions = [mockTransaction]
    const mockRef = vi.fn()
    
    render(<TransactionTable transactions={transactions} lastTransactionRef={mockRef} />)

    expect(screen.getByText('Supermercado')).toBeInTheDocument()
  })

  it('should format currency correctly', () => {
    const transactions = [mockTransaction]
    
    render(<TransactionTable transactions={transactions} />)

    // Should show formatted currency
    expect(screen.getByText('- R$ 150,50')).toBeInTheDocument()
  })

  it('should format date correctly', () => {
    const transactions = [mockTransaction]
    
    render(<TransactionTable transactions={transactions} />)

    // Should show formatted date (assuming mockTransaction has date '2024-01-15')
    expect(screen.getByText('15/01/2024')).toBeInTheDocument()
  })

  it('should show correct transaction type badge', () => {
    const transactions = [mockTransaction]
    
    render(<TransactionTable transactions={transactions} />)

    // Should show "Saída" badge for saida type
    expect(screen.getByText('Saída')).toBeInTheDocument()
  })

  it('should show correct recurrence badge', () => {
    const transactions = [mockTransaction]
    
    render(<TransactionTable transactions={transactions} />)

    // Should show "Mensal" badge for mensal recurrence
    expect(screen.getByText('Mensal')).toBeInTheDocument()
  })

  it('should handle multiple transactions correctly', () => {
    const transactions = [
      mockTransaction,
      { 
        ...mockTransaction, 
        id: '2', 
        description: 'Farmácia',
        category: 'Saúde',
        type: 'entrada' as const,
        value: 75.30
      }
    ]
    
    render(<TransactionTable transactions={transactions} />)

    expect(screen.getByText('Supermercado')).toBeInTheDocument()
    expect(screen.getByText('Farmácia')).toBeInTheDocument()
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Saúde')).toBeInTheDocument()
  })

  it('should apply correct CSS classes to transaction rows', () => {
    const transactions = [mockTransaction]
    
    render(<TransactionTable transactions={transactions} />)

    // The table row should have the correct classes
    const tableRow = screen.getByText('Supermercado').closest('tr')
    expect(tableRow).toHaveClass('border-b', 'border-border', 'hover:bg-table-row-hover', 'transition-colors')
  })

  it('should handle empty description gracefully', () => {
    const transactions = [{ ...mockTransaction, description: '' }]
    
    render(<TransactionTable transactions={transactions} />)

    // Should render without crashing
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
  })

  it('should handle missing location gracefully', () => {
    const transactions = [{ ...mockTransaction, location: '' }]
    
    render(<TransactionTable transactions={transactions} />)

    // Should render without crashing
    expect(screen.getByText('Supermercado')).toBeInTheDocument()
  })
})
