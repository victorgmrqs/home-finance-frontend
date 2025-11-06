/**
 * useLocais Hook
 * React Query hook for managing locais (places)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Local, LocalCreateInput, LocalUpdateInput } from '@/types/local';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = 'locais';

export function useLocais(params?: { limit?: number; offset?: number; nome?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => api.locais.list(params),
  });
}

export function useLocal(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.locais.get(id),
    enabled: !!id,
  });
}

export function useCreateLocal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: LocalCreateInput) => api.locais.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Local criado com sucesso.',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar local.';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateLocal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LocalUpdateInput }) =>
      api.locais.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Local atualizado com sucesso.',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar local.';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteLocal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.locais.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Local removido com sucesso.',
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover local.';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}
