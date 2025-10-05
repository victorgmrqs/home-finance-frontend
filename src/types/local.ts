/**
 * Local (Place) Types
 * Type definitions for locations matching backend API
 */

export interface Local {
  id: number;
  nome_fantasia?: string | null;
  cnpj?: string | null;
  razao_social?: string | null;
  categoria?: string | null;
  endereco?: string | null;
}

export interface LocalCreateInput {
  nome_fantasia?: string;
  cnpj?: string;
  razao_social?: string;
  categoria?: string;
  endereco?: string;
}

export interface LocalUpdateInput {
  nome_fantasia?: string;
  cnpj?: string;
  razao_social?: string;
  categoria?: string;
  endereco?: string;
}
