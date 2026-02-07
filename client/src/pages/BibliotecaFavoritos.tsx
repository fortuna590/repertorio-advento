import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Heart, Music, Plus, Trash2, Youtube, Guitar, Search, X } from "lucide-react";
import { useLocation } from "wouter";

export default function BibliotecaFavoritos() {
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busca, setBusca] = useState("");
  
  // Formulário de nova música favorita
  const [novaMusica, setNovaMusica] = useState({
    titulo: "",
    artista: "",
    tom: "",
    linkCifra: "",
    linkYoutube: "",
    momento: "",
  });

  // Query para listar favoritos
  const { data: favoritos = [], isLoading, refetch } = trpc.musicasFavoritas.listar.useQuery();

  // Mutation para adicionar
  const adicionarMutation = trpc.musicasFavoritas.adicionar.useMutation({
    onSuccess: () => {
      toast.success("Música adicionada aos favoritos!");
      refetch();
      setDialogOpen(false);
      setNovaMusica({
        titulo: "",
        artista: "",
        tom: "",
        linkCifra: "",
        linkYoutube: "",
        momento: "",
      });
    },
    onError: (error) => {
      toast.error("Erro ao adicionar música: " + error.message);
    },
  });

  // Mutation para remover
  const removerMutation = trpc.musicasFavoritas.remover.useMutation({
    onSuccess: () => {
      toast.success("Música removida dos favoritos!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover música: " + error.message);
    },
  });

  const handleAdicionarFavorito = () => {
    if (!novaMusica.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    adicionarMutation.mutate(novaMusica);
  };

  const handleRemoverFavorito = (id: number) => {
    if (confirm("Deseja realmente remover esta música dos favoritos?")) {
      removerMutation.mutate({ id });
    }
  };

  // Filtrar favoritos por busca
  const favoritosFiltrados = favoritos.filter((fav) => {
    const searchLower = busca.toLowerCase();
    return (
      fav.titulo.toLowerCase().includes(searchLower) ||
      (fav.artista && fav.artista.toLowerCase().includes(searchLower)) ||
      (fav.momento && fav.momento.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="p-4 rounded-2xl bg-pink-500/20 backdrop-blur-sm border border-pink-500/30 shadow-lg shadow-pink-500/20">
              <Heart className="w-10 h-10 md:w-12 md:h-12 text-pink-500 fill-pink-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 tracking-tight">
                Biblioteca de Favoritos
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Suas músicas favoritas em um só lugar
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        {/* Barra de ações */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, artista ou momento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 pr-10"
            />
            {busca && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setBusca("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Botão adicionar */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Música
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Música aos Favoritos</DialogTitle>
                <DialogDescription>
                  Preencha as informações da música que deseja adicionar à sua biblioteca
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="Nome da música"
                    value={novaMusica.titulo}
                    onChange={(e) => setNovaMusica({ ...novaMusica, titulo: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artista">Artista</Label>
                  <Input
                    id="artista"
                    placeholder="Nome do artista ou ministério"
                    value={novaMusica.artista}
                    onChange={(e) => setNovaMusica({ ...novaMusica, artista: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tom">Tom</Label>
                  <Input
                    id="tom"
                    placeholder="Ex: C, Dm, F#"
                    value={novaMusica.tom}
                    onChange={(e) => setNovaMusica({ ...novaMusica, tom: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="momento">Momento (opcional)</Label>
                  <Input
                    id="momento"
                    placeholder="Ex: Entrada, Comunhão, Final"
                    value={novaMusica.momento}
                    onChange={(e) => setNovaMusica({ ...novaMusica, momento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkCifra">Link da Cifra</Label>
                  <Input
                    id="linkCifra"
                    placeholder="https://www.cifraclub.com.br/..."
                    value={novaMusica.linkCifra}
                    onChange={(e) => setNovaMusica({ ...novaMusica, linkCifra: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkYoutube">Link do YouTube</Label>
                  <Input
                    id="linkYoutube"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={novaMusica.linkYoutube}
                    onChange={(e) => setNovaMusica({ ...novaMusica, linkYoutube: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAdicionarFavorito}
                  disabled={adicionarMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {adicionarMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de favoritos */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando favoritos...</p>
          </div>
        ) : favoritosFiltrados.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-semibold text-muted-foreground mb-2">
                {busca ? "Nenhuma música encontrada" : "Nenhuma música favorita ainda"}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {busca
                  ? "Tente buscar por outro termo"
                  : "Adicione suas músicas favoritas para acessá-las rapidamente"}
              </p>
              {!busca && (
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Música
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {favoritosFiltrados.map((favorito) => (
              <Card
                key={favorito.id}
                className="group hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 border-border/50 bg-card/80 backdrop-blur-sm hover:border-pink-500/50 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-pink-500/20 group-hover:bg-pink-500/30 transition-colors">
                          <Music className="w-4 h-4 text-pink-500" />
                        </div>
                        <span className="truncate">{favorito.titulo}</span>
                      </CardTitle>
                      {favorito.artista && (
                        <CardDescription className="text-sm truncate">
                          {favorito.artista}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoverFavorito(favorito.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {favorito.tom && (
                      <span className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground">
                        Tom: {favorito.tom}
                      </span>
                    )}
                    {favorito.momento && (
                      <span className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                        {favorito.momento}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 pt-0">
                  {favorito.linkYoutube && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
                      asChild
                    >
                      <a href={favorito.linkYoutube} target="_blank" rel="noopener noreferrer">
                        <Youtube className="w-4 h-4" />
                        <span className="truncate">Escutar no YouTube</span>
                      </a>
                    </Button>
                  )}
                  {favorito.linkCifra && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300"
                      asChild
                    >
                      <a href={favorito.linkCifra} target="_blank" rel="noopener noreferrer">
                        <Guitar className="w-4 h-4" />
                        <span className="truncate">Ver Cifra</span>
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
