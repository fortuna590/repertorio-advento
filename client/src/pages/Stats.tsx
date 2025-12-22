import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Music, Youtube, Guitar, ArrowLeft, RefreshCw, Flame, Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Stats() {
  const [period, setPeriod] = useState<1 | 7 | 30>(7);
  const [filterType, setFilterType] = useState<"all" | "youtube" | "cifra">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Query com período dinâmico
  const { data: stats, isLoading, refetch } = trpc.clicks.getStatsByPeriod.useQuery(
    { days: period },
    { refetchInterval: autoRefresh ? 5000 : false }
  );

  // Filtrar dados por tipo de link
  const filteredClicksByType = stats?.clicksByType || [];
  const filteredClicksByMusica = (stats?.clicksByMusica || []).filter(item => 
    filterType === "all" ? true : item.linkType === filterType
  );
  const filteredTopMusicas = (stats?.topMusicas || []).filter(item => 
    filterType === "all" ? true : item.linkType === filterType
  );

  // Calcular percentuais
  const totalClicks = stats?.totalClicks || 0;
  const youtubeClicks = filteredClicksByType.find(c => c.type === "youtube")?.count || 0;
  const cifraClicks = filteredClicksByType.find(c => c.type === "cifra")?.count || 0;
  const youtubePercent = totalClicks > 0 ? ((youtubeClicks / totalClicks) * 100).toFixed(1) : 0;
  const cifraPercent = totalClicks > 0 ? ((cifraClicks / totalClicks) * 100).toFixed(1) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <BarChart3 className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
          <p className="text-purple-200">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/repertorio">
            <Button variant="ghost" size="sm" className="mb-4 text-purple-200 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Repertório
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Estatísticas de Acesso
                </h1>
                <p className="text-purple-300 mt-1">
                  Análise em tempo real dos cliques no repertório
                </p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-5 h-5 text-purple-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Controles */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Período */}
          <Card className="border-purple-500/30 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-lg">Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {[1, 7, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setPeriod(days as 1 | 7 | 30)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      period === days
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-purple-200 hover:bg-slate-600"
                    }`}
                  >
                    {days === 1 ? "Hoje" : days === 7 ? "7 dias" : "30 dias"}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filtro */}
          <Card className="border-purple-500/30 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-lg">Filtrar por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {[
                  { value: "all" as const, label: "Todos" },
                  { value: "youtube" as const, label: "YouTube" },
                  { value: "cifra" as const, label: "Cifra" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterType === option.value
                        ? "bg-pink-600 text-white"
                        : "bg-slate-700 text-purple-200 hover:bg-slate-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto-refresh Toggle */}
        <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <input
            type="checkbox"
            id="autorefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="autorefresh" className="text-purple-200 cursor-pointer">
            Atualizar automaticamente a cada 5 segundos
          </label>
        </div>

        {/* Total de Cliques */}
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-pink-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Total de Cliques
            </CardTitle>
            <CardDescription>Período: {period === 1 ? "Hoje" : `Últimos ${period} dias`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-purple-300 mb-4">
              {totalClicks}
            </div>
            <p className="text-sm text-purple-200">
              {youtubeClicks > cifraClicks ? "YouTube" : "Cifra"} é o mais acessado
            </p>
          </CardContent>
        </Card>

        {/* Cliques por Tipo */}
        <Card className="border-purple-500/30 bg-slate-800/50">
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
            <div className="space-y-6">
              {/* YouTube */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-white">YouTube</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-500/30 text-red-200">{youtubeClicks} cliques</Badge>
                    <span className="text-sm font-semibold text-red-400">{youtubePercent}%</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
                    style={{ width: `${youtubePercent}%` }}
                  />
                </div>
              </div>

              {/* Cifra */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Guitar className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">Cifra</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-500/30 text-purple-200">{cifraClicks} cliques</Badge>
                    <span className="text-sm font-semibold text-purple-400">{cifraPercent}%</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all duration-500"
                    style={{ width: `${cifraPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Momentos Mais Acessados */}
        <Card className="border-purple-500/30 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Top 10 Momentos da Missa
            </CardTitle>
            <CardDescription>
              Momentos litúrgicos com maior número de acessos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.topMomentos || []).map((item, index) => (
                <div
                  key={item.momentoId}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-transparent border border-purple-500/20 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50">
                      <span className="text-sm font-bold text-purple-300">#{index + 1}</span>
                    </div>
                    <span className="font-medium text-white">{item.momentoTitulo}</span>
                  </div>
                  <Badge className="bg-purple-500/30 text-purple-200 font-semibold">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Músicas Mais Acessadas */}
        <Card className="border-purple-500/30 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Top 10 Músicas Mais Acessadas
            </CardTitle>
            <CardDescription>
              Músicas com maior número de cliques
              {filterType !== "all" && ` (${filterType === "youtube" ? "YouTube" : "Cifra"})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTopMusicas.length > 0 ? (
                filteredTopMusicas.map((item, index) => (
                  <div
                    key={`${item.musicaId}-${item.linkType}`}
                    className="flex items-start justify-between p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-900/20 transition-all"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shrink-0 mt-1">
                        <span className="text-xs font-bold text-white">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{item.musicaTitulo}</div>
                        <div className="text-sm text-purple-300 truncate">{item.musicaArtista}</div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs bg-purple-500/30 text-purple-200">
                            {item.momentoTitulo}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              item.linkType === "youtube"
                                ? "border-red-500/50 text-red-400"
                                : "border-purple-500/50 text-purple-300"
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
                    <Badge className="shrink-0 ml-3 bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
                      {item.count}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-purple-300">
                  Nenhum dado disponível para o filtro selecionado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="pt-4 border-t border-purple-500/20">
              <p className="text-sm text-purple-300">
                Uma produção de{" "}
                <span className="font-semibold text-purple-200">LouvaMais</span>
              </p>
              <p className="text-xs text-purple-400/60 mt-1">
                © 2025 LouvaMais. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
