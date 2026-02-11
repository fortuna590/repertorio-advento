import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, PieChartIcon, Calendar } from "lucide-react";
import { EscalasNavigation } from "@/components/EscalasNavigation";

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Relatorios() {
  const [equipeId, setEquipeId] = useState<string>("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Buscar equipes do usuário
  const { data: equipes = [] } = trpc.equipes.listar.useQuery();

  // Queries de gráficos
  const { data: dadosEvolucao = [], isLoading: loadingEvolucao } = trpc.escalas.obterDadosGraficoEvolucao.useQuery({
    equipeId: equipeId ? parseInt(equipeId) : undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  });

  const { data: dadosComparacao = [], isLoading: loadingComparacao } = trpc.escalas.obterDadosGraficoComparacao.useQuery({
    equipeId: equipeId ? parseInt(equipeId) : undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
    limite: 10,
  });

  const { data: dadosDistribuicao = [], isLoading: loadingDistribuicao } = trpc.escalas.obterDadosGraficoDistribuicao.useQuery({
    equipeId: equipeId ? parseInt(equipeId) : undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  });

  const { data: dadosHeatmap = [], isLoading: loadingHeatmap } = trpc.escalas.obterDadosHeatmap.useQuery({
    equipeId: equipeId ? parseInt(equipeId) : undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <EscalasNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-purple-400" />
            Relatórios Visuais
          </h1>
          <p className="text-purple-300">Análise detalhada de participações e estatísticas</p>
        </div>

        {/* Filtros */}
        <Card className="mb-8 bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
            <CardDescription className="text-purple-300">Personalize a visualização dos dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-purple-200">Equipe</Label>
                <Select value={equipeId} onValueChange={setEquipeId}>
                  <SelectTrigger className="bg-slate-900/50 border-purple-500/30 text-white">
                    <SelectValue placeholder="Todas as equipes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as equipes</SelectItem>
                    {equipes.map((equipe: any) => (
                      <SelectItem key={equipe.id} value={equipe.id.toString()}>
                        {equipe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-purple-200">Data Início</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="bg-slate-900/50 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-purple-200">Data Fim</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="bg-slate-900/50 border-purple-500/30 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Evolução Temporal */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Evolução Temporal
              </CardTitle>
              <CardDescription className="text-purple-300">
                Participações ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEvolucao ? (
                <div className="h-80 flex items-center justify-center text-purple-300">
                  Carregando...
                </div>
              ) : dadosEvolucao.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-purple-300">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={dadosEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
                    <XAxis dataKey="data" stroke="#c4b5fd" />
                    <YAxis stroke="#c4b5fd" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e1b4b',
                        border: '1px solid #7c3aed',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="confirmados" stroke="#10b981" name="Confirmados" strokeWidth={2} />
                    <Line type="monotone" dataKey="pendentes" stroke="#f59e0b" name="Pendentes" strokeWidth={2} />
                    <Line type="monotone" dataKey="ausentes" stroke="#ef4444" name="Ausentes" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Comparação entre Membros */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Top 10 Membros
              </CardTitle>
              <CardDescription className="text-purple-300">
                Comparação de participações
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingComparacao ? (
                <div className="h-80 flex items-center justify-center text-purple-300">
                  Carregando...
                </div>
              ) : dadosComparacao.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-purple-300">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dadosComparacao} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
                    <XAxis type="number" stroke="#c4b5fd" />
                    <YAxis dataKey="nome" type="category" width={100} stroke="#c4b5fd" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e1b4b',
                        border: '1px solid #7c3aed',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="confirmados" fill="#10b981" name="Confirmados" />
                    <Bar dataKey="pendentes" fill="#f59e0b" name="Pendentes" />
                    <Bar dataKey="ausentes" fill="#ef4444" name="Ausentes" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Distribuição por Função */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
                Distribuição por Função
              </CardTitle>
              <CardDescription className="text-purple-300">
                Participações por função
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDistribuicao ? (
                <div className="h-80 flex items-center justify-center text-purple-300">
                  Carregando...
                </div>
              ) : dadosDistribuicao.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-purple-300">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={dadosDistribuicao}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ funcao, percent }) => `${funcao}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {dadosDistribuicao.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e1b4b',
                        border: '1px solid #7c3aed',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Heatmap de Frequência por Dia da Semana */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Frequência por Dia da Semana
              </CardTitle>
              <CardDescription className="text-purple-300">
                Escalas por dia da semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHeatmap ? (
                <div className="h-80 flex items-center justify-center text-purple-300">
                  Carregando...
                </div>
              ) : dadosHeatmap.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-purple-300">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dadosHeatmap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4c1d95" />
                    <XAxis dataKey="dia" stroke="#c4b5fd" />
                    <YAxis stroke="#c4b5fd" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e1b4b',
                        border: '1px solid #7c3aed',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="total" fill="#8b5cf6" name="Total de Escalas" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
