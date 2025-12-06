import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Music, Youtube, Guitar, Sparkles, Church, Filter, BarChart3, Heart, Printer, FileDown, ShoppingBag, ListMusic, BookOpen } from "lucide-react";
import { APP_LOGO } from "@/const";
import { repertorio, type MomentoMissa } from "@/data/repertorio";
import { NotificationBell } from "@/components/NotificationBell";
import { PrintView } from "@/components/PrintView";
import { exportRepertorioPDF } from "@/utils/exportPDF";
import SocialLinks from "@/components/SocialLinks";
import ModernHeader from "@/components/ModernHeader";
import { TestimonialForm } from "@/components/TestimonialForm";

export default function Repertorio() {
  const [momentoSelecionado, setMomentoSelecionado] = useState<string | null>(null);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [showPrintView, setShowPrintView] = useState(false);
  const registerClickMutation = trpc.clicks.register.useMutation();
  const registerNewsletterMutation = trpc.newsletter.subscribe.useMutation();

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

  const filtrarPorBusca = (momento: any) => {
    if (!buscaTexto) return momento;
    
    const musicasFiltradas = momento.musicas.filter((musica: any) => {
      const busca = buscaTexto.toLowerCase();
      return (
        musica.titulo.toLowerCase().includes(busca) ||
        musica.artista.toLowerCase().includes(busca)
      );
    });

    if (musicasFiltradas.length === 0) return null;
    
    return { ...momento, musicas: musicasFiltradas };
  };

  const momentosComBusca = (momentoFiltrado ? [momentoFiltrado] : repertorio)
    .map(filtrarPorBusca)
    .filter(Boolean);

  const momentosParaExibir = momentosComBusca;

  return (
    <>
      {showPrintView && <PrintView />}
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800" style={{ display: showPrintView ? 'none' : 'block' }}>
        <ModernHeader />

        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Seção de Ações Rápidas */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Tempo do Advento</h1>
                <p className="text-purple-200">29 músicas litúrgicas cuidadosamente selecionadas</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/montar-repertorio">
                  <Button className="gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white">
                    <ListMusic className="w-4 h-4" />
                    Montar Repertório
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="gap-2 border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                  onClick={() => {
                    setShowPrintView(true);
                    setTimeout(() => window.print(), 500);
                  }}
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
                  onClick={() => exportRepertorioPDF()}
                >
                  <FileDown className="w-4 h-4" />
                  Exportar PDF
                </Button>
                <NotificationBell />
              </div>
            </div>

            {/* Campo de Busca */}
            <div className="relative max-w-2xl mb-8">
              <Input
                type="text"
                placeholder="Buscar por título ou artista..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="pl-10 h-12 text-base bg-slate-800 border-purple-500/30 text-white placeholder:text-purple-400"
              />
              <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
            </div>
          </div>

          {/* Filtros de Momentos */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Filter className="w-5 h-5 text-purple-300" />
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
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                    : 'border-purple-500/30 text-purple-200 hover:bg-purple-500/10'
                }`}
              >
                Todos os momentos
              </Button>
              {repertorio.map((momento) => (
                <Button
                  key={momento.id}
                  variant={momentoSelecionado === momento.id ? "default" : "outline"}
                  onClick={() => setMomentoSelecionado(momento.id)}
                  size="sm"
                  className={`rounded-full transition-all duration-300 hover:scale-105 ${
                    momentoSelecionado === momento.id
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                      : 'border-purple-500/30 text-purple-200 hover:bg-purple-500/10'
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
                    <span className="text-pink-400">{momento.numero}</span> {momento.titulo}
                  </h2>
                  {momento.observacao && (
                    <Badge 
                      className="text-xs w-fit bg-purple-500/30 text-purple-200 border-purple-500/50"
                    >
                      {momento.observacao}
                    </Badge>
                  )}
                </div>

                <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {momento.musicas.map((musica: { numero: number; titulo: string; artista: string; youtube?: string; cifra?: string; id?: string; observacao?: string }) => (
                    <Card
                      key={`${momento.id}-${musica.numero}`}
                      className="group hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-500 border-purple-500/20 bg-slate-800 hover:border-pink-500/50 hover:-translate-y-1"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2 mb-1 text-white">
                              <div className="text-pink-400">
                                <Music className="w-4 h-4" />
                              </div>
                              <span className="truncate">{musica.titulo}</span>
                            </CardTitle>
                            <CardDescription className="text-sm truncate text-purple-300">
                              {musica.artista}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-pink-500/10"
                              onClick={() => {}}
                            >
                              <Heart className="w-4 h-4 text-purple-400" />
                            </Button>
                            <Badge 
                              className="bg-purple-500/30 border-purple-500/50 text-purple-200"
                            >
                              #{musica.numero}
                            </Badge>
                          </div>
                        </div>
                        {musica.observacao && (
                          <Badge 
                            className="text-xs mt-3 w-fit bg-purple-500/20 text-purple-200 border-purple-500/30"
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
                            className="w-full justify-start gap-2 border-purple-500/30 text-purple-200 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
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
                            className="w-full justify-start gap-2 border-purple-500/30 text-purple-200 hover:bg-pink-500/10 hover:border-pink-500/50 hover:text-pink-400 transition-all duration-300"
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

          {/* Formulário de Depoimento */}
          <section className="mb-16">
            <TestimonialForm compact={true} />
          </section>

          {/* Seção de Newsletter */}
          <section className="mb-16">
            <Card className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border-purple-500/30">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 mb-4">
                    <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Receba novos repertórios
                  </h2>
                  <p className="text-purple-200 max-w-2xl mx-auto">
                    Inscreva-se na nossa newsletter e receba repertórios litúrgicos, dicas de música sacra e novidades do LouvaMais
                  </p>
                </div>

                <form
                  className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const email = formData.get("email") as string;
                    
                    registerNewsletterMutation.mutate(
                      { email },
                      {
                        onSuccess: () => {
                          (e.target as HTMLFormElement).reset();
                        },
                      }
                    );
                  }}
                >
                  <Input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    required
                    className="flex-1 bg-slate-800 border-purple-500/30 text-white placeholder:text-purple-400"
                  />
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                    disabled={registerNewsletterMutation.isPending}
                  >
                    {registerNewsletterMutation.isPending ? "Inscrevendo..." : "Inscrever"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 object-contain" />
                  <span className="font-bold text-white">Repertório Católico</span>
                </div>
                <p className="text-purple-200 text-sm">
                  Músicas litúrgicas para enriquecer suas celebrações
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
                <nav className="space-y-2">
                  <Link href="/blog" className="text-purple-200 hover:text-white transition text-sm block">
                    Blog
                  </Link>
                  <Link href="/sobre" className="text-purple-200 hover:text-white transition text-sm block">
                    Sobre
                  </Link>
                  <Link href="/stats" className="text-purple-200 hover:text-white transition text-sm block">
                    Estatísticas
                  </Link>
                </nav>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
                <SocialLinks layout="horizontal" size="small" />
              </div>
            </div>

            <div className="border-t border-purple-500/20 pt-8 text-center text-purple-200 text-sm">
              <p>© 2025 LouvaMais - Repertório Católico. Todos os direitos reservados.</p>
              <p className="mt-2">Para a maior glória de Deus ✨</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
