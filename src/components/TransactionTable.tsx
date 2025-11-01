import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "./TransactionsPage";

interface TransactionTableProps {
  transactions: Transaction[];
  lastTransactionRef?: (node: HTMLTableRowElement | null) => void;
  onMoveTransaction?: (transaction: Transaction) => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transaction: Transaction) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch (error) {
    return 'Data inválida';
  }
};

const getRecurrenceLabel = (recurrence: string) => {
  const labels = {
    'diario': 'Diário',
    'semanal': 'Semanal', 
    'mensal': 'Mensal',
    'ocasional': 'Ocasional'
  };
  return labels[recurrence as keyof typeof labels] || recurrence;
};

const getTypeLabel = (type: string) => {
  return type === 'entrada' ? 'Entrada' : 'Saída';
};

const getTipoDivisaoDisplay = (transaction: Transaction) => {
  if (!transaction.tipo_divisao || transaction.tipo_divisao === 'PESSOAL') {
    return '💰 Pessoal';
  }
  if (transaction.tipo_divisao === 'COMPARTILHADO_50_50') {
    return '👥 50/50';
  }
  if (transaction.tipo_divisao === 'COMPARTILHADO_CUSTOM') {
    return `⚖️ ${transaction.porcentagem_divisao || 50}%`;
  }
  return '💰 Pessoal';
};

const getStatusPagamentoDisplay = (status?: string) => {
  if (!status || status === 'PENDENTE') return '⏳ Pendente';
  if (status === 'PAGO') return '✅ Pago';
  if (status === 'VENCIDO') return '❌ Vencido';
  return '⏳ Pendente';
};

const getStatusPagamentoBadgeVariant = (status?: string): "default" | "secondary" | "destructive" => {
  if (status === 'PAGO') return 'default';
  if (status === 'VENCIDO') return 'destructive';
  return 'secondary';
};

export const TransactionTable = ({
  transactions,
  lastTransactionRef,
  onMoveTransaction,
  onEditTransaction,
  onDeleteTransaction
}: TransactionTableProps) => {
  const showActionsColumn = onMoveTransaction || onEditTransaction || onDeleteTransaction;
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-table-header">
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Data</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Descrição</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Valor Total</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Você Paga</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Divisão</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Tipo</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Categoria</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Local</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Recorrência</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Vencimento</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Status</th>
            {showActionsColumn && <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => {
            const isLastTransaction = index === transactions.length - 1;
            return (
              <tr 
                key={transaction.id}
                ref={isLastTransaction ? lastTransactionRef : undefined}
                className={`border-b border-border hover:bg-table-row-hover transition-colors ${
                  isLastTransaction ? 'border-b-0' : ''
                }`}
              >
              <td className="py-4 px-6 text-sm text-foreground">
                {formatDate(transaction.date)}
              </td>
              <td className="py-4 px-6 text-sm text-foreground">
                {transaction.description}
              </td>
              <td className="py-4 px-6 text-sm">
                <span className={transaction.type === 'entrada' ? 'text-success' : 'text-danger'}>
                  {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(transaction.value)}
                </span>
              </td>
              <td className="py-4 px-6 text-sm font-semibold">
                <span className={transaction.type === 'entrada' ? 'text-success' : 'text-primary'}>
                  {formatCurrency(transaction.valor_por_pessoa || transaction.value)}
                </span>
              </td>
              <td className="py-4 px-6">
                <Badge variant="outline" className="text-xs">
                  {getTipoDivisaoDisplay(transaction)}
                </Badge>
              </td>
              <td className="py-4 px-6">
                <Badge 
                  variant={transaction.type === 'entrada' ? 'default' : 'destructive'}
                  className={transaction.type === 'entrada' 
                    ? 'bg-success text-success-foreground' 
                    : 'bg-danger text-danger-foreground'
                  }
                >
                  {getTypeLabel(transaction.type)}
                </Badge>
              </td>
              <td className="py-4 px-6 text-sm text-foreground">
                {transaction.category}
              </td>
              <td className="py-4 px-6 text-sm text-foreground max-w-xs truncate">
                {transaction.location}
              </td>
              <td className="py-4 px-6">
                <Badge variant="secondary">
                  {getRecurrenceLabel(transaction.recurrence)}
                </Badge>
              </td>
              <td className="py-4 px-6 text-sm text-foreground">
                {transaction.data_vencimento ? formatDate(transaction.data_vencimento) : '-'}
              </td>
              <td className="py-4 px-6">
                <Badge variant={getStatusPagamentoBadgeVariant(transaction.status_pagamento)}>
                  {getStatusPagamentoDisplay(transaction.status_pagamento)}
                </Badge>
              </td>
              {showActionsColumn && (
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {onEditTransaction && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTransaction(transaction)}
                        className="hover:bg-primary/10 hover:text-primary"
                        title="Editar transação"
                        aria-label="Editar transação"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteTransaction && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTransaction(transaction)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                        title="Excluir transação"
                        aria-label="Excluir transação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {onMoveTransaction && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveTransaction(transaction)}
                        className="hover:bg-primary/10 hover:text-primary"
                        title="Mover para outro cartão"
                        aria-label="Mover para outro cartão"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};