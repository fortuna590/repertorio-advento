import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Music,
  Plus,
  MoreVertical,
  Share2,
  Copy,
  Trash2,
  Edit,
  Calendar,
  FileText,
  Link as LinkIcon,
  Lock,
  Globe,
  ArrowLeft,
  Download,
} from "lucide-react";
import { Link } from "wouter";
import { generateRepertorioPDF } from "@/lib/pdfGenerator";
import { repertorio } from "@/data/repertorio";

export default function MeusRepertorios() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editNotas, setEditNotas] = useState("");

  const { data: repertorios, isLoading, refetch } = trpc.repertorios.listMeus.useQuery();

  const toggleShareMutation = trpc.repertorios.toggleShare.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.isPublic && data.shareId) {
        const shareUrl = `${window.location.origin}/repertorio/${data.shareId}`;
        navigator.clipboard.writeText(shareUrl);
        toast.info("Link copiado para a área de transferência!");
      }
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const duplicateMutation = trpc.repertorios.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.repertorios.delete.useMutation({
    onSuccess: () => {
      toast.success("Repertório deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateNotasMutation = trpc.repertorios.updateNotas.useMutation({
    onSuccess: () => {
      toast.success("Notas atualizadas!");
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Redirect se não autenticado
  if (!authLoading && !user) {
    navigate("/login");
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const handleCopyLink = (shareId: string) => {
    const shareUrl = `${window.location.origin}/repertorio/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  // Criar mapa de músicas a partir do repertorio.ts importado
  const musicasMap: Record<string, { titulo: string; artista: string; momento: string }> = {};
  repertorio.forEach((momento) => {
    momento.musicas.forEach((musica) => {
      const musicaId = `${momento.id}-${musica.numero}`;
      musicasMap[musicaId] = {
        titulo: musica.titulo,
        artista: musica.artista,
        momento: momento.titulo,
      };
    });
  });

  const handleExportPDF = (rep: any) => {
    const musicasIds = rep.musicas || [];
    const musicasComDetalhes = musicasIds.map((musicaId: string) => ({
      id: musicaId,
      titulo: musicasMap[musicaId]?.titulo || musicaId,
      artista: musicasMap[musicaId]?.artista || "Desconhecido",
      momento: musicasMap[musicaId]?.momento || "Outras",
    }));

    generateRepertorioPDF({
      nome: rep.nome,
      descricao: rep.descricao || undefined,
      notas: rep.notas || undefined,
      dataCelebracao: rep.dataCelebracao ? String(rep.dataCelebracao) : undefined,
      musicas: musicasComDetalhes,
      createdAt: rep.createdAt ? String(rep.createdAt) : undefined,
    });

    toast.success("PDF gerado com sucesso!");
  };

  const handleDelete = (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar "${nome}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEditNotas = (id: number, notas: string) => {
    setEditingId(id);
    setEditNotas(notas || "");
  };

  const handleSaveNotas = () => {
    if (editingId) {
      updateNotasMutation.mutate({ id: editingId, notas: editNotas });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link href="/">
              <a className="text-purple-300 hover:text-purple-200 flex items-center gap-2 w-fit">
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </a>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Meus Repertórios</h1>
              <p className="text-purple-200 text-sm sm:text-base">
                {repertorios?.length || 0} repertório(s) criado(s)
              </p>
            </div>
          </div>
          <Link href="/montar-repertorio" className="w-full sm:w-auto">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo Repertório
            </Button>
          </Link>
        </div>

        {/* Lista de Repertórios */}
        {!repertorios || repertorios.length === 0 ? (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="py-16 text-center">
              <Music className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum repertório ainda
              </h3>
              <p className="text-purple-200 mb-6">
                Crie seu primeiro repertório personalizado para celebrações
              </p>
              <Link href="/montar-repertorio">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Repertório
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repertorios.map((rep) => (
              <Card
                key={rep.id}
                className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        {rep.nome}
                        {rep.isPublic ? (
                          <Globe className="w-4 h-4 text-green-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-purple-400" />
                        )}
                      </CardTitle>
                      {rep.descricao && (
                        <p className="text-purple-200 text-sm mt-1 line-clamp-2">
                          {rep.descricao}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-purple-300">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-purple-500/20">
                        <DropdownMenuItem
                          className="text-white hover:bg-purple-600/20"
                          onClick={() => navigate(`/repertorio/${rep.id}/editar`)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-purple-600/20"
                          onClick={() => handleEditNotas(rep.id, rep.notas || "")}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Notas
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-purple-600/20"
                          onClick={() => toggleShareMutation.mutate({ id: rep.id })}
                        >
                          {rep.isPublic ? (
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
                        </DropdownMenuItem>
                        {rep.isPublic && rep.shareId && (
                          <DropdownMenuItem
                            className="text-white hover:bg-purple-600/20"
                            onClick={() => handleCopyLink(rep.shareId!)}
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Copiar Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-white hover:bg-purple-600/20"
                          onClick={() => handleExportPDF(rep)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-purple-600/20"
                          onClick={() => duplicateMutation.mutate({ id: rep.id })}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:bg-red-600/20"
                          onClick={() => handleDelete(rep.id, rep.nome)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Músicas */}
                    <div className="flex items-center gap-2 text-purple-200 text-sm">
                      <Music className="w-4 h-4" />
                      <span>{rep.musicas?.length || 0} música(s)</span>
                    </div>

                    {/* Data da celebração */}
                    {rep.dataCelebracao && (
                      <div className="flex items-center gap-2 text-purple-200 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(rep.dataCelebracao).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}

                    {/* Notas preview */}
                    {rep.notas && (
                      <div className="bg-purple-900/30 rounded p-2 text-purple-200 text-sm line-clamp-2">
                        {rep.notas}
                      </div>
                    )}

                    {/* Data de criação */}
                    <p className="text-purple-400 text-xs">
                      Criado em {new Date(rep.createdAt).toLocaleDateString("pt-BR")}
                    </p>

                    {/* Botão de visualizar */}
                    <Link href={`/repertorio/${rep.id}`}>
                      <Button
                        variant="outline"
                        className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-600/20"
                      >
                        Ver Repertório
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para editar notas */}
        <Dialog open={editingId !== null} onOpenChange={() => setEditingId(null)}>
          <DialogContent className="bg-slate-800 border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Notas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editNotas}
                onChange={(e) => setEditNotas(e.target.value)}
                placeholder="Adicione observações, lembretes ou instruções para este repertório..."
                className="bg-slate-700 border-purple-500/30 text-white min-h-[150px]"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingId(null)}
                  className="border-purple-500/30 text-purple-200"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveNotas}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                  disabled={updateNotasMutation.isPending}
                >
                  {updateNotasMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
