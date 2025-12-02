import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Eye, ArrowRight, Sparkles } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

export default function Blog() {
  const { data: artigos, isLoading } = trpc.artigos.getAll.useQuery();

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Blog</h1>
          <p className="text-xl text-purple-200">
            Conteúdo educativo sobre música litúrgica e espiritualidade
          </p>
        </div>

        {/* Artigos Grid */}
        <section className="mb-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-purple-200">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>Carregando artigos...</span>
              </div>
            </div>
          ) : artigos && artigos.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {artigos.map((artigo) => (
                <Link key={artigo.id} href={`/blog/${artigo.slug}`}>
                  <Card className="group h-full cursor-pointer transition-all duration-300 hover:border-purple-400/50 hover:shadow-lg bg-slate-800 border-purple-500/20">
                    {artigo.imagemCapa && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={artigo.imagemCapa}
                          alt={artigo.titulo}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-3">
                        {artigo.categoria && (
                          <Badge variant="secondary" className="text-xs bg-purple-500/30 text-purple-200">
                            {artigo.categoria}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-purple-300">
                          <Eye className="w-3 h-3" />
                          <span>{artigo.visualizacoes}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:text-purple-300 transition-colors line-clamp-2 text-white">
                        {artigo.titulo}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-purple-200">
                        {artigo.resumo}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-purple-300">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(artigo.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-400 font-medium group-hover:gap-2 transition-all">
                          <span>Ler mais</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-12">
              <Card className="border-dashed bg-slate-800 border-purple-500/20">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                  </div>
                  <CardTitle className="text-3xl text-white mb-4">Conteúdo em Breve</CardTitle>
                  <CardDescription className="text-base text-purple-200 mb-8">
                    Estamos preparando artigos educativos sobre música litúrgica, espiritualidade e dicas práticas para seu ministério. Em breve você terá acesso a conteúdo exclusivo!
                  </CardDescription>
                  <Link href="/contato">
                    <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold">
                      Entre em Contato
                    </Button>
                  </Link>
                </CardHeader>
              </Card>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
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
                <Link href="/repertorio" className="text-purple-200 hover:text-white transition text-sm block">
                  Repertório
                </Link>
                <Link href="/sobre" className="text-purple-200 hover:text-white transition text-sm block">
                  Sobre
                </Link>
                <Link href="/contato" className="text-purple-200 hover:text-white transition text-sm block">
                  Contato
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
  );
}
