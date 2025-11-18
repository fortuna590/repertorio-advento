import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Youtube, Guitar, Sparkles, Church, Filter, BarChart3, Heart } from "lucide-react";
import { APP_LOGO } from "@/const";
import { repertorio, type MomentoMissa } from "@/data/repertorio";

export default function Home() {
  const [momentoSelecionado, setMomentoSelecionado] = useState<string | null>(null);
  const registerClickMutation = trpc.clicks.register.useMutation();

  const handleLinkClick = (musica: any, momento: any, linkType: "youtube" | "cifra") => {
    registerClickMutation.mutate({
      musicaId: `${momento.id}-${musica.numero}`,
      musicaTitulo: musica.titulo,
      musicaArtista: musica.artista,
      momentoId: momento.id,
      momentoTitulo: momento.titulo,
      linkType,
    });
  };

  const momentoFiltrado = momentoSelecionado
    ? repertorio.find((m) => m.id === momentoSelecionado)
    : null;

  const momentosParaExibir = momentoFiltrado ? [momentoFiltrado] : repertorio;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative border-b border-border/50 bg-gradient-to-br from-card via-card/95 to-accent/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container relative py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-primary/20 shadow-lg">
              <img 
                src={APP_LOGO} 
                alt="LouvaMais Logo" 
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 tracking-tight">
                Repertório Católico
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground flex items-center gap-2 flex-wrap">
                <Sparkles className="w-5 h-5 text-secondary" />
                <span>Tempo do Advento</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-sm text-muted-foreground/80">29 músicas litúrgicas</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <p className="text-base text-muted-foreground max-w-2xl">
              Músicas litúrgicas cuidadosamente selecionadas e organizadas por momentos da Santa Missa
            </p>
            <div className="flex gap-2 flex-wrap">
              <Link href="/doacao">
                <Button variant="default" size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <Heart className="w-4 h-4" />
                  Apoie o Projeto
                </Button>
              </Link>
              <Link href="/sobre">
                <Button variant="outline" size="sm" className="gap-2">
                  <Church className="w-4 h-4" />
                  Sobre
                </Button>
              </Link>
              <Link href="/stats">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estatísticas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        {/* Filtros Modernos */}
        <div className="mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent">
              <Filter className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Momentos da Missa
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Button
              variant={momentoSelecionado === null ? "default" : "outline"}
              onClick={() => setMomentoSelecionado(null)}
              size="sm"
              className="rounded-full transition-all duration-300 hover:scale-105"
            >
              Todos os momentos
            </Button>
            {repertorio.map((momento) => (
              <Button
                key={momento.id}
                variant={momentoSelecionado === momento.id ? "default" : "outline"}
                onClick={() => setMomentoSelecionado(momento.id)}
                size="sm"
                className="rounded-full transition-all duration-300 hover:scale-105"
              >
                <span className="hidden sm:inline">{momento.numero}</span>
                <span className="truncate max-w-[150px] sm:max-w-none">{momento.titulo}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de Momentos e Músicas */}
        <div className="space-y-12 md:space-y-16">
          {momentosParaExibir.map((momento) => (
            <section key={momento.id} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  <span className="text-primary">{momento.numero}</span> {momento.titulo}
                </h2>
                {momento.observacao && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs w-fit bg-secondary/20 text-secondary border-secondary/30"
                  >
                    {momento.observacao}
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {momento.musicas.map((musica) => (
                  <Card
                    key={`${momento.id}-${musica.numero}`}
                    className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:-translate-y-1"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base md:text-lg flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                              <Music className="w-4 h-4 text-primary" />
                            </div>
                            <span className="truncate">{musica.titulo}</span>
                          </CardTitle>
                          <CardDescription className="text-sm truncate">
                            {musica.artista}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="shrink-0 bg-accent/50 border-accent text-accent-foreground"
                        >
                          #{musica.numero}
                        </Badge>
                      </div>
                      {musica.observacao && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs mt-3 w-fit bg-secondary/20 text-secondary border-secondary/30"
                        >
                          {musica.observacao}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {musica.youtube && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
                          asChild
                        >
                          <a
                            href={musica.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLinkClick(musica, momento, "youtube")}
                          >
                            <Youtube className="w-4 h-4" />
                            <span className="truncate">Escutar no YouTube</span>
                          </a>
                        </Button>
                      )}
                      {musica.cifra && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300"
                          asChild
                        >
                          <a
                            href={musica.cifra}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLinkClick(musica, momento, "cifra")}
                          >
                            <Guitar className="w-4 h-4" />
                            <span className="truncate">Ver Cifra</span>
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Footer Moderno */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
        <div className="container py-10 md:py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src={APP_LOGO} 
                alt="LouvaMais Logo" 
                className="w-12 h-12 object-contain"
              />
              <span className="text-lg font-semibold text-foreground">Repertório Católico</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Repertório do Tempo do Advento</p>
              <p>29 músicas litúrgicas organizadas por momentos da Santa Missa</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 pt-4 border-t border-border/30">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Para a maior glória de Deus</span>
            </div>
            {/* Redes Sociais */}
            <div className="pt-4 border-t border-border/30">
              <div className="flex items-center justify-center gap-4 mb-4">
                <a
                  href="https://instagram.com/louvamais.solutions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span className="font-medium">@louvamais.solutions</span>
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Uma produção de{" "}
                <span className="font-semibold text-primary">LouvaMais - Church Solutions</span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                © 2025 LouvaMais. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
