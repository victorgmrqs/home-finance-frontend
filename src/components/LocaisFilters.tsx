import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Local } from "@/types/local";

interface LocaisFiltersProps {
  locais: Local[];
  onFilter: (filters: { nome?: string }) => void;
}

export const LocaisFilters = ({ locais, onFilter }: LocaisFiltersProps) => {
  const [searchFilter, setSearchFilter] = useState<string>("");

  useEffect(() => {
    const filters: any = {};

    if (searchFilter) {
      filters.nome = searchFilter;
    }

    onFilter(filters);
  }, [searchFilter, onFilter]);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Busca por Nome */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Buscar Local
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome fantasia, CNPJ ou endereço..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex items-end">
          <p className="text-sm text-muted-foreground">
            {locais.length} {locais.length === 1 ? 'local encontrado' : 'locais encontrados'}
          </p>
        </div>
      </div>
    </div>
  );
};
