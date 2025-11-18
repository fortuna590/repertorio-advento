import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Youtube, Guitar, Sparkles, Church } from "lucide-react";
import { repertorio, type MomentoMissa } from "@/data/repertorio";

export default function Home() {
  const [momentoSelecionado, setMomentoSelecionado] = useState<string | null>(null);

  const momentoFiltrado = momentoSelecionado
    ? repertorio.find((m) => m.id === momentoSelecionado)
    : null;

  const momentosParaExibir = momentoFiltrado ? [momentoFiltrado] : repertorio;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Church className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Repertório Católico
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                Tempo do Advento
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Músicas litúrgicas organizadas por momentos da Santa Missa
          </p>
        </div>
      </header>

      <main className="container py-8">
        {/* Filtros */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Filtrar por momento da missa
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={momentoSelecionado === null ? "default" : "outline"}
              onClick={() => setMomentoSelecionado(null)}
              size="sm"
            >
              Todos os momentos
            </Button>
            {repertorio.map((momento) => (
              <Button
                key={momento.id}
                variant={momentoSelecionado === momento.id ? "default" : "outline"}
                onClick={() => setMomentoSelecionado(momento.id)}
                size="sm"
              >
                {momento.numero} {momento.titulo}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de Momentos e Músicas */}
        <div className="space-y-8">
          {momentosParaExibir.map((momento) => (
            <section key={momento.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">
                  {momento.numero} {momento.titulo}
                </h2>
                {momento.observacao && (
                  <Badge variant="secondary" className="text-xs">
                    {momento.observacao}
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {momento.musicas.map((musica) => (
                  <Card
                    key={`${momento.id}-${musica.numero}`}
                    className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Music className="w-5 h-5 text-primary" />
                            {musica.titulo}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {musica.artista}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          #{musica.numero}
                        </Badge>
                      </div>
                      {musica.observacao && (
                        <Badge variant="secondary" className="text-xs mt-2 w-fit">
                          {musica.observacao}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {musica.youtube && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2"
                          asChild
                        >
                          <a
                            href={musica.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Youtube className="w-4 h-4 text-red-500" />
                            Escutar no YouTube
                          </a>
                        </Button>
                      )}
                      {musica.cifra && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2"
                          asChild
                        >
                          <a
                            href={musica.cifra}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Guitar className="w-4 h-4 text-primary" />
                            Ver Cifra
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

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm mt-16">
        <div className="container py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Repertório criado em 13 de novembro de 2025
            </p>
            <p className="text-sm text-muted-foreground">
              Última atualização: 16 de novembro de 2025
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
              <Church className="w-4 h-4" />
              <span>Para a maior glória de Deus</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
