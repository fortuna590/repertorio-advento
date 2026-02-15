import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Ranking() {
  const { data: ranking, isLoading, refetch } = trpc.escalas.obterRanking.useQuery({
    limite: 20,
  });

  const { data: user } = trpc.auth.me.useQuery();

  const calcularPontuacaoMutation = trpc.escalas.calcularPontuacao.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    // Calcular pontuação do usuário atual ao carregar a página
    if (user?.id) {
      calcularPontuacaoMutation.mutate({ userId: user.id });
    }
  }, [user?.id]);

  const getPosicaoIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (posicao === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (posicao === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{posicao}</span>;
  };

  const getPosicaoColor = (posicao: number) => {
    if (posicao === 1) return "bg-yellow-500/20 border-yellow-500/50";
    if (posicao === 2) return "bg-gray-400/20 border-gray-400/50";
    if (posicao === 3) return "bg-amber-600/20 border-amber-600/50";
    return "bg-card border-border";
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Ranking de Participação</h1>
        </div>
        <p className="text-muted-foreground">
          Acompanhe o desempenho dos membros nas escalas. Ganhe pontos confirmando participações!
        </p>
      </div>

      {/* Sistema de Pontos */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>+10 pontos por participação confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span>-5 pontos por participação recusada/ausência</span>
          </div>
        </CardContent>
      </Card>

      {/* Ranking */}
      <div className="space-y-4">
        {ranking && ranking.length > 0 ? (
          ranking.map((membro: any) => (
            <Card
              key={membro.userId}
              className={`transition-all hover:shadow-lg ${getPosicaoColor(membro.posicao)} ${
                user?.id === membro.userId ? "ring-2 ring-primary" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getPosicaoIcon(membro.posicao)}
                  </div>

                  {/* Informações do Membro */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {membro.nome || membro.email || "Usuário"}
                      </h3>
                      {user?.id === membro.userId && (
                        <Badge variant="default" className="text-xs">
                          Você
                        </Badge>
                      )}
                    </div>
                    {membro.email && (
                      <p className="text-sm text-muted-foreground truncate">{membro.email}</p>
                    )}
                  </div>

                  {/* Estatísticas */}
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{membro.pontos}</p>
                      <p className="text-xs text-muted-foreground">Pontos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {membro.participacoesTotal}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">
                        {membro.participacoesConfirmadas}
                      </p>
                      <p className="text-xs text-muted-foreground">Confirmadas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-500">
                        {membro.participacoesRecusadas}
                      </p>
                      <p className="text-xs text-muted-foreground">Ausências</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma pontuação registrada
              </h3>
              <p className="text-muted-foreground">
                Comece a participar de escalas para aparecer no ranking!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
