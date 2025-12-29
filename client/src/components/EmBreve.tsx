import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ModernHeader from "@/components/ModernHeader";

interface EmBreveProps {
  titulo: string;
  descricao: string;
  icone: React.ElementType;
  cor: string;
}

export default function EmBreve({ titulo, descricao, icone: Icon, cor }: EmBreveProps) {
  const [, setLocation] = useLocation();

  const getCor = () => {
    switch (cor) {
      case "roxo": return "from-purple-500/20 to-violet-500/20";
      case "amarelo": return "from-yellow-500/20 to-amber-500/20";
      case "verde": return "from-green-500/20 to-emerald-500/20";
      case "vermelho": return "from-red-500/20 to-rose-500/20";
      default: return "from-purple-500/20 to-pink-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
      <ModernHeader />

      <main className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Botão Voltar */}
          <Button
            onClick={() => setLocation("/repertorios")}
            variant="ghost"
            className="mb-8 text-purple-300 hover:text-purple-200 hover:bg-purple-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Repertórios
          </Button>

          {/* Card Principal */}
          <Card className={`bg-gradient-to-br ${getCor()} backdrop-blur-sm border-border/50`}>
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              {/* Ícone */}
              <div className="flex justify-center">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30">
                  <Icon className="w-16 h-16 text-purple-300" />
                </div>
              </div>

              {/* Título */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {titulo}
                </h1>
                <p className="text-lg text-gray-300">
                  {descricao}
                </p>
              </div>

              {/* Mensagem */}
              <div className="py-8">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                  <Calendar className="w-5 h-5 text-yellow-300" />
                  <span className="text-yellow-300 font-medium">
                    Repertório em preparação
                  </span>
                </div>
              </div>

              {/* Descrição */}
              <div className="max-w-xl mx-auto space-y-4 text-gray-300">
                <p>
                  Estamos trabalhando para trazer um repertório completo para este tempo litúrgico, com músicas cuidadosamente selecionadas para cada momento da Santa Missa.
                </p>
                <div className="flex items-center justify-center gap-8 pt-4">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" />
                    <span className="text-sm">Músicas organizadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="text-sm">Por momentos da Missa</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-6">
                <Button
                  onClick={() => setLocation("/repertorios")}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                >
                  Explorar outros repertórios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Secundário */}
          <div className="mt-8 p-6 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
            <p className="text-gray-300">
              Quer ser avisado quando este repertório estiver disponível?{" "}
              <a href="/contato" className="text-purple-300 hover:text-purple-200 underline">
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
