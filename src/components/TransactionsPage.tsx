import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionTable } from "./TransactionTable";
import { TransactionModal } from "./TransactionModal";
import { Pagination } from "./Pagination";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  value: number;
  type: "entrada" | "saida";
  category: string;
  location: string;
  recurrence: "diario" | "semanal" | "mensal" | "ocasional";
  tipo_divisao?: "PESSOAL" | "COMPARTILHADO_50_50" | "COMPARTILHADO_CUSTOM";
  valor_por_pessoa?: number | null;
  porcentagem_divisao?: number | null;
  data_vencimento?: string | null;
  status_pagamento?: "PENDENTE" | "PAGO" | "VENCIDO";
  painel_id?: number;
  parcelas?: number | null;
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2025-01-15",
    description: "Salário",
    value: 5000.00,
    type: "entrada",
    category: "Salário",
    location: "Empresa XYZ Ltda",
    recurrence: "mensal"
  },
  {
    id: "2", 
    date: "2025-01-14",
    description: "Supermercado",
    value: 180.50,
    type: "saida",
    category: "Alimentação",
    location: "Pão de Açúcar",
    recurrence: "ocasional"
  },
  {
    id: "3",
    date: "2025-01-13",
    description: "Combustível",
    value: 85.00,
    type: "saida", 
    category: "Transporte",
    location: "Posto Shell - Centro",
    recurrence: "semanal"
  },
  {
    id: "4",
    date: "2025-01-12", 
    description: "Freelance Design",
    value: 1200.00,
    type: "entrada",
    category: "Trabalho",
    location: "Cliente ABC",
    recurrence: "ocasional"
  }
];

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(mockTransactions);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [currentFilters, setCurrentFilters] = useState<{
    tipo?: string;
    categoria?: string;
    descricao?: string;
    location?: string;
    painel_id?: number;
    mes?: string;
    local_search?: string;
  }>({});
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Função auxiliar para aplicar filtros
  const applyFilters = (transactionsList: Transaction[], filterParams: typeof currentFilters): Transaction[] => {
    let filtered = [...transactionsList];

    // Filtro por tipo
    if (filterParams.tipo && filterParams.tipo !== "todos") {
      filtered = filtered.filter(t => t.type.toLowerCase() === filterParams.tipo!.toLowerCase());
    }

    // Filtro por categoria
    if (filterParams.categoria && filterParams.categoria !== "todos") {
      filtered = filtered.filter(t => t.category.toLowerCase() === filterParams.categoria!.toLowerCase());
    }

    // Filtro por descrição
    if (filterParams.descricao) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(filterParams.descricao!.toLowerCase())
      );
    }

    // Filtro por local
    if (filterParams.local_search) {
      filtered = filtered.filter(t => 
        t.location.toLowerCase().includes(filterParams.local_search!.toLowerCase())
      );
    }

    // Filtro por mês
    if (filterParams.mes) {
      filtered = filtered.filter(t => t.date.startsWith(filterParams.mes!));
    }

    // Filtro por painel_id
    if (filterParams.painel_id) {
      filtered = filtered.filter(t => t.painel_id === filterParams.painel_id);
    }

    return filtered;
  };

  const handleAddTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    // Reaplicar filtros após adicionar transação
    setFilteredTransactions(applyFilters(updatedTransactions, currentFilters));
    setIsModalOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleUpdateTransaction = (updatedData: Omit<Transaction, "id">) => {
    if (!editingTransaction) return;

    const updatedTransaction = {
      ...updatedData,
      id: editingTransaction.id
    };

    const updatedTransactions = transactions.map(t =>
      t.id === editingTransaction.id ? updatedTransaction : t
    );

    setTransactions(updatedTransactions);
    // Reaplicar filtros após atualizar transação
    setFilteredTransactions(applyFilters(updatedTransactions, currentFilters));
    setEditingTransaction(undefined);
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(undefined);
  };

  const handleFilter = (filterParams: {
    tipo?: string;
    categoria?: string;
    descricao?: string;
    location?: string;
    painel_id?: number;
    mes?: string;
    local_search?: string;
  }) => {
    // Salvar os parâmetros de filtro atuais
    setCurrentFilters(filterParams);
    // Aplicar filtros usando a função auxiliar
    const filtered = applyFilters(transactions, filterParams);
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

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
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Filtros */}
        <TransactionFilters 
          transactions={transactions}
          onFilter={handleFilter}
        />

        {/* Tabela */}
        <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
          <TransactionTable
            transactions={paginatedTransactions}
            onEditTransaction={handleEditTransaction}
          />
        </div>

        {/* Paginação */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      {/* Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
        existingLocations={Array.from(new Set(transactions.map(t => t.location)))}
        mode={editingTransaction ? "edit" : "create"}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};