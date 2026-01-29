import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EscalasNavigation } from "@/components/EscalasNavigation";
import { Users, CheckCircle2, XCircle, Clock3, TrendingUp } from "lucide-react";

export default function EstatisticasEscalas() {
  const { user } = useAuth();

  const { data: stats, isLoading } = trpc.escalas.estatisticas.useQuery(
    { userId: user?.openId || "" },
    { enabled: !!user?.openId }
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Acesso Restrito</CardTitle>
            <CardDescription className="text-purple-300">
              Você precisa estar logado para ver as estatísticas.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando estatísticas...</div>
      </div>
    );
  }

  const resumo = stats?.resumo || {};
  const participantes = stats?.participantes || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <EscalasNavigation />
      
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Estatísticas de Participação
          </h1>
          <p className="text-purple-200">
            Métricas e análises de participação nas escalas
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total de Escalas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{resumo.totalEscalas || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total de Participações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{resumo.totalParticipacoes || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{resumo.totalConfirmados || 0}</div>
              <p className="text-sm text-purple-300 mt-1">
                {resumo.taxaConfirmacaoGeral || 0}% de taxa
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Ausentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{resumo.totalAusentes || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Participantes */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas por Participante</CardTitle>
            <CardDescription className="text-purple-300">
              Desempenho individual de cada participante
            </CardDescription>
          </CardHeader>
          <CardContent>
            {participantes.length === 0 ? (
              <p className="text-purple-400 text-center py-8">
                Nenhum dado de participação disponível ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-500/30">
                      <th className="text-left py-3 px-4 text-purple-200 font-semibold">Nome</th>
                      <th className="text-center py-3 px-4 text-purple-200 font-semibold">Participações</th>
                      <th className="text-center py-3 px-4 text-green-300 font-semibold">Confirmados</th>
                      <th className="text-center py-3 px-4 text-yellow-300 font-semibold">Pendentes</th>
                      <th className="text-center py-3 px-4 text-red-300 font-semibold">Ausentes</th>
                      <th className="text-center py-3 px-4 text-purple-200 font-semibold">Taxa Confirmação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantes.map((p: any, index: number) => (
                      <tr key={index} className="border-b border-purple-500/20 hover:bg-purple-900/20 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{p.nome}</td>
                        <td className="py-3 px-4 text-center text-purple-200">{p.totalParticipacoes}</td>
                        <td className="py-3 px-4 text-center text-green-400">{p.confirmados}</td>
                        <td className="py-3 px-4 text-center text-yellow-400">{p.pendentes}</td>
                        <td className="py-3 px-4 text-center text-red-400">{p.ausentes}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-semibold ${
                            p.taxaConfirmacao >= 80 ? 'text-green-400' :
                            p.taxaConfirmacao >= 50 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {p.taxaConfirmacao}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
