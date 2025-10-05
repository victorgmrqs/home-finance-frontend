/**
 * Painel Types
 * Type definitions for panels matching backend API
 */

export interface Painel {
  id: number;
  nome: string;
  descricao?: string | null;
  usuario_id: number;
  criado_em: string;
  atualizado_em: string;
}

export interface PainelCreateInput {
  nome: string;
  descricao?: string;
  usuario_id: number;
}

export interface PainelUpdateInput {
  nome?: string;
  descricao?: string;
  usuario_id?: number;
}
