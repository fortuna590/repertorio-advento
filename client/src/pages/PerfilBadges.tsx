import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, TrendingUp, Target, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PerfilBadges() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [stats, setStats] = useState<any>({
    pontos: 0,
    participacoesTotal: 0,
    participacoesConfirmadas: 0,
    participacoesRecusadas: 0,
  });
  
  const { data: badges, isLoading: loadingBadges, refetch: refetchBadges } = trpc.escalas.listarBadgesUsuario.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const calcularPontuacaoMutation = trpc.escalas.calcularPontuacao.useMutation({
    onSuccess: (data) => {
      setStats(data);
      refetchBadges();
      if (data.novasBadges && data.novasBadges.length > 0) {
        data.novasBadges.forEach((badge: any) => {
          toast.success(`🎉 Badge Conquistada: ${badge.icone} ${badge.nome}`, {
            description: badge.descricao,
            duration: 5000,
          });
        });
      }
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user?.id) {
      calcularPontuacaoMutation.mutate({ userId: user.id });
    }
  }, [user?.id]);

  // Buscar todas as badges disponíveis
  const { data: todasBadges, isLoading: loadingTodasBadges } = trpc.escalas.obterRanking.useQuery(
    { limite: 1 },
    { enabled: false }
  );

  if (authLoading || !user) {
    return (
      <div className="container py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isLoading = calcularPontuacaoMutation.isPending || loadingBadges;
  const badgesConquistadas = badges || [];

  // Badges mockadas para exibição (em produção, buscar do backend)
  const todasBadgesDisponiveis = [
    { id: 1, nome: "Primeira Participação", icone: "🎵", cor: "#10b981", requisito: 1, tipo: "participacoes" },
    { id: 2, nome: "Músico Fiel", icone: "🎵", cor: "#10b981", requisito: 5, tipo: "participacoes" },
    { id: 4, nome: "Dedicação Total", icone: "⭐", cor: "#3b82f6", requisito: 10, tipo: "confirmacoes" },
    { id: 5, nome: "Servo Dedicado", icone: "⛪", cor: "#3b82f6", requisito: 50, tipo: "confirmacoes" },
    { id: 6, nome: "Guardião da Liturgia", icone: "✝️", cor: "#f59e0b", requisito: 100, tipo: "confirmacoes" },
    { id: 7, nome: "Ministro Exemplar", icone: "👑", cor: "#ef4444", requisito: 20, tipo: "confirmacoes" },
  ];

  const badgesConquistadasIds = badgesConquistadas.map((b: any) => b.badgeId);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        </div>
        <p className="text-muted-foreground">
          Acompanhe suas estatísticas e conquistas no LouvaMais
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Pontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.pontos}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Participações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{stats.participacoesTotal}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.participacoesConfirmadas}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">
              {badgesConquistadas.length}/6
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Galeria de Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Minhas Conquistas
          </CardTitle>
          <CardDescription>
            Badges conquistadas através da sua participação nas escalas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {todasBadgesDisponiveis.map((badge) => {
              const conquistada = badgesConquistadasIds.includes(badge.id);
              const progresso = badge.tipo === "participacoes" 
                ? Math.min((stats.participacoesTotal / badge.requisito) * 100, 100)
                : Math.min((stats.participacoesConfirmadas / badge.requisito) * 100, 100);

              return (
                <Card
                  key={badge.id}
                  className={`relative transition-all ${
                    conquistada
                      ? "border-primary/50 bg-primary/5 hover:shadow-lg"
                      : "border-border/50 bg-muted/20 opacity-60"
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    {!conquistada && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-4xl mb-2">{badge.icone}</div>
                    <h3 className="font-semibold text-sm mb-1">{badge.nome}</h3>
                    {conquistada ? (
                      <Badge variant="default" className="text-xs">
                        Conquistada
                      </Badge>
                    ) : (
                      <div className="space-y-2">
                        <Progress value={progresso} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {badge.tipo === "participacoes"
                            ? `${stats.participacoesTotal}/${badge.requisito} participações`
                            : `${stats.participacoesConfirmadas}/${badge.requisito} confirmações`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
