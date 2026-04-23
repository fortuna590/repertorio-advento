import { useState } from "react";
import { Link } from "wouter";
import { Search, Calendar } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";

export default function Blog() {
  const [busca, setBusca] = useState("");
  const { data, isLoading } = trpc.blog.listar.useQuery({ busca: busca || undefined });

  return (
    <>
      <SEO
        title="Blog — Liturgia e Música Sacra"
        description="Artigos sobre liturgia católica, música sacra, tempos litúrgicos e espiritualidade."
        keywords="blog liturgia, música sacra, artigos católicos, espiritualidade, advento, quaresma"
      />
      <div className="container py-12 md:py-16">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Blog <span className="gradient-text">Litúrgico</span>
          </h1>
          <p className="text-white/50 text-lg">Reflexões, guias e conteúdos sobre liturgia e música sacra.</p>
        </div>

        <div className="relative max-w-md mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Buscar artigos..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="card-glass rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-6 bg-white/10 rounded" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">Nenhum artigo encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((a, i) => (
              <Link
                key={a.id}
                href={`/blog/${a.slug}`}
                className="group card-glass rounded-2xl overflow-hidden hover-lift animate-fadeInUp"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {a.imagemCapa ? (
                  <div className="h-48 overflow-hidden">
                    <img src={a.imagemCapa} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}>
                    <span className="text-4xl">✝️</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {a.categoria && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-pink-600/20 text-pink-300">{a.categoria}</span>
                    )}
                    {a.createdAt && (
                      <span className="text-xs text-white/30 flex items-center gap-1 ml-auto">
                        <Calendar className="w-3 h-3" />
                        {new Date(a.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">{a.titulo}</h2>
                  {a.resumo && <p className="text-sm text-white/50 line-clamp-2">{a.resumo}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
