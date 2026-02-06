import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  FileText,
  Link as LinkIcon,
  Lock,
  Globe,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { Link } from "wouter";

export default function MeusRepertorios() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: repertorios, isLoading, refetch } = trpc.repertoriosPersonalizados.listMeus.useQuery();

  const toggleShareMutation = trpc.repertoriosPersonalizados.toggleShare.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.isPublic && data.shareId) {
        const shareUrl = `${window.location.origin}/repertorio-personalizado/${data.shareId}`;
        navigator.clipboard.writeText(shareUrl);
        toast.info("Link copiado para a área de transferência!");
      }
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const duplicateMutation = trpc.repertoriosPersonalizados.duplicar.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.repertoriosPersonalizados.excluir.useMutation({
    onSuccess: () => {
      toast.success("Repertório deletado com sucesso!");
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
    const shareUrl = `${window.location.origin}/repertorio-personalizado/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  const handleDelete = (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar "${nome}"?`)) {
      deleteMutation.mutate({ id });
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
          <div className="w-full sm:w-auto">
            <Link href="/repertorio-personalizado/novo" className="w-full sm:w-auto">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Repertório
              </Button>
            </Link>
          </div>
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
              <Link href="/repertorio-personalizado/novo">
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
                className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-white flex items-center gap-2 mb-1">
                        <span className="truncate">{rep.nome}</span>
                        {rep.isPublic ? (
                          <Globe className="w-4 h-4 text-green-400 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-purple-400 shrink-0" />
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
                        <Button variant="ghost" size="icon" className="text-purple-300 hover:text-purple-100 shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-purple-500/20">
                        <DropdownMenuItem
                          className="text-white hover:bg-purple-600/20 cursor-pointer"
                          onClick={() => navigate(`/repertorio-personalizado/${rep.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-purple-600/20 cursor-pointer"
                          onClick={() => navigate(`/repertorio-personalizado/${rep.id}/editar`)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-purple-500/20" />
                        <DropdownMenuItem
                          className="text-white hover:bg-purple-600/20 cursor-pointer"
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
                            className="text-white hover:bg-purple-600/20 cursor-pointer"
                            onClick={() => handleCopyLink(rep.shareId!)}
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Copiar Link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-white hover:bg-purple-600/20 cursor-pointer"
                          onClick={() => duplicateMutation.mutate({ id: rep.id })}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-purple-500/20" />
                        <DropdownMenuItem
                          className="text-red-400 hover:bg-red-600/20 cursor-pointer"
                          onClick={() => handleDelete(rep.id, rep.nome)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contador de músicas */}
                  <div className="flex items-center gap-2 text-purple-200 text-sm">
                    <Music className="w-4 h-4" />
                    <span>{rep.quantidadeMusicas || 0} música(s)</span>
                  </div>

                  {/* Descrição preview */}
                  {rep.descricao && (
                    <div className="bg-purple-900/30 rounded-lg p-3">
                      <p className="text-purple-200 text-sm line-clamp-3">
                        {rep.descricao}
                      </p>
                    </div>
                  )}

                  {/* Data de criação */}
                  <p className="text-purple-400 text-xs">
                    Criado em {new Date(rep.createdAt).toLocaleDateString("pt-BR")}
                  </p>

                  {/* Botão de visualizar */}
                  <Link href={`/repertorio-personalizado/${rep.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-600/20 hover:border-purple-500/50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
