import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Youtube, Guitar, Search, FileDown, Printer, Music } from "lucide-react";
import ModernHeader from "@/components/ModernHeader";
import FavoriteButton from "@/components/FavoriteButton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function MinhasFavoritas() {
  const [, navigate] = useLocation();
  const [buscaTexto, setBuscaTexto] = useState("");
  
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: favoritos, isLoading: favoritosLoading } = trpc.favoritos.list.useQuery();

  // Redirect if not logged in
  if (!userLoading && !user) {
    navigate("/login");
    return null;
  }

  const favoritosFiltrados = favoritos?.filter((fav) => {
    if (!buscaTexto) return true;
    const busca = buscaTexto.toLowerCase();
    return (
      fav.titulo.toLowerCase().includes(busca) ||
      (fav.artista && fav.artista.toLowerCase().includes(busca))
    );
  });

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert("Exportação em PDF em breve!");
  };

  const handlePrint = () => {
    window.print();
  };

  if (userLoading || favoritosLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
        <ModernHeader />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-700 rounded-lg"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <Heart className="w-10 h-10 fill-pink-500 text-pink-500" />
                Minhas Favoritas
              </h1>
              <p className="text-purple-200">
                {favoritos?.length || 0} música{favoritos?.length !== 1 ? "s" : ""} salva{favoritos?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                className="gap-2 border-purple-500/30 text-purple-200 hover:bg-purple-600/30"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-purple-500/30 text-purple-200 hover:bg-purple-600/30"
                onClick={handleExportPDF}
              >
                <FileDown className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar nas favoritas..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className="pl-10 bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Empty State */}
        {(!favoritos || favoritos.length === 0) && (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Nenhuma música favorita ainda
              </h3>
              <p className="text-purple-200 mb-6">
                Explore o repertório e clique no coração para salvar suas músicas preferidas
              </p>
              <Button
                onClick={() => navigate("/repertorio")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Music className="w-4 h-4 mr-2" />
                Explorar Repertório
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Favoritos Grid */}
        {favoritosFiltrados && favoritosFiltrados.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritosFiltrados.map((favorito) => (
              <Card
                key={favorito.id}
                className="bg-slate-800/50 border-purple-500/20 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white mb-2 line-clamp-2">
                        {favorito.titulo}
                      </CardTitle>
                      <CardDescription className="text-purple-300">
                        {favorito.artista}
                      </CardDescription>
                    </div>
                    <FavoriteButton
                      musicaId={favorito.titulo}
                      musicaTitulo={favorito.titulo}
                      musicaArtista={favorito.artista || ""}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="text-purple-400 text-xs">
                    Adicionada em{" "}
                    {new Date(favorito.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  
                  {/* Note: Links would need to be stored in favorites or fetched from repertorio data */}
                  <div className="pt-2 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 border-purple-500/30 text-purple-200 hover:bg-purple-600/10"
                      onClick={() => navigate("/repertorio")}
                    >
                      <Music className="w-4 h-4" />
                      <span className="truncate">Ver no Repertório</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {favoritosFiltrados && favoritosFiltrados.length === 0 && favoritos && favoritos.length > 0 && (
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-purple-200">
                Tente buscar por outro termo
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
