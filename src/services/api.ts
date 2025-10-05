/**
 * API Service
 * Centralized service for making HTTP requests to the backend
 */

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

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
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
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
      if (params?.tipo) queryParams.append('tipo', params.tipo);
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.local) queryParams.append('local', params.local.toString());
      if (params?.descricao) queryParams.append('descricao', params.descricao);

      const query = queryParams.toString();
      return fetchApi<any[]>(`/transactions${query ? `?${query}` : ''}`);
    },

    get: async (id: number) => {
      return fetchApi<any>(`/transactions/${id}`);
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
    }) => {
      return fetchApi<any>('/transactions', {
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
    }>) => {
      return fetchApi<any>(`/transactions/${id}`, {
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
    list: async (params?: { limit?: number; offset?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const query = queryParams.toString();
      return fetchApi<any[]>(`/locais${query ? `?${query}` : ''}`);
    },

    get: async (id: number) => {
      return fetchApi<any>(`/locais/${id}`);
    },

    create: async (data: {
      nome_fantasia?: string;
      cnpj?: string;
      razao_social?: string;
      categoria?: string;
      endereco?: string;
    }) => {
      return fetchApi<any>('/locais', {
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
      return fetchApi<any>(`/locais/${id}`, {
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
      return fetchApi<any[]>(`/usuarios${query ? `?${query}` : ''}`);
    },

    get: async (id: number) => {
      return fetchApi<any>(`/usuarios/${id}`);
    },

    create: async (data: {
      nome: string;
      email?: string;
    }) => {
      return fetchApi<any>('/usuarios', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<{
      nome: string;
      email?: string;
    }>) => {
      return fetchApi<any>(`/usuarios/${id}`, {
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
      return fetchApi<any>(`/usuarios/email/${email}`);
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
      return fetchApi<any[]>(`/painels${query ? `?${query}` : ''}`);
    },

    get: async (id: number) => {
      return fetchApi<any>(`/painels/${id}`);
    },

    create: async (data: {
      nome: string;
      descricao?: string;
      usuario_id: number;
    }) => {
      return fetchApi<any>('/painels', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<{
      nome: string;
      descricao?: string;
      usuario_id: number;
    }>) => {
      return fetchApi<any>(`/painels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return fetchApi<void>(`/painels/${id}`, {
        method: 'DELETE',
      });
    },

    getByUsuario: async (usuarioId: number) => {
      return fetchApi<any[]>(`/usuarios/${usuarioId}/painels`);
    },
  },

  // Health check
  health: async () => {
    return fetchApi<any>('/health');
  },
};

export { ApiError };
export type { ApiResponse };
