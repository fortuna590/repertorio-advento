import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Eye, ArrowRight, Sparkles } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-br from-card via-card/95 to-accent/20 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10" />
                <div className="text-left">
                  <div className="font-bold text-lg text-foreground">Repertório Católico</div>
                  <div className="text-xs text-muted-foreground">LouvaMais Solutions</div>
                </div>
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">Início</Button>
              </Link>
              <Link href="/sobre">
                <Button variant="ghost" size="sm">Sobre</Button>
              </Link>
              <Link href="/contato">
                <Button variant="ghost" size="sm">Contato</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-border/50 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Artigos sobre Música Litúrgica
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Conteúdo educativo para enriquecer o ministério de música da sua paróquia
            </p>
          </div>
        </div>
      </section>

      {/* Artigos Grid */}
      <section className="container py-12 md:py-16">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Carregando artigos...</span>
            </div>
          </div>
        ) : artigos && artigos.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {artigos.map((artigo) => (
              <Link key={artigo.id} href={`/blog/${artigo.slug}`}>
                <Card className="group h-full cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
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
                        <Badge variant="secondary" className="text-xs">
                          {artigo.categoria}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>{artigo.visualizacoes}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                      {artigo.titulo}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {artigo.resumo}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(artigo.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
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
            <Card className="border-dashed">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Nenhum artigo publicado ainda</CardTitle>
                <CardDescription className="text-base">
                  Em breve teremos conteúdo educativo sobre música litúrgica para você!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
        <div className="container py-10 md:py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={APP_LOGO} alt="LouvaMais" className="w-8 h-8" />
              <span className="text-lg font-semibold text-foreground">LouvaMais - Church Solutions</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>© 2025 LouvaMais - Church Solutions. Todos os direitos reservados.</p>
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
