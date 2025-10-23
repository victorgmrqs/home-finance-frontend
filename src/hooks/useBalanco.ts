import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface BalancoParams {
  painelId: number;
  mes?: string;
  data_inicio?: string;
  data_fim?: string;
}

export const useBalanco = ({ painelId, mes, data_inicio, data_fim }: BalancoParams) => {
  return useQuery({
    queryKey: ['balanco', painelId, mes, data_inicio, data_fim],
    queryFn: () => api.paineis.getBalanco(painelId, { mes, data_inicio, data_fim }),
    enabled: !!painelId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
