import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Youtube, Guitar, Sparkles, Church, Filter } from "lucide-react";
import { repertorio, type MomentoMissa } from "@/data/repertorio";

export default function Home() {
  const [momentoSelecionado, setMomentoSelecionado] = useState<string | null>(null);

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
            <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30 shadow-lg shadow-primary/20">
              <Church className="w-10 h-10 md:w-12 md:h-12 text-primary" />
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
          <p className="text-base text-muted-foreground max-w-2xl">
            Músicas litúrgicas cuidadosamente selecionadas e organizadas por momentos da Santa Missa
          </p>
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
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <Church className="w-6 h-6 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">Repertório Católico</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Repertório criado em 13 de novembro de 2025</p>
              <p>Última atualização: 16 de novembro de 2025</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 pt-4 border-t border-border/30 mt-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Para a maior glória de Deus</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
