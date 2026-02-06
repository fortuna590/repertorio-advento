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
import { Trash2, GripVertical } from "lucide-react";

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

const TONS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
  "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm",
];

interface SortableMusicaProps {
  musica: Musica;
  index: number;
  onUpdate: (index: number, campo: keyof Musica, valor: string) => void;
  onRemove: (index: number) => void;
}

export function SortableMusica({ musica, index, onUpdate, onRemove }: SortableMusicaProps) {
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
        <div className="md:col-span-2">
          <Label>Título da Música *</Label>
          <Input
            placeholder="Ex: Vem Espírito Santo"
            value={musica.titulo}
            onChange={(e) => onUpdate(index, "titulo", e.target.value)}
          />
        </div>

        <div>
          <Label>Artista / Compositor</Label>
          <Input
            placeholder="Ex: Comunidade Católica Shalom"
            value={musica.artista}
            onChange={(e) => onUpdate(index, "artista", e.target.value)}
          />
        </div>

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

        <div>
          <Label>Momento da Missa *</Label>
          <Select
            value={musica.momento}
            onValueChange={(valor) => onUpdate(index, "momento", valor)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOMENTOS_MISSA.map((momento) => (
                <SelectItem key={momento} value={momento}>
                  {momento}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Link da Cifra</Label>
          <Input
            type="url"
            placeholder="https://..."
            value={musica.linkCifra}
            onChange={(e) => onUpdate(index, "linkCifra", e.target.value)}
          />
        </div>

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
