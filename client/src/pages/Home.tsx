import { Link } from "wouter";
import { ArrowRight, BookOpen, Music2, Star } from "lucide-react";
import SEO from "@/components/SEO";
import { trpc } from "@/lib/trpc";

const TEMPOS = [
  { id: "ADVENTO", label: "Advento", descricao: "Tempo de espera e preparação para o Natal", emoji: "🕯️", gradient: "gradient-advento", href: "/repertorios?tempo=ADVENTO" },
  { id: "NATAL", label: "Natal", descricao: "Celebração do nascimento de Jesus Cristo", emoji: "⭐", gradient: "gradient-natal", href: "/repertorios?tempo=NATAL" },
  { id: "QUARESMA", label: "Quaresma", descricao: "Tempo de penitência, conversão e jejum", emoji: "✝️", gradient: "gradient-quaresma", href: "/repertorios?tempo=QUARESMA" },
  { id: "PASCOA", label: "Páscoa", descricao: "Celebração da ressurreição de Cristo", emoji: "🌅", gradient: "gradient-pascoa", href: "/repertorios?tempo=PASCOA" },
  { id: "TEMPO_COMUM", label: "Tempo Comum", descricao: "Crescimento na fé ao longo do ano", emoji: "🌿", gradient: "gradient-tempo-comum", href: "/repertorios?tempo=TEMPO_COMUM" },
  { id: "CELEBRACOES", label: "Celebrações", descricao: "Missas especiais e festas litúrgicas", emoji: "🎊", gradient: "gradient-celebracoes", href: "/repertorios?tempo=CELEBRACOES" },
];

export default function Home() {
  const { data: repertoriosData } = trpc.repertorios.listar.useQuery(undefined);
  const repertoriosRecentes = repertoriosData?.slice(0, 3);
  const { data: artigosData } = trpc.blog.listar.useQuery(undefined);
  const artigosRecentes = artigosData?.slice(0, 3);

  return (
    <>
      <SEO
        title="LouvaMais — Repertórios Litúrgicos Católicos"
        description="Repertórios litúrgicos organizados por tempo litúrgico para a Santa Missa."
        keywords="repertório litúrgico, músicas para missa, advento, quaresma, páscoa, liturgia católica"
      />

      {/* HERO */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
        </div>
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-8 animate-fadeInDown">
            <Star className="w-4 h-4 fill-purple-400 text-purple-400" />
            Repertórios para a Santa Missa
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 animate-fadeInUp leading-tight">
            Músicas que <span className="gradient-text">elevam a alma</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 animate-fadeInUp leading-relaxed">
            Repertórios litúrgicos cuidadosamente organizados por tempo litúrgico, prontos para enriquecer a celebração da Santa Missa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp">
            <Link href="/repertorios" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-105" style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}>
              <Music2 className="w-5 h-5" />Ver Repertórios<ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/blog" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white/80 border border-white/20 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:text-white">
              <BookOpen className="w-5 h-5" />Ler Blog
            </Link>
          </div>
        </div>
      </section>

      {/* TEMPOS LITÚRGICOS */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tempos <span className="gradient-text">Litúrgicos</span></h2>
            <p className="text-white/50 max-w-xl mx-auto">Cada tempo do ano litúrgico tem sua identidade musical própria.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPOS.map((tempo, i) => (
              <Link key={tempo.id} href={tempo.href}
                className="group block p-6 rounded-2xl border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 animate-fadeInUp"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-14 h-14 rounded-xl ${tempo.gradient} flex items-center justify-center text-2xl mb-4 transition-all duration-300 group-hover:scale-110`}>
                  {tempo.emoji}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{tempo.label}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{tempo.descricao}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver repertórios <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* REPERTÓRIOS RECENTES */}
      {repertoriosRecentes && repertoriosRecentes.length > 0 && (
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Repertórios <span className="gradient-text">Recentes</span></h2>
              <Link href="/repertorios" className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">Ver todos <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {repertoriosRecentes.map((r) => (
                <Link key={r.id} href={`/repertorios/${r.slug}`} className="group card-glass p-6 rounded-2xl hover-lift">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-300 mb-3">{r.tempoLiturgico}</span>
                  <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors mb-2 line-clamp-2">{r.titulo}</h3>
                  {r.descricao && <p className="text-sm text-white/50 line-clamp-2">{r.descricao}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BLOG RECENTE */}
      {artigosRecentes && artigosRecentes.length > 0 && (
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="container">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Do <span className="gradient-text">Blog</span></h2>
              <Link href="/blog" className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">Ver todos <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artigosRecentes.map((a) => (
                <Link key={a.id} href={`/blog/${a.slug}`} className="group card-glass rounded-2xl overflow-hidden hover-lift">
                  {a.imagemCapa && (
                    <div className="h-40 overflow-hidden">
                      <img src={a.imagemCapa} alt={a.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    {a.categoria && <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-pink-600/20 text-pink-300 mb-3">{a.categoria}</span>}
                    <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">{a.titulo}</h3>
                    {a.resumo && <p className="text-sm text-white/50 mt-2 line-clamp-2">{a.resumo}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="py-20 md:py-28 border-t border-white/5">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para enriquecer <span className="gradient-text">sua celebração?</span></h2>
            <p className="text-white/50 mb-8">Explore nossa biblioteca de repertórios litúrgicos e encontre as músicas perfeitas para cada momento da Missa.</p>
            <Link href="/repertorios" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-105" style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}>
              Explorar Repertórios<ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
