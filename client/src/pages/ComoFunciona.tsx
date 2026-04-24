import { Link } from "wouter";
import { Music2, BookOpen, Star, ArrowRight, CheckCircle2, Calendar, Users, Heart, ChevronDown } from "lucide-react";
import SEO from "@/components/SEO";

const PASSOS = [
  {
    numero: "01",
    icone: <Calendar className="w-6 h-6 text-purple-300" />,
    titulo: "Identifique o tempo litúrgico",
    descricao:
      "Descubra em qual período do ano litúrgico você está — Advento, Natal, Quaresma, Páscoa ou Tempo Comum — e acesse os repertórios correspondentes.",
    cor: "border-purple-500/30 bg-purple-600/10",
  },
  {
    numero: "02",
    icone: <Music2 className="w-6 h-6 text-pink-300" />,
    titulo: "Escolha seu repertório",
    descricao:
      "Navegue pelos repertórios prontos, organizados por tempo litúrgico e momento da Missa: Entrada, Ofertório, Comunhão e muito mais.",
    cor: "border-pink-500/30 bg-pink-600/10",
  },
  {
    numero: "03",
    icone: <BookOpen className="w-6 h-6 text-amber-300" />,
    titulo: "Aprenda com os artigos",
    descricao:
      "Leia artigos sobre liturgia, música sacra e espiritualidade para aprofundar sua formação e celebrar com mais consciência.",
    cor: "border-amber-500/30 bg-amber-600/10",
  },
  {
    numero: "04",
    icone: <Star className="w-6 h-6 text-emerald-300" />,
    titulo: "Salve e exporte",
    descricao:
      "Favorite os repertórios que mais gosta, copie a lista de músicas ou exporte em PDF para levar para a sua celebração.",
    cor: "border-emerald-500/30 bg-emerald-600/10",
  },
];

const BENEFICIOS = [
  "Repertórios prontos para cada tempo litúrgico",
  "Músicas organizadas por momento da Missa",
  "Links diretos para YouTube e cifras",
  "Artigos de formação litúrgica",
  "Exportação em PDF para uso offline",
  "Atualizado regularmente com novos conteúdos",
  "Gratuito e acessível de qualquer dispositivo",
  "Pensado para músicos, cantores e ministros",
];

const PERGUNTAS = [
  {
    pergunta: "O LouvaMais é gratuito?",
    resposta:
      "Sim! O LouvaMais é completamente gratuito. Você pode acessar todos os repertórios e artigos sem nenhum custo.",
  },
  {
    pergunta: "Preciso criar uma conta para usar?",
    resposta:
      "Não é necessário criar conta para visualizar os repertórios e artigos. A conta é opcional e permite salvar favoritos e acessar recursos extras.",
  },
  {
    pergunta: "Posso usar os repertórios na minha paróquia?",
    resposta:
      "Sim! Os repertórios são pensados para uso litúrgico em missas, celebrações e momentos de oração. Sinta-se à vontade para usá-los.",
  },
  {
    pergunta: "Com que frequência o conteúdo é atualizado?",
    resposta:
      "Novos repertórios e artigos são adicionados regularmente, especialmente antes de cada tempo litúrgico. Acompanhe o blog para novidades.",
  },
];

export default function ComoFunciona() {
  return (
    <>
      <SEO
        title="Como Funciona o LouvaMais — Guia Completo"
        description="Entenda como usar o LouvaMais para encontrar repertórios litúrgicos, aprender com artigos e organizar suas músicas para a Missa."
        keywords="como funciona louvamais, repertório litúrgico, músicas para missa, guia liturgia católica"
      />

      {/* HERO */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
          />
        </div>
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-6">
            <Heart className="w-4 h-4 fill-purple-400 text-purple-400" />
            Feito para músicos e cantores litúrgicos
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
            Como funciona o <span className="gradient-text">LouvaMais</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed">
            O LouvaMais é uma plataforma gratuita de repertórios litúrgicos católicos. Aqui você encontra sugestões de músicas organizadas por tempo litúrgico, artigos de formação e ferramentas para planejar sua celebração.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/repertorios"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-105"
              style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}
            >
              <Music2 className="w-5 h-5" />
              Ver repertórios
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white/80 border border-white/20 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:text-white"
            >
              <BookOpen className="w-5 h-5" />
              Ler artigos
            </Link>
          </div>
        </div>
      </section>

      {/* O QUE É */}
      <section className="py-16 md:py-20 border-t border-white/5">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
                O que é o <span className="gradient-text">LouvaMais?</span>
              </h2>
              <p className="text-white/60 leading-relaxed mb-4">
                O LouvaMais nasceu da necessidade real de músicos e cantores que precisam montar repertórios para a Missa de forma rápida, prática e fiel à liturgia da Igreja Católica.
              </p>
              <p className="text-white/60 leading-relaxed mb-6">
                Diferente de uma simples lista de músicas, o LouvaMais organiza as sugestões por <strong className="text-white/80">tempo litúrgico</strong> (Advento, Quaresma, Páscoa...) e por <strong className="text-white/80">momento da Missa</strong> (Entrada, Ofertório, Comunhão...), facilitando o planejamento litúrgico.
              </p>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-600/10 border border-purple-500/20">
                <Users className="w-5 h-5 text-purple-400 shrink-0" />
                <p className="text-sm text-white/60">
                  Pensado para <strong className="text-purple-300">músicos, cantores, ministros de música</strong> e qualquer pessoa que queira celebrar com mais qualidade litúrgica.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { valor: "5+", label: "Tempos litúrgicos", cor: "from-purple-600/20 to-purple-900/10 border-purple-500/20" },
                { valor: "10", label: "Momentos da Missa", cor: "from-pink-600/20 to-pink-900/10 border-pink-500/20" },
                { valor: "100+", label: "Músicas catalogadas", cor: "from-amber-600/20 to-amber-900/10 border-amber-500/20" },
                { valor: "∞", label: "Acesso gratuito", cor: "from-emerald-600/20 to-emerald-900/10 border-emerald-500/20" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`p-5 rounded-2xl border bg-gradient-to-br ${stat.cor} text-center`}
                >
                  <div className="text-3xl font-black text-white mb-1">{stat.valor}</div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMO USAR — PASSO A PASSO */}
      <section className="py-16 md:py-20 border-t border-white/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Como <span className="gradient-text">usar</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Em poucos passos você encontra o repertório ideal para a sua próxima celebração.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PASSOS.map((passo, i) => (
              <div
                key={passo.numero}
                className={`relative p-6 rounded-2xl border ${passo.cor} transition-all duration-300 hover:-translate-y-1`}
              >
                {i < PASSOS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 z-10">
                    <ArrowRight className="w-5 h-5 text-white/20" />
                  </div>
                )}
                <span className="text-4xl font-black text-white/10 mb-3 block">{passo.numero}</span>
                <div className="mb-3">{passo.icone}</div>
                <h3 className="text-base font-bold text-white mb-2">{passo.titulo}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{passo.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-16 md:py-20 border-t border-white/5">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
                Por que usar o <span className="gradient-text">LouvaMais?</span>
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Chega de perder tempo procurando músicas em vários lugares. O LouvaMais reúne tudo que você precisa para planejar uma celebração litúrgica com qualidade.
              </p>
              <Link
                href="/repertorios"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:opacity-90"
                style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}
              >
                Explorar repertórios
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {BENEFICIOS.map((b) => (
                <div key={b} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-sm text-white/70">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PERGUNTAS FREQUENTES */}
      <section className="py-16 md:py-20 border-t border-white/5">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Perguntas <span className="gradient-text">frequentes</span>
            </h2>
          </div>
          <div className="space-y-4">
            {PERGUNTAS.map((faq) => (
              <details
                key={faq.pergunta}
                className="group rounded-xl border border-white/10 bg-white/3 overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none text-white font-medium text-sm hover:bg-white/5 transition-colors">
                  {faq.pergunta}
                  <ChevronDown className="w-4 h-4 text-white/40 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-4 text-sm text-white/60 leading-relaxed border-t border-white/5 pt-3">
                  {faq.resposta}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 md:py-28 border-t border-white/5">
        <div className="container text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-white/50 mb-8">
              Acesse os repertórios gratuitamente e planeje sua próxima celebração com mais qualidade litúrgica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/repertorios"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-105"
                style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}
              >
                Ver repertórios
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white/80 border border-white/20 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                Ler o blog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
