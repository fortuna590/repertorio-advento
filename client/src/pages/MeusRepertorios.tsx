import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Link as LinkIcon,
  Lock,
  Globe,
  ArrowLeft,
  Eye,
  Search,
  SlidersHorizontal,
  X,
  Tag,
} from "lucide-react";
import { Link } from "wouter";

export default function MeusRepertorios() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "musicas">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  // Extrair todas as tags únicas dos repertórios
  const allTags = useMemo(() => {
    if (!repertorios) return [];
    const tagsSet = new Set<string>();
    repertorios.forEach((rep) => {
      if (rep.tags) {
        try {
          const tags = JSON.parse(rep.tags);
          if (Array.isArray(tags)) {
            tags.forEach((tag) => tagsSet.add(tag));
          }
        } catch (e) {
          // Ignora erros de parse
        }
      }
    });
    return Array.from(tagsSet).sort();
  }, [repertorios]);

  // Filtrar e ordenar repertórios
  const filteredRepertorios = useMemo(() => {
    if (!repertorios) return [];

    let filtered = [...repertorios];

    // Filtro de busca por nome
    if (searchTerm) {
      filtered = filtered.filter((rep) =>
        rep.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rep.descricao && rep.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((rep) => {
        if (!rep.tags) return false;
        try {
          const tags = JSON.parse(rep.tags);
          return Array.isArray(tags) && tags.includes(selectedTag);
        } catch (e) {
          return false;
        }
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "name") {
        comparison = a.nome.localeCompare(b.nome);
      } else if (sortBy === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "musicas") {
        comparison = (a.quantidadeMusicas || 0) - (b.quantidadeMusicas || 0);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [repertorios, searchTerm, selectedTag, sortBy, sortOrder]);

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag("all");
    setSortBy("date");
    setSortOrder("desc");
  };

  const hasActiveFilters = searchTerm || selectedTag !== "all" || sortBy !== "date" || sortOrder !== "desc";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
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
                {filteredRepertorios.length} de {repertorios?.length || 0} repertório(s)
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

        {/* Filtros e Busca */}
        {repertorios && repertorios.length > 0 && (
          <Card className="bg-slate-800/50 border-purple-500/20 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-5 h-5 text-purple-300" />
                <h3 className="text-lg font-semibold text-white">Filtros e Busca</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="ml-auto text-purple-300 hover:text-purple-100"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Campo de busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-300"
                  />
                </div>

                {/* Filtro por tag */}
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                    <Tag className="w-4 h-4 mr-2 text-purple-400" />
                    <SelectValue placeholder="Todas as tags" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/20">
                    <SelectItem value="all" className="text-white hover:bg-purple-600/20">
                      Todas as tags
                    </SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag} className="text-white hover:bg-purple-600/20">
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Ordenar por */}
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/20">
                    <SelectItem value="date" className="text-white hover:bg-purple-600/20">
                      Data de criação
                    </SelectItem>
                    <SelectItem value="name" className="text-white hover:bg-purple-600/20">
                      Nome (A-Z)
                    </SelectItem>
                    <SelectItem value="musicas" className="text-white hover:bg-purple-600/20">
                      Número de músicas
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Ordem */}
                <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                  <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                    <SelectValue placeholder="Ordem" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/20">
                    <SelectItem value="desc" className="text-white hover:bg-purple-600/20">
                      Decrescente
                    </SelectItem>
                    <SelectItem value="asc" className="text-white hover:bg-purple-600/20">
                      Crescente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

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
        ) : filteredRepertorios.length === 0 ? (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="py-16 text-center">
              <Search className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-purple-200 mb-6">
                Tente ajustar os filtros ou limpar a busca
              </p>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-purple-500/30 text-purple-200 hover:bg-purple-600/20"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRepertorios.map((rep) => {
              // Parse tags
              let tags: string[] = [];
              if (rep.tags) {
                try {
                  tags = JSON.parse(rep.tags);
                } catch (e) {
                  // Ignora erros
                }
              }

              return (
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
                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {tags.slice(0, 3).map((tag, idx) => {
                              // Cores variadas para as tags
                              const colors = [
                                "bg-purple-600/30 text-purple-200 border-purple-500/40",
                                "bg-pink-600/30 text-pink-200 border-pink-500/40",
                                "bg-blue-600/30 text-blue-200 border-blue-500/40",
                                "bg-green-600/30 text-green-200 border-green-500/40",
                                "bg-orange-600/30 text-orange-200 border-orange-500/40",
                                "bg-cyan-600/30 text-cyan-200 border-cyan-500/40",
                              ];
                              const colorClass = colors[idx % colors.length];
                              
                              return (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </span>
                              );
                            })}
                            {tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-700/50 text-purple-300 text-xs border border-purple-500/30">
                                +{tags.length - 3}
                              </span>
                            )}
                          </div>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
