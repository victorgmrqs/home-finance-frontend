import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Usuario } from "@/types/usuario";

interface UsuariosTableProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
}

export const UsuariosTable = ({ usuarios, onEdit, onDelete }: UsuariosTableProps) => {
  if (usuarios.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum usuário encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-table-header">
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Nome</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Email</th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-foreground w-24">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="border-b border-border hover:bg-table-row-hover transition-colors">
              <td className="py-4 px-6 text-sm text-foreground font-medium">{usuario.nome}</td>
              <td className="py-4 px-6 text-sm text-foreground">{usuario.email || '-'}</td>
              <td className="py-4 px-6">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(usuario)} className="hover:bg-primary/10 hover:text-primary">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(usuario)} className="hover:bg-destructive/10 hover:text-destructive">
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
