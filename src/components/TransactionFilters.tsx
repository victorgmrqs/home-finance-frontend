import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTipoContaIcon } from "@/components/TipoContaIcon";
import { usePaineis } from "@/hooks/usePaineis";
import { useCategorias } from "@/hooks/useCategorias";
import type { Transaction } from "./TransactionsPage";

interface TransactionFiltersProps {
  transactions: Transaction[];
  onFilter: (filtered: {
    tipo?: string;
    categoria?: string;
    descricao?: string;
    location?: string;
    painel_id?: number;
    mes?: string;
    local_search?: string;
  }) => void;
}

export const TransactionFilters = ({ transactions, onFilter }: TransactionFiltersProps) => {
  const { data: paineis = [] } = usePaineis();
  const { data: categorias = [] } = useCategorias();
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [categoryFilter, setCategoryFilter] = useState<string>("todos");
  const [descriptionFilter, setDescriptionFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [painelFilter, setPainelFilter] = useState<string>("");
  const [mesFilter, setMesFilter] = useState<string>("");

  useEffect(() => {
    const filters: any = {};

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

    // Filtro por painel (obrigatório)
    if (painelFilter) {
      filters.painel_id = parseInt(painelFilter);
    }

    // Filtro por mês
    if (mesFilter) {
      filters.mes = mesFilter;
    }

    // Filtro por local (busca por texto)
    if (locationFilter) {
      filters.local_search = locationFilter;
    }

    onFilter(filters);
  }, [typeFilter, categoryFilter, descriptionFilter, locationFilter, painelFilter, mesFilter, onFilter]);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtro de Cartão */}
        <div className="space-y-2">
          <Label>Cartão</Label>
          <Select value={painelFilter} onValueChange={setPainelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cartão" />
            </SelectTrigger>
            <SelectContent>
              {paineis.map(painel => (
                <SelectItem key={painel.id} value={painel.id.toString()}>
                  <span className="flex items-center gap-2">
                    <span>{getTipoContaIcon(painel.tipo_conta)}</span>
                    <span>{painel.nome}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Mês */}
        <div className="space-y-2">
          <Label>Período</Label>
          <Input
            type="month"
            placeholder="2025-10"
            value={mesFilter}
            onChange={(e) => setMesFilter(e.target.value)}
          />
        </div>

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
              {categorias.map(categoria => (
                <SelectItem key={categoria.id} value={categoria.nome}>
                  {categoria.nome}
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