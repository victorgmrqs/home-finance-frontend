/**
 * TransactionsPageInfiniteScroll
 * Component with infinite scroll for loading transactions
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFilters as TransactionFiltersComponent } from "./TransactionFilters";
import { TransactionTable } from "./TransactionTable";
import { TransactionModal } from "./TransactionModal";
import { Navigation } from "./Navigation";
import { useInfiniteTransactions } from "@/hooks/useInfiniteTransactions";
import { useLocais, useCreateLocal } from "@/hooks/useLocais";
import { useCreateTransaction } from "@/hooks/useTransactions";
import type { TransactionCreateInput, Transaction as APITransaction, RecurrenceType, TransactionFilters } from "@/types/transaction";
import type { Local } from "@/types/local";
import type { Transaction } from "./TransactionsPage";
import { Skeleton } from "@/components/ui/skeleton";

// Adapter to convert backend format to frontend format
function adaptTransaction(apiTransaction: APITransaction, locais: Local[] = []): Transaction {
  // Find the local name by local_id
  const local = locais.find(l => l.id === apiTransaction.local_id);
  const locationName = local ? (local.nome_fantasia || `Local ${apiTransaction.local_id}`) : "Sem local";
  
  const recurrenceMap: Record<string, "diario" | "semanal" | "mensal" | "ocasional"> = {
    'DIARIO': 'diario',
    'SEMANAL': 'semanal',
    'MENSAL': 'mensal',
    'OCASIONAL': 'ocasional',
  };
  
  const recurrence = apiTransaction.recorrencia 
    ? (recurrenceMap[apiTransaction.recorrencia] || 'ocasional')
    : 'ocasional';
  
  return {
    id: apiTransaction.id.toString(),
    date: apiTransaction.data,
    description: apiTransaction.descricao,
    value: apiTransaction.valor,
    type: apiTransaction.tipo.toLowerCase() as "entrada" | "saida",
    category: apiTransaction.categoria,
    location: apiTransaction.local_id ? locationName : "Sem local",
    recurrence,
    tipo_divisao: apiTransaction.tipo_divisao,
    valor_por_pessoa: apiTransaction.valor_por_pessoa,
    porcentagem_divisao: apiTransaction.porcentagem_divisao,
    data_vencimento: apiTransaction.data_vencimento,
    status_pagamento: apiTransaction.status_pagamento,
  };
}

interface TransactionFiltersState {
  tipo?: string;
  categoria?: string;
  descricao?: string;
  location?: string;
  painel_id?: number;
  mes?: string;
  local_search?: string;
}

// Convert TransactionFiltersState to TransactionFilters format for API
const convertFiltersToAPI = (filters: TransactionFiltersState): TransactionFilters => {
  const apiFilters: TransactionFilters = {};
  
  if (filters.painel_id) {
    apiFilters.painel_id = filters.painel_id;
  }
  if (filters.mes) {
    apiFilters.mes = filters.mes;
  }
  if (filters.categoria) {
    apiFilters.categoria = filters.categoria;
  }
  if (filters.descricao) {
    apiFilters.descricao = filters.descricao;
  }
  if (filters.local_search) {
    apiFilters.local_search = filters.local_search;
  }
  if (filters.tipo && (filters.tipo === 'ENTRADA' || filters.tipo === 'SAIDA')) {
    apiFilters.tipo = filters.tipo;
  }
  
  return apiFilters;
};

export const TransactionsPageInfiniteScroll = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFiltersState>({ painel_id: 1 });
  const itemsPerPage = 20;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use infinite transactions hook
  const {
    transactions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    reset,
  } = useInfiniteTransactions({
    itemsPerPage,
    filters: convertFiltersToAPI(filters),
  });

  // Fetch locais for dropdown
  const { data: locais = [] } = useLocais();

  // Create transaction mutation
  const createTransaction = useCreateTransaction();
  
  // Create local mutation
  const createLocal = useCreateLocal();

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  // Reset when filters change
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  
  useEffect(() => {
    reset();
  }, [filtersKey, reset]);

  const adaptedTransactions = transactions.map(transaction => adaptTransaction(transaction, locais));

  // Helper function to get or create local ID
  const getOrCreateLocalId = async (locationName: string): Promise<number | undefined> => {
    if (!locationName || locationName === 'Não informado') {
      return undefined;
    }

    // First, try to find existing local
    const existingLocal = locais.find((l: Local) => {
      const localName = l.nome_fantasia || l.id.toString();
      return localName === locationName;
    });

    if (existingLocal) {
      return existingLocal.id;
    }

    // Local doesn't exist, create it automatically
    try {
      const newLocal = await createLocal.mutateAsync({
        nome_fantasia: locationName,
      });
      return newLocal.id;
    } catch (error) {
      console.error('Error creating local:', error);
      // If local creation fails, proceed without local_id
      return undefined;
    }
  };

  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    const localId = await getOrCreateLocalId(transaction.location || '');

    const recurrenceMap: Record<string, RecurrenceType> = {
      'diario': 'DIARIO',
      'semanal': 'SEMANAL',
      'mensal': 'MENSAL',
      'ocasional': 'OCASIONAL',
    };

    // Convert frontend format to backend format
    const apiData: TransactionCreateInput = {
      data: transaction.date,
      descricao: transaction.description,
      valor: transaction.value,
      tipo: transaction.type.toUpperCase() as "ENTRADA" | "SAIDA",
      categoria: transaction.category,
      recorrencia: transaction.recurrence ? (recurrenceMap[transaction.recurrence] || 'OCASIONAL') : undefined,
      local_id: localId,
      painel_id: filters.painel_id || 1, // Default to first painel if not specified
    };

    try {
      await createTransaction.mutateAsync(apiData);
      setIsModalOpen(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error creating transaction:', error);
    }
  };

  const handleFilter = (filtered: TransactionFiltersState) => {
    // Update filters state to trigger API refetch
    setFilters(filtered);
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
        <Navigation />

        {/* Cabeçalho da página */}
        <div className="flex items-center justify-between mb-8 mt-8">
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
        <TransactionFiltersComponent
          transactions={adaptedTransactions}
          onFilter={(filtered: TransactionFiltersState) => handleFilter(filtered)}
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
            <>
              <TransactionTable transactions={adaptedTransactions} />
              {/* Intersection Observer target for infinite scroll */}
              {hasMore && (
                <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                  {isLoadingMore && (
                    <div className="text-muted-foreground">Carregando mais transações...</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
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

