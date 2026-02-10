import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, BarChart3, TrendingUp, Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default function DashboardEstatisticas() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [equipeId, setEquipeId] = useState<number | undefined>(undefined);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Buscar equipes do usuário
  const { data: equipes = [] } = trpc.equipes.listar.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Buscar estatísticas
  const { data: estatisticas, isLoading } = trpc.escalas.obterEstatisticas.useQuery(
    {
      userId: user?.id.toString() || "",
      equipeId,
      dataInicio,
      dataFim,
    },
    { enabled: !!user }
  );

  const membros = estatisticas?.membros || [];
  const totalEscalas = estatisticas?.totalEscalas || 0;

  // Calcular estatísticas gerais
  const totalParticipacoes = membros.reduce((acc, m) => acc + m.totalParticipacoes, 0);
  const totalConfirmadas = membros.reduce((acc, m) => acc + m.confirmadas, 0);
  const totalPendentes = membros.reduce((acc, m) => acc + m.pendentes, 0);
  const totalAusencias = membros.reduce((acc, m) => acc + m.ausencias, 0);

  const taxaConfirmacaoGeral = totalParticipacoes > 0
    ? Math.round((totalConfirmadas / totalParticipacoes) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/escalas")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              Dashboard de Estatísticas
            </h1>
            <p className="text-muted-foreground">
              Acompanhe a participação e frequência dos membros
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre as estatísticas por equipe e período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Equipe</Label>
                <Select
                  value={equipeId?.toString() || "todas"}
                  onValueChange={(value) => setEquipeId(value === "todas" ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as equipes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as equipes</SelectItem>
                    {equipes.map((equipe) => (
                      <SelectItem key={equipe.id} value={equipe.id.toString()}>
                        {equipe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>

            {(equipeId || dataInicio || dataFim) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEquipeId(undefined);
                  setDataInicio("");
                  setDataFim("");
                }}
                className="mt-4"
              >
                Limpar filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Escalas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-primary" />
                <span className="text-3xl font-bold">{totalEscalas}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Confirmadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <span className="text-3xl font-bold">{totalConfirmadas}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {taxaConfirmacaoGeral}% de taxa de confirmação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-8 h-8 text-yellow-500" />
                <span className="text-3xl font-bold">{totalPendentes}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ausências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="w-8 h-8 text-red-500" />
                <span className="text-3xl font-bold">{totalAusencias}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Estatísticas por Membro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Estatísticas por Membro
            </CardTitle>
            <CardDescription>
              Participação e frequência de cada membro
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : membros.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma estatística encontrada para o período selecionado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Membro</th>
                      <th className="text-center py-3 px-4 font-medium">Total</th>
                      <th className="text-center py-3 px-4 font-medium">Confirmadas</th>
                      <th className="text-center py-3 px-4 font-medium">Pendentes</th>
                      <th className="text-center py-3 px-4 font-medium">Ausências</th>
                      <th className="text-center py-3 px-4 font-medium">Taxa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membros.map((membro, index) => (
                      <tr key={index} className="border-b hover:bg-accent/50">
                        <td className="py-3 px-4 font-medium">{membro.nome}</td>
                        <td className="text-center py-3 px-4">{membro.totalParticipacoes}</td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            {membro.confirmadas}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            {membro.pendentes}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            {membro.ausencias}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${membro.taxaConfirmacao}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{membro.taxaConfirmacao}%</span>
                          </div>
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
