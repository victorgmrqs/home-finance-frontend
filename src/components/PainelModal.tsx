import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePainel, useUpdatePainel } from "@/hooks/usePaineis";
import { useUsuarios } from "@/hooks/useUsuarios";
import type { Painel, TipoConta, PainelUpdateInput } from "@/types/painel";

interface PainelModalProps {
  isOpen: boolean;
  onClose: () => void;
  painel?: Painel | null;
}

export const PainelModal = ({ isOpen, onClose, painel }: PainelModalProps) => {
  const [formData, setFormData] = useState({ nome: "", descricao: "", tipo_conta: "" as TipoConta | "", usuario_id: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createPainel = useCreatePainel();
  const updatePainel = useUpdatePainel();
  const { data: usuarios = [] } = useUsuarios();
  const isEditMode = !!painel;

  useEffect(() => {
    if (painel) {
      setFormData({ nome: painel.nome, descricao: painel.descricao || "", tipo_conta: painel.tipo_conta, usuario_id: painel.usuario_id.toString() });
    } else {
      setFormData({ nome: "", descricao: "", tipo_conta: "", usuario_id: "" });
    }
    setErrors({});
  }, [painel, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.tipo_conta) newErrors.tipo_conta = "Tipo de conta é obrigatório";
    if (!formData.usuario_id) newErrors.usuario_id = "Usuário é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data: PainelUpdateInput = { 
      nome: formData.nome.trim(), 
      tipo_conta: formData.tipo_conta as TipoConta, 
      usuario_id: parseInt(formData.usuario_id) 
    };
    if (formData.descricao.trim()) data.descricao = formData.descricao.trim();
    try {
      if (isEditMode) await updatePainel.mutateAsync({ id: painel.id, data });
      else await createPainel.mutateAsync(data);
      onClose();
    } catch (error) { console.error("Error saving painel:", error); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader><DialogTitle>{isEditMode ? "Editar Cartão" : "Novo Cartão"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="nome">Nome <span className="text-destructive">*</span></Label><Input id="nome" value={formData.nome} onChange={(e) => handleChange("nome", e.target.value)} placeholder="Ex: Cartão Nubank, Conta Itaú" className={errors.nome ? "border-destructive" : ""} />{errors.nome && <p className="text-sm text-destructive mt-1">{errors.nome}</p>}</div>
          <div><Label htmlFor="tipo_conta">Tipo de Conta <span className="text-destructive">*</span></Label><Select value={formData.tipo_conta} onValueChange={(value) => handleChange("tipo_conta", value)}><SelectTrigger className={errors.tipo_conta ? "border-destructive" : ""}><SelectValue placeholder="Selecione o tipo" /></SelectTrigger><SelectContent><SelectItem value="CARTAO_CREDITO">💳 Cartão de Crédito</SelectItem><SelectItem value="CONTA_BANCARIA">🏦 Conta Bancária</SelectItem><SelectItem value="DINHEIRO">💵 Dinheiro</SelectItem></SelectContent></Select>{errors.tipo_conta && <p className="text-sm text-destructive mt-1">{errors.tipo_conta}</p>}</div>
          <div><Label htmlFor="descricao">Descrição</Label><Input id="descricao" value={formData.descricao} onChange={(e) => handleChange("descricao", e.target.value)} placeholder="Ex: Cartão para gastos pessoais" /></div>
          <div><Label htmlFor="usuario_id">Usuário <span className="text-destructive">*</span></Label><Select value={formData.usuario_id} onValueChange={(value) => handleChange("usuario_id", value)}><SelectTrigger className={errors.usuario_id ? "border-destructive" : ""}><SelectValue placeholder="Selecione um usuário" /></SelectTrigger><SelectContent>{usuarios.map((usuario) => (<SelectItem key={usuario.id} value={usuario.id.toString()}>{usuario.nome}</SelectItem>))}</SelectContent></Select>{errors.usuario_id && <p className="text-sm text-destructive mt-1">{errors.usuario_id}</p>}</div>
          <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={createPainel.isPending || updatePainel.isPending}>{isEditMode ? "Atualizar" : "Criar"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
