import SEO from "@/components/SEO";
import { Music, Heart, BookOpen } from "lucide-react";

export default function Sobre() {
  return (
    <>
      <SEO
        title="Sobre o LouvaMais"
        description="Conheça o LouvaMais, plataforma de repertórios litúrgicos para a Santa Missa."
        keywords="sobre louvamais, repertório litúrgico, música sacra, liturgia católica"
      />
      <div className="container py-12 md:py-16 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-600/20 mb-6">
            <Music className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Sobre o <span className="gradient-text">LouvaMais</span>
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            Uma plataforma dedicada a enriquecer a celebração da Santa Missa com repertórios litúrgicos organizados e acessíveis.
          </p>
        </div>

        <div className="space-y-8">
          <div className="card-glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-600/20"><Heart className="w-5 h-5 text-purple-400" /></div>
              <h2 className="text-xl font-bold text-white">Nossa Missão</h2>
            </div>
            <p className="text-white/60 leading-relaxed">
              O LouvaMais nasceu do desejo de facilitar o trabalho de músicos e cantores litúrgicos, oferecendo repertórios organizados por tempo litúrgico, com links para cifras e vídeos no YouTube.
            </p>
          </div>

          <div className="card-glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-pink-600/20"><BookOpen className="w-5 h-5 text-pink-400" /></div>
              <h2 className="text-xl font-bold text-white">O que oferecemos</h2>
            </div>
            <ul className="space-y-3 text-white/60">
              <li className="flex items-start gap-2"><span className="text-purple-400 mt-1">•</span> Repertórios organizados por tempo litúrgico (Advento, Natal, Quaresma, Páscoa, Tempo Comum)</li>
              <li className="flex items-start gap-2"><span className="text-purple-400 mt-1">•</span> Músicas separadas por momento da Missa (Entrada, Ofertório, Comunhão, etc.)</li>
              <li className="flex items-start gap-2"><span className="text-purple-400 mt-1">•</span> Links para cifras e YouTube para cada música</li>
              <li className="flex items-start gap-2"><span className="text-purple-400 mt-1">•</span> Blog com artigos sobre liturgia e música sacra</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
