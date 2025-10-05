import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Local } from "@/types/local";

interface LocaisTableProps {
  locais: Local[];
  onEdit: (local: Local) => void;
  onDelete: (local: Local) => void;
}

const formatCNPJ = (cnpj: string | null | undefined) => {
  if (!cnpj) return 'Não informado';

  // Remove non-digits
  const cleaned = cnpj.replace(/\D/g, '');

  // Format as XX.XXX.XXX/XXXX-XX
  if (cleaned.length === 14) {
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  return cnpj;
};

export const LocaisTable = ({ locais, onEdit, onDelete }: LocaisTableProps) => {
  if (locais.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum local encontrado</p>
        <p className="text-sm text-muted-foreground mt-2">
          Clique em "Novo Local" para adicionar um estabelecimento
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-table-header">
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Nome Fantasia</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">CNPJ</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Razão Social</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Categoria</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Endereço</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground w-24">Ações</th>
          </tr>
        </thead>
        <tbody>
          {locais.map((local) => (
            <tr
              key={local.id}
              className="border-b border-border hover:bg-table-row-hover transition-colors"
            >
              <td className="py-4 px-6 text-sm text-foreground font-medium">
                {local.nome_fantasia || 'Sem nome'}
              </td>
              <td className="py-4 px-6 text-sm text-foreground">
                {formatCNPJ(local.cnpj)}
              </td>
              <td className="py-4 px-6 text-sm text-foreground">
                {local.razao_social || '-'}
              </td>
              <td className="py-4 px-6 text-sm text-foreground">
                {local.categoria || '-'}
              </td>
              <td className="py-4 px-6 text-sm text-foreground max-w-xs truncate">
                {local.endereco || '-'}
              </td>
              <td className="py-4 px-6">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(local)}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(local)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
