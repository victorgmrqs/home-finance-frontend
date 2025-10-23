/**
 * usePaineis Hook
 * React Query hook for managing paineis (panels)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Painel, PainelCreateInput, PainelUpdateInput } from '@/types/painel';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = 'paineis';

export function usePaineis(params?: { limit?: number; offset?: number; usuario_id?: number }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => api.paineis.list(params),
    // Se usuario_id não for fornecido, buscar todos os painéis do sistema
    // (O backend deve filtrar por usuário automaticamente via autenticação)
  });
}

export function usePainel(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.paineis.get(id),
    enabled: !!id,
  });
}

export function usePaineisByUsuario(usuarioId: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'usuario', usuarioId],
    queryFn: () => api.paineis.getByUsuario(usuarioId),
    enabled: !!usuarioId,
  });
}

export function useCreatePainel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PainelCreateInput) => api.paineis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Painel criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar painel.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePainel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PainelUpdateInput }) =>
      api.paineis.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Painel atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar painel.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePainel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.paineis.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Painel removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover painel.',
        variant: 'destructive',
      });
    },
  });
}
