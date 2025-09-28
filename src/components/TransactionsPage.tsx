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
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleAddTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    setFilteredTransactions(updatedTransactions);
    setIsModalOpen(false);
  };

  const handleFilter = (filtered: Transaction[]) => {
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
          <TransactionTable transactions={paginatedTransactions} />
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
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
        existingLocations={Array.from(new Set(transactions.map(t => t.location)))}
      />
    </div>
  );
};