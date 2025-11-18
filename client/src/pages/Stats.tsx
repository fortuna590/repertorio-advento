import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Music, Youtube, Guitar, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Stats() {
  const { data: stats, isLoading } = trpc.clicks.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BarChart3 className="w-12 h-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Repertório
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Estatísticas de Acesso
              </h1>
              <p className="text-muted-foreground mt-1">
                Análise de cliques nos links do repertório
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-12 space-y-8">
        {/* Total de Cliques */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Total de Cliques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary">
              {stats?.totalClicks || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Cliques registrados desde o lançamento
            </p>
          </CardContent>
        </Card>

        {/* Cliques por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Cliques por Tipo de Link
            </CardTitle>
            <CardDescription>
              Comparação entre acessos ao YouTube e Cifra Club
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.clicksByType.map((item) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.type === "youtube" ? (
                        <Youtube className="w-5 h-5 text-red-500" />
                      ) : (
                        <Guitar className="w-5 h-5 text-primary" />
                      )}
                      <span className="font-medium capitalize">{item.type}</span>
                    </div>
                    <Badge variant="secondary">{item.count} cliques</Badge>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        item.type === "youtube" ? "bg-red-500" : "bg-primary"
                      }`}
                      style={{
                        width: `${(item.count / (stats?.totalClicks || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cliques por Momento da Missa */}
        <Card>
          <CardHeader>
            <CardTitle>Momentos Mais Acessados</CardTitle>
            <CardDescription>
              Distribuição de cliques por momento litúrgico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.clicksByMomento.map((item, index) => (
                <div
                  key={item.momentoId}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{item.momentoTitulo}</span>
                  </div>
                  <Badge>{item.count} cliques</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 20 Músicas Mais Acessadas */}
        <Card>
          <CardHeader>
            <CardTitle>Top 20 Músicas Mais Acessadas</CardTitle>
            <CardDescription>
              Músicas com maior número de cliques nos links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.clicksByMusica.map((item, index) => (
                <div
                  key={`${item.musicaId}-${item.linkType}`}
                  className="flex items-start justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Badge
                      variant={index < 3 ? "default" : "outline"}
                      className="shrink-0 font-mono"
                    >
                      #{index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.musicaTitulo}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.musicaArtista}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {item.momentoTitulo}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            item.linkType === "youtube"
                              ? "border-red-500/50 text-red-500"
                              : "border-primary/50 text-primary"
                          }`}
                        >
                          {item.linkType === "youtube" ? (
                            <Youtube className="w-3 h-3 mr-1" />
                          ) : (
                            <Guitar className="w-3 h-3 mr-1" />
                          )}
                          {item.linkType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className="shrink-0 ml-3">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
