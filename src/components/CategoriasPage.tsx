import { useState } from "react";
import { Plus } from "lucide-react";
import { Navigation } from "./Navigation";
import { Button } from "@/components/ui/button";
import { CategoriasTable } from "./CategoriasTable";
import { CategoriaModal } from "./CategoriaModal";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useCategorias, useDeleteCategoria } from "@/hooks/useCategorias";
import type { Categoria } from "@/types/categoria";

export const CategoriasPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);

  const { data: categorias = [], isLoading, error } = useCategorias();
  const deleteCategoria = useDeleteCategoria();

  const handleEditCategoria = (categoria: Categoria) => {
    setCategoriaToEdit(categoria);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteCategoria = (categoria: Categoria) => {
    setCategoriaToDelete(categoria);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (categoriaToDelete) {
      await deleteCategoria.mutateAsync(categoriaToDelete.id);
      setIsDeleteDialogOpen(false);
      setCategoriaToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMode("create");
    setCategoriaToEdit(null);
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
        {/* Navegação */}
        <Navigation />

        {/* Cabeçalho da página */}
        <div className="flex items-center justify-between mb-8 mt-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Categorias</h2>
            <p className="text-muted-foreground mt-1">
              {isLoading
                ? "Carregando..."
                : `${categorias.length} categoria${categorias.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            onClick={() => {
              setModalMode("create");
              setCategoriaToEdit(null);
              setIsModalOpen(true);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        {/* Tabela */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          {error ? (
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-2">Erro ao carregar categorias</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : "Erro desconhecido"}
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : (
            <CategoriasTable
              categorias={categorias}
              isLoading={isLoading}
              onEdit={handleEditCategoria}
              onDelete={handleDeleteCategoria}
            />
          )}
        </div>
      </main>

      {/* Modal de Nova/Editar Categoria */}
      <CategoriaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        categoriaToEdit={categoriaToEdit}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoriaToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Categoria"
        description={
          categoriaToDelete?.is_default
            ? "Categorias padrão do sistema não podem ser removidas."
            : "Deseja realmente excluir esta categoria? Esta ação não pode ser desfeita e só é permitida se a categoria não estiver em uso."
        }
        isLoading={deleteCategoria.isPending}
      />
    </div>
  );
};
