import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdicionarMusicaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repertorioId: string;
  momentoId: string;
  momentoTitulo: string;
  onSuccess?: () => void;
}

export function AdicionarMusicaModal({
  open,
  onOpenChange,
  repertorioId,
  momentoId,
  momentoTitulo,
  onSuccess,
}: AdicionarMusicaModalProps) {

  const [titulo, setTitulo] = useState("");
  const [artista, setArtista] = useState("");
  const [youtube, setYoutube] = useState("");
  const [cifra, setCifra] = useState("");
  const [letra, setLetra] = useState("");
  const [tom, setTom] = useState("");
  const [tags, setTags] = useState("");
  const [observacao, setObservacao] = useState("");

  const adicionarMutation = trpc.musicasBase.adicionar.useMutation({
    onSuccess: () => {
      toast.success("Música adicionada ao repertório com sucesso!");
      limparFormulario();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar música: " + error.message);
    },
  });

  const limparFormulario = () => {
    setTitulo("");
    setArtista("");
    setYoutube("");
    setCifra("");
    setLetra("");
    setTom("");
    setTags("");
    setObservacao("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      toast.error("Por favor, informe o título da música.");
      return;
    }

    adicionarMutation.mutate({
      repertorioId,
      momentoId,
      titulo: titulo.trim(),
      artista: artista.trim() || undefined,
      youtube: youtube.trim() || undefined,
      cifra: cifra.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Música</DialogTitle>
          <DialogDescription>
            Adicionar nova música ao momento: <strong>{momentoTitulo}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nome da música"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artista">Artista</Label>
            <Input
              id="artista"
              value={artista}
              onChange={(e) => setArtista(e.target.value)}
              placeholder="Nome do artista ou compositor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube">Link do YouTube</Label>
            <Input
              id="youtube"
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cifra">Link da Cifra</Label>
            <Input
              id="cifra"
              type="url"
              value={cifra}
              onChange={(e) => setCifra(e.target.value)}
              placeholder="https://cifraclub.com.br/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="letra">Link da Letra</Label>
            <Input
              id="letra"
              type="url"
              value={letra}
              onChange={(e) => setLetra(e.target.value)}
              placeholder="https://letras.mus.br/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tom">Tom</Label>
            <Input
              id="tom"
              value={tom}
              onChange={(e) => setTom(e.target.value)}
              placeholder="Ex: C, Dm, F#"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separadas por vírgula"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Notas ou observações sobre a música"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={adicionarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={adicionarMutation.isPending}>
              {adicionarMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar Música
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
