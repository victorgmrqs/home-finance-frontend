/**
 * useDashboardData Hook
 * Hook for aggregating financial data across all cards/panels
 * Uses aggregated endpoint to eliminate N+1 query pattern
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { usePaineis } from './usePaineis';
import type { Painel } from '@/types/painel';

interface DashboardFilters {
  mes?: string; // formato YYYY-MM
  usuario_id?: number;
}

interface GastoPorPainel {
  painel: Painel;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  total_pessoal: number;
  total_compartilhado: number;
  valor_a_pagar: number; // Considerando divisão
}

interface GastoPorUsuario {
  usuario_id: number;
  usuario_nome: string;
  total_gasto_pessoal: number;
  total_gasto_compartilhado: number;
  total_a_pagar: number;
}

interface DashboardData {
  // Totais gerais
  total_entradas_familia: number;
  total_saidas_familia: number;
  saldo_familia: number;

  // Por cartão
  gastos_por_painel: GastoPorPainel[];

  // Por usuário
  gastos_por_usuario: GastoPorUsuario[];

  // Estatísticas
  quantidade_transacoes: number;
  quantidade_compartilhadas: number;
}

export function useDashboardData(filters: DashboardFilters = {}) {
  // Buscar painéis para enriquecer os dados
  const { data: paineis = [], isLoading: paineisLoading } = usePaineis();

  // Buscar dados agregados do dashboard em uma única requisição
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard', 'summary', filters],
    queryFn: () => api.dashboard.summary(filters),
    staleTime: 30 * 1000,
  });

  // Enriquecer dados com informações completas dos painéis
  const dashboardData = useMemo<DashboardData>(() => {
    if (summaryLoading || paineisLoading || !summaryData) {
      return {
        total_entradas_familia: 0,
        total_saidas_familia: 0,
        saldo_familia: 0,
        gastos_por_painel: [],
        gastos_por_usuario: [],
        quantidade_transacoes: 0,
        quantidade_compartilhadas: 0,
      };
    }

    // Enriquecer gastos_por_painel com objetos Painel completos
    const gastos_por_painel: GastoPorPainel[] = summaryData.gastos_por_painel.map(gasto => {
      const painel = paineis.find(p => p.id === gasto.painel_id);

      // Se não encontrar o painel, criar um objeto mínimo
      const painelData: Painel = painel || {
        id: gasto.painel_id,
        nome: gasto.painel_nome,
        descricao: gasto.painel_descricao,
        tipo_conta: gasto.painel_tipo_conta as 'CARTAO_CREDITO' | 'CONTA_BANCARIA' | 'DINHEIRO',
        usuario_id: gasto.painel_usuario_id,
        created_at: '',
        updated_at: '',
      };

      return {
        painel: painelData,
        total_entradas: gasto.total_entradas,
        total_saidas: gasto.total_saidas,
        saldo: gasto.saldo,
        total_pessoal: gasto.total_pessoal,
        total_compartilhado: gasto.total_compartilhado,
        valor_a_pagar: gasto.valor_a_pagar,
      };
    });

    return {
      total_entradas_familia: summaryData.total_entradas_familia,
      total_saidas_familia: summaryData.total_saidas_familia,
      saldo_familia: summaryData.saldo_familia,
      gastos_por_painel,
      gastos_por_usuario: summaryData.gastos_por_usuario,
      quantidade_transacoes: summaryData.quantidade_transacoes,
      quantidade_compartilhadas: summaryData.quantidade_compartilhadas,
    };
  }, [summaryData, paineis, summaryLoading, paineisLoading]);

  return {
    data: dashboardData,
    isLoading: summaryLoading || paineisLoading,
  };
}
