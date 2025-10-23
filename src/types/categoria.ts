/**
 * Categoria de Transação
 * Pode ser padrão do sistema ou customizada por usuário
 */
export interface Categoria {
  /** ID único da categoria */
  id: number;

  /** Nome da categoria */
  nome: string;

  /** Descrição opcional */
  descricao?: string;

  /** ID do usuário dono (null = categoria padrão) */
  usuario_id?: number;

  /** Indica se é categoria padrão do sistema */
  is_default: boolean;

  /** Data de criação */
  criado_em: string;

  /** Data da última atualização */
  atualizado_em: string;
}

/**
 * Payload para criar nova categoria
 */
export interface CategoriaCreateInput {
  /** Nome da categoria (obrigatório, max 100 caracteres) */
  nome: string;

  /** Descrição opcional (max 500 caracteres) */
  descricao?: string;
}

/**
 * Payload para atualizar categoria existente
 */
export interface CategoriaUpdateInput {
  /** Novo nome da categoria */
  nome?: string;

  /** Nova descrição */
  descricao?: string;
}
