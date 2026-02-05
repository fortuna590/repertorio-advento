import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, CheckCircle2, XCircle, Clock3, ChevronDown, ChevronUp } from "lucide-react";
import { EscalasNavigation } from "@/components/EscalasNavigation";
import { toast } from "sonner";
import { useEscalasNotifications } from "@/hooks/useEscalasNotifications";

export default function MinhasEscalas() {
  const { user, loading: authLoading } = useAuth();
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  
  // Hook de notificações em tempo real
  const { totalEscalas, escalasNaoConfirmadas } = useEscalasNotifications(user?.id);

  const { data: escalas, isLoading, refetch } = trpc.escalas.minhasEscalas.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const confirmarMutation = trpc.escalas.confirmarPorToken.useMutation({
    onSuccess: () => {
      toast.success("Presença confirmada!", {
        description: "Sua confirmação foi registrada com sucesso.",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao confirmar", {
        description: error.message,
      });
    },
  });

  const toggleExpanded = (escalaId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(escalaId)) {
        newSet.delete(escalaId);
      } else {
        newSet.add(escalaId);
      }
      return newSet;
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <EscalasNavigation />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <EscalasNavigation />
        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>Você precisa estar logado para ver suas escalas.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmado":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case "ausente":
        return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Clock3 className="w-3.5 h-3.5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string, compact: boolean = false) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      confirmado: "default",
      pendente: "secondary",
      ausente: "destructive",
    };
    
    if (compact) {
      return (
        <Badge variant={variants[status] || "secondary"} className="gap-1 text-xs h-6">
          {getStatusIcon(status)}
          {status === "confirmado" ? "Confirmado" : status === "ausente" ? "Ausente" : "Pendente"}
        </Badge>
      );
    }
    
    return (
      <Badge variant={variants[status] || "secondary"} className="gap-1">
        {getStatusIcon(status)}
        {status === "confirmado" ? "Confirmado" : status === "ausente" ? "Ausente" : "Pendente"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <EscalasNavigation />
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Minhas Escalas
          </h1>
          <p className="text-purple-200">
            Escalas em que você foi convidado para participar
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container py-8">
        {!escalas || escalas.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Nenhuma escala encontrada</CardTitle>
              <CardDescription className="text-purple-300">
                Você ainda não foi convidado para nenhuma escala.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {escalas.map((escala: any) => {
              const minhaParticipacao = escala.participantes.find(
                (p: any) => p.userId === user.id
              );
              const isExpanded = expandedCards.has(escala.id);
              const totalParticipantes = escala.participantes.length;
              const confirmados = escala.participantes.filter((p: any) => p.status === "confirmado").length;

              return (
                <Card key={escala.id} className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all p-4">
                  {/* Cabeçalho Compacto */}
                  <div className="space-y-3">
                    {/* Título e Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-base text-white truncate flex-1">
                        {escala.titulo}
                      </h3>
                      {minhaParticipacao && getStatusBadge(minhaParticipacao.status, true)}
                    </div>

                    {/* Informações Essenciais */}
                    <div className="space-y-1.5 text-xs text-purple-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(escala.data).toLocaleDateString("pt-BR")}
                        {escala.hora && (
                          <>
                            <Clock className="w-3.5 h-3.5 ml-2" />
                            {escala.hora}
                          </>
                        )}
                      </div>
                      {escala.local && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{escala.local}</span>
                        </div>
                      )}
                    </div>

                    {/* Sua Função */}
                    {minhaParticipacao && (
                      <div className="p-2 bg-purple-900/30 rounded border border-purple-500/30">
                        <p className="text-xs text-purple-200">Sua função:</p>
                        <p className="text-sm text-white font-semibold">
                          {minhaParticipacao.funcao?.nome || "Função não encontrada"}
                        </p>
                      </div>
                    )}

                    {/* Estatísticas Compactas */}
                    <div className="flex items-center gap-3 text-xs p-2 bg-slate-900/50 rounded">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-purple-200">{totalParticipantes}</span>
                      </div>
                      {confirmados > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-green-400">✓ {confirmados}</span>
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2">
                      {minhaParticipacao?.status === "pendente" && minhaParticipacao.token && (
                        <Button
                          size="sm"
                          onClick={() => confirmarMutation.mutate({ token: minhaParticipacao.token })}
                          disabled={confirmarMutation.isPending}
                          className="flex-1 text-xs h-8"
                        >
                          {confirmarMutation.isPending ? "Confirmando..." : "Confirmar"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpanded(escala.id)}
                        className="flex-1 text-xs h-8"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5 mr-1.5" />
                            Ver Detalhes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Detalhes Expandidos */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-purple-500/30 space-y-3">
                      {escala.descricao && (
                        <div>
                          <p className="text-xs text-purple-400 mb-1">Descrição:</p>
                          <p className="text-sm text-purple-200">{escala.descricao}</p>
                        </div>
                      )}

                      {/* Lista Completa de Participantes */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          <h4 className="text-sm font-semibold text-white">
                            Todos os Participantes ({escala.participantes.length})
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {escala.participantes.map((p: any) => (
                            <div
                              key={p.id}
                              className={`flex items-center justify-between p-2 rounded text-xs ${
                                p.userId === user.id 
                                  ? "bg-purple-900/40 border border-purple-500/40" 
                                  : "bg-slate-900/50"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">
                                  {p.nome}
                                  {p.userId === user.id && (
                                    <span className="text-purple-300 ml-1">(Você)</span>
                                  )}
                                </p>
                                <p className="text-purple-400 truncate">
                                  {p.funcao?.nome || "Função não encontrada"}
                                </p>
                              </div>
                              {getStatusBadge(p.status, true)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
