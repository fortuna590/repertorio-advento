import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { toast } from "sonner";

export default function MinhasEscalas() {
  const { user, loading: authLoading } = useAuth();

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

  if (authLoading || isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar logado para ver suas escalas.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmado":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "ausente":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock3 className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      confirmado: "default",
      pendente: "secondary",
      ausente: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="gap-1">
        {getStatusIcon(status)}
        {status === "confirmado" ? "Confirmado" : status === "ausente" ? "Ausente" : "Pendente"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="border-b border-purple-200/50 bg-white/80 backdrop-blur-sm">
        <div className="container py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Minhas Escalas
          </h1>
          <p className="text-muted-foreground">
            Escalas em que você foi convidado para participar
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container py-8">
        {!escalas || escalas.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma escala encontrada</CardTitle>
              <CardDescription>
                Você ainda não foi convidado para nenhuma escala.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            {escalas.map((escala: any) => {
              const minhaParticipacao = escala.participantes.find(
                (p: any) => p.userId === user.id
              );

              return (
                <Card key={escala.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{escala.titulo}</CardTitle>
                        {escala.descricao && (
                          <CardDescription>{escala.descricao}</CardDescription>
                        )}
                      </div>
                      {minhaParticipacao && getStatusBadge(minhaParticipacao.status)}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(escala.data).toLocaleDateString("pt-BR")}
                      </div>
                      {escala.hora && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {escala.hora}
                        </div>
                      )}
                      {escala.local && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {escala.local}
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Minha Função */}
                    {minhaParticipacao && (
                      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">Sua função:</p>
                            <p className="text-lg text-primary font-bold">
                              {minhaParticipacao.funcao?.nome || "Função não encontrada"}
                            </p>
                          </div>
                          {minhaParticipacao.status === "pendente" && minhaParticipacao.token && (
                            <Button
                              onClick={() => confirmarMutation.mutate({ token: minhaParticipacao.token })}
                              disabled={confirmarMutation.isPending}
                            >
                              {confirmarMutation.isPending ? "Confirmando..." : "Confirmar Presença"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Outros Participantes */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4" />
                        <h3 className="font-semibold">Participantes ({escala.participantes.length})</h3>
                      </div>
                      <div className="grid gap-2">
                        {escala.participantes.map((p: any) => (
                          <div
                            key={p.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              p.userId === user.id ? "bg-primary/5 border-primary/30" : "bg-muted/30"
                            }`}
                          >
                            <div>
                              <p className="font-medium">
                                {p.nome}
                                {p.userId === user.id && (
                                  <span className="text-primary ml-2">(Você)</span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {p.funcao?.nome || "Função não encontrada"}
                              </p>
                            </div>
                            {getStatusBadge(p.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
