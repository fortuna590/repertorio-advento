import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Music, Youtube, Guitar, Church, Filter, Printer, FileDown, ListMusic, ArrowLeft } from "lucide-react";
import { repertorioMissaDoGalo } from "@/data/repertorioMissaDoGalo";
import { NotificationBell } from "@/components/NotificationBell";
import { PrintView } from "@/components/PrintView";
import ModernHeader from "@/components/ModernHeader";
import FavoriteButton from "@/components/FavoriteButton";

export default function RepertorioMissaDoGalo() {
  const [momentoSelecionado, setMomentoSelecionado] = useState<string | null>(null);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [showPrintView, setShowPrintView] = useState(false);
  const registerClickMutation = trpc.clicks.register.useMutation();

  // Adicionar meta tags Open Graph
  useEffect(() => {
    const currentUrl = window.location.href;
    document.title = 'Missa do Galo | LouvaMais';
    
    const oldMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
    oldMetaTags.forEach(tag => tag.remove());
    
    const metaTags = [
      { property: 'og:title', content: 'Missa do Galo | LouvaMais' },
      { property: 'og:description', content: 'Repertório completo de músicas para a Missa do Galo. Encontre as melhores músicas para celebrar o Natal.' },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'LouvaMais' },
      { property: 'og:image', content: `${window.location.origin}/og-missa-do-galo.jpg` },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Missa do Galo | LouvaMais' },
      { name: 'twitter:description', content: 'Repertório completo de músicas para a Missa do Galo.' },
    ];
    
    metaTags.forEach(({ property, name, content }) => {
      const meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      if (name) meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });
  }, []);

  const handleLinkClick = (musica: any, momento: any, linkType: "youtube" | "cifra") => {
    registerClickMutation.mutate({
      musicaId: `${momento.id}-${musica.numero}`,
      musicaTitulo: musica.titulo,
      musicaArtista: musica.artista || "Coral Sagrado",
      momentoId: momento.id,
      momentoTitulo: momento.titulo,
      linkType,
    });
  };

  // Função de fallback para o botão Ouvir
  const abrirOuvir = (musica: any, momento: any) => {
    const termo = encodeURIComponent(musica.titulo + " canto litúrgico católico");
    const url = musica.youtube && musica.youtube.trim() !== ""
      ? musica.youtube
      : `https://www.youtube.com/results?search_query=${termo}`;
    
    handleLinkClick(musica, momento, "youtube");
    
    try {
      window.open(url, "_blank");
    } catch {
      window.open(`https://www.google.com/search?q=${termo}`, "_blank");
    }
  };

  const momentoFiltrado = momentoSelecionado
    ? repertorioMissaDoGalo.find((m) => m.id === momentoSelecionado)
    : null;

  const filtrarPorBusca = (momento: any) => {
    if (!buscaTexto) return momento;
    
    const musicasFiltradas = momento.musicas.filter((musica: any) => {
      const busca = buscaTexto.toLowerCase();
      return musica.titulo.toLowerCase().includes(busca);
    });

    if (musicasFiltradas.length === 0) return null;
    
    return { ...momento, musicas: musicasFiltradas };
  };

  const momentosComBusca = (momentoFiltrado ? [momentoFiltrado] : repertorioMissaDoGalo)
    .map(filtrarPorBusca)
    .filter(Boolean);

  const momentosParaExibir = momentosComBusca;

  return (
    <>
      {showPrintView && <PrintView />}
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-slate-900" style={{ display: showPrintView ? 'none' : 'block' }}>
        <ModernHeader />

        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <Link href="/repertorios">
            <Button variant="ghost" className="gap-2 text-orange-200 hover:text-orange-100 hover:bg-orange-500/10 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Repertórios
            </Button>
          </Link>

          {/* Seção de Ações Rápidas */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Church className="w-10 h-10 text-yellow-400" />
                  <h1 className="text-4xl md:text-5xl font-bold text-white">Missa do Galo – Natal</h1>
                </div>
                <p className="text-yellow-200">10 músicas tradicionais para a celebração do Natal</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/montar-repertorio">
                  <Button className="gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
                    <ListMusic className="w-4 h-4" />
                    Montar Repertório
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="gap-2 border-orange-500/30 text-orange-200 hover:bg-orange-500/10"
                  onClick={() => {
                    setShowPrintView(true);
                    setTimeout(() => window.print(), 500);
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </Button>
                <NotificationBell />
              </div>
            </div>

            {/* Campo de Busca */}
            <div className="relative max-w-2xl mb-8">
              <Input
                type="text"
                placeholder="Buscar por título..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="pl-10 h-12 text-base bg-slate-800 border-orange-500/30 text-white placeholder:text-orange-400"
              />
              <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
            </div>
          </div>

          {/* Filtros de Momentos */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Filter className="w-5 h-5 text-orange-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Momentos da Missa
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-3">
              <Button
                variant={momentoSelecionado === null ? "default" : "outline"}
                onClick={() => setMomentoSelecionado(null)}
                size="sm"
                className={`rounded-full transition-all duration-300 hover:scale-105 ${
                  momentoSelecionado === null 
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' 
                    : 'border-orange-500/30 text-orange-200 hover:bg-orange-500/10'
                }`}
              >
                Todos os momentos
              </Button>
              {repertorioMissaDoGalo.map((momento) => (
                <Button
                  key={momento.id}
                  variant={momentoSelecionado === momento.id ? "default" : "outline"}
                  onClick={() => setMomentoSelecionado(momento.id)}
                  size="sm"
                  className={`rounded-full transition-all duration-300 hover:scale-105 ${
                    momentoSelecionado === momento.id
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                      : 'border-orange-500/30 text-orange-200 hover:bg-orange-500/10'
                  }`}
                >
                  <span className="hidden sm:inline">{momento.numero}</span>
                  <span className="truncate max-w-[150px] sm:max-w-none">{momento.titulo}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de Momentos e Músicas */}
          <div className="space-y-12 md:space-y-16 mb-16">
            {momentosParaExibir.map((momento) => (
              <section key={momento.id} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    <span className="text-yellow-400">{momento.numero}</span> {momento.titulo}
                  </h2>
                  {momento.observacao && (
                    <Badge 
                      className="text-xs w-fit bg-orange-500/30 text-orange-200 border-orange-500/50"
                    >
                      {momento.observacao}
                    </Badge>
                  )}
                </div>

                <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {momento.musicas.map((musica: any) => (
                    <Card
                      key={`${momento.id}-${musica.numero}`}
                      className="group hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 border-orange-500/20 bg-slate-800 hover:border-yellow-500/50 hover:-translate-y-1"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2 mb-1 text-white">
                              <div className="text-yellow-400">
                                <Music className="w-4 h-4" />
                              </div>
                              <span className="truncate">{musica.titulo}</span>
                            </CardTitle>
                            <CardDescription className="text-sm text-orange-300 flex items-center gap-2">
                              <Guitar className="w-3 h-3" />
                              Tom: {musica.tom}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <FavoriteButton
                              musicaId={`missa-galo-${momento.id}-${musica.numero}`}
                              musicaTitulo={musica.titulo}
                              musicaArtista={musica.categoria}
                            />
                            <Badge 
                              className="bg-orange-500/30 border-orange-500/50 text-orange-200"
                            >
                              #{musica.numero}
                            </Badge>
                          </div>
                        </div>
                        {musica.observacao && (
                          <Badge 
                            className="text-xs mt-3 w-fit bg-orange-500/20 text-orange-200 border-orange-500/30"
                          >
                            {musica.observacao}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        {/* Cifra Resumo */}
                        {musica.cifraResumo && (
                          <div className="p-3 rounded-lg bg-slate-900/50 border border-orange-500/20">
                            <pre className="text-xs text-orange-200 font-mono whitespace-pre-wrap">
                              {musica.cifraResumo}
                            </pre>
                          </div>
                        )}

                        {/* Botão Ouvir com Fallback */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2 border-orange-500/30 text-orange-200 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
                          onClick={() => abrirOuvir(musica, momento)}
                        >
                          <Youtube className="w-4 h-4" />
                          <span className="truncate">Ouvir</span>
                        </Button>

                        {/* Botão Cifra Completa */}
                        {musica.cifra && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-2 border-orange-500/30 text-orange-200 hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:text-yellow-400 transition-all duration-300"
                            asChild
                          >
                            <a
                              href={musica.cifra}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleLinkClick(musica, momento, "cifra")}
                            >
                              <Guitar className="w-4 h-4" />
                              <span className="truncate">Ver Cifra Completa</span>
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

          {/* Informação sobre o Repertório */}
          <div className="mt-16 p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Church className="w-6 h-6 text-yellow-400" />
              Sobre este Repertório
            </h3>
            <p className="text-gray-300">
              Este repertório foi cuidadosamente preparado para a celebração da Missa do Galo, 
              trazendo músicas tradicionais e cantos litúrgicos apropriados para o Tempo do Natal. 
              Todas as músicas incluem cifras resumidas e links para referências de áudio.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
          <div className="container py-8 text-center text-sm text-muted-foreground">
            <p>© 2025 LouvaMais - Todos os direitos reservados</p>
          </div>
        </footer>
      </div>
    </>
  );
}
