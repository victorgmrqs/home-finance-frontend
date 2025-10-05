import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Painel } from "@/types/painel";

interface PaineisTableProps {
  paineis: Painel[];
  onEdit: (painel: Painel) => void;
  onDelete: (painel: Painel) => void;
}

export const PaineisTable = ({ paineis, onEdit, onDelete }: PaineisTableProps) => {
  if (paineis.length === 0) return <div className="text-center py-12"><p className="text-muted-foreground">Nenhum painel encontrado</p></div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead><tr className="bg-table-header"><th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Nome</th><th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Descrição</th><th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Usuário ID</th><th className="text-left py-4 px-6 text-sm font-semibold text-foreground w-24">Ações</th></tr></thead>
        <tbody>
          {paineis.map((painel) => (
            <tr key={painel.id} className="border-b border-border hover:bg-table-row-hover transition-colors">
              <td className="py-4 px-6 text-sm text-foreground font-medium">{painel.nome}</td>
              <td className="py-4 px-6 text-sm text-foreground">{painel.descricao || '-'}</td>
              <td className="py-4 px-6 text-sm text-foreground">{painel.usuario_id}</td>
              <td className="py-4 px-6"><div className="flex gap-2"><Button variant="ghost" size="icon" onClick={() => onEdit(painel)} className="hover:bg-primary/10 hover:text-primary"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => onDelete(painel)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
