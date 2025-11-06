/**
 * useCategorias Hook
 * Hook para gerenciar categorias de transações via API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import type { Categoria, CategoriaCreateInput } from '@/types/categoria';

const QUERY_KEY = 'categorias';

/**
 * Hook para listar todas as categorias
 * Retorna categorias padrão + customizadas do usuário
 */
export function useCategorias() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      return api.categorias.list();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });
}

/**
 * Hook para buscar categoria específica por ID
 */
export function useCategoria(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      return api.categorias.get(id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para criar nova categoria customizada
 */
export function useCreateCategoria() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CategoriaCreateInput) => {
      return api.categorias.create(data);
    },
    onSuccess: () => {
      // Invalidar cache de categorias
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

      toast({
        title: 'Sucesso!',
        description: 'Categoria criada com sucesso.',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar categoria.';

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para atualizar categoria customizada
 * Apenas categorias não-padrão podem ser editadas
 */
export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CategoriaCreateInput> }) => {
      return api.categorias.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

      toast({
        title: 'Sucesso!',
        description: 'Categoria atualizada com sucesso.',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar categoria.';

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para deletar categoria customizada
 * Apenas categorias não-padrão sem transações associadas
 */
export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return api.categorias.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

      toast({
        title: 'Sucesso!',
        description: 'Categoria removida com sucesso.',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover categoria.';

      // Mensagens específicas para erros comuns
      let description = errorMessage;
      if (errorMessage.includes('categoria padrão')) {
        description = 'Categorias padrão do sistema não podem ser removidas.';
      } else if (errorMessage.includes('transações associadas') || errorMessage.includes('em uso')) {
        description = 'Não é possível remover categoria com transações associadas.';
      }

      toast({
        title: 'Erro',
        description,
        variant: 'destructive',
      });
    },
  });
}

// Exportar tipos
export type { Categoria, CategoriaCreateInput };
