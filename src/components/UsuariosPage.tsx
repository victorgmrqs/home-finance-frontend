import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsuariosTable } from "./UsuariosTable";
import { UsuarioModal } from "./UsuarioModal";
import { Navigation } from "./Navigation";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useUsuarios, useDeleteUsuario } from "@/hooks/useUsuarios";
import type { Usuario } from "@/types/usuario";
import { Skeleton } from "@/components/ui/skeleton";

export const UsuariosPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);

  const { data: usuarios = [], isLoading, error } = useUsuarios();
  const deleteUsuario = useDeleteUsuario();

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleDelete = (usuario: Usuario) => {
    setDeletingUsuario(usuario);
  };

  const confirmDelete = async () => {
    if (deletingUsuario) {
      await deleteUsuario.mutateAsync(deletingUsuario.id);
      setDeletingUsuario(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUsuario(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar usuários</h2>
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
      <header className="sticky top-0 z-50 bg-header-bg shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-header-text">Home Finance</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Navigation />

        <div className="flex items-center justify-between mb-8 mt-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Usuários</h2>
            <p className="text-muted-foreground mt-1">
              {usuarios.length} {usuarios.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <UsuariosTable usuarios={usuarios} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </main>

      <UsuarioModal isOpen={isModalOpen} onClose={handleCloseModal} usuario={editingUsuario} />

      <ConfirmDeleteDialog
        isOpen={!!deletingUsuario}
        onClose={() => setDeletingUsuario(null)}
        onConfirm={confirmDelete}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário "${deletingUsuario?.nome}"? Esta ação não pode ser desfeita e removerá todos os painéis e transações associados.`}
        isLoading={deleteUsuario.isPending}
      />
    </div>
  );
};
