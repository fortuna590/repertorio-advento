import { Link } from "wouter";
import { Music, Calendar, Sparkles, Church, Star, Cross, Sunrise, Sprout, PartyPopper } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ModernHeader from "@/components/ModernHeader";

export default function Repertorios() {
  const repertorios = [
    {
      id: "advento",
      titulo: "Tempo do Advento",
      descricao: "29 músicas litúrgicas organizadas por momentos da missa",
      tempoLiturgico: "Advento",
      cor: "roxo",
      totalMusicas: 29,
      totalMomentos: 11,
      link: "/repertorio",
      icone: Sparkles,
      gradiente: "from-purple-500/20 to-pink-500/20"
    },
    {
      id: "missa-do-galo",
      titulo: "Missa do Galo – Natal",
      descricao: "Repertório tradicional para a celebração da Missa do Galo",
      tempoLiturgico: "Natal",
      cor: "branco",
      totalMusicas: 10,
      totalMomentos: 10,
      link: "/repertorio/missa-do-galo",
      icone: Church,
      gradiente: "from-yellow-500/20 to-orange-500/20"
    },
    {
      id: "tempo-do-natal",
      titulo: "Tempo do Natal",
      descricao: "Repertório para a Festa da Sagrada Família e celebrações natalinas",
      tempoLiturgico: "Natal",
      cor: "branco",
      totalMusicas: 10,
      totalMomentos: 9,
      link: "/repertorio/tempo-do-natal",
      icone: Star,
      gradiente: "from-blue-500/20 to-cyan-500/20"
    },
    {
      id: "quaresma",
      titulo: "Tempo da Quaresma",
      descricao: "Repertório em preparação para o tempo de conversão e silêncio",
      tempoLiturgico: "Quaresma",
      cor: "roxo",
      totalMusicas: 0,
      totalMomentos: 0,
      link: "/repertorio/quaresma",
      icone: Cross,
      gradiente: "from-purple-500/20 to-violet-500/20",
      emBreve: true
    },
    {
      id: "pascoa",
      titulo: "Tempo da Páscoa",
      descricao: "Repertório em preparação para o tempo de ressurreição e vida nova",
      tempoLiturgico: "Páscoa",
      cor: "branco",
      totalMusicas: 0,
      totalMomentos: 0,
      link: "/repertorio/pascoa",
      icone: Sunrise,
      gradiente: "from-yellow-500/20 to-amber-500/20",
      emBreve: true
    },
    {
      id: "tempo-comum",
      titulo: "Tempo Comum",
      descricao: "Repertório em preparação para a caminhada da fé",
      tempoLiturgico: "Tempo Comum",
      cor: "verde",
      totalMusicas: 0,
      totalMomentos: 0,
      link: "/repertorio/tempo-comum",
      icone: Sprout,
      gradiente: "from-green-500/20 to-emerald-500/20",
      emBreve: true
    },
    {
      id: "celebracoes-especiais",
      titulo: "Celebrações Especiais",
      descricao: "Repertório em preparação para Ramos, Tríduo Pascal, Pentecostes e mais",
      tempoLiturgico: "Especiais",
      cor: "vermelho",
      totalMusicas: 0,
      totalMomentos: 0,
      link: "/repertorio/celebracoes-especiais",
      icone: PartyPopper,
      gradiente: "from-red-500/20 to-rose-500/20",
      emBreve: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
      <ModernHeader />

      <main className="container py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Music className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Repertórios Litúrgicos
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore nossos repertórios organizados por tempo litúrgico, com músicas cuidadosamente selecionadas para cada momento da Santa Missa.
          </p>
        </div>

        {/* Grid de Repertórios */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {repertorios.map((repertorio) => {
            const Icon = repertorio.icone;
            return (
              <Link key={repertorio.id} href={repertorio.link}>
                <Card className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 border-border/50 bg-gradient-to-br ${repertorio.gradiente} backdrop-blur-sm hover:border-purple-500/50`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {repertorio.tempoLiturgico}
                          </Badge>
                          {repertorio.emBreve && (
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                              Em Breve
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-2xl md:text-3xl flex items-center gap-3 text-white group-hover:text-purple-300 transition-colors">
                          <Icon className="w-6 h-6 shrink-0" />
                          <span>{repertorio.titulo}</span>
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-base text-gray-300 mt-2">
                      {repertorio.descricao}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Estatísticas */}
                    {!repertorio.emBreve && (
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">
                            <strong className="text-white">{repertorio.totalMusicas}</strong> músicas
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">
                            <strong className="text-white">{repertorio.totalMomentos}</strong> momentos
                          </span>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 text-purple-300 group-hover:text-purple-200 font-medium transition-colors">
                        <span>{repertorio.emBreve ? "Ver detalhes" : "Explorar Repertório"}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 LouvaMais - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
