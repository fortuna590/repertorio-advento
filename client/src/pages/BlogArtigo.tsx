import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";

export default function BlogArtigo() {
  const { slug } = useParams<{ slug: string }>();
  const { data: artigo, isLoading } = trpc.blog.buscarPorSlug.useQuery({ slug: slug || "" }, { enabled: !!slug });

  if (isLoading) {
    return (
      <div className="container py-12 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-white/10 rounded w-1/4" />
          <div className="h-12 bg-white/10 rounded" />
          <div className="h-64 bg-white/10 rounded-2xl" />
          <div className="space-y-3">
            {Array.from({length:8}).map((_,i) => <div key={i} className="h-4 bg-white/10 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!artigo) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Artigo não encontrado</h1>
        <Link href="/blog" className="text-purple-400 hover:text-purple-300">← Voltar ao blog</Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={artigo.metaTitle || artigo.titulo}
        description={artigo.metaDescription || artigo.resumo || ""}
        keywords={artigo.palavrasChave || ""}
        ogImage={artigo.imagemCapa || undefined}
        ogType="article"
      />
      <div className="container py-12 md:py-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>

        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap gap-3 mb-4">
              {artigo.categoria && (
                <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-pink-600/20 text-pink-300 border border-pink-500/30">
                  {artigo.categoria}
                </span>
              )}
              {artigo.createdAt && (
                <span className="inline-flex items-center gap-2 text-sm text-white/40">
                  <Calendar className="w-4 h-4" />
                  {new Date(artigo.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{artigo.titulo}</h1>
            {artigo.resumo && <p className="text-xl text-white/60 leading-relaxed">{artigo.resumo}</p>}
          </header>

          {/* Imagem de capa */}
          {artigo.imagemCapa && (
            <div className="rounded-2xl overflow-hidden mb-10">
              <img src={artigo.imagemCapa} alt={artigo.titulo} className="w-full h-64 md:h-96 object-cover" />
            </div>
          )}

          {/* Conteúdo */}
          <div
            className="prose-louvamais text-white/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: artigo.conteudo || "" }}
          />

          {/* Tags */}
          {artigo.tags && artigo.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="w-4 h-4 text-white/30" />
                {(typeof artigo.tags === "string" ? JSON.parse(artigo.tags) : artigo.tags || []).map((tag: string) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
