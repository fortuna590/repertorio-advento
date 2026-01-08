import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Heart, Music, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ModernHeader from "@/components/ModernHeader";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MinhasFavoritasUnificadas() {
  const [filtroTipo, setFiltroTipo] = useState<"todas" | "padrao" | "admin">("todas");

  // Queries
  const favoritasPadraoQuery = (trpc as any).favoritos.list.useQuery();
  const favoritasAdminQuery = (trpc as any).musicasAdminFavoritas.list.useQuery();

  // Mutations
  const removeFavoritaPadraoMutation = (trpc as any).favoritos.remove.useMutation();
  const removeFavoritaAdminMutation = (trpc as any).musicasAdminFavoritas.remove.useMutation();

  const favoritasPadrao = favoritasPadraoQuery.data || [];
  const favoritasAdmin = favoritasAdminQuery.data || [];

  // Formatar favoritas padrão
  const favoritasPadraoFormatadas = favoritasPadrao.map((fav: any) => ({
    id: fav.id,
    titulo: fav.musicaTitulo,
    artista: fav.musicaArtista,
    tipo: "padrao",
    createdAt: fav.createdAt,
  }));

  // Formatar favoritas admin
  const favoritasAdminFormatadas = favoritasAdmin.map((fav: any) => ({
    id: fav.id,
    titulo: fav.musica?.titulo || "Música sem título",
    artista: fav.musica?.artista || "Artista desconhecido",
    tipo: "admin",
    createdAt: fav.createdAt,
    musicaId: fav.musicaRepertorioId,
  }));

  // Combinar e filtrar
  const todasAsFavoritas = [...favoritasPadraoFormatadas, ...favoritasAdminFormatadas];
  const favoritasFiltradas = todasAsFavoritas.filter((fav) => {
    if (filtroTipo === "todas") return true;
    return fav.tipo === filtroTipo;
  });

  const handleRemoveFavoritaPadrao = async (id: number) => {
    try {
      await removeFavoritaPadraoMutation.mutateAsync({ id });
      toast.success("Removida dos favoritos");
      favoritasPadraoQuery.refetch();
    } catch (error) {
      toast.error("Erro ao remover favorita");
    }
  };

  const handleRemoveFavoritaAdmin = async (musicaId: number) => {
    try {
      await removeFavoritaAdminMutation.mutateAsync({ musicaRepertorioId: musicaId });
      toast.success("Removida dos favoritos");
      favoritasAdminQuery.refetch();
    } catch (error) {
      toast.error("Erro ao remover favorita");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
      <ModernHeader />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/repertorios">
            <Button variant="ghost" className="gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              <h1 className="text-4xl font-bold text-white">Minhas Favoritas</h1>
            </div>
            <p className="text-purple-200 text-lg">
              Todas as suas músicas favoritas em um só lugar
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={filtroTipo === "todas" ? "default" : "outline"}
              onClick={() => setFiltroTipo("todas")}
              size="sm"
            >
              Todas ({todasAsFavoritas.length})
            </Button>
            <Button
              variant={filtroTipo === "padrao" ? "default" : "outline"}
              onClick={() => setFiltroTipo("padrao")}
              size="sm"
            >
              Padrão ({favoritasPadraoFormatadas.length})
            </Button>
            <Button
              variant={filtroTipo === "admin" ? "default" : "outline"}
              onClick={() => setFiltroTipo("admin")}
              size="sm"
            >
              Personalizadas ({favoritasAdminFormatadas.length})
            </Button>
          </div>
        </div>

        {/* Lista de Favoritas */}
        {favoritasFiltradas.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritasFiltradas.map((fav) => (
              <Card
                key={`${fav.tipo}-${fav.id}`}
                className="bg-slate-800 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white truncate text-lg">
                        {fav.titulo}
                      </CardTitle>
                      {fav.artista && (
                        <CardDescription className="text-purple-300 truncate">
                          {fav.artista}
                        </CardDescription>
                      )}
                    </div>
                    <Badge
                      variant={fav.tipo === "admin" ? "secondary" : "default"}
                      className={fav.tipo === "admin" ? "bg-orange-500/20 text-orange-200" : ""}
                    >
                      {fav.tipo === "admin" ? "Personalizada" : "Padrão"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        fav.tipo === "admin"
                          ? handleRemoveFavoritaAdmin(fav.musicaId)
                          : handleRemoveFavoritaPadrao(fav.id)
                      }
                      className="flex-1 gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Nenhuma favorita ainda</h3>
            <p className="text-purple-200 mb-6">
              {filtroTipo === "todas"
                ? "Comece a adicionar músicas aos seus favoritos!"
                : `Nenhuma música ${filtroTipo === "admin" ? "personalizada" : "padrão"} nos favoritos`}
            </p>
            <Link href="/repertorios">
              <Button className="gap-2">
                <Music className="w-4 h-4" />
                Explorar Repertórios
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
