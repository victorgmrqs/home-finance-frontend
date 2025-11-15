import { useState, useEffect, useCallback } from "react";
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTipoContaIcon } from "@/components/TipoContaIcon";
import { usePaineis } from "@/hooks/usePaineis";
import { useCategorias, useCreateCategoria } from "@/hooks/useCategorias";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { getCurrentDate } from "@/utils/date";
import type { Transaction } from "./TransactionsPage";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, "id">) => void;
  existingLocations: string[];
  mode?: "create" | "edit";
  transactionToEdit?: Transaction;
}

export const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingLocations,
  mode = "create",
  transactionToEdit
}: TransactionModalProps) => {
  const { currentUser } = useUser();
  const { data: paineis = [], isLoading: paineisLoading } = usePaineis();
  const { data: categorias = [] } = useCategorias();
  const createCategoria = useCreateCategoria();
  const { toast } = useToast();

  // Filtrar apenas painéis do usuário logado
  const userPaineis = currentUser
    ? paineis.filter(p => p.usuario_id === currentUser.id)
    : [];

  const getInitialFormData = useCallback(() => {
    if (mode === "edit" && transactionToEdit) {
      return {
        date: transactionToEdit.date,
        description: transactionToEdit.description || "",
        value: transactionToEdit.value.toString(),
        type: transactionToEdit.type,
        category: transactionToEdit.category,
        location: transactionToEdit.location || "",
        recurrence: transactionToEdit.recurrence,
        painel_id: transactionToEdit.painel_id,
        tipo_divisao: transactionToEdit.tipo_divisao || "PESSOAL",
        porcentagem_divisao: transactionToEdit.porcentagem_divisao?.toString() || "",
        data_vencimento: transactionToEdit.data_vencimento || "",
        status_pagamento: transactionToEdit.status_pagamento || "PENDENTE",
        parcelas: transactionToEdit.parcelas || 1,
        eh_parcelado: !!transactionToEdit.parcelas && transactionToEdit.parcelas > 1,
      };
    }
    // Smart defaults: remember last used card and set sensible defaults
    const lastUsedCardId = localStorage.getItem('lastUsedCardId');

    return {
      date: getCurrentDate(),
      description: "",
      value: "",
      type: "" as "entrada" | "saida" | "",
      category: "",
      location: "",
      recurrence: "ocasional" as "diario" | "semanal" | "mensal" | "ocasional" | "",
      painel_id: lastUsedCardId ? parseInt(lastUsedCardId) : undefined,
      tipo_divisao: "PESSOAL" as "PESSOAL" | "COMPARTILHADO_50_50" | "COMPARTILHADO_CUSTOM" | "",
      porcentagem_divisao: "",
      data_vencimento: "",
      status_pagamento: "PAGO" as "PENDENTE" | "PAGO" | "VENCIDO" | "",
      parcelas: 1,
      eh_parcelado: false,
    };
  }, [mode, transactionToEdit]);

  const [formData, setFormData] = useState(getInitialFormData());
  const [viewMode, setViewMode] = useState<"quick" | "advanced">("quick");

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Reset form when mode or transactionToEdit changes
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [mode, transactionToEdit, isOpen, getInitialFormData]);

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

    // Validar apenas campos obrigatórios: valor, tipo, categoria, recorrência
    if (!formData.value || !formData.type || !formData.category || !formData.recurrence) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha valor, tipo, categoria e recorrência',
        variant: 'destructive'
      });
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

    // Save last used card for smart defaults
    localStorage.setItem('lastUsedCardId', formData.painel_id.toString());

    onSubmit({
      date: formData.date,
      description: formData.description || 'Sem descrição',
      value: parseFloat(formData.value),
      type: formData.type,
      category: formData.category,
      location: formData.location || "",
      recurrence: formData.recurrence,
      painel_id: formData.painel_id,
      tipo_divisao: formData.tipo_divisao || 'PESSOAL',
      valor_por_pessoa: valorPorPessoa,
      porcentagem_divisao: formData.tipo_divisao === 'COMPARTILHADO_CUSTOM' ? parseFloat(formData.porcentagem_divisao) : undefined,
      data_vencimento: formData.data_vencimento || undefined,
      status_pagamento: formData.status_pagamento || 'PENDENTE',
      parcelas: formData.eh_parcelado ? formData.parcelas : undefined,
    });

    // Reset form
    setFormData({
      date: getCurrentDate(),
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
      status_pagamento: "PENDENTE",
      parcelas: 1,
      eh_parcelado: false,
    });

    onClose();
  };

  const filteredLocations = existingLocations.filter(location =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const showAddNewLocation = locationSearch && !filteredLocations.includes(locationSearch);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Transação" : "Nova Transação"}</DialogTitle>
        </DialogHeader>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "quick" | "advanced")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">⚡ Modo Rápido</TabsTrigger>
            <TabsTrigger value="advanced">🔧 Modo Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Valor */}
              <div>
                <Label htmlFor="value">Valor <span className="text-destructive">*</span></Label>
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
                <Label>Tipo <span className="text-destructive">*</span></Label>
                <Select value={formData.type} onValueChange={(value: "entrada" | "saida") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">💸 Entrada</SelectItem>
                    <SelectItem value="saida">💳 Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div>
                <Label>Categoria <span className="text-destructive">*</span></Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
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
                      <CommandInput
                        placeholder="Buscar ou criar categoria..."
                        value={categorySearch}
                        onValueChange={setCategorySearch}
                      />
                      <CommandEmpty>
                        <div
                          className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                          onClick={() => {
                            if (!categorySearch.trim()) {
                              toast({
                                title: 'Erro',
                                description: 'Digite o nome da categoria',
                                variant: 'destructive',
                              });
                              return;
                            }

                            createCategoria.mutate({ nome: categorySearch }, {
                              onSuccess: (newCategoria) => {
                                setFormData({ ...formData, category: newCategoria.nome });
                                setCategoryOpen(false);
                                setCategorySearch('');
                              },
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar categoria "{categorySearch}"
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {categorias.map((categoria) => (
                          <CommandItem
                            key={categoria.id}
                            value={categoria.nome}
                            onSelect={(value) => {
                              setFormData({ ...formData, category: value });
                              setCategoryOpen(false);
                              setCategorySearch('');
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

              {/* Cartão */}
              <div className="space-y-2">
                <Label htmlFor="painel_id">Cartão <span className="text-destructive">*</span></Label>
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

              {/* Preview do valor (sempre visível no modo rápido) */}
              {valorPorPessoa !== null && formData.value && (
                <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
                  <p className="text-sm font-medium text-foreground">
                    💰 Você paga: <span className="text-lg font-bold text-primary">R$ {valorPorPessoa.toFixed(2)}</span>
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
          </TabsContent>

          <TabsContent value="advanced" className="mt-4">
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
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Supermercado"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Valor */}
              <div>
                <Label htmlFor="value-adv">Valor <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="value-adv"
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
                <Label>Tipo <span className="text-destructive">*</span></Label>
                <Select value={formData.type} onValueChange={(value: "entrada" | "saida") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">💸 Entrada</SelectItem>
                    <SelectItem value="saida">💳 Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div>
                <Label>Categoria <span className="text-destructive">*</span></Label>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
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
                      <CommandInput
                        placeholder="Buscar ou criar categoria..."
                        value={categorySearch}
                        onValueChange={setCategorySearch}
                      />
                      <CommandEmpty>
                        <div
                          className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                          onClick={() => {
                            if (!categorySearch.trim()) {
                              toast({
                                title: 'Erro',
                                description: 'Digite o nome da categoria',
                                variant: 'destructive',
                              });
                              return;
                            }

                            createCategoria.mutate({ nome: categorySearch }, {
                              onSuccess: (newCategoria) => {
                                setFormData({ ...formData, category: newCategoria.nome });
                                setCategoryOpen(false);
                                setCategorySearch('');
                              },
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar categoria "{categorySearch}"
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {categorias.map((categoria) => (
                          <CommandItem
                            key={categoria.id}
                            value={categoria.nome}
                            onSelect={(value) => {
                              setFormData({ ...formData, category: value });
                              setCategoryOpen(false);
                              setCategorySearch('');
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
                <Label>Local (opcional)</Label>
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
                <Label htmlFor="painel_id_adv">Cartão <span className="text-destructive">*</span></Label>
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
                    <SelectTrigger id="painel_id_adv">
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
                    <SelectItem value="diario">🔁 Diário</SelectItem>
                    <SelectItem value="semanal">📅 Semanal</SelectItem>
                    <SelectItem value="mensal">📆 Mensal</SelectItem>
                    <SelectItem value="ocasional">⚡ Ocasional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Parcelamento - apenas para saídas */}
              {formData.type === 'saida' && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="eh_parcelado"
                      checked={formData.eh_parcelado}
                      onChange={(e) => setFormData({
                        ...formData,
                        eh_parcelado: e.target.checked,
                        parcelas: e.target.checked ? formData.parcelas : 1
                      })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="eh_parcelado" className="font-normal cursor-pointer">
                      💳 Compra parcelada
                    </Label>
                  </div>

                  {formData.eh_parcelado && (
                    <div>
                      <Label htmlFor="parcelas">Número de parcelas</Label>
                      <Input
                        id="parcelas"
                        type="number"
                        min="2"
                        max="48"
                        value={formData.parcelas}
                        onChange={(e) => setFormData({
                          ...formData,
                          parcelas: parseInt(e.target.value) || 1
                        })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.parcelas}x de R$ {(parseFloat(formData.value) / formData.parcelas || 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};