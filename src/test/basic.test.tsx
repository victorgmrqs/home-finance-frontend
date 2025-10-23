import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderWithProviders, mockApiResponses } from '@/test/test-utils'

// Mock simples para demonstrar que os testes funcionam
const MockComponent = () => {
  return (
    <div>
      <h1>Home Finance</h1>
      <p>Teste de componente</p>
    </div>
  )
}

describe('Teste Básico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render mock component correctly', () => {
    renderWithProviders(<MockComponent />)

    expect(screen.getByText('Home Finance')).toBeInTheDocument()
    expect(screen.getByText('Teste de componente')).toBeInTheDocument()
  })

  it('should have mock data available', () => {
    expect(mockApiResponses.transactions).toBeDefined()
    expect(mockApiResponses.paineis).toBeDefined()
    expect(mockApiResponses.locais).toBeDefined()
  })
})

// Teste de utilitários
describe('Test Utils', () => {
  it('should provide mock data', () => {
    expect(mockApiResponses.transactions.data).toHaveLength(1)
    expect(mockApiResponses.transactions.data[0]).toHaveProperty('id')
    expect(mockApiResponses.transactions.data[0]).toHaveProperty('description')
  })

  it('should provide mock paineis', () => {
    expect(mockApiResponses.paineis.data).toHaveLength(2)
    expect(mockApiResponses.paineis.data[0]).toHaveProperty('nome')
  })

  it('should provide mock locais', () => {
    expect(mockApiResponses.locais.data).toHaveLength(1)
    expect(mockApiResponses.locais.data[0]).toHaveProperty('nome_fantasia')
  })
})



