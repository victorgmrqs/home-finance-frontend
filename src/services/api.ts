/**
 * API Service
 * Centralized service for making HTTP requests to the backend
 */

import type { Transaction } from '@/types/transaction';
import type { Local } from '@/types/local';
import type { Usuario } from '@/types/usuario';
import type { Painel, PainelUsuario } from '@/types/painel';
import type { Categoria } from '@/types/categoria';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Pegar token de autenticação
  const token = localStorage.getItem('auth_token');
  const authHeaders: Record<string, string> = {};

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Se erro 401, limpar auth e redirecionar para login
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }

      throw new ApiError(
        response.status,
        errorData.code || 'UNKNOWN_ERROR',
        errorData.message || `HTTP Error ${response.status}`
      );
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const api = {
  // Transactions
  transactions: {
    list: async (params?: {
      limit?: number;
      offset?: number;
      tipo?: 'ENTRADA' | 'SAIDA';
      categoria?: string;
      local?: number;
      descricao?: string;
      painel_id?: number;
      data_inicio?: string;
      data_fim?: string;
      mes?: string;
      local_search?: string; // Busca por nome do local
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
      if (params?.tipo) queryParams.append('tipo', params.tipo);
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.local) queryParams.append('local', params.local.toString());
      if (params?.descricao) queryParams.append('descricao', params.descricao);
      if (params?.painel_id) queryParams.append('painel_id', params.painel_id.toString());
      if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
      if (params?.data_fim) queryParams.append('data_fim', params.data_fim);
      if (params?.mes) queryParams.append('mes', params.mes);
      if (params?.local_search) queryParams.append('local_search', params.local_search);

      const query = queryParams.toString();
      return fetchApi<Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
    },

    get: async (id: number) => {
      return fetchApi<Transaction>(`/transactions/${id}`);
    },

    create: async (data: {
      data: string; // date in ISO format
      descricao: string;
      valor: number;
      tipo: 'ENTRADA' | 'SAIDA';
      categoria: string;
      recorrencia?: 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'OCASIONAL';
      parcelas?: number;
      local_id?: number;
      painel_id: number; // ✅ OBRIGATÓRIO
      tipo_divisao?: 'PESSOAL' | 'COMPARTILHADO_50_50' | 'COMPARTILHADO_CUSTOM'; // ✅ NOVO
      valor_por_pessoa?: number; // ✅ NOVO
      porcentagem_divisao?: number; // ✅ NOVO
      data_vencimento?: string; // ✅ NOVO
      status_pagamento?: 'PENDENTE' | 'PAGO' | 'VENCIDO'; // ✅ NOVO
    }) => {
      return fetchApi<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<{
      data: string;
      descricao: string;
      valor: number;
      tipo: 'ENTRADA' | 'SAIDA';
      categoria: string;
      recorrencia?: 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'OCASIONAL';
      parcelas?: number;
      local_id?: number;
      painel_id?: number; // ✅ NOVO
      tipo_divisao?: 'PESSOAL' | 'COMPARTILHADO_50_50' | 'COMPARTILHADO_CUSTOM'; // ✅ NOVO
      valor_por_pessoa?: number; // ✅ NOVO
      porcentagem_divisao?: number; // ✅ NOVO
      data_vencimento?: string; // ✅ NOVO
      status_pagamento?: 'PENDENTE' | 'PAGO' | 'VENCIDO'; // ✅ NOVO
    }>) => {
      return fetchApi<Transaction>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return fetchApi<void>(`/transactions/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Locais
  locais: {
    list: async (params?: { limit?: number; offset?: number; nome?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.nome) queryParams.append('nome', params.nome);

      const query = queryParams.toString();
      return fetchApi<Local[]>(`/locais${query ? `?${query}` : ''}`);
    },

    get: async (id: number) => {
      return fetchApi<Local>(`/locais/${id}`);
    },

    create: async (data: {
      nome_fantasia?: string;
      cnpj?: string;
      razao_social?: string;
      categoria?: string;
      endereco?: string;
    }) => {
      return fetchApi<Local>('/locais', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<{
      nome_fantasia?: string;
      cnpj?: string;
      razao_social?: string;
      categoria?: string;
      endereco?: string;
    }>) => {
      return fetchApi<Local>(`/locais/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return fetchApi<void>(`/locais/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Usuarios
  usuarios: {
    list: async (params?: { limit?: number; offset?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

      const query = queryParams.toString();
      return fetchApi<Usuario[]>(`/usuarios${query ? `?${query}` : ''}`);
    },

    get: async (id: number) => {
      return fetchApi<Usuario>(`/usuarios/${id}`);
    },

    create: async (data: {
      nome: string;
      email?: string;
    }) => {
      return fetchApi<Usuario>('/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<{
      nome: string;
      email?: string;
    }>) => {
      return fetchApi<Usuario>(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return fetchApi<void>(`/usuarios/${id}`, {
        method: 'DELETE',
      });
    },

    getByEmail: async (email: string) => {
      return fetchApi<Usuario>(`/usuarios/email/${email}`);
    },
  },

  // Paineis
  paineis: {
    list: async (params?: { limit?: number; offset?: number; usuario_id?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
      if (params?.usuario_id) queryParams.append('usuario_id', params.usuario_id.toString());

      const query = queryParams.toString();
      return fetchApi<Painel[]>(`/paineis${query ? `?${query}` : ''}`);
    },

    get: async (id: number) => {
      return fetchApi<Painel>(`/paineis/${id}`);
    },

    create: async (data: {
      nome: string;
      descricao?: string;
      tipo_conta: 'CARTAO_CREDITO' | 'CONTA_BANCARIA' | 'DINHEIRO'; // ✅ OBRIGATÓRIO
      usuario_id: number;
    }) => {
      return fetchApi<Painel>('/paineis', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<{
      nome: string;
      descricao?: string;
      tipo_conta?: 'CARTAO_CREDITO' | 'CONTA_BANCARIA' | 'DINHEIRO'; // ✅ NOVO
      usuario_id: number;
    }>) => {
      return fetchApi<Painel>(`/paineis/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return fetchApi<void>(`/paineis/${id}`, {
        method: 'DELETE',
      });
    },

    getByUsuario: async (usuarioId: number) => {
      return fetchApi<Painel[]>(`/usuarios/${usuarioId}/paineis`);
    },

    // ✅ NOVOS ENDPOINTS
    getBalanco: async (painelId: number, params?: { mes?: string; data_inicio?: string; data_fim?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.mes) queryParams.append('mes', params.mes);
      if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
      if (params?.data_fim) queryParams.append('data_fim', params.data_fim);

      const query = queryParams.toString();
      return fetchApi<{ balanco: number; entradas: number; saidas: number }>(`/paineis/${painelId}/balanco${query ? `?${query}` : ''}`);
    },

    compartilhar: async (painelId: number, data: { usuario_id: number; tipo_permissao: 'OWNER' | 'EDITOR' | 'VIEWER' }) => {
      return fetchApi<PainelUsuario>(`/paineis/${painelId}/compartilhar`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getUsuarios: async (painelId: number) => {
      return fetchApi<PainelUsuario[]>(`/paineis/${painelId}/usuarios`);
    },

    removerUsuario: async (painelId: number, usuarioId: number) => {
      return fetchApi<void>(`/paineis/${painelId}/usuarios/${usuarioId}`, {
        method: 'DELETE',
      });
    },
  },

  // Categorias
  categorias: {
    /**
     * Lista todas as categorias disponíveis
     * Retorna categorias padrão + categorias customizadas do usuário
     */
    list: async () => {
      return fetchApi<Categoria[]>('/categorias');
    },

    /**
     * Busca uma categoria específica por ID
     */
    get: async (id: number) => {
      return fetchApi<Categoria>(`/categorias/${id}`);
    },

    /**
     * Cria nova categoria customizada
     */
    create: async (data: {
      nome: string;
      descricao?: string;
    }) => {
      return fetchApi<Categoria>('/categorias', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Atualiza categoria customizada
     * Apenas categorias não-padrão do usuário podem ser editadas
     */
    update: async (id: number, data: Partial<{
      nome: string;
      descricao?: string;
    }>) => {
      return fetchApi<Categoria>(`/categorias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Deleta categoria customizada
     * Apenas categorias não-padrão sem transações associadas
     */
    delete: async (id: number) => {
      return fetchApi<void>(`/categorias/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Health check
  health: async () => {
    return fetchApi<{ status: string; timestamp: string }>('/health');
  },
};

export { ApiError };
export type { ApiResponse };
