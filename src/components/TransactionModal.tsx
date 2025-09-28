import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Transaction } from "./TransactionsPage";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, "id">) => void;
  existingLocations: string[];
}

const categories = [
  "Alimentação",
  "Transporte",
  "Moradia", 
  "Saúde",
  "Lazer",
  "Salário",
  "Trabalho"
];

export const TransactionModal = ({ isOpen, onClose, onSubmit, existingLocations }: TransactionModalProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    value: "",
    type: "" as "entrada" | "saida" | "",
    category: "",
    location: "",
    recurrence: "" as "diario" | "semanal" | "mensal" | "ocasional" | ""
  });

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.value || !formData.type || !formData.category || !formData.recurrence) {
      return;
    }

    onSubmit({
      date: formData.date,
      description: formData.description,
      value: parseFloat(formData.value),
      type: formData.type,
      category: formData.category,
      location: formData.location || "Não informado",
      recurrence: formData.recurrence
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      value: "",
      type: "",
      category: "",
      location: "",
      recurrence: ""
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
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};