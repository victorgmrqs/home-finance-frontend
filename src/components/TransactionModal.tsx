import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { getTipoContaIcon } from "@/components/TipoContaIcon";
import { usePaineis } from "@/hooks/usePaineis";
import { useCategorias, useCreateCategoria } from "@/hooks/useCategorias";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from "./TransactionsPage";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, "id">) => void;
  existingLocations: string[];
}

export const TransactionModal = ({ isOpen, onClose, onSubmit, existingLocations }: TransactionModalProps) => {
  const { currentUser } = useUser();
  const { data: paineis = [], isLoading: paineisLoading } = usePaineis();
  const { data: categorias = [] } = useCategorias();
  const createCategoria = useCreateCategoria();
  const { toast } = useToast();

  // Filtrar apenas painéis do usuário logado
  const userPaineis = currentUser
    ? paineis.filter(p => p.usuario_id === currentUser.id)
    : [];

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    value: "",
    type: "" as "entrada" | "saida" | "",
    category: "",
    location: "",
    recurrence: "" as "diario" | "semanal" | "mensal" | "ocasional" | "",
    painel_id: undefined as number | undefined,
    tipo_divisao: "PESSOAL" as "PESSOAL" | "COMPARTILHADO_50_50" | "COMPARTILHADO_CUSTOM" | "",
    porcentagem_divisao: "",
    data_vencimento: "",
    status_pagamento: "PENDENTE" as "PENDENTE" | "PAGO" | "VENCIDO" | ""
  });

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  // Calcular valor por pessoa automaticamente
  const calcularValorPorPessoa = (): number | null => {
    const valor = parseFloat(formData.value);
    if (isNaN(valor) || valor <= 0) return null;

    if (formData.tipo_divisao === 'PESSOAL' || !formData.tipo_divisao) {
      return valor;
    }

    if (formData.tipo_divisao === 'COMPARTILHADO_50_50') {
      return valor / 2;
    }

    if (formData.tipo_divisao === 'COMPARTILHADO_CUSTOM') {
      const porcentagem = parseFloat(formData.porcentagem_divisao);
      if (isNaN(porcentagem) || porcentagem <= 0 || porcentagem > 100) return null;
      return valor * (porcentagem / 100);
    }

    return null;
  };

  const valorPorPessoa = calcularValorPorPessoa();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.value || !formData.type || !formData.category || !formData.recurrence) {
      return;
    }

    if (!formData.painel_id) {
      toast({
        title: 'Erro',
        description: 'Selecione um cartão',
        variant: 'destructive'
      });
      return;
    }

    onSubmit({
      date: formData.date,
      description: formData.description,
      value: parseFloat(formData.value),
      type: formData.type,
      category: formData.category,
      location: formData.location || "Não informado",
      recurrence: formData.recurrence,
      painel_id: formData.painel_id,
      tipo_divisao: formData.tipo_divisao || 'PESSOAL',
      valor_por_pessoa: valorPorPessoa,
      porcentagem_divisao: formData.tipo_divisao === 'COMPARTILHADO_CUSTOM' ? parseFloat(formData.porcentagem_divisao) : undefined,
      data_vencimento: formData.data_vencimento || undefined,
      status_pagamento: formData.status_pagamento || 'PENDENTE'
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      value: "",
      type: "",
      category: "",
      location: "",
      recurrence: "",
      painel_id: undefined,
      tipo_divisao: "PESSOAL",
      porcentagem_divisao: "",
      data_vencimento: "",
      status_pagamento: "PENDENTE"
    });
  };

  const filteredLocations = existingLocations.filter(location =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const showAddNewLocation = locationSearch && !filteredLocations.includes(locationSearch);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data */}
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Valor */}
          <div>
            <Label htmlFor="value">Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="pl-10"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <Label>Tipo</Label>
            <Select value={formData.type} onValueChange={(value: "entrada" | "saida") => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div>
            <Label>Categoria</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-start"
                >
                  {formData.category || "Selecione a categoria"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar ou criar categoria..." />
                  <CommandEmpty>
                    <div
                      className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                      onClick={() => {
                        const input = document.querySelector('[placeholder="Buscar ou criar categoria..."]') as HTMLInputElement;
                        const newCategory = input?.value;
                        if (newCategory) {
                          createCategoria.mutate({ nome: newCategory });
                          setFormData({ ...formData, category: newCategory });
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar categoria
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {categorias.map((categoria) => (
                      <CommandItem
                        key={categoria.id}
                        value={categoria.nome}
                        onSelect={() => {
                          setFormData({ ...formData, category: categoria.nome });
                        }}
                      >
                        {categoria.nome}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Local */}
          <div>
            <Label>Local</Label>
            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-start"
                >
                  {formData.location || "Selecione ou digite um local..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Buscar local..." 
                    value={locationSearch}
                    onValueChange={setLocationSearch}
                  />
                  <CommandEmpty>
                    {showAddNewLocation ? (
                      <div
                        className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                        onClick={() => {
                          setFormData({ ...formData, location: locationSearch });
                          setLocationOpen(false);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar novo local "{locationSearch}"
                      </div>
                    ) : (
                      "Nenhum local encontrado."
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredLocations.map((location) => (
                      <CommandItem
                        key={location}
                        value={location}
                        onSelect={() => {
                          setFormData({ ...formData, location });
                          setLocationOpen(false);
                        }}
                      >
                        {location}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Cartão */}
          <div className="space-y-2">
            <Label htmlFor="painel_id">Cartão *</Label>
            {paineisLoading ? (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                Carregando cartões...
              </div>
            ) : userPaineis.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                Você precisa criar um cartão primeiro. Vá em <span className="font-semibold">Cartões</span> para criar um.
              </div>
            ) : (
              <Select
                value={formData.painel_id?.toString()}
                onValueChange={(value) => setFormData({ ...formData, painel_id: parseInt(value) })}
              >
                <SelectTrigger id="painel_id">
                  <SelectValue placeholder="Selecione o cartão" />
                </SelectTrigger>
                <SelectContent>
                  {userPaineis.map(painel => (
                    <SelectItem key={painel.id} value={painel.id.toString()}>
                      <span className="flex items-center gap-2">
                        <span>{getTipoContaIcon(painel.tipo_conta)}</span>
                        <span>{painel.nome}</span>
                        {painel.permissao && painel.permissao !== 'OWNER' && (
                          <Badge variant="secondary" className="ml-2">{painel.permissao}</Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Recorrência */}
          <div>
            <Label>Recorrência</Label>
            <Select value={formData.recurrence} onValueChange={(value: "diario" | "semanal" | "mensal" | "ocasional") => setFormData({ ...formData, recurrence: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a recorrência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diário</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="ocasional">Ocasional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data de Vencimento */}
          <div>
            <Label htmlFor="data_vencimento">Data de Vencimento (Opcional)</Label>
            <Input
              id="data_vencimento"
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Para cartões de crédito</p>
          </div>

          {/* Status de Pagamento */}
          <div>
            <Label htmlFor="status_pagamento">Status de Pagamento</Label>
            <Select
              value={formData.status_pagamento}
              onValueChange={(value: "PENDENTE" | "PAGO" | "VENCIDO") =>
                setFormData({ ...formData, status_pagamento: value })
              }
            >
              <SelectTrigger id="status_pagamento">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">⏳ Pendente</SelectItem>
                <SelectItem value="PAGO">✅ Pago</SelectItem>
                <SelectItem value="VENCIDO">❌ Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Divisão */}
          <div className="space-y-2">
            <Label htmlFor="tipo_divisao">Tipo de Divisão</Label>
            <Select
              value={formData.tipo_divisao}
              onValueChange={(value: "PESSOAL" | "COMPARTILHADO_50_50" | "COMPARTILHADO_CUSTOM") =>
                setFormData({ ...formData, tipo_divisao: value, porcentagem_divisao: value === 'COMPARTILHADO_CUSTOM' ? formData.porcentagem_divisao : "" })
              }
            >
              <SelectTrigger id="tipo_divisao">
                <SelectValue placeholder="Como dividir o gasto?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PESSOAL">💰 Pessoal (só você paga)</SelectItem>
                <SelectItem value="COMPARTILHADO_50_50">👥 Compartilhado 50/50</SelectItem>
                <SelectItem value="COMPARTILHADO_CUSTOM">⚖️ Compartilhado Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Porcentagem (só aparece se CUSTOM) */}
          {formData.tipo_divisao === 'COMPARTILHADO_CUSTOM' && (
            <div className="space-y-2">
              <Label htmlFor="porcentagem_divisao">Sua Porcentagem (%)</Label>
              <Input
                id="porcentagem_divisao"
                type="number"
                min="1"
                max="100"
                value={formData.porcentagem_divisao}
                onChange={(e) => setFormData({ ...formData, porcentagem_divisao: e.target.value })}
                placeholder="Ex: 60 (você paga 60%)"
              />
            </div>
          )}

          {/* Preview do valor calculado */}
          {valorPorPessoa !== null && formData.value && (
            <div className="bg-muted/50 p-3 rounded-md border border-border">
              <p className="text-sm font-medium text-foreground">
                {formData.tipo_divisao === 'PESSOAL' || !formData.tipo_divisao ? (
                  <>💰 Você paga: <span className="text-lg font-bold text-primary">R$ {valorPorPessoa.toFixed(2)}</span></>
                ) : formData.tipo_divisao === 'COMPARTILHADO_50_50' ? (
                  <>👥 Você paga (50%): <span className="text-lg font-bold text-primary">R$ {valorPorPessoa.toFixed(2)}</span></>
                ) : (
                  <>⚖️ Você paga ({formData.porcentagem_divisao}%): <span className="text-lg font-bold text-primary">R$ {valorPorPessoa.toFixed(2)}</span></>
                )}
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={userPaineis.length === 0 || paineisLoading}
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};