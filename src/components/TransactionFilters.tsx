import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Transaction } from "./TransactionsPage";

interface TransactionFiltersProps {
  transactions: Transaction[];
  onFilter: (filtered: {
    tipo?: string;
    categoria?: string;
    descricao?: string;
    location?: string;
  }) => void;
}

const categories = [
  "Alimentação",
  "Transporte", 
  "Moradia",
  "Saúde",
  "Lazer",
  "Salário",
  "Trabalho"
];

export const TransactionFilters = ({ transactions, onFilter }: TransactionFiltersProps) => {
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [categoryFilter, setCategoryFilter] = useState<string>("todos");
  const [descriptionFilter, setDescriptionFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");

  useEffect(() => {
    const filters:any = {};

    // Filtro por tipo
    if (typeFilter !== "todos") {
      filters.tipo = typeFilter.toUpperCase() as "ENTRADA" | "SAIDA";
    }

    // Filtro por categoria
    if (categoryFilter !== "todos") {
      filters.categoria = categoryFilter;
    }

    // Filtro por descrição
    if (descriptionFilter) {
      filters.descricao = descriptionFilter;
    }

    // Filtro por local - not sent to API, handled on frontend
    // The API expects 'local' as a number (local_id), not a string search
    // For now, we'll skip this filter on the API side

    onFilter(filters);
  }, [typeFilter, categoryFilter, descriptionFilter, locationFilter, onFilter]);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Tipo */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Tipo
          </label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Categoria */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Categoria
          </label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Busca por Descrição */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Descrição
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar descrição..."
              value={descriptionFilter}
              onChange={(e) => setDescriptionFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Busca por Local */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Local
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar local..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};