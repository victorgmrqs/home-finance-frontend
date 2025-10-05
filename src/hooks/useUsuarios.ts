/**
 * useUsuarios Hook
 * React Query hook for managing usuarios (users)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Usuario, UsuarioCreateInput, UsuarioUpdateInput } from '@/types/usuario';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = 'usuarios';

export function useUsuarios(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => api.usuarios.list(params),
  });
}

export function useUsuario(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.usuarios.get(id),
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UsuarioCreateInput) => api.usuarios.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Usuário criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar usuário.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UsuarioUpdateInput }) =>
      api.usuarios.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Usuário atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar usuário.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.usuarios.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Usuário removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover usuário.',
        variant: 'destructive',
      });
    },
  });
}
