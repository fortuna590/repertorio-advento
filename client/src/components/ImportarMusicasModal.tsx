import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Music } from "lucide-react";

type Musica = {
  id?: number;
  titulo: string;
  artista: string;
  tom: string;
  linkCifra: string;
  linkYoutube: string;
  momento: string;
};

interface ImportarMusicasModalProps {
  repertorioAtualId: number | null;
  onImportar: (musicas: Musica[]) => void;
}

export function ImportarMusicasModal({ repertorioAtualId, onImportar }: ImportarMusicasModalProps) {
  const [repertorioFonteId, setRepertorioFonteId] = useState<string>("");
  const [musicasSelecionadas, setMusicasSelecionadas] = useState<number[]>([]);

  // Buscar lista de repertórios
  const { data: repertorios } = trpc.repertoriosPersonalizados.listMeus.useQuery();

  // Buscar músicas do repertório selecionado
  const { data: repertorioFonte } = trpc.repertoriosPersonalizados.buscarPorId.useQuery(
    { id: parseInt(repertorioFonteId) },
    { enabled: !!repertorioFonteId }
  );

  const handleToggleMusica = (musicaId: number) => {
    if (musicasSelecionadas.includes(musicaId)) {
      setMusicasSelecionadas(musicasSelecionadas.filter(id => id !== musicaId));
    } else {
      setMusicasSelecionadas([...musicasSelecionadas, musicaId]);
    }
  };

  const handleSelecionarTodas = () => {
    if (!repertorioFonte?.musicas) return;
    
    if (musicasSelecionadas.length === repertorioFonte.musicas.length) {
      setMusicasSelecionadas([]);
    } else {
      setMusicasSelecionadas(repertorioFonte.musicas.map(m => m.id));
    }
  };

  const handleImportar = () => {
    if (!repertorioFonte?.musicas) return;

    const musicasParaImportar = repertorioFonte.musicas
      .filter(m => musicasSelecionadas.includes(m.id))
      .map(m => ({
        titulo: m.titulo,
        artista: m.artista || "",
        tom: m.tom || "",
        linkCifra: m.linkCifra || "",
        linkYoutube: m.linkYoutube || "",
        momento: m.momento,
      }));

    onImportar(musicasParaImportar);
  };

  // Filtrar repertórios (excluir o atual se estiver editando)
  const repertoriosFiltrados = repertorios?.filter(
    r => !repertorioAtualId || r.id !== repertorioAtualId
  ) || [];

  return (
    <div className="space-y-4">
      {/* Seletor de Repertório */}
      <div>
        <Label>Selecione o Repertório</Label>
        <Select value={repertorioFonteId} onValueChange={setRepertorioFonteId}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha um repertório..." />
          </SelectTrigger>
          <SelectContent>
            {repertoriosFiltrados.map((rep) => (
              <SelectItem key={rep.id} value={rep.id.toString()}>
                {rep.nome} ({rep.quantidadeMusicas} músicas)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Músicas */}
      {repertorioFonte && repertorioFonte.musicas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Músicas Disponíveis</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelecionarTodas}
            >
              {musicasSelecionadas.length === repertorioFonte.musicas.length
                ? "Desmarcar Todas"
                : "Selecionar Todas"}
            </Button>
          </div>

          <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-3">
            {repertorioFonte.musicas.map((musica) => (
              <div
                key={musica.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={musicasSelecionadas.includes(musica.id)}
                  onCheckedChange={() => handleToggleMusica(musica.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="font-medium truncate">{musica.titulo}</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {musica.artista || "Artista não informado"}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-700 dark:text-purple-300">
                      {musica.momento}
                    </span>
                    {musica.tom && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-700 dark:text-blue-300">
                        Tom: {musica.tom}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {repertorioFonte && repertorioFonte.musicas.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Este repertório não possui músicas</p>
        </div>
      )}

      {/* Botões */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          onClick={handleImportar}
          disabled={musicasSelecionadas.length === 0}
        >
          Importar {musicasSelecionadas.length > 0 && `(${musicasSelecionadas.length})`}
        </Button>
      </div>
    </div>
  );
}
