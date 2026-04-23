import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Search, Filter, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";

const TEMPOS = [
  { value: "", label: "Todos" },
  { value: "ADVENTO", label: "Advento" },
  { value: "NATAL", label: "Natal" },
  { value: "QUARESMA", label: "Quaresma" },
  { value: "PASCOA", label: "Páscoa" },
  { value: "TEMPO_COMUM", label: "Tempo Comum" },
  { value: "CELEBRACOES", label: "Celebrações" },
];

const TEMPO_COLORS: Record<string, string> = {
  ADVENTO: "bg-purple-600/20 text-purple-300",
  NATAL: "bg-green-600/20 text-green-300",
  QUARESMA: "bg-stone-600/20 text-stone-300",
  PASCOA: "bg-amber-600/20 text-amber-300",
  TEMPO_COMUM: "bg-emerald-600/20 text-emerald-300",
  CELEBRACOES: "bg-indigo-600/20 text-indigo-300",
};

export default function Repertorios() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const [tempo, setTempo] = useState(params.get("tempo") || "");
  const [busca, setBusca] = useState("");

  const { data, isLoading } = trpc.repertorios.listar.useQuery({
    tempoLiturgico: tempo || undefined,
    busca: busca || undefined,
  });

  return (
    <>
      <SEO
        title="Repertórios Litúrgicos"
        description="Explore nossa coleção de repertórios litúrgicos organizados por tempo do ano litúrgico."
        keywords="repertório litúrgico, músicas missa, advento, quaresma, páscoa, tempo comum"
      />
      <div className="container py-12 md:py-16">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Repertórios <span className="gradient-text">Litúrgicos</span>
          </h1>
          <p className="text-white/50 text-lg">Encontre o repertório ideal para cada celebração.</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscar repertório..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-white/40" />
            {TEMPOS.map(t => (
              <button
                key={t.value}
                onClick={() => setTempo(t.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tempo === t.value
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="card-glass rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-3 w-1/3" />
                <div className="h-6 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">Nenhum repertório encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((r, i) => (
              <Link
                key={r.id}
                href={`/repertorios/${r.slug}`}
                className="group card-glass p-6 rounded-2xl hover-lift animate-fadeInUp"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${TEMPO_COLORS[r.tempoLiturgico] || "bg-purple-600/20 text-purple-300"}`}>
                    {r.tempoLiturgico}
                  </span>
                  {r.categoria && (
                    <span className="text-xs text-white/30">{r.categoria}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors mb-2 line-clamp-2">
                  {r.titulo}
                </h2>
                {r.descricao && (
                  <p className="text-sm text-white/50 line-clamp-2 mb-4">{r.descricao}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                  Ver repertório <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
