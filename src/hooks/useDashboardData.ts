/**
 * useDashboardData Hook
 * Hook for aggregating financial data across all cards/panels
 */

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { api } from '@/services/api';
import { usePaineis } from './usePaineis';
import { useUsuarios } from './useUsuarios';
import type { Transaction } from '@/types/transaction';
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
  // Buscar painéis e usuários primeiro
  const { data: paineis = [], isLoading: paineisLoading } = usePaineis();
  const { data: usuarios = [], isLoading: usuariosLoading } = useUsuarios();

  // Para cada painel, buscar suas transações em paralelo
  // (O backend exige painel_id obrigatório, então fazemos múltiplas requisições)
  const transactionQueries = useQueries({
    queries: paineis.map(painel => ({
      queryKey: ['transactions', { painel_id: painel.id, mes: filters.mes }],
      queryFn: () => api.transactions.list({
        painel_id: painel.id,
        mes: filters.mes,
      }),
      enabled: !!painel.id && !paineisLoading,
      staleTime: 30 * 1000,
    })),
  });

  // Combinar todas as transações de todos os painéis
  const allTransactions = useMemo(() => {
    return transactionQueries.flatMap(query => (query.data || []) as Transaction[]);
  }, [transactionQueries]);

  const transactionsLoading = transactionQueries.some(query => query.isLoading) || paineisLoading;

  const dashboardData = useMemo<DashboardData>(() => {
    if (transactionsLoading || paineisLoading || usuariosLoading) {
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

    // Calcular totais gerais da família
    let total_entradas_familia = 0;
    let total_saidas_familia = 0;
    let quantidade_compartilhadas = 0;

    allTransactions.forEach((t: Transaction) => {
      if (t.tipo === 'ENTRADA') {
        total_entradas_familia += t.valor;
      } else {
        total_saidas_familia += t.valor;
        if (t.tipo_divisao && t.tipo_divisao !== 'PESSOAL') {
          quantidade_compartilhadas++;
        }
      }
    });

    const saldo_familia = total_entradas_familia - total_saidas_familia;

    // Calcular gastos por painel
    const gastos_por_painel: GastoPorPainel[] = paineis.map(painel => {
      const transacoesDoPainel = allTransactions.filter(t => t.painel_id === painel.id);

      let total_entradas = 0;
      let total_saidas = 0;
      let total_pessoal = 0;
      let total_compartilhado = 0;
      let valor_a_pagar = 0;

      transacoesDoPainel.forEach(t => {
        if (t.tipo === 'ENTRADA') {
          total_entradas += t.valor;
        } else {
          total_saidas += t.valor;

          // Calcular valor a pagar considerando divisão
          if (t.tipo_divisao === 'PESSOAL' || !t.tipo_divisao) {
            total_pessoal += t.valor;
            valor_a_pagar += t.valor;
          } else {
            total_compartilhado += t.valor;
            // Usar valor_por_pessoa se disponível, senão calcular
            valor_a_pagar += t.valor_por_pessoa || t.valor / 2;
          }
        }
      });

      return {
        painel,
        total_entradas,
        total_saidas,
        saldo: total_entradas - total_saidas,
        total_pessoal,
        total_compartilhado,
        valor_a_pagar,
      };
    });

    // Calcular gastos por usuário
    const gastos_por_usuario_map = new Map<number, GastoPorUsuario>();

    usuarios.forEach(usuario => {
      gastos_por_usuario_map.set(usuario.id, {
        usuario_id: usuario.id,
        usuario_nome: usuario.nome,
        total_gasto_pessoal: 0,
        total_gasto_compartilhado: 0,
        total_a_pagar: 0,
      });
    });

    // Iterar pelas transações e calcular por usuário
    allTransactions.forEach((t: Transaction) => {
      if (t.tipo === 'SAIDA') {
        const painel = paineis.find(p => p.id === t.painel_id);
        if (painel && painel.usuario_id) {
          const userData = gastos_por_usuario_map.get(painel.usuario_id);
          if (userData) {
            if (t.tipo_divisao === 'PESSOAL' || !t.tipo_divisao) {
              userData.total_gasto_pessoal += t.valor;
              userData.total_a_pagar += t.valor;
            } else {
              userData.total_gasto_compartilhado += t.valor;
              userData.total_a_pagar += t.valor_por_pessoa || t.valor / 2;
            }
          }
        }
      }
    });

    const gastos_por_usuario = Array.from(gastos_por_usuario_map.values());

    return {
      total_entradas_familia,
      total_saidas_familia,
      saldo_familia,
      gastos_por_painel,
      gastos_por_usuario,
      quantidade_transacoes: allTransactions.length,
      quantidade_compartilhadas,
    };
  }, [allTransactions, paineis, usuarios, transactionsLoading, paineisLoading, usuariosLoading]);

  return {
    data: dashboardData,
    isLoading: transactionsLoading || paineisLoading || usuariosLoading,
  };
}
