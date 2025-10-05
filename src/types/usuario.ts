/**
 * Usuario Types
 * Type definitions for users matching backend API
 */

export interface Usuario {
  id: number;
  nome: string;
  email?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface UsuarioCreateInput {
  nome: string;
  email?: string;
}

export interface UsuarioUpdateInput {
  nome?: string;
  email?: string;
}
