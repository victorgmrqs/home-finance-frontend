import { Badge } from "@/components/ui/badge";
import type { Transaction } from "./TransactionsPage";

interface TransactionTableProps {
  transactions: Transaction[];
  lastTransactionRef?: (node: HTMLTableRowElement | null) => void;
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

export const TransactionTable = ({ transactions, lastTransactionRef }: TransactionTableProps) => {
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
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Valor</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Tipo</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Categoria</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Local</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Recorrência</th>
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
              <td className="py-4 px-6 text-sm font-semibold">
                <span className={transaction.type === 'entrada' ? 'text-success' : 'text-danger'}>
                  {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(transaction.value)}
                </span>
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
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};