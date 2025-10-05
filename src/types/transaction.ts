/**
 * Transaction Types
 * Type definitions for transactions matching backend API
 */

export type TransactionType = 'ENTRADA' | 'SAIDA';
export type RecurrenceType = 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'OCASIONAL';

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
}

export interface TransactionFilters {
  limit?: number;
  offset?: number;
  tipo?: TransactionType;
  categoria?: string;
  local?: number;
  descricao?: string;
}
