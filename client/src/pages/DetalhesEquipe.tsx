import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2, Plus, Edit, Trash2, Users, Calendar } from "lucide-react";
import { getLoginUrl } from "@/const";

const TIPO_LABELS: Record<string, string> = {
  musica: "Música",
  grupo_oracao: "Grupo de Oração",
  leitura: "Leitura",
  acolhida: "Acolhida",
  outro: "Outro",
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" }> = {
  ativo: { label: "Ativo", variant: "default" },
  inativo: { label: "Inativo", variant: "secondary" },
};

export default function DetalhesEquipe() {
  const { equipeId } = useParams<{ equipeId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: equipe, isLoading: loadingEquipe } = trpc.equipes.buscarPorId.useQuery(
    { id: Number(equipeId) },
    { enabled: !!user }
  );

  const { data: membros = [], isLoading: loadingMembros } = trpc.membros.listarPorEquipe.useQuery(
    { equipeId: Number(equipeId) },
    { enabled: !!user }
  );

  const deletarEquipeMutation = trpc.equipes.deletar.useMutation({
    onSuccess: () => {
      setLocation("/equipes");
    },
    onError: (error) => {
      alert("Erro ao deletar equipe: " + error.message);
    },
  });

  const deletarMembroMutation = trpc.membros.deletar.useMutation({
    onSuccess: () => {
      // Recarregar lista de membros
      window.location.reload();
    },
    onError: (error) => {
      alert("Erro ao deletar membro: " + error.message);
    },
  });

  const handleDeletarEquipe = () => {
    if (confirm("Tem certeza que deseja deletar esta equipe? Esta ação não pode ser desfeita.")) {
      deletarEquipeMutation.mutate({ id: Number(equipeId) });
    }
  };

  const handleDeletarMembro = (membroId: number, nome: string) => {
    if (confirm(`Tem certeza que deseja remover ${nome} da equipe?`)) {
      deletarMembroMutation.mutate({ id: membroId });
    }
  };

  if (authLoading || loadingEquipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (!equipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Equipe não encontrada</p>
        <Button onClick={() => setLocation("/equipes")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Equipes
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container py-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => setLocation("/equipes")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {equipe.nome}
                </h1>
                <Badge variant="outline">{TIPO_LABELS[equipe.tipo]}</Badge>
              </div>
              {equipe.descricao && (
                <p className="text-muted-foreground">{equipe.descricao}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setLocation(`/escalas/criar-de-equipe?equipeId=${equipeId}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Escala
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/equipes/${equipeId}/escalas`)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Ver Escalas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/equipes/${equipeId}/editar`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeletarEquipe}
                disabled={deletarEquipeMutation.isPending}
              >
                {deletarEquipeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Deletar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Membros */}
      <main className="container py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Membros da Equipe
                </CardTitle>
                <CardDescription>
                  {membros.length} {membros.length === 1 ? "membro" : "membros"} cadastrado{membros.length !== 1 && "s"}
                </CardDescription>
              </div>
              <Button onClick={() => setLocation(`/equipes/${equipeId}/membros/novo`)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Membro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingMembros ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : membros.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Nenhum membro cadastrado ainda
                </p>
                <Button onClick={() => setLocation(`/equipes/${equipeId}/membros/novo`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Membro
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {membros.map((membro) => (
                  <Card key={membro.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{membro.nome}</CardTitle>
                          <CardDescription className="truncate">
                            {membro.funcao || "Sem função definida"}
                          </CardDescription>
                        </div>
                        <Badge variant={STATUS_LABELS[membro.status].variant}>
                          {STATUS_LABELS[membro.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {membro.instrumento && (
                        <p className="text-sm text-muted-foreground">
                          🎸 {membro.instrumento}
                        </p>
                      )}
                      {membro.email && (
                        <p className="text-sm text-muted-foreground truncate">
                          ✉️ {membro.email}
                        </p>
                      )}
                      {membro.telefone && (
                        <p className="text-sm text-muted-foreground">
                          📞 {membro.telefone}
                        </p>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setLocation(`/equipes/${equipeId}/membros/${membro.id}/editar`)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletarMembro(membro.id, membro.nome)}
                          disabled={deletarMembroMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
