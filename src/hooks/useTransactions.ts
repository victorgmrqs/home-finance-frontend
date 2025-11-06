/**
 * useTransactions Hook
 * React Query hook for managing transactions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { Transaction, TransactionCreateInput, TransactionUpdateInput, TransactionFilters } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = 'transactions';

// Helper function to extract error message
const getErrorMessage = (error: Error | unknown, defaultMessage: string): string => {
  return error instanceof Error ? error.message : defaultMessage;
};

// Helper function to create mutation handlers
const createMutationHandlers = (
  successMessage: string,
  errorMessage: string,
  queryClient: ReturnType<typeof useQueryClient>,
  toastFn: ReturnType<typeof useToast>['toast']
) => ({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    toastFn({
      title: 'Sucesso!',
      description: successMessage,
    });
  },
  onError: (error: Error | unknown) => {
    toastFn({
      title: 'Erro',
      description: getErrorMessage(error, errorMessage),
      variant: 'destructive',
    });
  },
});

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
    ...createMutationHandlers(
      'Transação criada com sucesso.',
      'Erro ao criar transação.',
      queryClient,
      toast
    ),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransactionUpdateInput }) =>
      api.transactions.update(id, data),
    ...createMutationHandlers(
      'Transação atualizada com sucesso.',
      'Erro ao atualizar transação.',
      queryClient,
      toast
    ),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.transactions.delete(id),
    ...createMutationHandlers(
      'Transação removida com sucesso.',
      'Erro ao remover transação.',
      queryClient,
      toast
    ),
  });
}

