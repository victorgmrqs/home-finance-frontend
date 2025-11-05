/**
 * TransactionsPage - Integrated with Backend API
 * Uses React Query hooks for data fetching and mutations
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionTable } from "./TransactionTable";
import { TransactionModal } from "./TransactionModal";
import { Pagination } from "./Pagination";
import { useTransactions, useCreateTransaction } from "@/hooks/useTransactions";
import { useLocais, useCreateLocal } from "@/hooks/useLocais";
import type { TransactionCreateInput, Transaction, TransactionFilters as TransactionFiltersType } from "@/types/transaction";
import type { Local } from "@/types/local";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction as FrontendTransaction } from "./TransactionsPage";

// Adapter to convert backend format to frontend format
function adaptTransaction(apiTransaction: Transaction, locais: Local[] = []): {
  id: string;
  date: string;
  description: string;
  value: number;
  type: "entrada" | "saida";
  category: string;
  location: string;
  recurrence: "diario" | "semanal" | "mensal" | "ocasional";
} {
  // Find the local name by local_id
  const local = locais.find(l => l.id === apiTransaction.local_id);
  const locationName = local ? local.nome_fantasia || `Local ${apiTransaction.local_id}` : "Sem local";
  
  return {
    id: apiTransaction.id.toString(),
    date: apiTransaction.data,
    description: apiTransaction.descricao,
    value: apiTransaction.valor,
    type: apiTransaction.tipo.toLowerCase() as "entrada" | "saida",
    category: apiTransaction.categoria,
    location: apiTransaction.local_id ? locationName : "Sem local",
    recurrence: (apiTransaction.recorrencia?.toLowerCase() || "ocasional") as "diario" | "semanal" | "mensal" | "ocasional",
  };
}

export const TransactionsPageIntegrated = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<TransactionFiltersType>({});
  const itemsPerPage = 10;

  // Fetch transactions from API
  const { data: transactions = [], isLoading, error } = useTransactions({
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    ...filters,
  });

  // Fetch locais for dropdown
  const { data: locais = [], isLoading: locaisLoading, error: locaisError } = useLocais();

  // Create transaction mutation
  const createTransaction = useCreateTransaction();
  
  // Create local mutation
  const createLocal = useCreateLocal();

  const adaptedTransactions = transactions.map(transaction => adaptTransaction(transaction, locais));
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const handleAddTransaction = async (transaction: Omit<FrontendTransaction, "id">) => {
    let localId: number | undefined;
    
    if (transaction.location && transaction.location !== 'Não informado') {
      // First, try to find existing local
      const existingLocal = locais.find((l: Local) => {
        const localName = l.nome_fantasia || l.id.toString();
        return localName === transaction.location;
      });
      
      if (existingLocal) {
        // Local exists, use its ID
        localId = existingLocal.id;
      } else {
        // Local doesn't exist, create it automatically
        try {
          const newLocal = await createLocal.mutateAsync({
            nome_fantasia: transaction.location,
          });
          localId = newLocal.id;
        } catch (error) {
          console.error('Error creating local:', error);
          // If local creation fails, proceed without local_id
          localId = undefined;
        }
      }
    }

    // Convert frontend format to backend format
    const apiData: TransactionCreateInput = {
      data: transaction.date,
      descricao: transaction.description,
      valor: transaction.value,
      tipo: transaction.type.toUpperCase() as "ENTRADA" | "SAIDA",
      categoria: transaction.category,
      recorrencia: transaction.recurrence?.toUpperCase() as "DIARIO" | "SEMANAL" | "MENSAL" | "OCASIONAL",
      local_id: localId,
      painel_id: transaction.painel_id || 1, // Default to 1 if not provided (should be required by modal)
      tipo_divisao: transaction.tipo_divisao,
      valor_por_pessoa: transaction.valor_por_pessoa || undefined,
      porcentagem_divisao: transaction.porcentagem_divisao || undefined,
      data_vencimento: transaction.data_vencimento || undefined,
      status_pagamento: transaction.status_pagamento,
      parcelas: transaction.parcelas || undefined,
    };

    try {
      await createTransaction.mutateAsync(apiData);
      setIsModalOpen(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error creating transaction:', error);
    }
  };

  const handleFilter = (filtered: {
    tipo?: string;
    categoria?: string;
    descricao?: string;
    location?: string;
    painel_id?: number;
    mes?: string;
    local_search?: string;
  }) => {
    // Update filters state to trigger API refetch
    setCurrentPage(1);
    setFilters(filtered as TransactionFiltersType);
    // TODO: Implement filter logic with API
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar transações</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-header-bg shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-header-text">Home Finance</h1>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Cabeçalho da página */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">Transações</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createTransaction.isPending || createLocal.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Filtros */}
        <TransactionFilters
          transactions={adaptedTransactions}
          onFilter={handleFilter}
        />

        {/* Tabela */}
        <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <TransactionTable transactions={adaptedTransactions} />
          )}
        </div>

        {/* Paginação */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>

      {/* Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
        existingLocations={Array.from(new Set(locais.map((l: Local) => l.nome_fantasia || l.id.toString())))}
      />
    </div>
  );
};
