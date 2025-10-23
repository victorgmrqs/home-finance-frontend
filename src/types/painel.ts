/**
 * Painel Types
 * Type definitions for panels matching backend API
 *
 * Note: "Painel" is displayed as "Cartão" or "Conta" in the UI
 */

export type TipoPermissao = 'OWNER' | 'EDITOR' | 'VIEWER';

/**
 * Tipo de Conta
 * Determines the visual icon and category of the account
 */
export type TipoConta = 'CARTAO_CREDITO' | 'CONTA_BANCARIA' | 'DINHEIRO';

export interface Painel {
  id: number;
  nome: string;
  descricao?: string | null;
  tipo_conta: TipoConta;
  usuario_id: number;
  criado_em: string;
  atualizado_em: string;
  // Campos de permissão quando retornado do backend
  permissao?: TipoPermissao;
  compartilhado_com?: PainelUsuario[];
}

export interface PainelCreateInput {
  nome: string;
  descricao?: string;
  tipo_conta: TipoConta;
  usuario_id: number;
}

export interface PainelUpdateInput {
  nome?: string;
  descricao?: string;
  tipo_conta?: TipoConta;
  usuario_id?: number;
}

export interface PainelUsuario {
  id: number;
  painel_id: number;
  usuario_id: number;
  tipo_permissao: TipoPermissao;
  criado_em: string;
  usuario_nome?: string;
  usuario_email?: string;
}

export interface PainelUsuarioCreate {
  usuario_id: number;
  tipo_permissao: TipoPermissao;
}
