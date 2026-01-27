import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, CheckCircle2, TrendingUp, Calendar, Award } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function EstatisticasEscalas() {
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.escalas.estatisticas.useQuery(
    { userId: user?.id || "" },
    { enabled: !!user }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Carregando estatísticas...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhuma estatística disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Estatísticas de Escalas</h1>
          <p className="text-gray-700 mt-1">Métricas e análises do seu gerenciamento de escalas</p>
        </div>
        <Link href="/escalas">
          <Button variant="outline">Voltar para Escalas</Button>
        </Link>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Escalas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEscalas}</div>
            <p className="text-xs text-muted-foreground">Escalas criadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipantes}</div>
            <p className="text-xs text-muted-foreground">Participantes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Confirmação</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.taxaConfirmacao}%</div>
            <p className="text-xs text-muted-foreground">Participantes confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(stats.escalasPorMes).slice(-1)[0] || 0}
            </div>
            <p className="text-xs text-muted-foreground">Escalas este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Escalas por Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Escalas por Mês (Últimos 6 meses)
          </CardTitle>
          <CardDescription>Evolução do número de escalas criadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.escalasPorMes).map(([mes, count]) => (
              <div key={mes} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-700">{mes}</div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-500"
                      style={{
                        width: `${Math.max((count / Math.max(...Object.values(stats.escalasPorMes))) * 100, 5)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-semibold text-gray-900">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participantes Mais Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Participantes Mais Ativos
            </CardTitle>
            <CardDescription>Top 5 participantes com mais escalas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.participantesAtivos.length > 0 ? (
                stats.participantesAtivos.map((p: any, index: number) => (
                  <div key={p.nome} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{p.nome}</div>
                      <div className="text-sm text-gray-600">{p.participacoes} participações</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum participante ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Funções Mais Requisitadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Funções Mais Requisitadas
            </CardTitle>
            <CardDescription>Top 5 funções mais utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.funcoesRequisitadas.length > 0 ? (
                stats.funcoesRequisitadas.map((f: any, index: number) => (
                  <div key={f.nome} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{f.nome}</div>
                      <div className="text-sm text-gray-600">{f.count} vezes</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma função ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
