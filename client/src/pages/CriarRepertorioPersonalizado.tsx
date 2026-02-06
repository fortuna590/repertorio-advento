import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Music, GripVertical, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableMusica } from "@/components/SortableMusica";
import { ImportarMusicasModal } from "@/components/ImportarMusicasModal";

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

const TAGS_PREDEFINIDAS = [
  "Missa Dominical",
  "Casamento",
  "Funeral",
  "Natal",
  "Páscoa",
  "Advento",
  "Quaresma",
  "Pentecostes",
  "Batismo",
  "Primeira Comunhão",
  "Crisma",
  "Adorção",
  "Terço",
  "Novena",
];

const TONS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
  "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm",
];

export default function CriarRepertorioPersonalizado() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();

  const isEdicao = !!id;

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [novaTag, setNovaTag] = useState("");
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [modalImportarAberto, setModalImportarAberto] = useState(false);
  const [repertorioFonteId, setRepertorioFonteId] = useState<number | null>(null);
  const [musicasSelecionadas, setMusicasSelecionadas] = useState<number[]>([]);

  // Buscar repertório se for edição
  const { data: repertorio, isLoading } = trpc.repertoriosPersonalizados.buscarPorId.useQuery(
    { id: parseInt(id || "0") },
    { enabled: isEdicao }
  );

  useEffect(() => {
    if (repertorio) {
      setNome(repertorio.nome);
      setDescricao(repertorio.descricao || "");
      // Parse tags
      if (repertorio.tags) {
        try {
          const parsedTags = JSON.parse(repertorio.tags);
          setTags(Array.isArray(parsedTags) ? parsedTags : []);
        } catch (e) {
          setTags([]);
        }
      }
      setMusicas(
        repertorio.musicas.map((m) => ({
          id: m.id,
          titulo: m.titulo,
          artista: m.artista || "",
          tom: m.tom || "",
          linkCifra: m.linkCifra || "",
          linkYoutube: m.linkYoutube || "",
          momento: m.momento,
        }))
      );
    }
  }, [repertorio]);

  const criarRepertorioMutation = trpc.repertoriosPersonalizados.criar.useMutation();
  const atualizarRepertorioMutation = trpc.repertoriosPersonalizados.atualizar.useMutation();
  const adicionarMusicaMutation = trpc.repertoriosPersonalizados.adicionarMusica.useMutation();
  const atualizarMusicaMutation = trpc.repertoriosPersonalizados.atualizarMusica.useMutation();
  const excluirMusicaMutation = trpc.repertoriosPersonalizados.excluirMusica.useMutation();

  const handleAdicionarMusica = () => {
    setMusicas([
      ...musicas,
      {
        titulo: "",
        artista: "",
        tom: "",
        linkCifra: "",
        linkYoutube: "",
        momento: "Entrada",
      },
    ]);
    
    // Scroll suave para a nova música após um pequeno delay
    setTimeout(() => {
      const musicasSection = document.getElementById('musicas-section');
      if (musicasSection) {
        const lastMusica = musicasSection.lastElementChild;
        if (lastMusica) {
          lastMusica.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  const handleRemoverMusica = async (index: number) => {
    const musica = musicas[index];
    
    if (musica.id && isEdicao) {
      try {
        await excluirMusicaMutation.mutateAsync({
          id: musica.id,
          repertorioId: parseInt(id!),
        });
        toast.success("Música excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir música");
        return;
      }
    }

    setMusicas(musicas.filter((_, i) => i !== index));
  };

  const handleAtualizarMusica = (index: number, campo: keyof Musica, valor: string) => {
    const novasMusicas = [...musicas];
    novasMusicas[index] = { ...novasMusicas[index], [campo]: valor };
    setMusicas(novasMusicas);
  };

  // Drag and drop sensors
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
        const oldIndex = items.findIndex((_, i) => i === active.id);
        const newIndex = items.findIndex((_, i) => i === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSalvar = async () => {
    if (!nome.trim()) {
      toast.error("Nome do repertório é obrigatório");
      return;
    }

    if (musicas.length === 0) {
      toast.error("Adicione pelo menos uma música ao repertório");
      return;
    }

    // Validar músicas
    for (const musica of musicas) {
      if (!musica.titulo.trim()) {
        toast.error("Todas as músicas devem ter um título");
        return;
      }
    }

    try {
      let repertorioId = id ? parseInt(id) : null;

      // Criar ou atualizar repertório
      if (isEdicao) {
        await atualizarRepertorioMutation.mutateAsync({
          id: parseInt(id!),
          nome,
          descricao,
          tags,
        });
      } else {
        const resultado = await criarRepertorioMutation.mutateAsync({
          nome,
          descricao,
          tags,
        });
        repertorioId = resultado.repertorioId;
      }

      // Salvar músicas
      for (const musica of musicas) {
        if (musica.id && isEdicao) {
          // Atualizar música existente
          await atualizarMusicaMutation.mutateAsync({
            id: musica.id,
            repertorioId: parseInt(id!),
            titulo: musica.titulo,
            artista: musica.artista,
            tom: musica.tom,
            linkCifra: musica.linkCifra,
            linkYoutube: musica.linkYoutube,
            momento: musica.momento,
          });
        } else {
          // Adicionar nova música
          await adicionarMusicaMutation.mutateAsync({
            repertorioId: repertorioId!,
            titulo: musica.titulo,
            artista: musica.artista,
            tom: musica.tom,
            linkCifra: musica.linkCifra,
            linkYoutube: musica.linkYoutube,
            momento: musica.momento,
          });
        }
      }

      toast.success(`Repertório ${isEdicao ? "atualizado" : "criado"} com sucesso!`);

      setLocation("/meus-repertorios");
    } catch (error) {
      toast.error(`Erro ao ${isEdicao ? "atualizar" : "criar"} repertório`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/meus-repertorios")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdicao ? "Editar Repertório" : "Criar Novo Repertório"}
            </h1>
            <p className="text-muted-foreground">
              {isEdicao
                ? "Atualize as informações do seu repertório"
                : "Monte seu repertório personalizado com músicas ilimitadas"}
            </p>
          </div>
        </div>

        {/* Informações do Repertório */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações do Repertório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Repertório *</Label>
              <Input
                id="nome"
                placeholder="Ex: Missa Domingo 15/02"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição / Notas (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Adicione observações, notas ou detalhes sobre este repertório..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>

            {/* Seletor de Tags */}
            <div>
              <Label>Tags / Categorias (opcional)</Label>
              <div className="space-y-3">
                {/* Tags selecionadas */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600/20 text-purple-700 dark:text-purple-300 text-sm border border-purple-600/30"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((_, i) => i !== index))}
                          className="hover:text-red-500 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Seletor de tags predefinidas */}
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !tags.includes(value)) {
                      setTags([...tags, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma tag predefinida" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAGS_PREDEFINIDAS.filter(tag => !tags.includes(tag)).map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Input para tag personalizada */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ou crie uma tag personalizada..."
                    value={novaTag}
                    onChange={(e) => setNovaTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (novaTag.trim() && !tags.includes(novaTag.trim())) {
                          setTags([...tags, novaTag.trim()]);
                          setNovaTag("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (novaTag.trim() && !tags.includes(novaTag.trim())) {
                        setTags([...tags, novaTag.trim()]);
                        setNovaTag("");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Músicas */}
        <Card className="mb-6">
          <CardHeader className="sticky top-0 z-10 bg-card border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Músicas ({musicas.length})
              </CardTitle>
              <div className="flex gap-2">
                <Dialog open={modalImportarAberto} onOpenChange={setModalImportarAberto}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Importar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Importar Músicas de Outro Repertório</DialogTitle>
                      <DialogDescription>
                        Selecione um repertório e escolha as músicas que deseja importar
                      </DialogDescription>
                    </DialogHeader>
                    <ImportarMusicasModal
                      repertorioAtualId={id ? parseInt(id) : null}
                      onImportar={(musicasImportadas: Musica[]) => {
                        setMusicas([...musicas, ...musicasImportadas]);
                        setModalImportarAberto(false);
                        toast.success(`${musicasImportadas.length} música(s) importada(s) com sucesso!`);
                      }}
                    />
                  </DialogContent>
                </Dialog>
                <Button onClick={handleAdicionarMusica} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Música
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6" id="musicas-section">
            {musicas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma música adicionada ainda</p>
                <p className="text-sm">Clique em "Adicionar Música" para começar</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={musicas.map((_, i) => i)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-6">
                    {musicas.map((musica, index) => (
                      <SortableMusica
                        key={index}
                        musica={musica}
                        index={index}
                        onUpdate={handleAtualizarMusica}
                        onRemove={handleRemoverMusica}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => setLocation("/meus-repertorios")}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={criarRepertorioMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {criarRepertorioMutation.isPending
              ? "Salvando..."
              : isEdicao
              ? "Salvar Alterações"
              : "Criar Repertório"}
          </Button>
        </div>
      </div>

      {/* Botão Flutuante de Adicionar Música */}
      {musicas.length > 0 && (
        <button
          onClick={handleAdicionarMusica}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center gap-2 group"
          aria-label="Adicionar Música"
        >
          <Plus className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Adicionar Música
          </span>
        </button>
      )}
    </div>
  );
}
