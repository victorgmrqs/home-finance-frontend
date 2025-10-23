/**
 * useMoveTransaction Hook
 * Hook for moving a transaction to a different card/panel
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = 'transactions';

interface MoveTransactionParams {
  id: number;
  novo_painel_id: number;
}

/**
 * Hook para mover uma transação para outro cartão/painel
 * Usa o endpoint de UPDATE existente, apenas alterando o painel_id
 */
export function useMoveTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, novo_painel_id }: MoveTransactionParams) => {
      return api.transactions.update(id, { painel_id: novo_painel_id });
    },
    onSuccess: () => {
      // Invalidar queries de transações para recarregar os dados
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({
        title: 'Sucesso',
        description: 'Transação movida para outro cartão com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao mover transação',
        description: error.message || 'Ocorreu um erro ao tentar mover a transação.',
      });
    },
  });
}
