import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp, Plus, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTipoContaIcon } from "@/components/TipoContaIcon";
import { usePaineis } from "@/hooks/usePaineis";
import { useCategorias, useCreateCategoria } from "@/hooks/useCategorias";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { getCurrentDate } from "@/utils/date";
import type { Transaction } from "./TransactionsPageInfiniteScroll";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, "id">) => void;
  existingLocations: string[];
  mode?: "create" | "edit";
  transactionToEdit?: Transaction;
}

export const TransactionModalImproved = ({
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

  // Modo de visualização: quick (rápido) ou advanced (avançado)
  const [viewMode, setViewMode] = useState<"quick" | "advanced">("quick");

  // Seções colapsáveis no modo avançado
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filtrar apenas painéis do usuário logado (memoizado)
  const userPaineis = useMemo(() => {
    return currentUser
      ? paineis.filter(p => p.usuario_id === currentUser.id)
      : [];
  }, [currentUser, paineis]);

  // Smart Default: Lembrar último cartão usado
  const defaultPainelId = useMemo(() => {
    const lastUsed = localStorage.getItem('lastUsedPainelId');
    if (lastUsed && userPaineis.some(p => p.id === parseInt(lastUsed))) {
      return parseInt(lastUsed);
    }
    return userPaineis[0]?.id;
  }, [userPaineis]);

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

    // Smart Defaults
    return {
      date: getCurrentDate(),
      description: "",
      value: "",
      type: "saida" as "entrada" | "saida" | "", // Padrão: saída (mais comum)
      category: "",
      location: "",
      recurrence: "ocasional" as "diario" | "semanal" | "mensal" | "ocasional" | "",
      painel_id: defaultPainelId,
      tipo_divisao: "PESSOAL" as "PESSOAL" | "COMPARTILHADO_50_50" | "COMPARTILHADO_CUSTOM" | "",
      porcentagem_divisao: "",
      data_vencimento: "",
      status_pagamento: "PENDENTE" as "PENDENTE" | "PAGO" | "VENCIDO" | "",
      parcelas: 1,
      eh_parcelado: false,
    };
  }, [mode, transactionToEdit, defaultPainelId]);

  const [formData, setFormData] = useState(getInitialFormData());
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Presets de divisão
  type DivisionPreset = "100" | "50" | "60" | "70" | "custom";
  const [selectedPreset, setSelectedPreset] = useState<DivisionPreset>("100");

  // Reset form when mode or transactionToEdit changes
  useEffect(() => {
    setFormData(getInitialFormData());
    setViewMode("quick");
    setShowDetails(false);
    setShowAdvanced(false);
  }, [mode, transactionToEdit, isOpen, getInitialFormData]);

  // Calcular valor por pessoa automaticamente (memoizado)
  const valorPorPessoa = useMemo((): number | null => {
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
  }, [formData.value, formData.tipo_divisao, formData.porcentagem_divisao]);

  // Handler para presets de divisão
  const handlePresetClick = (preset: DivisionPreset) => {
    setSelectedPreset(preset);

    switch (preset) {
      case "100":
        setFormData({ ...formData, tipo_divisao: "PESSOAL", porcentagem_divisao: "" });
        break;
      case "50":
        setFormData({ ...formData, tipo_divisao: "COMPARTILHADO_50_50", porcentagem_divisao: "" });
        break;
      case "60":
        setFormData({ ...formData, tipo_divisao: "COMPARTILHADO_CUSTOM", porcentagem_divisao: "60" });
        break;
      case "70":
        setFormData({ ...formData, tipo_divisao: "COMPARTILHADO_CUSTOM", porcentagem_divisao: "70" });
        break;
      case "custom":
        setFormData({ ...formData, tipo_divisao: "COMPARTILHADO_CUSTOM", porcentagem_divisao: "" });
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    if (!formData.value || !formData.type || !formData.category) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha valor, tipo e categoria',
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

    // Salvar último cartão usado
    localStorage.setItem('lastUsedPainelId', formData.painel_id.toString());

    onSubmit({
      date: formData.date,
      description: formData.description || 'Sem descrição',
      value: parseFloat(formData.value),
      type: formData.type,
      category: formData.category,
      location: formData.location || "",
      recurrence: formData.recurrence || "ocasional",
      painel_id: formData.painel_id,
      tipo_divisao: formData.tipo_divisao || 'PESSOAL',
      valor_por_pessoa: valorPorPessoa,
      porcentagem_divisao: formData.tipo_divisao === 'COMPARTILHADO_CUSTOM' ? parseFloat(formData.porcentagem_divisao) : undefined,
      data_vencimento: formData.data_vencimento || undefined,
      status_pagamento: formData.status_pagamento || 'PENDENTE',
      parcelas: formData.eh_parcelado ? formData.parcelas : undefined,
    });

    // Reset form
    setFormData(getInitialFormData());
    onClose();
  };

  const filteredLocations = existingLocations.filter(location =>
    location.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const showAddNewLocation = locationSearch && !filteredLocations.includes(locationSearch);

  // Últimas 5 categorias mais usadas (mock - poderia vir do histórico)
  const recentCategories = categorias.slice(0, 5);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar Transação" : "Nova Transação"}</DialogTitle>
        </DialogHeader>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "quick" | "advanced")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">⚡ Modo Rápido</TabsTrigger>
            <TabsTrigger value="advanced">🔧 Modo Avançado</TabsTrigger>
          </TabsList>

          {/* MODO RÁPIDO */}
          <TabsContent value="quick">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Valor */}
              <div>
                <Label htmlFor="value">Valor *</Label>
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
                    className="pl-10 text-lg font-semibold"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <Label>Tipo *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={formData.type === "saida" ? "default" : "outline"}
                    className={formData.type === "saida" ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => setFormData({ ...formData, type: "saida" })}
                  >
                    ↓ Saída
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === "entrada" ? "default" : "outline"}
                    className={formData.type === "entrada" ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setFormData({ ...formData, type: "entrada" })}
                  >
                    ↑ Entrada
                  </Button>
                </div>
              </div>

              {/* Categoria */}
              <div>
                <Label>Categoria *</Label>
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
                      {recentCategories.length > 0 && (
                        <>
                          <CommandGroup heading="Recentes">
                            {recentCategories.map((categoria) => (
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
                          <CommandGroup heading="Todas">
                            {categorias.filter(c => !recentCategories.includes(c)).map((categoria) => (
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
                        </>
                      )}
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
                    Você precisa criar um cartão primeiro.
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

              {/* Divisão - Presets Visuais */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Label>Divisão de Gasto</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Como o custo será dividido entre você e outros</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <Button
                    type="button"
                    variant={selectedPreset === "100" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetClick("100")}
                  >
                    100%
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPreset === "50" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetClick("50")}
                  >
                    50/50
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPreset === "60" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetClick("60")}
                  >
                    60/40
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPreset === "70" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetClick("70")}
                  >
                    70/30
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPreset === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetClick("custom")}
                  >
                    Custom
                  </Button>
                </div>

                {selectedPreset === "custom" && (
                  <div>
                    <Label htmlFor="porcentagem_divisao">Sua Porcentagem (%)</Label>
                    <Input
                      id="porcentagem_divisao"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.porcentagem_divisao}
                      onChange={(e) => setFormData({ ...formData, porcentagem_divisao: e.target.value })}
                      placeholder="Ex: 60"
                    />
                  </div>
                )}

                {/* Preview Fixo do Valor */}
                {valorPorPessoa !== null && formData.value && (
                  <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
                    <p className="text-sm font-medium text-foreground">
                      💰 Você paga: <span className="text-xl font-bold text-primary">R$ {valorPorPessoa.toFixed(2)}</span>
                    </p>
                    {formData.tipo_divisao !== 'PESSOAL' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Outro paga: R$ {(parseFloat(formData.value) - valorPorPessoa).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Descrição (opcional) */}
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Supermercado"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Botões */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("advanced")}
                >
                  Mais opções →
                </Button>
                <div className="flex gap-2">
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
              </div>
            </form>
          </TabsContent>

          {/* MODO AVANÇADO */}
          <TabsContent value="advanced">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campos Essenciais (sempre visíveis) */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Essencial</h3>

                {/* ... Copiar campos essenciais do modo rápido ... */}
                {/* Valor, Tipo, Categoria, Cartão */}

              </div>

              {/* Detalhes (colapsável) */}
              <div className="border rounded-lg">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <h3 className="font-semibold">Detalhes</h3>
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showDetails && (
                  <div className="p-4 space-y-4 border-t">
                    {/* Data, Descrição, Local */}
                  </div>
                )}
              </div>

              {/* Avançado (colapsável) */}
              <div className="border rounded-lg">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <h3 className="font-semibold">Avançado</h3>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showAdvanced && (
                  <div className="p-4 space-y-4 border-t">
                    {/* Recorrência, Parcelamento, Vencimento, Status */}
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-2 pt-4">
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
