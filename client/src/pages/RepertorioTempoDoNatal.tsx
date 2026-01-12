import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Music, Youtube, Guitar, Star, Filter, Printer, FileDown, ListMusic, ArrowLeft } from "lucide-react";
import { repertorioTempoDoNatal } from "@/data/repertorioTempoDoNatal";
import { NotificationBell } from "@/components/NotificationBell";
import { PrintView } from "@/components/PrintView";
import ModernHeader from "@/components/ModernHeader";
import FavoriteButton from "@/components/FavoriteButton";

export default function RepertorioTempoDoNatal() {
  const [momentoSelecionado, setMomentoSelecionado] = useState<string | null>(null);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [showPrintView, setShowPrintView] = useState(false);
  const registerClickMutation = trpc.clicks.register.useMutation();

  // Adicionar meta tags Open Graph
  useEffect(() => {
    const currentUrl = window.location.href;
    document.title = 'Tempo do Natal | LouvaMais';
    const oldMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
    oldMetaTags.forEach(tag => tag.remove());
    const metaTags = [
      { property: 'og:title', content: 'Tempo do Natal | LouvaMais' },
      { property: 'og:description', content: 'Repertório de músicas para o Tempo do Natal. Celebre o nascimento de Jesus com músicas litúrgicas especiais.' },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'LouvaMais' },
      { property: 'og:image', content: `${window.location.origin}/og-tempo-natal.jpg` },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Tempo do Natal | LouvaMais' },
      { name: 'twitter:description', content: 'Repertório de músicas para o Tempo do Natal.' },
    ];
    metaTags.forEach(({ property, name, content }) => {
      const meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      if (name) meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });
  }, []);

  const handleLinkClick = (musica: any, linkType: "youtube" | "cifra") => {
    registerClickMutation.mutate({
      musicaId: musica.id,
      musicaTitulo: musica.titulo,
      musicaArtista: "Católicas",
      momentoId: musica.momento,
      momentoTitulo: musica.momento,
      linkType,
    });
  };

  // Função de fallback para o botão Ouvir
  const abrirOuvir = (musica: any) => {
    const termo = encodeURIComponent(musica.titulo + " canto litúrgico católico");
    const url = musica.linkYoutube && musica.linkYoutube.trim() !== ""
      ? musica.linkYoutube
      : `https://www.youtube.com/results?search_query=${termo}`;
    
    handleLinkClick(musica, "youtube");
    
    try {
      window.open(url, "_blank");
    } catch {
      window.open(`https://www.google.com/search?q=${termo}`, "_blank");
    }
  };

  const musicasFiltradas = repertorioTempoDoNatal.filter((musica) => {
    const passaMomento = !momentoSelecionado || musica.momento === momentoSelecionado;
    const passaBusca = !buscaTexto || musica.titulo.toLowerCase().includes(buscaTexto.toLowerCase());
    return passaMomento && passaBusca;
  });

  const momentosUnicos = Array.from(new Set(repertorioTempoDoNatal.map(m => m.momento)));

  return (
    <>
      {showPrintView && <PrintView />}
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-slate-900" style={{ display: showPrintView ? 'none' : 'block' }}>
        <ModernHeader />

        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <Link href="/repertorios">
            <Button variant="ghost" className="gap-2 text-cyan-200 hover:text-cyan-100 hover:bg-cyan-500/10 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Repertórios
            </Button>
          </Link>

          {/* Seção de Ações Rápidas */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-10 h-10 text-cyan-400" />
                  <h1 className="text-4xl md:text-5xl font-bold text-white">Tempo do Natal</h1>
                </div>
                <p className="text-cyan-200">Festa da Sagrada Família - 10 músicas litúrgicas</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/montar-repertorio">
                  <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                    <ListMusic className="w-4 h-4" />
                    Montar Repertório
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="gap-2 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
                  onClick={() => setShowPrintView(true)}
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="🔍 Buscar música..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="bg-slate-800/50 border-cyan-500/30 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={momentoSelecionado === null ? "default" : "outline"}
                  onClick={() => setMomentoSelecionado(null)}
                  className={momentoSelecionado === null 
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" 
                    : "border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"}
                >
                  Todos
                </Button>
                {momentosUnicos.map((momento) => (
                  <Button
                    key={momento}
                    variant={momentoSelecionado === momento ? "default" : "outline"}
                    onClick={() => setMomentoSelecionado(momento)}
                    className={momentoSelecionado === momento
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                      : "border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"}
                  >
                    {momento}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Músicas */}
          <div className="space-y-6">
            {musicasFiltradas.length === 0 ? (
              <Card className="bg-slate-800/50 border-cyan-500/20">
                <CardContent className="py-12 text-center">
                  <Music className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 text-lg">Nenhuma música encontrada</p>
                </CardContent>
              </Card>
            ) : (
              musicasFiltradas.map((musica) => (
                <Card key={musica.id} className="bg-slate-800/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                            {musica.momento}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            Tom: {musica.tom}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl text-white flex items-center gap-3">
                          <Music className="w-5 h-5 text-cyan-400" />
                          {musica.titulo}
                        </CardTitle>
                      </div>
                      <FavoriteButton
                        musicaId={musica.id}
                        musicaTitulo={musica.titulo}
                        musicaArtista="Católicas"
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Cifra Resumo */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Guitar className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-cyan-300">Cifra Resumo</span>
                      </div>
                      <code className="text-cyan-200 font-mono text-sm">{musica.cifraResumo}</code>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        onClick={() => {
                          handleLinkClick(musica, "cifra");
                          window.open(musica.linkCifra, "_blank");
                        }}
                        className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                      >
                        <Guitar className="w-4 h-4" />
                        Cifra Completa
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => abrirOuvir(musica)}
                        className="gap-2 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
                      >
                        <Youtube className="w-4 h-4" />
                        Ouvir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-cyan-200">
            <p>© 2025 LouvaMais - Todos os direitos reservados</p>
          </div>
        </footer>
      </div>
    </>
  );
}
