import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export const mockTransaction = (overrides?: any) => ({
  id: 1,
  data: '2024-01-15',
  descricao: 'Supermercado',
  valor: 150.50,
  tipo: 'SAIDA' as const,
  categoria: 'Alimentação',
  recorrencia: 'MENSAL' as const,
  local_id: 1,
  ...overrides,
})

export const mockLocal = {
  id: 1,
  nome_fantasia: 'Supermercado ABC',
  cnpj: '12.345.678/0001-90',
  razao_social: 'Supermercado ABC Ltda',
  categoria: 'Comércio',
  endereco: 'Rua das Flores, 123',
}

export const mockApiResponse = {
  code: 'SUCCESS',
  message: 'Operação realizada com sucesso',
  data: mockTransaction(),
}
