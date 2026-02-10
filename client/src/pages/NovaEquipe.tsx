import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { getLoginUrl } from "@/const";

const TIPO_OPTIONS = [
  { value: "musica", label: "Música" },
  { value: "grupo_oracao", label: "Grupo de Oração" },
  { value: "leitura", label: "Leitura" },
  { value: "acolhida", label: "Acolhida" },
  { value: "outro", label: "Outro" },
];

interface NovaEquipeProps {
  equipeId?: string;
}

export default function NovaEquipe({ equipeId }: NovaEquipeProps) {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"musica" | "grupo_oracao" | "leitura" | "acolhida" | "outro">("musica");
  const [descricao, setDescricao] = useState("");

  const isEdicao = !!equipeId;

  // Buscar dados da equipe se estiver editando
  const { data: equipe, isLoading: loadingEquipe } = trpc.equipes.buscarPorId.useQuery(
    { id: Number(equipeId) },
    { enabled: isEdicao && !!user }
  );

  // Preencher formulário com dados da equipe
  useEffect(() => {
    if (equipe) {
      setNome(equipe.nome);
      setTipo(equipe.tipo);
      setDescricao(equipe.descricao || "");
    }
  }, [equipe]);

  const criarMutation = trpc.equipes.criar.useMutation({
    onSuccess: (data) => {
      setLocation(`/equipes/${data.equipeId}`);
    },
    onError: (error) => {
      alert("Erro ao criar equipe: " + error.message);
    },
  });

  const atualizarMutation = trpc.equipes.atualizar.useMutation({
    onSuccess: () => {
      setLocation(`/equipes/${equipeId}`);
    },
    onError: (error) => {
      alert("Erro ao atualizar equipe: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Por favor, informe o nome da equipe.");
      return;
    }

    if (isEdicao) {
      atualizarMutation.mutate({
        id: Number(equipeId),
        nome,
        tipo,
        descricao,
      });
    } else {
      criarMutation.mutate({
        nome,
        tipo,
        descricao,
      });
    }
  };

  if (authLoading || (isEdicao && loadingEquipe)) {
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

  const isSubmitting = criarMutation.isPending || atualizarMutation.isPending;

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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {isEdicao ? "Editar Equipe" : "Nova Equipe"}
          </h1>
        </div>
      </header>

      {/* Formulário */}
      <main className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Equipe</CardTitle>
            <CardDescription>
              Preencha os dados básicos da sua equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Equipe *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Coral Sagrado"
                  required
                />
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva a equipe, seus objetivos, horários de ensaio, etc."
                  rows={4}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/equipes")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEdicao ? "Salvar Alterações" : "Criar Equipe"}
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
