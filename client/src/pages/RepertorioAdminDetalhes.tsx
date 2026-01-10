import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Music, ExternalLink, Eye, Loader2, Heart, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { ShareArticle } from "@/components/ShareArticle";
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

  // Mutations
  const incrementarVisualizacoesMutation = (trpc as any).repertorio.incrementarVisualizacoes.useMutation();
  const incrementarCliqueMutation = (trpc as any).repertorio.incrementarCliqueMusica.useMutation();
  const addFavoritaMutation = (trpc as any).musicasAdminFavoritas.add.useMutation();
  const removeFavoritaMutation = (trpc as any).musicasAdminFavoritas.remove.useMutation();

  const handleClickLink = (musicaId: number, tipo: "youtube" | "cifra", url: string) => {
    incrementarCliqueMutation.mutate({ musicaId, tipo });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleToggleFavorite = async (musicaId: number, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await removeFavoritaMutation.mutateAsync({ musicaRepertorioId: musicaId });
        toast.success("Removida dos favoritos");
      } else {
        await addFavoritaMutation.mutateAsync({ musicaRepertorioId: musicaId });
        toast.success("Adicionada aos favoritos");
      }
      musicasQuery.refetch();
    } catch (error) {
      toast.error("Erro ao atualizar favoritos");
    }
  };

  const handleExportarPDF = () => {
    const repertorio = repertorioQuery.data;
    if (!repertorio) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.text(repertorio.nome, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      if (repertorio.descricao) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const descricaoLinhas = doc.splitTextToSize(repertorio.descricao, pageWidth - 20);
        doc.text(descricaoLinhas, 10, yPosition);
        yPosition += descricaoLinhas.length * 5 + 10;
      }

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Tempo Litúrgico: ${repertorio.tempoLiturgico}`, 10, yPosition);
      yPosition += 10;

      momentos.forEach((momento: any) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(momento.nome, 10, yPosition);
        yPosition += 10;

        const musicasMomento = musicas.filter((m: any) => m.momentoId === momento.id);
        musicasMomento.forEach((musica: any) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.text(`• ${musica.titulo}`, 15, yPosition);
          yPosition += 5;

          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          if (musica.artista) {
            doc.text(`  Artista: ${musica.artista}`, 15, yPosition);
            yPosition += 5;
          }

          if (musica.descricao) {
            const descLinhas = doc.splitTextToSize(`  ${musica.descricao}`, pageWidth - 30);
            doc.text(descLinhas, 15, yPosition);
            yPosition += descLinhas.length * 4;
          }

          yPosition += 3;
        });

        yPosition += 5;
      });

      doc.save(`${repertorio.nome}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const repertorio = repertorioQuery.data;
  const momentos = momentosQuery.data || [];
  const musicas = musicasQuery.data || [];

  // Incrementar visualizações ao carregar a página
  useEffect(() => {
    if (repertorioId && repertorio) {
      incrementarVisualizacoesMutation.mutate({ id: repertorioId });
    }
  }, [repertorioId, repertorio]);

  // Adicionar meta tags Open Graph
  useEffect(() => {
    if (repertorio) {
      const currentUrl = window.location.href;
      
      // Atualizar title
      document.title = `${repertorio.nome} | LouvaMais`;
      
      // Remover meta tags antigas
      const oldMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
      oldMetaTags.forEach(tag => tag.remove());
      
      // Adicionar novas meta tags
      const metaTags = [
        { property: 'og:title', content: repertorio.nome },
        { property: 'og:description', content: repertorio.descricao || 'Repertório personalizado de músicas litúrgicas' },
        { property: 'og:url', content: currentUrl },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'LouvaMais' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: repertorio.nome },
        { name: 'twitter:description', content: repertorio.descricao || 'Repertório personalizado de músicas litúrgicas' },
      ];
      
      if (repertorio.imagemCapa) {
        metaTags.push(
          { property: 'og:image', content: repertorio.imagemCapa },
          { name: 'twitter:image', content: repertorio.imagemCapa }
        );
      }
      
      metaTags.forEach(({ property, name, content }) => {
        const meta = document.createElement('meta');
        if (property) meta.setAttribute('property', property);
        if (name) meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      });
    }
  }, [repertorio]);

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
          <div className="flex gap-3 mt-6">
            <Link href="/repertorios">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Repertórios
              </Button>
            </Link>
            <Button onClick={handleExportarPDF} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
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
        {/* Botões de Ação */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/repertorios">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </Link>
          <Button onClick={handleExportarPDF} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
          <ShareArticle
            titulo={repertorio.nome}
            url={typeof window !== 'undefined' ? window.location.href : ''}
            descricao={repertorio.descricao || ''}
            tipo="repertorio"
            repertorioId={repertorio.id}
          />
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
                              
                              {/* Botão de Favoritar */}
                              <div className="mb-3">
                                <button
                                  onClick={() => handleToggleFavorite(musica.id, false)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105"
                                  style={{
                                    backgroundColor: `${repertorio.corPrimaria}20`,
                                    color: repertorio.corTexto,
                                  }}
                                >
                                  <Heart className="w-4 h-4" />
                                  Favoritar
                                </button>
                              </div>

                              {/* Links */}
                              <div className="flex flex-wrap gap-2">
                                {musica.linkYoutube && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleClickLink(musica.id, "youtube", musica.linkYoutube);
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                                    style={{
                                      backgroundColor: `${repertorio.corPrimaria}30`,
                                      color: repertorio.corTexto,
                                    }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    YouTube
                                  </button>
                                )}
                                {musica.linkCifra && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleClickLink(musica.id, "cifra", musica.linkCifra);
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                                    style={{
                                      backgroundColor: `${repertorio.corSecundaria}30`,
                                      color: repertorio.corTexto,
                                    }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Cifra
                                  </button>
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
