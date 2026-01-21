import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAutocompleteProps {
  onSelect: (user: { id: number; name: string; email: string }) => void;
  value?: string;
}

export function UserAutocomplete({ onSelect, value }: UserAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(value || "");

  const { data: usuarios, isLoading } = trpc.escalas.buscarUsuarios.useQuery(
    { busca: searchTerm },
    { enabled: searchTerm.length >= 2 }
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedValue || "Buscar usuário cadastrado..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Digite nome ou email..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Buscando...
              </div>
            )}
            {!isLoading && searchTerm.length < 2 && (
              <CommandEmpty>Digite pelo menos 2 caracteres para buscar</CommandEmpty>
            )}
            {!isLoading && searchTerm.length >= 2 && (!usuarios || usuarios.length === 0) && (
              <CommandEmpty>Nenhum usuário encontrado</CommandEmpty>
            )}
            {usuarios && usuarios.length > 0 && (
              <CommandGroup>
                {usuarios.map((usuario: any) => (
                  <CommandItem
                    key={usuario.id}
                    value={usuario.name || usuario.email}
                    onSelect={() => {
                      setSelectedValue(usuario.name || usuario.email);
                      onSelect({
                        id: usuario.id,
                        name: usuario.name || "",
                        email: usuario.email || "",
                      });
                      setOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{usuario.name || "Sem nome"}</span>
                      <span className="text-xs text-muted-foreground">{usuario.email}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedValue === (usuario.name || usuario.email)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
