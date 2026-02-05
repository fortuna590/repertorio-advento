import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Users, CheckCircle2, XCircle, Clock3, ChevronDown, ChevronUp, Filter, Archive, ArchiveRestore, CheckCheck } from "lucide-react";
import { EscalasNavigation } from "@/components/EscalasNavigation";
import { toast } from "sonner";
import { useEscalasNotifications } from "@/hooks/useEscalasNotifications";

export default function MinhasEscalas() {
  const { user, loading: authLoading } = useAuth();
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("todas");
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);
  const [escalaSelecionadas, setEscalasSelecionadas] = useState<Set<number>>(new Set());
  const [dialogConfirmarMassa, setDialogConfirmarMassa] = useState(false);
  
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

  const arquivarMutation = trpc.escalas.arquivarParticipacao.useMutation({
    onSuccess: () => {
      toast.success("Escala arquivada!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao arquivar", {
        description: error.message,
      });
    },
  });

  const confirmarMultiplasMutation = trpc.escalas.confirmarMultiplas.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.confirmados} escalas confirmadas!`, {
        description: data.erros.length > 0 ? `${data.erros.length} erros encontrados` : "Todas confirmadas com sucesso",
      });
      setEscalasSelecionadas(new Set());
      setDialogConfirmarMassa(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao confirmar escalas", {
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

  const toggleSelecao = (escalaId: number) => {
    setEscalasSelecionadas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(escalaId)) {
        newSet.delete(escalaId);
      } else {
        newSet.add(escalaId);
      }
      return newSet;
    });
  };

  const handleConfirmarSelecionadas = () => {
    const tokens = escalas
      ?.filter((e: any) => escalaSelecionadas.has(e.id))
      .map((e: any) => {
        const minhaParticipacao = e.participantes.find((p: any) => p.userId === user?.id);
        return minhaParticipacao?.token;
      })
      .filter(Boolean) as string[];

    if (tokens.length === 0) {
      toast.error("Nenhuma escala selecionada");
      return;
    }

    confirmarMultiplasMutation.mutate({ tokens });
  };

  const handleArquivar = (participanteId: number, arquivado: boolean) => {
    arquivarMutation.mutate({ participanteId, arquivado });
  };

  // Filtrar escalas
  const escalasFiltradas = useMemo(() => {
    if (!escalas) return [];

    const hoje = new Date().toISOString().split('T')[0];

    return escalas.filter((escala: any) => {
      const minhaParticipacao = escala.participantes.find((p: any) => p.userId === user?.id);
      if (!minhaParticipacao) return false;

      // Filtro de arquivamento
      if (!mostrarArquivadas && minhaParticipacao.arquivado === 1) return false;
      if (mostrarArquivadas && minhaParticipacao.arquivado === 0) return false;

      // Filtro de status
      if (filtroStatus !== "todos" && minhaParticipacao.status !== filtroStatus) return false;

      // Filtro de período
      if (filtroPeriodo === "proximas" && escala.data < hoje) return false;
      if (filtroPeriodo === "passadas" && escala.data >= hoje) return false;

      return true;
    });
  }, [escalas, filtroStatus, filtroPeriodo, mostrarArquivadas, user?.id]);

  // Contar escalas pendentes para seleção em massa
  const escalasPendentes = useMemo(() => {
    if (!escalas) return [];
    const hoje = new Date().toISOString().split('T')[0];
    return escalas.filter((e: any) => {
      const minhaParticipacao = e.participantes.find((p: any) => p.userId === user?.id);
      return minhaParticipacao?.status === "pendente" && 
             minhaParticipacao?.arquivado === 0 &&
             e.data >= hoje;
    });
  }, [escalas, user?.id]);

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
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Acesso Restrito</CardTitle>
              <CardDescription className="text-purple-300">Você precisa estar logado para ver suas escalas.</CardDescription>
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
      <div className="container py-8 space-y-6">
        {/* Barra de Filtros e Ações */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="w-4 h-4 text-purple-400" />
            
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="ausente">Ausente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="proximas">Próximas</SelectItem>
                <SelectItem value="passadas">Passadas</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="mostrar-arquivadas"
                checked={mostrarArquivadas}
                onCheckedChange={(checked) => setMostrarArquivadas(checked as boolean)}
              />
              <label htmlFor="mostrar-arquivadas" className="text-xs text-purple-200 cursor-pointer">
                Mostrar arquivadas
              </label>
            </div>

            {(filtroStatus !== "todos" || filtroPeriodo !== "todas") && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setFiltroStatus("todos");
                  setFiltroPeriodo("todas");
                }}
                className="text-xs h-8"
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {escalasPendentes.length > 0 && !mostrarArquivadas && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setDialogConfirmarMassa(true)}
              className="gap-2 text-xs h-9"
            >
              <CheckCheck className="w-4 h-4" />
              Confirmar em Massa ({escalasPendentes.length})
            </Button>
          )}
        </div>

        {/* Contador de Resultados */}
        <div className="text-sm text-purple-300">
          {escalasFiltradas.length} {escalasFiltradas.length === 1 ? "escala encontrada" : "escalas encontradas"}
        </div>

        {/* Lista de Escalas */}
        {!escalas || escalas.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Nenhuma escala encontrada</CardTitle>
              <CardDescription className="text-purple-300">
                Você ainda não foi convidado para nenhuma escala.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : escalasFiltradas.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Nenhuma escala com esses filtros</CardTitle>
              <CardDescription className="text-purple-300">
                Tente ajustar os filtros para ver mais escalas.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {escalasFiltradas.map((escala: any) => {
              const minhaParticipacao = escala.participantes.find(
                (p: any) => p.userId === user.id
              );
              const isExpanded = expandedCards.has(escala.id);
              const isSelecionada = escalaSelecionadas.has(escala.id);
              const totalParticipantes = escala.participantes.length;
              const confirmados = escala.participantes.filter((p: any) => p.status === "confirmado").length;
              const hoje = new Date().toISOString().split('T')[0];
              const isPassada = escala.data < hoje;
              const isArquivada = minhaParticipacao?.arquivado === 1;

              return (
                <Card key={escala.id} className={`bg-slate-800/50 backdrop-blur-sm border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all p-4 ${isArquivada ? 'opacity-60' : ''}`}>
                  {/* Cabeçalho Compacto */}
                  <div className="space-y-3">
                    {/* Checkbox + Título + Status */}
                    <div className="flex items-start gap-2">
                      {minhaParticipacao?.status === "pendente" && !isPassada && !isArquivada && (
                        <Checkbox 
                          checked={isSelecionada}
                          onCheckedChange={() => toggleSelecao(escala.id)}
                          className="mt-1"
                        />
                      )}
                      <div className="flex-1 flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-base text-white truncate flex-1">
                          {escala.titulo}
                          {isArquivada && <Archive className="inline w-3.5 h-3.5 ml-2 text-purple-400" />}
                        </h3>
                        {minhaParticipacao && getStatusBadge(minhaParticipacao.status, true)}
                      </div>
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
                      {minhaParticipacao?.status === "pendente" && minhaParticipacao.token && !isArquivada && (
                        <Button
                          size="sm"
                          onClick={() => confirmarMutation.mutate({ token: minhaParticipacao.token })}
                          disabled={confirmarMutation.isPending}
                          className="flex-1 text-xs h-8"
                        >
                          {confirmarMutation.isPending ? "Confirmando..." : "Confirmar"}
                        </Button>
                      )}
                      
                      {isPassada && !isArquivada && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArquivar(minhaParticipacao.id, true)}
                          disabled={arquivarMutation.isPending}
                          className="gap-1.5 text-xs h-8"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Arquivar
                        </Button>
                      )}

                      {isArquivada && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArquivar(minhaParticipacao.id, false)}
                          disabled={arquivarMutation.isPending}
                          className="gap-1.5 text-xs h-8"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          Desarquivar
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

      {/* Dialog de Confirmação em Massa */}
      <Dialog open={dialogConfirmarMassa} onOpenChange={setDialogConfirmarMassa}>
        <DialogContent className="bg-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Escalas em Massa</DialogTitle>
            <DialogDescription className="text-purple-300">
              Você tem {escalasPendentes.length} escalas pendentes de confirmação. Deseja confirmar todas de uma vez?
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {escalasPendentes.map((e: any) => (
              <div key={e.id} className="p-3 bg-slate-900/50 rounded border border-purple-500/20">
                <p className="font-semibold text-white text-sm">{e.titulo}</p>
                <p className="text-xs text-purple-300">
                  {new Date(e.data).toLocaleDateString("pt-BR")} {e.hora && `às ${e.hora}`}
                </p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogConfirmarMassa(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmarSelecionadas}
              disabled={confirmarMultiplasMutation.isPending}
            >
              {confirmarMultiplasMutation.isPending ? "Confirmando..." : `Confirmar Todas (${escalasPendentes.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
