import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar, Tag, Music, ArrowRight, Share2, Copy, Check } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import { useState, useCallback } from "react";
import { RecomendacoesSection } from "@/components/RecomendacoesSection";

const TEMPO_COLORS: Record<string, string> = {
  ADVENTO: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  NATAL: "bg-green-600/20 text-green-300 border-green-500/30",
  QUARESMA: "bg-stone-600/20 text-stone-300 border-stone-500/30",
  PASCOA: "bg-amber-600/20 text-amber-300 border-amber-500/30",
  TEMPO_COMUM: "bg-emerald-600/20 text-emerald-300 border-emerald-500/30",
  CELEBRACOES: "bg-indigo-600/20 text-indigo-300 border-indigo-500/30",
};

const TEMPO_LABELS: Record<string, string> = {
  ADVENTO: "Advento",
  NATAL: "Natal",
  QUARESMA: "Quaresma",
  PASCOA: "Páscoa",
  TEMPO_COMUM: "Tempo Comum",
  CELEBRACOES: "Celebrações",
};

// Detecta tempos litúrgicos mencionados no conteúdo do artigo
function detectarTemposNoConteudo(conteudo: string, titulo: string): string[] {
  const texto = (conteudo + " " + titulo).toUpperCase();
  const tempos: string[] = [];
  if (texto.includes("ADVENTO")) tempos.push("ADVENTO");
  if (texto.includes("NATAL")) tempos.push("NATAL");
  if (texto.includes("QUARESMA")) tempos.push("QUARESMA");
  if (texto.includes("PÁSCOA") || texto.includes("PASCOA")) tempos.push("PASCOA");
  if (texto.includes("TEMPO COMUM")) tempos.push("TEMPO_COMUM");
  if (texto.includes("CELEBRAÇ") || texto.includes("FESTAS")) tempos.push("CELEBRACOES");
  return tempos;
}

export default function BlogArtigo() {
  const { slug } = useParams<{ slug: string }>();
  const { data: artigo, isLoading } = trpc.blog.buscarPorSlug.useQuery({ slug: slug || "" }, { enabled: !!slug });
  const { data: todosRepertorios } = trpc.repertorios.listar.useQuery(undefined);
  const { data: recomendacoes, isLoading: loadingRec } = trpc.recomendacoes.paraArtigo.useQuery(
    { artigoId: artigo?.id ?? 0 },
    { enabled: !!artigo?.id }
  );
  const [copiado, setCopiado] = useState(false);

  const compartilhar = useCallback(async () => {
    const url = window.location.href;
    const titulo = artigo?.titulo || "Artigo LouvaMais";
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: `Leia: ${titulo}`, url });
      } catch { /* cancelado */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }, [artigo]);

  const copiarLink = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }, []);

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

  // Determinar repertórios relacionados pelo tempo litúrgico detectado no artigo
  const temposDetectados = detectarTemposNoConteudo(artigo.conteudo || "", artigo.titulo);
  const repertoriosRelacionados = (todosRepertorios || [])
    .filter(r => temposDetectados.includes(r.tempoLiturgico))
    .slice(0, 3);

  const tags = typeof artigo.tags === "string"
    ? (() => { try { return JSON.parse(artigo.tags); } catch { return []; } })()
    : (artigo.tags || []);

  return (
    <>
      <SEO
        title={artigo.metaTitle || `${artigo.titulo} | Blog LouvaMais`}
        description={artigo.metaDescription || artigo.resumo || `Artigo sobre ${artigo.categoria} no blog LouvaMais.`}
        keywords={artigo.palavrasChave || (tags.join(", "))}
        ogImage={artigo.imagemCapa || undefined}
        ogType="article"
      />
      <div className="container py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Blog
          </Link>
          {/* Ações de compartilhamento */}
          <div className="flex gap-2">
            <button onClick={compartilhar}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all">
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
            <button onClick={copiarLink}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all">
              {copiado ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiado ? "Copiado!" : "Copiar link"}</span>
            </button>
          </div>
        </div>

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
          {tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="w-4 h-4 text-white/30" />
                {tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/50 border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Compartilhamento final */}
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">Gostou? Compartilhe com sua equipe de música.</p>
            <div className="flex gap-3">
              <button onClick={compartilhar}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
              <button onClick={copiarLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all">
                {copiado ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copiado ? "Copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        </article>

        {/* REPERTÓRIOS RELACIONADOS */}
        {repertoriosRelacionados.length > 0 && (
          <section className="max-w-3xl mx-auto mt-16 pt-12 border-t border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-600/20">
                <Music className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Repertórios relacionados</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {repertoriosRelacionados.map((r) => (
                <Link key={r.id} href={`/repertorios/${r.slug}`}
                  className="group card-glass p-5 rounded-2xl hover-lift">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-3 ${TEMPO_COLORS[r.tempoLiturgico] || "bg-purple-600/20 text-purple-300 border-purple-500/30"}`}>
                    {TEMPO_LABELS[r.tempoLiturgico] || r.tempoLiturgico}
                  </span>
                  <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors text-sm line-clamp-2 mb-2">{r.titulo}</h3>
                  {r.descricao && <p className="text-xs text-white/40 line-clamp-2">{r.descricao}</p>}
                  <div className="mt-3 flex items-center gap-1 text-xs text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver repertório <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/repertorios" className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Ver todos os repertórios <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Recomendações inteligentes */}
        <div className="max-w-3xl mx-auto">
          <RecomendacoesSection
            repertorios={recomendacoes?.repertorios}
            artigos={recomendacoes?.artigos}
            isLoading={loadingRec}
            titulo="Veja também"
          />
        </div>

        {/* CTA para blog */}
        <div className="max-w-3xl mx-auto mt-8 pt-8 border-t border-white/10 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao blog
          </Link>
        </div>
      </div>
    </>
  );
}
