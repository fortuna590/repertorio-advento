import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Music, ExternalLink, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ModernHeader from "@/components/ModernHeader";
import { trpc } from "@/lib/trpc";

export default function RepertorioAdminDetalhes() {
  const [, params] = useRoute("/repertorio-admin/:id");
  const repertorioId = params?.id ? parseInt(params.id) : 0;

  // Queries
  const repertorioQuery = (trpc as any).repertorio.getById.useQuery(
    { id: repertorioId },
    { enabled: !!repertorioId }
  );
  const momentosQuery = (trpc as any).repertorio.listMomentos.useQuery(
    { repertorioId },
    { enabled: !!repertorioId }
  );
  const musicasQuery = (trpc as any).repertorio.listMusicasRepertorio.useQuery(
    { repertorioId },
    { enabled: !!repertorioId }
  );

  // Mutation para incrementar visualizações
  const incrementarVisualizacoesMutation = (trpc as any).repertorio.incrementarVisualizacoes.useMutation();

  const repertorio = repertorioQuery.data;
  const momentos = momentosQuery.data || [];
  const musicas = musicasQuery.data || [];

  // Incrementar visualizações ao carregar a página
  useEffect(() => {
    if (repertorioId && repertorio) {
      incrementarVisualizacoesMutation.mutate({ id: repertorioId });
    }
  }, [repertorioId, repertorio]);

  if (repertorioQuery.isLoading || momentosQuery.isLoading || musicasQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!repertorio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
        <ModernHeader />
        <div className="container py-12 text-center">
          <p className="text-gray-300 text-xl">Repertório não encontrado</p>
          <Link href="/repertorios">
            <Button className="mt-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Repertórios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Agrupar músicas por momento
  const musicasPorMomento = momentos.map((momento: any) => ({
    ...momento,
    musicas: musicas.filter((m: any) => m.momentoId === momento.id).sort((a: any, b: any) => a.ordem - b.ordem)
  })).sort((a: any, b: any) => a.ordem - b.ordem);

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom right, ${repertorio.corFundo}, #0f172a, #1e293b)`,
      }}
    >
      <ModernHeader />

      <main className="container py-12 md:py-16">
        {/* Botão Voltar */}
        <div className="mb-8">
          <Link href="/repertorios">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Header do Repertório */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge 
                  variant="outline" 
                  style={{ 
                    backgroundColor: `${repertorio.corPrimaria}20`,
                    borderColor: `${repertorio.corPrimaria}50`,
                    color: repertorio.corTexto
                  }}
                >
                  Personalizado
                </Badge>
                <div className="flex items-center gap-2 text-sm" style={{ color: repertorio.corTexto }}>
                  <Eye className="w-4 h-4" />
                  <span>{repertorio.visualizacoes || 0} visualizações</span>
                </div>
              </div>
              <h1 
                className="text-4xl md:text-5xl font-bold mb-3"
                style={{ color: repertorio.corTexto }}
              >
                {repertorio.nome}
              </h1>
              {repertorio.descricao && (
                <p 
                  className="text-lg opacity-90"
                  style={{ color: repertorio.corTexto }}
                >
                  {repertorio.descricao}
                </p>
              )}
            </div>
          </div>

          {/* Paleta de Cores */}
          <div className="flex gap-2 mt-6">
            <div
              className="w-8 h-8 rounded-lg border-2 border-white/20"
              style={{ backgroundColor: repertorio.corPrimaria }}
              title="Cor Primária"
            />
            <div
              className="w-8 h-8 rounded-lg border-2 border-white/20"
              style={{ backgroundColor: repertorio.corSecundaria }}
              title="Cor Secundária"
            />
            <div
              className="w-8 h-8 rounded-lg border-2 border-white/20"
              style={{ backgroundColor: repertorio.corFundo }}
              title="Cor de Fundo"
            />
          </div>
        </div>

        {/* Momentos da Missa e Músicas */}
        <div className="space-y-8">
          {musicasPorMomento.length > 0 ? (
            musicasPorMomento.map((momento: any) => (
              <Card 
                key={momento.id}
                className="border-2 backdrop-blur-sm"
                style={{
                  backgroundColor: `${repertorio.corFundo}80`,
                  borderColor: `${repertorio.corPrimaria}50`,
                }}
              >
                <CardHeader>
                  <CardTitle 
                    className="text-2xl flex items-center gap-3"
                    style={{ color: repertorio.corPrimaria }}
                  >
                    <Music className="w-6 h-6" />
                    {momento.nome}
                  </CardTitle>
                  {momento.descricao && (
                    <CardDescription style={{ color: `${repertorio.corTexto}90` }}>
                      {momento.descricao}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent>
                  {momento.musicas.length > 0 ? (
                    <div className="space-y-4">
                      {momento.musicas.map((musica: any) => (
                        <div
                          key={musica.id}
                          className="p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            backgroundColor: `${repertorio.corSecundaria}20`,
                            borderColor: `${repertorio.corSecundaria}30`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 
                                className="text-lg font-semibold mb-1"
                                style={{ color: repertorio.corTexto }}
                              >
                                {musica.titulo}
                              </h3>
                              {musica.artista && (
                                <p 
                                  className="text-sm mb-2 opacity-75"
                                  style={{ color: repertorio.corTexto }}
                                >
                                  {musica.artista}
                                </p>
                              )}
                              {musica.descricao && (
                                <p 
                                  className="text-sm mb-3 opacity-70"
                                  style={{ color: repertorio.corTexto }}
                                >
                                  {musica.descricao}
                                </p>
                              )}
                              
                              {/* Links */}
                              <div className="flex flex-wrap gap-2">
                                {musica.linkYoutube && (
                                  <a
                                    href={musica.linkYoutube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
                                    style={{
                                      backgroundColor: `${repertorio.corPrimaria}30`,
                                      color: repertorio.corTexto,
                                    }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    YouTube
                                  </a>
                                )}
                                {musica.linkCifra && (
                                  <a
                                    href={musica.linkCifra}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
                                    style={{
                                      backgroundColor: `${repertorio.corSecundaria}30`,
                                      color: repertorio.corTexto,
                                    }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Cifra
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p 
                      className="text-center py-8 opacity-70"
                      style={{ color: repertorio.corTexto }}
                    >
                      Nenhuma música adicionada neste momento
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center bg-slate-800/50 border-purple-500/20">
              <p className="text-gray-300 text-lg">
                Este repertório ainda não possui momentos da missa configurados
              </p>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20" style={{ backgroundColor: `${repertorio.corFundo}80` }}>
        <div className="container py-8 text-center text-sm" style={{ color: `${repertorio.corTexto}70` }}>
          <p>© 2025 LouvaMais - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
