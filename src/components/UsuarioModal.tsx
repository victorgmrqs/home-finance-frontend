import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateUsuario, useUpdateUsuario } from "@/hooks/useUsuarios";
import type { Usuario, UsuarioCreateInput, UsuarioUpdateInput } from "@/types/usuario";

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario?: Usuario | null;
}

export const UsuarioModal = ({ isOpen, onClose, usuario }: UsuarioModalProps) => {
  const [formData, setFormData] = useState({ nome: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();

  const isEditMode = !!usuario;

  useEffect(() => {
    if (usuario) {
      setFormData({ nome: usuario.nome, email: usuario.email || "" });
    } else {
      setFormData({ nome: "", email: "" });
    }
    setErrors({});
  }, [usuario, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEditMode) {
        const updateData: UsuarioUpdateInput = { nome: formData.nome.trim() };
        if (formData.email.trim()) updateData.email = formData.email.trim();
        await updateUsuario.mutateAsync({ id: usuario.id, data: updateData });
      } else {
        const createData: UsuarioCreateInput = { nome: formData.nome.trim() };
        if (formData.email.trim()) createData.email = formData.email.trim();
        await createUsuario.mutateAsync(createData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving usuario:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome <span className="text-destructive">*</span></Label>
            <Input id="nome" value={formData.nome} onChange={(e) => handleChange("nome", e.target.value)} placeholder="Ex: João Silva" className={errors.nome ? "border-destructive" : ""} />
            {errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="Ex: joao@example.com" className={errors.email ? "border-destructive" : ""} />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createUsuario.isPending || updateUsuario.isPending}>{isEditMode ? "Atualizar" : "Criar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
