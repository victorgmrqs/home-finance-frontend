/**
 * MoveTransactionModal Component
 * Modal for moving a transaction to a different card/panel
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTipoContaIcon } from "@/components/TipoContaIcon";
import { usePaineis } from "@/hooks/usePaineis";
import { useMoveTransaction } from "@/hooks/useMoveTransaction";
import type { Transaction } from "@/types/transaction";

interface MoveTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const MoveTransactionModal = ({ isOpen, onClose, transaction }: MoveTransactionModalProps) => {
  const [selectedPainelId, setSelectedPainelId] = useState<string>("");
  const { data: paineis = [], isLoading: paineisLoading } = usePaineis();
  const moveTransaction = useMoveTransaction();

  // Reset ao abrir o modal
  useEffect(() => {
    if (isOpen && transaction) {
      setSelectedPainelId("");
    }
  }, [isOpen, transaction]);

  // Filtrar painéis (exceto o painel atual da transação)
  const availablePaineis = paineis.filter(p => p.id !== transaction?.painel_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transaction || !selectedPainelId) {
      return;
    }

    try {
      await moveTransaction.mutateAsync({
        id: transaction.id,
        novo_painel_id: parseInt(selectedPainelId),
      });
      onClose();
    } catch (error) {
      console.error("Error moving transaction:", error);
    }
  };

  if (!transaction) return null;

  // Encontrar informações do painel atual
  const painelAtual = paineis.find(p => p.id === transaction.painel_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Mover Transação</DialogTitle>
          <DialogDescription>
            Mova esta transação para outro cartão
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações da transação */}
          <div className="bg-muted/50 p-4 rounded-md space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Descrição:</span>
              <p className="font-medium">{transaction.descricao}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Valor:</span>
              <p className="font-medium">
                R$ {transaction.valor.toFixed(2)}
                {transaction.tipo_divisao && transaction.tipo_divisao !== 'PESSOAL' && transaction.valor_por_pessoa && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (você paga: R$ {transaction.valor_por_pessoa.toFixed(2)})
                  </span>
                )}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Cartão atual:</span>
              <p className="font-medium">
                {painelAtual && getTipoContaIcon(painelAtual.tipo_conta)} {painelAtual?.nome || `ID ${transaction.painel_id}`}
              </p>
            </div>
          </div>

          {/* Seletor de novo cartão */}
          <div className="space-y-2">
            <Label htmlFor="novo_painel_id">Mover para: <span className="text-destructive">*</span></Label>
            {paineisLoading ? (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                Carregando cartões...
              </div>
            ) : availablePaineis.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                Não há outros cartões disponíveis.
              </div>
            ) : (
              <Select value={selectedPainelId} onValueChange={setSelectedPainelId}>
                <SelectTrigger id="novo_painel_id">
                  <SelectValue placeholder="Selecione o cartão de destino" />
                </SelectTrigger>
                <SelectContent>
                  {availablePaineis.map((painel) => (
                    <SelectItem key={painel.id} value={painel.id.toString()}>
                      {getTipoContaIcon(painel.tipo_conta)} {painel.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createCategoria.isPending || updateCategoria.isPending}
            >
              {moveTransaction.isPending ? "Movendo..." : "Mover"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
