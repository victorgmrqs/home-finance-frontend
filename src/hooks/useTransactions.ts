/**
 * useTransactions Hook
 * React Query hook for managing transactions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Transaction, TransactionCreateInput, TransactionUpdateInput, TransactionFilters } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = 'transactions';

export function useTransactions(params?: TransactionFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => api.transactions.list(params),
    enabled: !!params?.painel_id,
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.transactions.get(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: TransactionCreateInput) => api.transactions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Transação criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar transação.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransactionUpdateInput }) =>
      api.transactions.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Transação atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar transação.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.transactions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Transação removida com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover transação.',
        variant: 'destructive',
      });
    },
  });
}

