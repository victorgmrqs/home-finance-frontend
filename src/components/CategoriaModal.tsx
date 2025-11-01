import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCategoria, useUpdateCategoria } from "@/hooks/useCategorias";
import { useToast } from "@/hooks/use-toast";
import type { Categoria } from "@/types/categoria";

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  categoriaToEdit?: Categoria | null;
}

export const CategoriaModal = ({
  isOpen,
  onClose,
  mode = "create",
  categoriaToEdit,
}: CategoriaModalProps) => {
  const { toast } = useToast();
  const createCategoria = useCreateCategoria();
  const updateCategoria = useUpdateCategoria();

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  });

  // Reset form when mode or categoriaToEdit changes
  useEffect(() => {
    if (mode === "edit" && categoriaToEdit) {
      setFormData({
        nome: categoriaToEdit.nome,
        descricao: categoriaToEdit.descricao || "",
      });
    } else {
      setFormData({
        nome: "",
        descricao: "",
      });
    }
  }, [mode, categoriaToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      if (mode === "edit" && categoriaToEdit) {
        await updateCategoria.mutateAsync({
          id: categoriaToEdit.id,
          data: formData,
        });
      } else {
        await createCategoria.mutateAsync(formData);
      }

      // Reset form and close
      setFormData({ nome: "", descricao: "" });
      onClose();
    } catch (error) {
      // Error handling is done in the hooks
      console.error("Erro ao salvar categoria:", error);
    }
  };

  const handleClose = () => {
    setFormData({ nome: "", descricao: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              placeholder="Ex: Alimentação"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              required
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 100 caracteres
            </p>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              placeholder="Descrição da categoria..."
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 500 caracteres
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={createCategoria.isPending || updateCategoria.isPending}
            >
              {createCategoria.isPending || updateCategoria.isPending
                ? "Salvando..."
                : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
