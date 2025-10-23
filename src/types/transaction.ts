/**
 * Transaction Types
 * Type definitions for transactions matching backend API
 */

export type TransactionType = 'ENTRADA' | 'SAIDA';
export type RecurrenceType = 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'OCASIONAL';
export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'VENCIDO';

/**
 * Tipo de Divisão
 * Determina como o gasto é dividido entre pessoas
 */
export type TipoDivisao = 'PESSOAL' | 'COMPARTILHADO_50_50' | 'COMPARTILHADO_CUSTOM';

export interface Transaction {
  id: number;
  data: string; // ISO date string
  descricao: string;
  valor: number;
  tipo: TransactionType;
  categoria: string;
  recorrencia?: RecurrenceType | null;
  parcelas?: number | null;
  local_id?: number | null;
  painel_id: number; // ✅ NOVO - obrigatório
  tipo_divisao?: TipoDivisao; // ✅ NOVO - como o gasto é dividido
  valor_por_pessoa?: number | null; // ✅ NOVO - calculado se compartilhado
  porcentagem_divisao?: number | null; // ✅ NOVO - para CUSTOM (ex: 60/40)
  data_vencimento?: string | null; // ✅ NOVO - data de vencimento (cartão de crédito)
  status_pagamento?: StatusPagamento; // ✅ NOVO - status do pagamento
  criado_em?: string;
  atualizado_em?: string;
  // Campos opcionais de join
  painel?: {
    id: number;
    nome: string;
  };
  local?: {
    id: number;
    nome_fantasia: string;
  };
}

export interface TransactionCreateInput {
  data: string;
  descricao: string;
  valor: number;
  tipo: TransactionType;
  categoria: string;
  recorrencia?: RecurrenceType;
  parcelas?: number;
  local_id?: number;
  painel_id: number; // ✅ NOVO - obrigatório
  tipo_divisao?: TipoDivisao; // ✅ NOVO
  valor_por_pessoa?: number; // ✅ NOVO
  porcentagem_divisao?: number; // ✅ NOVO
  data_vencimento?: string; // ✅ NOVO
  status_pagamento?: StatusPagamento; // ✅ NOVO
}

export interface TransactionUpdateInput {
  data?: string;
  descricao?: string;
  valor?: number;
  tipo?: TransactionType;
  categoria?: string;
  recorrencia?: RecurrenceType;
  parcelas?: number;
  local_id?: number;
  painel_id?: number;
  tipo_divisao?: TipoDivisao; // ✅ NOVO
  valor_por_pessoa?: number; // ✅ NOVO
  porcentagem_divisao?: number; // ✅ NOVO
  data_vencimento?: string; // ✅ NOVO
  status_pagamento?: StatusPagamento; // ✅ NOVO
}

export interface TransactionFilters {
  limit?: number;
  offset?: number;
  tipo?: TransactionType;
  categoria?: string;
  local?: number;
  descricao?: string;
  painel_id?: number;
  data_inicio?: string;
  data_fim?: string;
  mes?: string; // formato YYYY-MM
  local_search?: string; // Busca por nome do local
}
