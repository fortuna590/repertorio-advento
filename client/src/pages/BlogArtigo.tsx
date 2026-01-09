import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, ArrowLeft, User, Tag } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";
import { ShareArticle } from "@/components/ShareArticle";

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 text-purple-200">
          <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <span>Carregando artigo...</span>
        </div>
      </div>
    );
  }

  if (error || !artigo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center bg-slate-800 border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">Artigo não encontrado</h2>
          <p className="text-purple-200 mb-6">
            O artigo que você está procurando não existe ou foi removido.
          </p>
          <Link href="/blog">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Blog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Cabeçalho do Artigo */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Blog
              </Button>
            </Link>
            {artigo.categoria && (
              <Badge className="bg-purple-500/30 text-purple-200 border-purple-500/50">{artigo.categoria}</Badge>
            )}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {artigo.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-purple-200 mb-6">
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
              <Tag className="w-4 h-4 text-purple-400" />
              {artigo.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs border-purple-500/30 text-purple-200 bg-purple-500/10">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-lg text-purple-200 leading-relaxed">
            {artigo.resumo}
          </p>
        </div>

        {/* Imagem de Capa */}
        {artigo.imagemCapa && (
          <div className="mb-12 rounded-2xl overflow-hidden border border-purple-500/30">
            <img
              src={artigo.imagemCapa}
              alt={artigo.titulo}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Conteúdo do Artigo */}
        <div className="prose prose-lg max-w-none mb-12">
          <div
            className="text-purple-100 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: artigo.conteudo.replace(/\n/g, '<br />') }}
          />
        </div>

        {/* Footer do Artigo */}
        <div className="mt-12 pt-8 border-t border-purple-500/20">
          <div className="flex items-center justify-between gap-4">
            <Link href="/blog">
              <Button variant="outline" className="border-purple-500/30 text-purple-200 hover:text-white hover:bg-purple-500/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Blog
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <ShareArticle
                titulo={artigo.titulo}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                descricao={artigo.resumo}
              />
              <div className="text-sm text-purple-300">
                Atualizado em {formatDate(artigo.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 object-contain" />
                <span className="font-bold text-white">LouvaMais</span>
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
                <Link href="/blog" className="text-purple-200 hover:text-white transition text-sm block">
                  Blog
                </Link>
                <Link href="/sobre" className="text-purple-200 hover:text-white transition text-sm block">
                  Sobre
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
              <SocialLinks layout="horizontal" size="small" />
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-purple-200 text-sm">
            <p>© 2025 LouvaMais. Todos os direitos reservados.</p>
            <p className="mt-2">Para a maior glória de Deus ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
