import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, ArrowLeft, User, Tag, Sparkles } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";

export default function BlogArtigo() {
  const { slug } = useParams();
  const { data: artigo, isLoading, error } = trpc.artigos.getBySlug.useQuery({ slug: slug || "" });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Carregando artigo...</span>
        </div>
      </div>
    );
  }

  if (error || !artigo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Artigo não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O artigo que você está procurando não existe ou foi removido.
          </p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Blog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

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
              <Link href="/blog">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Artigo */}
      <article className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho do Artigo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/blog">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Blog
                </Button>
              </Link>
              {artigo.categoria && (
                <Badge variant="secondary">{artigo.categoria}</Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              {artigo.titulo}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              {artigo.autorNome && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{artigo.autorNome}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(artigo.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{artigo.visualizacoes} visualizações</span>
              </div>
            </div>

            {artigo.tags && artigo.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {artigo.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-lg text-muted-foreground leading-relaxed">
              {artigo.resumo}
            </p>
          </div>

          {/* Imagem de Capa */}
          {artigo.imagemCapa && (
            <div className="mb-12 rounded-2xl overflow-hidden border border-border/50">
              <img
                src={artigo.imagemCapa}
                alt={artigo.titulo}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Conteúdo do Artigo */}
          <div className="prose prose-lg max-w-none">
            <div
              className="text-foreground leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: artigo.conteudo.replace(/\n/g, '<br />') }}
            />
          </div>

          {/* Footer do Artigo */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Link href="/blog">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Blog
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground">
                Atualizado em {formatDate(artigo.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </article>

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
