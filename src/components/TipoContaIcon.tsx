/**
 * TipoContaIcon Component
 * Displays visual icon for account type (Credit Card, Bank Account, Cash)
 */

import type { TipoConta } from "@/types/painel";

interface TipoContaIconProps {
  tipo: TipoConta;
  className?: string;
  showLabel?: boolean;
}

const TIPO_CONTA_CONFIG = {
  CARTAO_CREDITO: {
    icon: '💳',
    label: 'Cartão de Crédito',
  },
  CONTA_BANCARIA: {
    icon: '🏦',
    label: 'Conta Bancária',
  },
  DINHEIRO: {
    icon: '💵',
    label: 'Dinheiro',
  },
} as const;

export const TipoContaIcon = ({ tipo, className = "", showLabel = false }: TipoContaIconProps) => {
  const config = TIPO_CONTA_CONFIG[tipo];

  if (!config) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="text-xl" role="img" aria-label={config.label}>
        {config.icon}
      </span>
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {config.label}
        </span>
      )}
    </span>
  );
};

// Export helper function to get label only
export const getTipoContaLabel = (tipo: TipoConta): string => {
  return TIPO_CONTA_CONFIG[tipo]?.label || '';
};

// Export helper function to get icon only
export const getTipoContaIcon = (tipo: TipoConta): string => {
  return TIPO_CONTA_CONFIG[tipo]?.icon || '';
};
