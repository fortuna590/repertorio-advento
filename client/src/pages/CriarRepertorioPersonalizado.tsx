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
import { MusicasRecentesSection } from "@/components/MusicasRecentesSection";

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

const getMomentosPorTemplate = (template: "missa" | "grupo_oracao" | "livre") => {
  if (template === "grupo_oracao") return MOMENTOS_GRUPO_ORACAO;
  if (template === "missa") return MOMENTOS_MISSA;
  return []; // Template livre não tem momentos
};

const TAGS_PREDEFINIDAS = [
  "Missa Dominical",
  "Casamento",
  "Natal",
  "Páscoa",
  "Advento",
  "Quaresma",
  "Pentecostes",
  "Batismo",
  "Primeira Comunhão",
  "Crisma",
  "Adoração",
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
  const [tipoTemplate, setTipoTemplate] = useState<"missa" | "grupo_oracao" | "livre">("missa");
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [modalImportarAberto, setModalImportarAberto] = useState(false);
  const [repertorioFonteId, setRepertorioFonteId] = useState<number | null>(null);
  const [musicasSelecionadas, setMusicasSelecionadas] = useState<number[]>([]);

  const LOCAL_STORAGE_KEY = `repertorio_draft_${id || 'novo'}`;

  // Carregar dados do localStorage ao montar componente
  useEffect(() => {
    if (!isEdicao) { // Só carrega do localStorage se for criação nova
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setNome(data.nome || "");
          setDescricao(data.descricao || "");
          setTags(data.tags || []);
          setTipoTemplate(data.tipoTemplate || "missa");
          setMusicas(data.musicas || []);
          toast.info("Rascunho recuperado!");
        } catch (e) {
          console.error("Erro ao carregar rascunho:", e);
        }
      }
    }
  }, []);

  // Auto-save no localStorage quando dados mudam
  useEffect(() => {
    if (!isEdicao && (nome || descricao || tags.length > 0 || musicas.length > 0)) {
      const data = { nome, descricao, tags, tipoTemplate, musicas };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  }, [nome, descricao, tags, tipoTemplate, musicas, isEdicao, LOCAL_STORAGE_KEY]);

  // Buscar repertório se for edição
  const { data: repertorio, isLoading } = trpc.repertoriosPersonalizados.buscarPorId.useQuery(
    { id: parseInt(id || "0") },
    { enabled: isEdicao }
  );

  useEffect(() => {
    if (repertorio) {
      setNome(repertorio.nome);
      setDescricao(repertorio.descricao || "");
      setTipoTemplate(repertorio.tipoTemplate || "missa");
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
    const momentos = getMomentosPorTemplate(tipoTemplate);
    setMusicas([
      ...musicas,
      {
        titulo: "",
        artista: "",
        tom: "",
        linkCifra: "",
        linkYoutube: "",
        momento: momentos.length > 0 ? momentos[0] : "", // Primeiro momento ou vazio para template livre
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

  const handleSalvarContinuar = async () => {
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
      // Validar momento apenas para templates que não são livres
      if (tipoTemplate !== "livre" && !musica.momento) {
        toast.error("Todas as músicas devem ter um momento definido");
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
          tipoTemplate,
        });
        repertorioId = resultado.repertorioId;
        // Redirecionar para edição após criar
        setLocation(`/repertorio-personalizado/${repertorioId}/editar`);
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

      // Limpar localStorage após salvar com sucesso
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      toast.success(`Repertório salvo! Continue editando.`);
      
      // Recarregar dados se for edição
      if (isEdicao) {
        window.location.reload();
      }
    } catch (error) {
      toast.error(`Erro ao salvar repertório`);
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
      // Validar momento apenas para templates que não são livres
      if (tipoTemplate !== "livre" && !musica.momento) {
        toast.error("Todas as músicas devem ter um momento definido");
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
          tipoTemplate,
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

      // Limpar localStorage após salvar com sucesso
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
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

            {/* Seletor de Tipo de Template */}
            {!isEdicao && (
              <div>
                <Label htmlFor="tipoTemplate">Tipo de Repertório *</Label>
                <Select value={tipoTemplate} onValueChange={(value: any) => setTipoTemplate(value)}>
                  <SelectTrigger id="tipoTemplate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="missa">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Missa</span>
                        <span className="text-xs text-muted-foreground">Entrada, Glória, Aclamação, Ofertório, Santo, Cordeiro, Comunhão, Final</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="grupo_oracao">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Grupo de Oração</span>
                        <span className="text-xs text-muted-foreground">Acolhida, Animação, Oração/Entrega, Espírito Santo, Palavra, Louvor, Final</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="livre">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Livre (Sem Momentos)</span>
                        <span className="text-xs text-muted-foreground">Adoração, Momento Mariano, Terço, Novena - adicione músicas livremente</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {tipoTemplate === "missa" && "Estrutura tradicional da Santa Missa"}
                  {tipoTemplate === "grupo_oracao" && "Estrutura de Grupo de Oração"}
                  {tipoTemplate === "livre" && "Sem momentos predefinidos - ideal para adoração, terço, novena, etc."}
                </p>
              </div>
            )}

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

        {/* Músicas Recentes */}
        <MusicasRecentesSection onReutilizar={(musica: Musica) => {
          setMusicas([...musicas, musica]);
          toast.success("Música adicionada!");
        }} />

        {/* Músicas */}
        <Card className="mb-6">
          <CardHeader className="sticky top-0 z-10 bg-card border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Músicas ({musicas.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6" id="musicas-section">
            {musicas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma música adicionada ainda</p>
                <p className="text-sm">Use a barra flutuante acima para adicionar músicas</p>
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
                        tipoTemplate={tipoTemplate}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação - Agora flutuantes */}
      </div>

      {/* Barra Flutuante de Ações - Otimizada para Mobile */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b shadow-lg">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex gap-2 sm:gap-3 justify-between items-center flex-wrap sm:flex-nowrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/meus-repertorios")}
            className="min-w-[80px] text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
            <span className="sm:hidden">←</span>
          </Button>
          
          <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            {musicas.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdicionarMusica}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 text-xs sm:text-sm min-w-[100px] sm:min-w-auto"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Adicionar Música</span>
                <span className="sm:hidden">+ Música</span>
              </Button>
            )}
            
            <Button 
              variant="outline"
              size="sm"
              onClick={handleSalvarContinuar} 
              disabled={criarRepertorioMutation.isPending || atualizarRepertorioMutation.isPending}
              className="text-xs sm:text-sm min-w-[100px] sm:min-w-auto"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {(criarRepertorioMutation.isPending || atualizarRepertorioMutation.isPending)
                ? "..."
                : (
                  <>
                    <span className="hidden sm:inline">Salvar e Continuar</span>
                    <span className="sm:hidden">Continuar</span>
                  </>
                )}
            </Button>
            
            <Button 
              size="sm"
              onClick={handleSalvar} 
              disabled={criarRepertorioMutation.isPending || atualizarRepertorioMutation.isPending}
              className="text-xs sm:text-sm min-w-[80px] sm:min-w-auto"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {(criarRepertorioMutation.isPending || atualizarRepertorioMutation.isPending)
                ? "..."
                : isEdicao
                ? (
                  <>
                    <span className="hidden sm:inline">Salvar e Sair</span>
                    <span className="sm:hidden">Salvar</span>
                  </>
                )
                : (
                  <>
                    <span className="hidden sm:inline">Criar Repertório</span>
                    <span className="sm:hidden">Criar</span>
                  </>
                )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Espaçamento para compensar barra flutuante */}
      <div className="h-16"></div>
    </div>
  );
}
