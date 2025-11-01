import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Categoria } from "@/types/categoria";

interface CategoriasTableProps {
  categorias: Categoria[];
  isLoading: boolean;
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    return new Intl.DateTimeFormat("pt-BR").format(date);
  } catch (error) {
    return "Data inválida";
  }
};

export const CategoriasTable = ({
  categorias,
  isLoading,
  onEdit,
  onDelete,
}: CategoriasTableProps) => {
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-table-header">
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
              Nome
            </th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
              Descrição
            </th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
              Tipo
            </th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
              Criado em
            </th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria, index) => {
            const isLastItem = index === categorias.length - 1;
            return (
              <tr
                key={categoria.id}
                className={`border-b border-border hover:bg-table-row-hover transition-colors ${
                  isLastItem ? "border-b-0" : ""
                }`}
              >
                <td className="py-4 px-6 text-sm text-foreground font-medium">
                  {categoria.nome}
                </td>
                <td className="py-4 px-6 text-sm text-muted-foreground">
                  {categoria.descricao || "-"}
                </td>
                <td className="py-4 px-6">
                  {categoria.is_default ? (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <Lock className="h-3 w-3" />
                      Padrão
                    </Badge>
                  ) : (
                    <Badge variant="outline">Customizada</Badge>
                  )}
                </td>
                <td className="py-4 px-6 text-sm text-foreground">
                  {formatDate(categoria.criado_em)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(categoria)}
                      className="hover:bg-primary/10 hover:text-primary"
                      title="Editar categoria"
                      aria-label="Editar categoria"
                      disabled={categoria.is_default}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(categoria)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                      title={
                        categoria.is_default
                          ? "Categorias padrão não podem ser excluídas"
                          : "Excluir categoria"
                      }
                      aria-label="Excluir categoria"
                      disabled={categoria.is_default}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
