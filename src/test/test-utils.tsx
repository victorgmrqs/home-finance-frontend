import React, { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from '@/contexts/UserContext'
import { PainelProvider } from '@/contexts/PainelContext'

// Mock data
export const mockUser = {
  id: 1,
  nome: 'João Silva',
  email: 'joao@example.com',
  criado_em: '2025-01-01T00:00:00Z',
  atualizado_em: '2025-01-01T00:00:00Z'
}

export const mockPainel = {
  id: 1,
  nome: 'Painel Padrão',
  descricao: 'Painel padrão para transações',
  tipo_conta: 'CONTA_BANCARIA' as const,
  usuario_id: 1,
  permissao: 'OWNER' as const,
  criado_em: '2025-01-01T00:00:00Z',
  atualizado_em: '2025-01-01T00:00:00Z'
}

export const mockTransaction = {
  id: 1,
  date: '2025-01-01',
  description: 'Supermercado',
  value: 150.50,
  type: 'saida' as const,
  category: 'Alimentação',
  recurrence: 'ocasional' as const,
  parcelas: null,
  local_id: 1,
  painel_id: 1,
  tipo_divisao: 'PESSOAL' as const,
  valor_por_pessoa: 150.50,
  porcentagem_divisao: null,
  data_vencimento: null,
  status_pagamento: 'PENDENTE' as const,
  location: 'Supermercado ABC',
  criado_em: '2025-01-01T00:00:00Z',
  atualizado_em: '2025-01-01T00:00:00Z'
}

export const mockLocal = {
  id: 1,
  nome_fantasia: 'Supermercado ABC',
  endereco: 'Rua das Flores, 123',
  cidade: 'São Paulo',
  estado: 'SP',
  criado_em: '2025-01-01T00:00:00Z',
  atualizado_em: '2025-01-01T00:00:00Z'
}

export const mockCategoria = {
  id: 1,
  nome: 'Alimentação',
  descricao: 'Gastos com alimentação e supermercado',
  usuario_id: null,
  is_default: true,
  criado_em: '2025-01-01T00:00:00Z',
  atualizado_em: '2025-01-01T00:00:00Z'
}

export const mockCategorias = [
  {
    id: 1,
    nome: 'Alimentação',
    descricao: 'Gastos com alimentação e supermercado',
    usuario_id: null,
    is_default: true,
    criado_em: '2025-01-01T00:00:00Z',
    atualizado_em: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    nome: 'Transporte',
    descricao: 'Gastos com transporte e combustível',
    usuario_id: null,
    is_default: true,
    criado_em: '2025-01-01T00:00:00Z',
    atualizado_em: '2025-01-01T00:00:00Z',
  },
  {
    id: 3,
    nome: 'Moradia',
    descricao: 'Aluguel e contas da casa',
    usuario_id: null,
    is_default: true,
    criado_em: '2025-01-01T00:00:00Z',
    atualizado_em: '2025-01-01T00:00:00Z',
  },
  {
    id: 4,
    nome: 'Saúde',
    descricao: 'Médicos e farmácia',
    usuario_id: null,
    is_default: true,
    criado_em: '2025-01-01T00:00:00Z',
    atualizado_em: '2025-01-01T00:00:00Z',
  },
  {
    id: 5,
    nome: 'Lazer',
    descricao: 'Entretenimento e viagens',
    usuario_id: null,
    is_default: true,
    criado_em: '2025-01-01T00:00:00Z',
    atualizado_em: '2025-01-01T00:00:00Z',
  },
  {
    id: 10,
    nome: 'Academia',
    descricao: 'Mensalidade e personal',
    usuario_id: 1,
    is_default: false,
    criado_em: '2025-01-15T10:30:00Z',
    atualizado_em: '2025-01-15T10:30:00Z',
  },
]

export const mockBalanco = {
  entradas: 5000.00,
  saidas: 3200.00,
  saldo: 1800.00,
  mes: '2025-01'
}

// Mock single API response
export const mockApiResponse = {
  code: 'SUCCESS',
  message: 'Operação realizada com sucesso',
  data: mockTransaction
}

export const mockDashboardData = {
  total_entradas_familia: 5000.00,
  total_saidas_familia: 3200.00,
  saldo_familia: 1800.00,
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
  ],
  recent_transactions: [mockTransaction]
}

// Mock API responses
export const mockApiResponses = {
  dashboardData: mockDashboardData,
  paineis: {
    code: 'PAINEL_LIST_SUCCESS',
    message: 'Encontrados 2 painéis',
    data: [mockPainel, { ...mockPainel, id: 2, nome: 'Casa' }],
    total: 2
  },
  transactions: {
    code: 'TRANSACTION_LIST_SUCCESS',
    message: 'Lista de transações obtida com sucesso',
    data: [mockTransaction]
  },
  locais: {
    code: 'LOCAL_LIST_SUCCESS',
    message: 'Encontrados 1 locais',
    data: [mockLocal],
    total: 1
  },
  categorias: {
    code: 'SUCCESS',
    message: 'Categorias listadas com sucesso',
    data: mockCategorias
  },
  balanco: {
    code: 'BALANCO_SUCCESS',
    message: 'Balanço obtido com sucesso',
    data: mockBalanco
  }
}

// Create a custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  user?: typeof mockUser | null
  initialRoute?: string
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    user = mockUser,
    initialRoute = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Set initial route
  window.history.pushState({}, 'Test page', initialRoute)

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UserProvider>
            <PainelProvider>
              {children}
            </PainelProvider>
          </UserProvider>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock fetch for API calls
export const mockFetch = (response: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  })
}

// Mock fetch with error
export const mockFetchError = (message = 'Network error') => {
  global.fetch = vi.fn().mockRejectedValue(new Error(message))
}

// Helper to wait for async operations
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }
  
  global.IntersectionObserver = vi.fn().mockImplementation(() => mockObserver)
  return mockObserver
}

// Export everything a test might need
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'