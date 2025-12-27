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
  Calendar,
  FileText,
  Link as LinkIcon,
  Lock,
  Globe,
  User,
  Save,
  Download,
  Youtube,
  Guitar,
} from "lucide-react";
import { Link } from "wouter";
import { repertorioCompleto } from "@/data/repertorioCompleto";

// Criar mapa de músicas a partir do repertorioCompleto.ts para acesso rápido
const musicasMap: Record<string, { titulo: string; artista: string; momento: string; youtube: string; cifra: string; observacao?: string }> = {};

repertorioCompleto.forEach((momento) => {
  momento.musicas.forEach((musica) => {
    const musicaId = `${momento.id}-${musica.numero}`;
    musicasMap[musicaId] = {
      titulo: musica.titulo,
      artista: musica.artista,
      momento: momento.titulo,
      youtube: musica.youtube,
      cifra: musica.cifra,
      observacao: musica.observacao,
    };
  });
});

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

  const repertorioData = repertorioById || repertorioByShare;
  const isLoading = loadingById || loadingByShare;

  // Verificar se o usuário é dono do repertório
  const isOwner = user && repertorioData?.userId === user.id;

  // Mutations
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
      if (data.isPublic) {
        toast.success("Repertório compartilhado!");
      } else {
        toast.success("Repertório agora é privado");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Inicializar estados quando dados carregam
  useEffect(() => {
    if (repertorioData) {
      setNotas(repertorioData.notas || "");
      setOrdemMusicas(repertorioData.ordemMusicas || repertorioData.musicas || []);
    }
  }, [repertorioData]);

  // Drag and drop handlers
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
    const shareUrl = `${window.location.origin}/repertorio/${repertorioData?.shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  const exportPDFMutation = trpc.repertorios.exportPDF.useMutation({
    onSuccess: (data) => {
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("PDF gerado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar PDF");
    },
  });

  const handleExportPDF = () => {
    if (!repertorioId) {
      toast.error("ID do repertório não encontrado");
      return;
    }
    exportPDFMutation.mutate({ id: repertorioId });
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!repertorioData) {
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
                {repertorioData.nome}
                {repertorioData.isPublic ? (
                  <Globe className="w-6 h-6 text-green-400" />
                ) : (
                  <Lock className="w-6 h-6 text-purple-400" />
                )}
              </h1>
              {repertorioData.descricao && (
                <p className="text-purple-200 mt-1">{repertorioData.descricao}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-purple-300 text-sm">
                {repertorioData.nomeUsuario && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {repertorioData.nomeUsuario}
                  </span>
                )}
                {repertorioData.dataCelebracao && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(repertorioData.dataCelebracao).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 flex-wrap">
            {/* Botão Exportar PDF (sempre visível) */}
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={exportPDFMutation.isPending}
              className="border-purple-500/30 text-purple-200 hover:bg-purple-600/30"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportPDFMutation.isPending ? "Gerando..." : "Exportar PDF"}
            </Button>

            {/* Ações do dono */}
            {isOwner && (
              <>
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
                  {repertorioData.isPublic ? (
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
                {repertorioData.isPublic && repertorioData.shareId && (
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="border-purple-500/30 text-purple-200"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copiar Link
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Lista de Músicas com Drag-and-Drop */}
        <Card className="bg-slate-800/50 border-purple-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Músicas ({ordemMusicas.length})
              {isOwner && (
                <span className="text-sm font-normal text-purple-300 ml-2">
                  (arraste para reordenar)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ordemMusicas.map((musicaId, index) => {
                const musica = musicasMap[musicaId];
                if (!musica) return null;

                return (
                  <div
                    key={musicaId}
                    draggable={isOwner || false}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-4 rounded-lg bg-slate-700/50 border border-purple-500/20 ${
                      isOwner ? "cursor-grab active:cursor-grabbing" : ""
                    } ${draggedIndex === index ? "opacity-50" : ""}`}
                  >
                    {isOwner && (
                      <GripVertical className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{musica.titulo}</p>
                      <p className="text-purple-300 text-sm">{musica.artista}</p>
                      <p className="text-purple-400 text-xs mt-1">{musica.momento}</p>
                      {musica.observacao && (
                        <p className="text-purple-500 text-xs mt-1">{musica.observacao}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {musica.youtube && (
                        <a
                          href={musica.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 transition-colors"
                          title="Ver no YouTube"
                        >
                          <Youtube className="w-4 h-4 text-red-400" />
                        </a>
                      )}
                      {musica.cifra && (
                        <a
                          href={musica.cifra}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-orange-600/20 hover:bg-orange-600/40 transition-colors"
                          title="Ver cifra"
                        >
                          <Guitar className="w-4 h-4 text-orange-400" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notas (apenas para dono) */}
        {isOwner && (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Adicione observações sobre este repertório..."
                className="bg-slate-700/50 border-purple-500/30 text-white min-h-[100px]"
              />
              <Button
                onClick={handleSaveNotas}
                disabled={updateNotasMutation.isPending}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateNotasMutation.isPending ? "Salvando..." : "Salvar Notas"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
