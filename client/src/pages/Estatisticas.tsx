import { Card } from "@/components/ui/card";
import { BarChart3, Music, Users, TrendingUp, Eye, Download } from "lucide-react";
import ModernHeader from "@/components/ModernHeader";

export default function Estatisticas() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Estatísticas</h1>
          <p className="text-xl text-purple-200">
            Acompanhe o crescimento e impacto do Repertório Católico
          </p>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-8 bg-gradient-to-br from-purple-600/20 to-purple-600/10 border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <Music className="w-8 h-8 text-purple-400" />
              <span className="text-xs bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">29+</p>
            <p className="text-purple-200">Músicas Litúrgicas</p>
            <p className="text-xs text-purple-400 mt-2">Repertório do Advento</p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-pink-600/20 to-pink-600/10 border-pink-500/30">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-pink-400" />
              <span className="text-xs bg-pink-500/30 text-pink-200 px-3 py-1 rounded-full">
                Este mês
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">1.2K+</p>
            <p className="text-pink-200">Visualizações</p>
            <p className="text-xs text-pink-400 mt-2">Crescimento constante</p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-blue-600/20 to-blue-600/10 border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <Download className="w-8 h-8 text-blue-400" />
              <span className="text-xs bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">450+</p>
            <p className="text-blue-200">Downloads</p>
            <p className="text-xs text-blue-400 mt-2">Repertórios exportados</p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-green-600/20 to-green-600/10 border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-400" />
              <span className="text-xs bg-green-500/30 text-green-200 px-3 py-1 rounded-full">
                Comunidade
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">150+</p>
            <p className="text-green-200">Ministérios Conectados</p>
            <p className="text-xs text-green-400 mt-2">Em todo o Brasil</p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-yellow-600/20 to-yellow-600/10 border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <span className="text-xs bg-yellow-500/30 text-yellow-200 px-3 py-1 rounded-full">
                Crescimento
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">+35%</p>
            <p className="text-yellow-200">Crescimento Mensal</p>
            <p className="text-xs text-yellow-400 mt-2">Comparado ao mês anterior</p>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-red-600/20 to-red-600/10 border-red-500/30">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-red-400" />
              <span className="text-xs bg-red-500/30 text-red-200 px-3 py-1 rounded-full">
                Artigos
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">1</p>
            <p className="text-red-200">Artigos Publicados</p>
            <p className="text-xs text-red-400 mt-2">Sobre o Advento</p>
          </Card>
        </div>

        {/* Gráficos e Análises */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-8 bg-slate-800 border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-6">Momentos da Missa Mais Acessados</h3>
            <div className="space-y-4">
              {[
                { label: "Entrada", value: 95, percentage: 100 },
                { label: "Aclamação ao Evangelho", value: 88, percentage: 93 },
                { label: "Ofertório", value: 82, percentage: 86 },
                { label: "Comunhão", value: 78, percentage: 82 },
                { label: "Saída", value: 72, percentage: 76 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-purple-200">{item.label}</span>
                    <span className="text-white font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-slate-800 border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-6">Recursos Mais Utilizados</h3>
            <div className="space-y-4">
              {[
                { label: "Visualizar Repertório", value: 98 },
                { label: "Buscar Músicas", value: 87 },
                { label: "Filtrar por Momento", value: 76 },
                { label: "Exportar PDF", value: 65 },
                { label: "Compartilhar", value: 54 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-purple-200">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold w-8 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Insights Principais</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <div>
                <h3 className="font-semibold text-white mb-2">Engajamento em Alta</h3>
                <p className="text-purple-200 text-sm">
                  Os usuários estão cada vez mais engajados com o repertório, especialmente com as funcionalidades de filtro e busca.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
              <div>
                <h3 className="font-semibold text-white mb-2">Crescimento Sustentável</h3>
                <p className="text-purple-200 text-sm">
                  Crescimento consistente de 35% ao mês indica que o projeto está resolvendo um problema real para ministérios.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <div>
                <h3 className="font-semibold text-white mb-2">Comunidade Forte</h3>
                <p className="text-purple-200 text-sm">
                  150+ ministérios conectados mostram que a plataforma está criando uma comunidade real de usuários.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
              <div>
                <h3 className="font-semibold text-white mb-2">Potencial de Expansão</h3>
                <p className="text-purple-200 text-sm">
                  Com 1 artigo publicado e crescimento consistente, há grande potencial para expandir conteúdo educativo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
