import { useState } from "react";
import { Link } from "wouter";
import { Music, Calendar, Sparkles, Church, Star, Cross, Sunrise, Sprout, PartyPopper, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ModernHeader from "@/components/ModernHeader";
import { trpc } from "@/lib/trpc";

export default function Repertorios() {
  const [filtroTempo, setFiltroTempo] = useState<string | null>(null);
  const [buscaTermo, setBuscaTermo] = useState("");

  // Carregar repertórios admin
  const repertoriosAdminQuery = (trpc as any).repertorio.list.useQuery();
  const incrementarVisualizacoesMutation = (trpc as any).repertorio.incrementarVisualizacoes.useMutation();
  const repertoriosAdmin = repertoriosAdminQuery.data || [];

  const repertoriosPadrao = [
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
      gradiente: "from-purple-500/20 to-pink-500/20",
      tipo: "padrao"
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
      gradiente: "from-yellow-500/20 to-orange-500/20",
      tipo: "padrao"
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
      gradiente: "from-blue-500/20 to-cyan-500/20",
      tipo: "padrao"
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
      emBreve: true,
      tipo: "padrao"
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
      emBreve: true,
      tipo: "padrao"
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
      emBreve: true,
      tipo: "padrao"
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
      emBreve: true,
      tipo: "padrao"
    }
  ];

  // Converter repertórios admin para o formato unificado
  const repertoriosAdminFormatados = repertoriosAdmin.map((rep: any) => ({
    id: `admin-${rep.id}`,
    titulo: rep.nome,
    descricao: rep.descricao || "Repertório personalizado",
    tempoLiturgico: rep.tempoLiturgico || "Personalizado",
    totalMusicas: 0, // Pode ser calculado se necessário
    totalMomentos: 0,
    icone: Music,
    gradiente: "from-orange-500/20 to-red-500/20",
    tipo: "admin",
    visualizacoes: rep.visualizacoes || 0,
    adminId: rep.id
  }));

  // Combinar todos os repertórios
  const todosRepertorios = [...repertoriosPadrao, ...repertoriosAdminFormatados];

  // Filtrar repertórios
  const repertoriosFiltrados = todosRepertorios.filter((r) => {
    // Filtro por tempo litúrgico
    const passaFiltroTempo = filtroTempo === null || 
      (filtroTempo === "Personalizado" && r.tipo === "admin") ||
      r.tempoLiturgico === filtroTempo;
    
    // Filtro por busca
    const passaBusca = buscaTermo === "" ||
      r.titulo.toLowerCase().includes(buscaTermo.toLowerCase()) ||
      (r.descricao && r.descricao.toLowerCase().includes(buscaTermo.toLowerCase()));
    
    return passaFiltroTempo && passaBusca;
  });

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

        {/* Campo de Busca */}
        <div className="max-w-md mx-auto mb-8">
          <Input
            type="text"
            placeholder="Buscar repertórios..."
            value={buscaTermo}
            onChange={(e) => setBuscaTermo(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filtros por Tempo Litúrgico */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={filtroTempo === null ? "default" : "outline"}
            onClick={() => setFiltroTempo(null)}
            size="sm"
            className="rounded-full"
          >
            Todos
          </Button>
          <Button
            variant={filtroTempo === "Advento" ? "default" : "outline"}
            onClick={() => setFiltroTempo("Advento")}
            size="sm"
            className="rounded-full"
          >
            Advento
          </Button>
          <Button
            variant={filtroTempo === "Natal" ? "default" : "outline"}
            onClick={() => setFiltroTempo("Natal")}
            size="sm"
            className="rounded-full"
          >
            Natal
          </Button>
          <Button
            variant={filtroTempo === "Quaresma" ? "default" : "outline"}
            onClick={() => setFiltroTempo("Quaresma")}
            size="sm"
            className="rounded-full"
          >
            Quaresma
          </Button>
          <Button
            variant={filtroTempo === "Páscoa" ? "default" : "outline"}
            onClick={() => setFiltroTempo("Páscoa")}
            size="sm"
            className="rounded-full"
          >
            Páscoa
          </Button>
          {repertoriosAdmin.length > 0 && (
            <Button
              variant={filtroTempo === "Personalizado" ? "default" : "outline"}
              onClick={() => setFiltroTempo("Personalizado")}
              size="sm"
              className="rounded-full"
            >
              Personalizados
            </Button>
          )}
        </div>

        {/* Grid de Repertórios */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {repertoriosFiltrados.map((repertorio) => {
            const Icon = repertorio.icone;
            
            // Repertórios Admin
            if (repertorio.tipo === "admin") {
              return (
                <Link key={repertorio.id} href={`/repertorio-admin/${repertorio.adminId}`}>
                  <Card
                    className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 border-border/50 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm hover:border-purple-500/50"
                  >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                            Personalizado
                          </Badge>
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
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-orange-400" />
                        <span className="text-gray-300">
                          <strong className="text-white">{repertorio.visualizacoes}</strong> visualizações
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 text-orange-300 group-hover:text-orange-200 font-medium transition-colors">
                        <span>Ver Detalhes</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              );
            }

            // Repertórios Padrão
            return (
              <Link key={repertorio.id} href={repertorio.link || "#"}>
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
