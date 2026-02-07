import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, GripVertical, Search, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

type Musica = {
  id?: number;
  titulo: string;
  artista: string;
  tom: string;
  linkCifra: string;
  linkYoutube: string;
  momento: string;
};

const MOMENTOS_MISSA = [
  "Entrada",
  "Ato Penitencial",
  "Glória",
  "Aclamação",
  "Ofertório",
  "Santo",
  "Cordeiro",
  "Comunhão",
  "Final",
  "Outro",
];

const MOMENTOS_GRUPO_ORACAO = [
  "Acolhida",
  "Animação",
  "Oração/Entrega",
  "Espírito Santo",
  "Palavra",
  "Louvor",
  "Final",
  "Outro",
];

const TONS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
  "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm",
];

interface SortableMusicaProps {
  musica: Musica;
  index: number;
  onUpdate: (index: number, campo: keyof Musica, valor: string) => void;
  onRemove: (index: number) => void;
  tipoTemplate: "missa" | "grupo_oracao" | "livre";
}

export function SortableMusica({ musica, index, onUpdate, onRemove, tipoTemplate }: SortableMusicaProps) {
  const momentos = tipoTemplate === "grupo_oracao" ? MOMENTOS_GRUPO_ORACAO : MOMENTOS_MISSA;
  const mostrarMomento = tipoTemplate !== "livre"; // Ocultar campo momento para template livre
  
  const [buscaYoutube, setBuscaYoutube] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [buscaCifra, setBuscaCifra] = useState("");
  const [mostrarResultadosCifra, setMostrarResultadosCifra] = useState(false);
  
  const { data: resultadosBusca, isLoading: buscando } = trpc.youtubeSearch.buscarVideos.useQuery(
    { query: buscaYoutube },
    { enabled: buscaYoutube.length > 0 && mostrarResultados }
  );
  
  const { data: resultadosCifra, isLoading: buscandoCifra } = trpc.cifraSearch.buscarCifras.useQuery(
    { query: buscaCifra },
    { enabled: buscaCifra.length > 0 && mostrarResultadosCifra }
  );
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-lg space-y-4 relative bg-card/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-lg">Música {index + 1}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título */}
        <div className="md:col-span-2">
          <Label>Título da Música *</Label>
          <Input
            placeholder="Ex: Vem Espírito Santo"
            value={musica.titulo}
            onChange={(e) => onUpdate(index, "titulo", e.target.value)}
          />
        </div>

        {/* Artista */}
        <div>
          <Label>Artista / Compositor</Label>
          <Input
            placeholder="Ex: Comunidade Católica Shalom"
            value={musica.artista}
            onChange={(e) => onUpdate(index, "artista", e.target.value)}
          />
        </div>

        {/* Tom */}
        <div>
          <Label>Tom</Label>
          <Select
            value={musica.tom}
            onValueChange={(valor) => onUpdate(index, "tom", valor)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tom" />
            </SelectTrigger>
            <SelectContent>
              {TONS.map((tom) => (
                <SelectItem key={tom} value={tom}>
                  {tom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Momento (apenas se não for template livre) */}
        {mostrarMomento && (
          <div className="md:col-span-2">
            <Label>Momento {tipoTemplate === "grupo_oracao" ? "do Grupo" : "da Missa"} *</Label>
            <Select
              value={musica.momento}
              onValueChange={(valor) => onUpdate(index, "momento", valor)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {momentos.map((momento) => (
                  <SelectItem key={momento} value={momento}>
                    {momento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Busca de Cifra */}
        <div className="md:col-span-2">
          <Label>Buscar Cifra no CifraClub</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Digite artista - música (ex: Frei Gilson - Vamos Celebrar)"
              value={buscaCifra}
              onChange={(e) => setBuscaCifra(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setMostrarResultadosCifra(true);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setMostrarResultadosCifra(true)}
              disabled={buscandoCifra || !buscaCifra}
            >
              {buscandoCifra ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Resultados da Busca de Cifras */}
          {mostrarResultadosCifra && resultadosCifra && resultadosCifra.cifras.length > 0 && (
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2 bg-background mt-2">
              {resultadosCifra.cifras.map((cifra: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left p-2 hover:bg-accent rounded-lg transition-colors"
                  onClick={() => {
                    onUpdate(index, "linkCifra", cifra.link);
                    setMostrarResultadosCifra(false);
                    setBuscaCifra("");
                    toast.success("Link da cifra preenchido!");
                  }}
                >
                  <p className="font-medium text-sm">{cifra.titulo}</p>
                  <p className="text-xs text-muted-foreground">{cifra.artista}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Link da Cifra */}
        <div className="md:col-span-2">
          <Label>Link da Cifra</Label>
          <Input
            type="url"
            placeholder="https://www.cifraclub.com.br/..."
            value={musica.linkCifra}
            onChange={(e) => onUpdate(index, "linkCifra", e.target.value)}
          />
        </div>

        {/* Busca YouTube */}
        <div className="md:col-span-2">
          <Label>Buscar no YouTube</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome da música para buscar..."
              value={buscaYoutube}
              onChange={(e) => setBuscaYoutube(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setMostrarResultados(true);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setMostrarResultados(true)}
              disabled={buscando || !buscaYoutube}
            >
              {buscando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Resultados da Busca YouTube */}
          {mostrarResultados && resultadosBusca && resultadosBusca.videos.length > 0 && (
            <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2 bg-background mt-2">
              {resultadosBusca.videos.map((video: any) => (
                <button
                  key={video.videoId}
                  type="button"
                  className="w-full text-left p-2 hover:bg-accent rounded-lg transition-colors flex gap-3"
                  onClick={() => {
                    onUpdate(index, "titulo", video.titulo);
                    onUpdate(index, "artista", video.canal);
                    onUpdate(index, "linkYoutube", video.link);
                    setMostrarResultados(false);
                    setBuscaYoutube("");
                    toast.success("Dados preenchidos automaticamente!");
                  }}
                >
                  <img 
                    src={video.thumbnail} 
                    alt={video.titulo}
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{video.titulo}</p>
                    <p className="text-xs text-muted-foreground truncate">{video.canal}</p>
                    <p className="text-xs text-muted-foreground">
                      {video.duracao} • {video.visualizacoes}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Link do YouTube */}
        <div className="md:col-span-2">
          <Label>Link do YouTube</Label>
          <Input
            type="url"
            placeholder="https://youtube.com/..."
            value={musica.linkYoutube}
            onChange={(e) => onUpdate(index, "linkYoutube", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
