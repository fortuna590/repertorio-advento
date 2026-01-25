import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EditarMusicaModalProps {
  open: boolean;
  onClose: () => void;
  musica: {
    id: number;
    titulo: string;
    artista?: string | null;
    youtube?: string | null;
    cifra?: string | null;
    observacao?: string | null;
    ordem?: number;
  };
  onSuccess: () => void;
}

export function EditarMusicaModal({ open, onClose, musica, onSuccess }: EditarMusicaModalProps) {
  const [form, setForm] = useState({
    titulo: "",
    artista: "",
    youtube: "",
    cifra: "",
    observacao: "",
    ordem: 1,
  });

  const editarMutation = trpc.musicasBase.editar.useMutation({
    onSuccess: () => {
      toast.success("Música atualizada com sucesso");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  useEffect(() => {
    if (musica) {
      setForm({
        titulo: musica.titulo || "",
        artista: musica.artista || "",
        youtube: musica.youtube || "",
        cifra: musica.cifra || "",
        observacao: musica.observacao || "",
        ordem: musica.ordem || 1,
      });
    }
  }, [musica]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editarMutation.mutate({
      id: musica.id,
      ...form,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Música</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="artista">Artista</Label>
            <Input
              id="artista"
              value={form.artista}
              onChange={(e) => setForm({ ...form, artista: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="youtube">Link do YouTube</Label>
            <Input
              id="youtube"
              type="url"
              value={form.youtube}
              onChange={(e) => setForm({ ...form, youtube: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div>
            <Label htmlFor="cifra">Link da Cifra</Label>
            <Input
              id="cifra"
              type="url"
              value={form.cifra}
              onChange={(e) => setForm({ ...form, cifra: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="ordem">Ordem</Label>
            <Input
              id="ordem"
              type="number"
              value={form.ordem}
              onChange={(e) => setForm({ ...form, ordem: parseInt(e.target.value) })}
              min={1}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={editarMutation.isPending}>
              {editarMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
