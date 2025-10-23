import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaineisTable } from "./PaineisTable";
import { PainelModal } from "./PainelModal";
import { Navigation } from "./Navigation";
import { usePaineis, useDeletePainel } from "@/hooks/usePaineis";
import type { Painel } from "@/types/painel";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const PaineisPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPainel, setEditingPainel] = useState<Painel | null>(null);
  const [deletingPainel, setDeletingPainel] = useState<Painel | null>(null);
  const { data: paineis = [], isLoading, error } = usePaineis();
  const deletePainel = useDeletePainel();

  const handleEdit = (painel: Painel) => { setEditingPainel(painel); setIsModalOpen(true); };
  const handleDelete = (painel: Painel) => setDeletingPainel(painel);
  const confirmDelete = () => { if (deletingPainel) { deletePainel.mutate(deletingPainel.id); setDeletingPainel(null); } };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingPainel(null); };

  if (error) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar cartões</h2><p className="text-muted-foreground">{error instanceof Error ? error.message : 'Erro desconhecido'}</p><Button onClick={() => window.location.reload()} className="mt-4">Tentar novamente</Button></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-header-bg shadow-lg"><div className="container mx-auto px-4 py-4"><h1 className="text-2xl font-bold text-header-text">Home Finance</h1></div></header>
      <main className="container mx-auto px-4 py-8">
        <Navigation />
        <div className="flex items-center justify-between mb-8 mt-8">
          <div><h2 className="text-3xl font-bold text-foreground">Cartões</h2><p className="text-muted-foreground mt-1">{paineis.length} {paineis.length === 1 ? 'cartão cadastrado' : 'cartões cadastrados'}</p></div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" />Novo Cartão</Button>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
          {isLoading ? <div className="p-6 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : <PaineisTable paineis={paineis} onEdit={handleEdit} onDelete={handleDelete} />}
        </div>
      </main>
      <PainelModal isOpen={isModalOpen} onClose={handleCloseModal} painel={editingPainel} />
      <AlertDialog open={!!deletingPainel} onOpenChange={() => setDeletingPainel(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir o cartão "{deletingPainel?.nome}"? Esta ação removerá todas as transações associadas.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
};
