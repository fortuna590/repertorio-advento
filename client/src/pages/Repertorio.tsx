import { Link, useParams } from "wouter";
import { ArrowLeft, Music, BookOpen } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";

const MOMENTOS_LABELS: Record<string, string> = {
  ENTRADA: "Entrada",
  ATO_PENITENCIAL: "Ato Penitencial",
  GLORIA: "Glória",
  SALMO: "Salmo Responsorial",
  OFERTORIO: "Ofertório",
  COMUNHAO: "Comunhão",
  FINAL: "Final",
  OUTROS: "Outros Momentos",
};

const TEMPO_COLORS: Record<string, string> = {
  ADVENTO: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  NATAL: "bg-green-600/20 text-green-300 border-green-500/30",
  QUARESMA: "bg-stone-600/20 text-stone-300 border-stone-500/30",
  PASCOA: "bg-amber-600/20 text-amber-300 border-amber-500/30",
  TEMPO_COMUM: "bg-emerald-600/20 text-emerald-300 border-emerald-500/30",
  CELEBRACOES: "bg-indigo-600/20 text-indigo-300 border-indigo-500/30",
};

export default function Repertorio() {
  const { slug } = useParams<{ slug: string }>();
  const { data: r, isLoading } = trpc.repertorios.buscarPorSlug.useQuery({ slug: slug || "" }, { enabled: !!slug });

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/4" />
          <div className="h-12 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Repertório não encontrado</h1>
        <Link href="/repertorios" className="text-purple-400 hover:text-purple-300">← Voltar aos repertórios</Link>
      </div>
    );
  }

  const momentosComMusicas = Object.entries(MOMENTOS_LABELS).filter(([key]) => {
    const musicas = r.musicas?.filter((m: any) => m.momento === key) || [];
    return musicas.length > 0;
  });

  return (
    <>
      <SEO
        title={r.metaTitle || r.titulo}
        description={r.metaDescription || r.descricao || ""}
        keywords={r.palavrasChave || ""}
        ogType="article"
      />
      <div className="container py-12 md:py-16">
        {/* Breadcrumb */}
        <Link href="/repertorios" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Repertórios
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${TEMPO_COLORS[r.tempoLiturgico] || "bg-purple-600/20 text-purple-300 border-purple-500/30"}`}>
              {r.tempoLiturgico}
            </span>
            {r.categoria && (
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 text-white/50 border border-white/10">
                {r.categoria}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{r.titulo}</h1>
          {r.descricao && <p className="text-lg text-white/60 max-w-2xl leading-relaxed">{r.descricao}</p>}
        </div>

        {/* Músicas por Momento */}
        {momentosComMusicas.length > 0 ? (
          <div className="space-y-8">
            {momentosComMusicas.map(([key, label]) => {
              const musicas = r.musicas?.filter((m: any) => m.momento === key) || [];
              return (
                <div key={key} className="card-glass rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-purple-600/20">
                      <Music className="w-4 h-4 text-purple-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">{label}</h2>
                    <span className="text-xs text-white/30 ml-auto">{musicas.length} música{musicas.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-3">
                    {musicas.map((m: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{m.titulo}</p>
                          {m.artista && <p className="text-sm text-white/40 truncate">{m.artista}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.youtube && (
                            <a href={m.youtube} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">
                              YouTube
                            </a>
                          )}
                          {m.cifra && (
                            <a href={m.cifra} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors">
                              Cifra
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-glass rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">Este repertório ainda não possui músicas cadastradas.</p>
          </div>
        )}
      </div>
    </>
  );
}
