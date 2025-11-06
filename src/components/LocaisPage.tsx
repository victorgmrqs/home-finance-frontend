import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocaisTable } from "./LocaisTable";
import { LocalModal } from "./LocalModal";
import { LocaisFilters } from "./LocaisFilters";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useLocais, useDeleteLocal } from "@/hooks/useLocais";
import { Navigation } from "./Navigation";
import type { Local } from "@/types/local";
import { Skeleton } from "@/components/ui/skeleton";

type LocaisFilterParams = { nome?: string };

export const LocaisPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocal, setEditingLocal] = useState<Local | null>(null);
  const [deletingLocal, setDeletingLocal] = useState<Local | null>(null);
  const [filters, setFilters] = useState<LocaisFilterParams>({});

  // Fetch locais with filters
  const { data: locais = [], isLoading, error } = useLocais(filters);
  const deleteLocal = useDeleteLocal();

  const handleFilter = useCallback((newFilters: LocaisFilterParams) => {
    setFilters(newFilters);
  }, []);

  const handleEdit = (local: Local) => {
    setEditingLocal(local);
    setIsModalOpen(true);
  };

  const handleDelete = (local: Local) => {
    setDeletingLocal(local);
  };

  const confirmDelete = async () => {
    if (deletingLocal) {
      await deleteLocal.mutateAsync(deletingLocal.id);
      setDeletingLocal(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLocal(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar locais</h2>
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
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-header-bg shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-header-text">Home Finance</h1>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Navegação */}
        <Navigation />

        {/* Cabeçalho da página */}
        <div className="flex items-center justify-between mb-8 mt-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Locais</h2>
            <p className="text-muted-foreground mt-1">
              {locais.length} {locais.length === 1 ? 'local cadastrado' : 'locais cadastrados'}
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Local
          </Button>
        </div>

        {/* Filtros */}
        <LocaisFilters locais={locais} onFilter={handleFilter} />

        {/* Tabela */}
        <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <LocaisTable
              locais={locais}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {/* Modal de Criar/Editar */}
      <LocalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        local={editingLocal}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDeleteDialog
        isOpen={!!deletingLocal}
        onClose={() => setDeletingLocal(null)}
        onConfirm={confirmDelete}
        title="Excluir Local"
        description={`Tem certeza que deseja excluir o local "${deletingLocal?.nome_fantasia || 'Sem nome'}"? Esta ação não pode ser desfeita.`}
        isLoading={deleteLocal.isPending}
      />
    </div>
  );
};
