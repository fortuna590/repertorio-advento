import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2, UserCog } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditarMembro() {
  const { equipeId, membroId } = useParams<{ equipeId: string; membroId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [funcao, setFuncao] = useState("");

  const { data: equipe } = trpc.equipes.buscarPorId.useQuery(
    { id: Number(equipeId) },
    { enabled: !!user }
  );

  const { data: membro, isLoading: membroLoading } = trpc.membros.buscarPorId.useQuery(
    { id: Number(membroId) },
    { enabled: !!user && !!membroId }
  );

  // Preencher formulário com dados do membro
  useEffect(() => {
    if (membro) {
      setNome(membro.nome || "");
      setEmail(membro.email || "");
      setTelefone(membro.telefone || "");
      setFuncao(membro.funcao || "");
    }
  }, [membro]);

  const atualizarMembroMutation = trpc.membros.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Membro atualizado!", {
        description: `${nome} foi atualizado com sucesso.`,
      });
      setLocation(`/equipes/${equipeId}`);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar membro", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast.error("Nome obrigatório", {
        description: "Por favor, informe o nome do membro.",
      });
      return;
    }

    atualizarMembroMutation.mutate({
      id: Number(membroId),
      nome: nome.trim(),
      status: "ativo",
      email: email.trim() || undefined,
      telefone: telefone.trim() || undefined,
      funcao: funcao.trim() || undefined,
    });
  };

  if (authLoading || membroLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container py-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => setLocation(`/equipes/${equipeId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <UserCog className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Editar Membro
              </h1>
              {equipe && (
                <p className="text-muted-foreground">
                  Editar membro da equipe {equipe.nome}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Formulário */}
      <main className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Informações do Membro</CardTitle>
            <CardDescription>
              Atualize os dados do membro da equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Ex: João da Silva"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funcao">Função</Label>
                  <Input
                    id="funcao"
                    placeholder="Ex: Violão, Vocal, Leitura"
                    value={funcao}
                    onChange={(e) => setFuncao(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/equipes/${equipeId}`)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={atualizarMembroMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {atualizarMembroMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <UserCog className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
