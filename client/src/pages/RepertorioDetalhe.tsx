import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Music,
  ArrowLeft,
  GripVertical,
  Share2,
  Copy,
  Calendar,
  FileText,
  Link as LinkIcon,
  Lock,
  Globe,
  ExternalLink,
  User,
  Save,
} from "lucide-react";
import { Link } from "wouter";

// Dados das músicas do Advento (simplificado)
const musicasData: Record<string, { titulo: string; artista: string; momento: string }> = {
  "entrada-1": { titulo: "Vem, Senhor Jesus", artista: "Ministério Adoração e Vida", momento: "Entrada" },
  "entrada-2": { titulo: "Maranata", artista: "Comunidade Católica Shalom", momento: "Entrada" },
  "entrada-3": { titulo: "Preparai o Caminho", artista: "Comunidade Católica Shalom", momento: "Entrada" },
  "entrada-4": { titulo: "Vem, Vem, Senhor", artista: "Ministério Adoração e Vida", momento: "Entrada" },
  "entrada-5": { titulo: "Desperta, Jerusalém", artista: "Comunidade Católica Shalom", momento: "Entrada" },
  "ato-penitencial-1": { titulo: "Senhor, Piedade (Advento)", artista: "Pe. Zezinho", momento: "Ato Penitencial" },
  "ato-penitencial-2": { titulo: "Kyrie Eleison", artista: "Taizé", momento: "Ato Penitencial" },
  "salmo-1": { titulo: "Salmo 24 - A Vós, Senhor", artista: "Ir. Miria Kolling", momento: "Salmo" },
  "salmo-2": { titulo: "Salmo 84 - Mostrai-nos", artista: "Pe. José Weber", momento: "Salmo" },
  "aclamacao-1": { titulo: "Aleluia (Advento)", artista: "Comunidade Católica Shalom", momento: "Aclamação" },
  "aclamacao-2": { titulo: "Vem, Senhor, Vem!", artista: "Ministério Adoração e Vida", momento: "Aclamação" },
  "ofertorio-1": { titulo: "Aceita, Senhor", artista: "Pe. Zezinho", momento: "Ofertório" },
  "ofertorio-2": { titulo: "Oferta de Amor", artista: "Comunidade Católica Shalom", momento: "Ofertório" },
  "santo-1": { titulo: "Santo (Advento)", artista: "Pe. José Weber", momento: "Santo" },
  "santo-2": { titulo: "Hosana nas Alturas", artista: "Ministério Adoração e Vida", momento: "Santo" },
  "paz-1": { titulo: "Paz Sobre a Terra", artista: "Comunidade Católica Shalom", momento: "Paz" },
  "paz-2": { titulo: "A Paz Esteja Convosco", artista: "Pe. Zezinho", momento: "Paz" },
  "cordeiro-1": { titulo: "Cordeiro de Deus (Advento)", artista: "Pe. José Weber", momento: "Cordeiro" },
  "cordeiro-2": { titulo: "Cordeiro Manso", artista: "Ministério Adoração e Vida", momento: "Cordeiro" },
  "comunhao-1": { titulo: "Vinde, Fiéis", artista: "Tradicional", momento: "Comunhão" },
  "comunhao-2": { titulo: "Ó Vinde, Adoremos", artista: "Tradicional", momento: "Comunhão" },
  "comunhao-3": { titulo: "Pão da Vida", artista: "Comunidade Católica Shalom", momento: "Comunhão" },
  "comunhao-4": { titulo: "Eu Vim Para Que Todos", artista: "Pe. Zezinho", momento: "Comunhão" },
  "acao-gracas-1": { titulo: "Magnificat", artista: "Ir. Miria Kolling", momento: "Ação de Graças" },
  "acao-gracas-2": { titulo: "Graças e Louvores", artista: "Ministério Adoração e Vida", momento: "Ação de Graças" },
  "final-1": { titulo: "Ide Por Todo o Mundo", artista: "Pe. Zezinho", momento: "Final" },
  "final-2": { titulo: "Maria de Nazaré", artista: "Pe. Zezinho", momento: "Final" },
  "final-3": { titulo: "Virgem do Silêncio", artista: "Comunidade Católica Shalom", momento: "Final" },
  "final-4": { titulo: "Ave Maria (Advento)", artista: "Tradicional", momento: "Final" },
};

export default function RepertorioDetalhe() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [notas, setNotas] = useState("");
  const [ordemMusicas, setOrdemMusicas] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Determinar se é ID numérico ou shareId
  const isShareId = params.id && isNaN(Number(params.id));
  const repertorioId = isShareId ? undefined : Number(params.id);
  const shareId = isShareId ? params.id : undefined;

  // Query para repertório por ID
  const { data: repertorioById, isLoading: loadingById } = trpc.repertorios.getById.useQuery(
    { id: repertorioId! },
    { enabled: !!repertorioId }
  );

  // Query para repertório por shareId
  const { data: repertorioByShare, isLoading: loadingByShare } = trpc.repertorios.getByShareId.useQuery(
    { shareId: shareId! },
    { enabled: !!shareId }
  );

  const repertorio = repertorioById || repertorioByShare;
  const isLoading = loadingById || loadingByShare;
  const isOwner = user && repertorio?.userId === user.id;

  const updateOrdemMutation = trpc.repertorios.updateOrdem.useMutation({
    onSuccess: () => {
      toast.success("Ordem salva com sucesso!");
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateNotasMutation = trpc.repertorios.updateNotas.useMutation({
    onSuccess: () => {
      toast.success("Notas salvas!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleShareMutation = trpc.repertorios.toggleShare.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.isPublic && data.shareId) {
        const shareUrl = `${window.location.origin}/repertorio/${data.shareId}`;
        navigator.clipboard.writeText(shareUrl);
        toast.info("Link copiado!");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Inicializar ordem das músicas
  useEffect(() => {
    if (repertorio) {
      const ordem = repertorio.ordemMusicas || repertorio.musicas;
      setOrdemMusicas(ordem);
      setNotas(repertorio.notas || "");
    }
  }, [repertorio]);

  // Handlers de drag-and-drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrdem = [...ordemMusicas];
    const [draggedItem] = newOrdem.splice(draggedIndex, 1);
    newOrdem.splice(index, 0, draggedItem);
    setOrdemMusicas(newOrdem);
    setDraggedIndex(index);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSaveOrdem = () => {
    if (repertorioId && isOwner) {
      updateOrdemMutation.mutate({ id: repertorioId, ordemMusicas });
    }
  };

  const handleSaveNotas = () => {
    if (repertorioId && isOwner) {
      updateNotasMutation.mutate({ id: repertorioId, notas });
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/repertorio/${repertorio?.shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!repertorio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-purple-500/20 max-w-md">
          <CardContent className="py-8 text-center">
            <Music className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">Repertório não encontrado</h3>
            <p className="text-purple-200 mb-4">
              Este repertório não existe ou não está disponível publicamente.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={isOwner ? "/meus-repertorios" : "/"}>
              <a className="text-purple-300 hover:text-purple-200 flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </a>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {repertorio.nome}
                {repertorio.isPublic ? (
                  <Globe className="w-6 h-6 text-green-400" />
                ) : (
                  <Lock className="w-6 h-6 text-purple-400" />
                )}
              </h1>
              {repertorio.descricao && (
                <p className="text-purple-200 mt-1">{repertorio.descricao}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-purple-300 text-sm">
                {repertorio.nomeUsuario && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {repertorio.nomeUsuario}
                  </span>
                )}
                {repertorio.dataCelebracao && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(repertorio.dataCelebracao).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ações do dono */}
          {isOwner && (
            <div className="flex gap-2">
              {hasChanges && (
                <Button
                  onClick={handleSaveOrdem}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={updateOrdemMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Ordem
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => toggleShareMutation.mutate({ id: repertorioId! })}
                className="border-purple-500/30 text-purple-200"
              >
                {repertorio.isPublic ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Tornar Privado
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </>
                )}
              </Button>
              {repertorio.isPublic && repertorio.shareId && (
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="border-purple-500/30 text-purple-200"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Lista de Músicas com Drag-and-Drop */}
        <Card className="bg-slate-800/50 border-purple-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Músicas ({ordemMusicas.length})
              {isOwner && (
                <span className="text-purple-400 text-sm font-normal ml-2">
                  (arraste para reordenar)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ordemMusicas.map((musicaId, index) => {
                const musica = musicasData[musicaId] || {
                  titulo: musicaId,
                  artista: "Desconhecido",
                  momento: "Outro",
                };
                return (
                  <div
                    key={musicaId}
                    draggable={isOwner ? true : false}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 rounded-lg bg-purple-900/30 border border-purple-500/20 ${
                      isOwner ? "cursor-grab active:cursor-grabbing" : ""
                    } ${draggedIndex === index ? "opacity-50" : ""}`}
                  >
                    {isOwner && (
                      <GripVertical className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    )}
                    <span className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-200 text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{musica.titulo}</p>
                      <p className="text-purple-300 text-sm truncate">{musica.artista}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-purple-600/30 text-purple-200 text-xs flex-shrink-0">
                      {musica.momento}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        {(isOwner || repertorio.notas) && (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Notas e Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <div className="space-y-3">
                  <Textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Adicione observações, lembretes ou instruções para este repertório..."
                    className="bg-slate-700 border-purple-500/30 text-white min-h-[100px]"
                  />
                  <Button
                    onClick={handleSaveNotas}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                    disabled={updateNotasMutation.isPending}
                  >
                    {updateNotasMutation.isPending ? "Salvando..." : "Salvar Notas"}
                  </Button>
                </div>
              ) : (
                <p className="text-purple-200 whitespace-pre-wrap">{repertorio.notas}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
