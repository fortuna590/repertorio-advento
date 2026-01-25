import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Music } from "lucide-react";

interface Musica {
  id: number;
  titulo: string;
  artista?: string | null;
  ordem: number;
}

interface ReordenarMusicasModalProps {
  open: boolean;
  onClose: () => void;
  repertorioId: string;
  momentoId: string;
  momentoTitulo: string;
  onSuccess: () => void;
}

function SortableItem({ musica }: { musica: Musica }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: musica.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-slate-800 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-purple-400 hover:text-purple-300"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <Music className="w-4 h-4 text-pink-400" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate">{musica.titulo}</div>
        {musica.artista && (
          <div className="text-sm text-purple-300 truncate">{musica.artista}</div>
        )}
      </div>
      <div className="text-sm text-purple-400">#{musica.ordem}</div>
    </div>
  );
}

export function ReordenarMusicasModal({
  open,
  onClose,
  repertorioId,
  momentoId,
  momentoTitulo,
  onSuccess,
}: ReordenarMusicasModalProps) {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  
  const { data: musicasData, isLoading } = trpc.musicasBase.listar.useQuery(
    { repertorioId, momentoId },
    { enabled: open }
  );

  const reordenarMutation = trpc.musicasBase.reordenar.useMutation({
    onSuccess: () => {
      toast.success("Ordem das músicas atualizada");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(`Erro ao reordenar: ${error.message}`);
    },
  });

  useEffect(() => {
    if (musicasData) {
      setMusicas(musicasData as Musica[]);
    }
  }, [musicasData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMusicas((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Atualizar ordem
        return newItems.map((item, index) => ({
          ...item,
          ordem: index + 1,
        }));
      });
    }
  };

  const handleSave = () => {
    const musicasParaAtualizar = musicas.map((m) => ({
      id: m.id,
      ordem: m.ordem,
    }));

    reordenarMutation.mutate({ musicas: musicasParaAtualizar });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reordenar Músicas - {momentoTitulo}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-purple-300">Carregando músicas...</div>
        ) : musicas.length === 0 ? (
          <div className="text-center py-8 text-purple-300">
            Nenhuma música adicionada neste momento
          </div>
        ) : (
          <>
            <div className="text-sm text-purple-300 mb-4">
              Arraste as músicas para reordenar. A nova ordem será salva ao clicar em "Salvar".
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={musicas.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {musicas.map((musica) => (
                    <SortableItem key={musica.id} musica={musica} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex gap-2 justify-end mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={reordenarMutation.isPending}
              >
                {reordenarMutation.isPending ? "Salvando..." : "Salvar Ordem"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
