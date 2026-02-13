import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star, Crown, Flame, CheckCircle, Shield, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const iconMap: Record<string, any> = {
  Star,
  Award,
  Trophy,
  Crown,
  Flame,
  CheckCircle,
  Shield,
  Zap,
  Medal,
};

export default function Ranking() {
  const [equipeId, setEquipeId] = useState<number | undefined>(undefined);
  const [limite, setLimite] = useState(10);

  const { data: ranking, isLoading: loadingRanking } = trpc.escalas.obterRanking.useQuery({
    equipeId,
    limite,
  });

  const { data: equipes } = trpc.equipes.listar.useQuery();

  const { data: metas, isLoading: loadingMetas } = equipeId
    ? trpc.escalas.listarMetasEquipe.useQuery({ equipeId, status: 'ativa' })
    : { data: undefined, isLoading: false };

  const getPosicaoIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (posicao === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (posicao === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{posicao}</span>;
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ranking de Participação</h1>
        <p className="text-muted-foreground">
          Acompanhe a classificação dos membros mais ativos e suas conquistas
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          className="border rounded-md px-3 py-2"
          value={equipeId || ""}
          onChange={(e) => setEquipeId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Todas as equipes</option>
          {equipes?.map((equipe: any) => (
            <option key={equipe.id} value={equipe.id}>
              {equipe.nome}
            </option>
          ))}
        </select>

        <select
          className="border rounded-md px-3 py-2"
          value={limite}
          onChange={(e) => setLimite(Number(e.target.value))}
        >
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
      </div>

      {/* Metas da Equipe */}
      {equipeId && metas && metas.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Metas da Equipe</CardTitle>
            <CardDescription>Progresso das metas ativas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metas.map((meta: any) => (
              <div key={meta.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{meta.titulo}</p>
                    {meta.descricao && (
                      <p className="text-sm text-muted-foreground">{meta.descricao}</p>
                    )}
                  </div>
                  <Badge variant={meta.status === 'concluida' ? 'default' : 'secondary'}>
                    {meta.percentual}%
                  </Badge>
                </div>
                <Progress value={meta.percentual} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {meta.progresso} / {meta.objetivo} {meta.tipo}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabela de Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Classificação</CardTitle>
          <CardDescription>
            Membros ordenados por pontuação (10 pontos por confirmação, -5 por ausência)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRanking ? (
            <p className="text-center py-8 text-muted-foreground">Carregando ranking...</p>
          ) : ranking && ranking.length > 0 ? (
            <div className="space-y-4">
              {ranking.map((membro: any) => (
                <div
                  key={membro.membroId}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* Posição */}
                  <div className="flex-shrink-0">
                    {getPosicaoIcon(membro.posicao)}
                  </div>

                  {/* Info do Membro */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{membro.nome}</p>
                    <p className="text-sm text-muted-foreground">{membro.funcao}</p>
                  </div>

                  {/* Estatísticas */}
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-lg">{membro.pontos}</p>
                      <p className="text-xs text-muted-foreground">Pontos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{membro.participacoesConfirmadas}</p>
                      <p className="text-xs text-muted-foreground">Confirmadas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-muted-foreground">{membro.participacoesTotal}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Abrir modal com badges do membro
                      alert(`Ver badges de ${membro.nome}`);
                    }}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Badges
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum membro encontrado. Crie escalas e adicione participantes para gerar o ranking.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
