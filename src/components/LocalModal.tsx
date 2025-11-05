import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLocal, useUpdateLocal } from "@/hooks/useLocais";
import type { Local, LocalUpdateInput } from "@/types/local";
import { formatCNPJ, validateCNPJ } from "@/utils/cnpj";

interface LocalModalProps {
  isOpen: boolean;
  onClose: () => void;
  local?: Local | null;
}

export const LocalModal = ({ isOpen, onClose, local }: LocalModalProps) => {
  const [formData, setFormData] = useState({
    nome_fantasia: "",
    cnpj: "",
    razao_social: "",
    categoria: "",
    endereco: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createLocal = useCreateLocal();
  const updateLocal = useUpdateLocal();

  const isEditMode = !!local;

  // Populate form when editing
  useEffect(() => {
    if (local) {
      setFormData({
        nome_fantasia: local.nome_fantasia || "",
        cnpj: local.cnpj || "",
        razao_social: local.razao_social || "",
        categoria: local.categoria || "",
        endereco: local.endereco || "",
      });
    } else {
      setFormData({
        nome_fantasia: "",
        cnpj: "",
        razao_social: "",
        categoria: "",
        endereco: "",
      });
    }
    setErrors({});
  }, [local, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    handleChange("cnpj", formatted);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome_fantasia.trim()) {
      newErrors.nome_fantasia = "Nome fantasia é obrigatório";
    }

    if (formData.cnpj && !validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = "CNPJ inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Remove empty fields and build data object with validated keys
    const data: LocalUpdateInput = {};
    
    if (formData.nome_fantasia.trim()) {
      data.nome_fantasia = formData.nome_fantasia.trim();
    }
    if (formData.cnpj.trim()) {
      data.cnpj = formData.cnpj.trim();
    }
    if (formData.razao_social.trim()) {
      data.razao_social = formData.razao_social.trim();
    }
    if (formData.categoria.trim()) {
      data.categoria = formData.categoria.trim();
    }
    if (formData.endereco.trim()) {
      data.endereco = formData.endereco.trim();
    }

    try {
      if (isEditMode) {
        await updateLocal.mutateAsync({ id: local.id, data });
      } else {
        await createLocal.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the hook
      console.error("Error saving local:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Local" : "Novo Local"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Fantasia */}
          <div>
            <Label htmlFor="nome_fantasia">
              Nome Fantasia <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nome_fantasia"
              value={formData.nome_fantasia}
              onChange={(e) => handleChange("nome_fantasia", e.target.value)}
              placeholder="Ex: Supermercado ABC"
              className={errors.nome_fantasia ? "border-destructive" : ""}
            />
            {errors.nome_fantasia && (
              <p className="text-sm text-destructive mt-1">{errors.nome_fantasia}</p>
            )}
          </div>

          {/* CNPJ */}
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => handleCNPJChange(e.target.value)}
              placeholder="00.000.000/0000-00"
              className={errors.cnpj ? "border-destructive" : ""}
            />
            {errors.cnpj && (
              <p className="text-sm text-destructive mt-1">{errors.cnpj}</p>
            )}
          </div>

          {/* Razão Social */}
          <div>
            <Label htmlFor="razao_social">Razão Social</Label>
            <Input
              id="razao_social"
              value={formData.razao_social}
              onChange={(e) => handleChange("razao_social", e.target.value)}
              placeholder="Ex: Supermercado ABC Ltda"
            />
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              placeholder="Ex: Supermercado, Restaurante, Farmácia"
            />
          </div>

          {/* Endereço */}
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
              placeholder="Ex: Rua das Flores, 123"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createLocal.isPending || updateLocal.isPending}
            >
              {isEditMode ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
