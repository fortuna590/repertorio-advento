import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { useLocation, useSearch } from "wouter";
import { ArrowLeft, Calendar, Users, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Funcao {
  nome: string;
  descricao: string;
  ordem: number;
  membrosIds: number[];
}

export default function EscalaDeEquipeForm() {
  const { user } = useAuth();
  const searchParams = new URLSearchParams(useSearch());
  const [, setLocation] = useLocation();

  const [equipeId, setEquipeId] = useState<number | null>(null);
  
  // Pré-selecionar equipe se vier da URL
  useEffect(() => {
    const equipeIdParam = searchParams.get("equipeId");
    if (equipeIdParam) {
      setEquipeId(parseInt(equipeIdParam));
    }
  }, []);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState<"musicos" | "reuniao" | "grupo_oracao" | "personalizado">("musicos");
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [membroComConflito, setMembroComConflito] = useState<any>(null);
  const [funcaoIndexConflito, setFuncaoIndexConflito] = useState<number | null>(null);
  const [membroIdConflito, setMembroIdConflito] = useState<number | null>(null);

  // Buscar equipes do usuário
  const { data: equipes = [] } = trpc.equipes.listar.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Buscar membros da equipe selecionada
  const { data: membros = [] } = trpc.membros.listarPorEquipe.useQuery(
    { equipeId: equipeId || 0 },
    { enabled: !!equipeId }
  );

  // Buscar indisponibilidades quando data for selecionada
  const { data: indisponibilidades = [] } = trpc.escalas.verificarIndisponibilidades.useQuery(
    {
      equipeId: equipeId!,
      data: data,
    },
    { enabled: !!equipeId && !!data }
  );

  const criarEscalaMutation = trpc.escalas.criarEscalaDeEquipe.useMutation({
    onSuccess: (data) => {
      alert("Escala criada com sucesso!");
      setLocation(`/escalas/${data.escalaId}`);
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const adicionarFuncao = () => {
    setFuncoes([
      ...funcoes,
      {
        nome: "",
        descricao: "",
        ordem: funcoes.length + 1,
        membrosIds: [],
      },
    ]);
  };

  const removerFuncao = (index: number) => {
    setFuncoes(funcoes.filter((_, i) => i !== index));
  };

  const atualizarFuncao = (index: number, campo: keyof Funcao, valor: any) => {
    const novasFuncoes = [...funcoes];
    novasFuncoes[index] = { ...novasFuncoes[index], [campo]: valor };
    setFuncoes(novasFuncoes);
  };

  const toggleMembro = (funcaoIndex: number, membroId: number) => {
    const funcao = funcoes[funcaoIndex];
    
    // Verificar se o membro tem indisponibilidade
    const conflitos = Array.isArray(indisponibilidades) ? indisponibilidades : indisponibilidades?.conflitos || [];
    const conflito = conflitos.find((ind: any) => ind.id === membroId);
    
    if (conflito && !funcao.membrosIds.includes(membroId)) {
      // Se está tentando adicionar e há conflito, mostrar modal
      setMembroComConflito(conflito);
      setFuncaoIndexConflito(funcaoIndex);
      setMembroIdConflito(membroId);
      return;
    }

    // Se não há conflito ou está removendo, proceder normalmente
    const membrosIds = funcao.membrosIds.includes(membroId)
      ? funcao.membrosIds.filter((id) => id !== membroId)
      : [...funcao.membrosIds, membroId];
    atualizarFuncao(funcaoIndex, "membrosIds", membrosIds);
  };

  const confirmarAdicaoComConflito = () => {
    if (funcaoIndexConflito !== null && membroIdConflito !== null) {
      const funcao = funcoes[funcaoIndexConflito];
      const membrosIds = [...funcao.membrosIds, membroIdConflito];
      atualizarFuncao(funcaoIndexConflito, "membrosIds", membrosIds);
    }
    setMembroComConflito(null);
    setFuncaoIndexConflito(null);
    setMembroIdConflito(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !equipeId) {
      alert("Selecione uma equipe");
      return;
    }

    if (!titulo || !data) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    criarEscalaMutation.mutate({
      userId: user.id.toString(),
      equipeId,
      titulo,
      descricao,
      data,
      hora,
      local,
      tipo,
      funcoes,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-4xl">
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
              <Calendar className="w-8 h-8 text-primary" />
              Criar Escala de Equipe
            </h1>
            <p className="text-muted-foreground">
              Crie uma escala a partir de uma equipe cadastrada
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Escala</CardTitle>
              <CardDescription>
                Preencha os dados básicos da escala
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selecionar Equipe */}
              <div className="space-y-2">
                <Label htmlFor="equipe">Equipe *</Label>
                <Select
                  value={equipeId?.toString() || ""}
                  onValueChange={(value) => setEquipeId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipes.map((equipe) => (
                      <SelectItem key={equipe.id} value={equipe.id.toString()}>
                        {equipe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Missa de Domingo - 15/02"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição adicional da escala"
                  rows={3}
                />
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                  />
                </div>
              </div>

              {/* Local */}
              <div className="space-y-2">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder="Ex: Igreja Matriz"
                />
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="musicos">Músicos</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="grupo_oracao">Grupo de Oração</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Funções e Membros */}
          {equipeId && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Funções e Membros
                    </CardTitle>
                    <CardDescription>
                      Adicione funções e selecione membros da equipe
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={adicionarFuncao} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Função
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {funcoes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma função adicionada. Clique em "Adicionar Função" para começar.
                  </p>
                ) : (
                  funcoes.map((funcao, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nome da Função *</Label>
                              <Input
                                value={funcao.nome}
                                onChange={(e) =>
                                  atualizarFuncao(index, "nome", e.target.value)
                                }
                                placeholder="Ex: Violão, Voz, Teclado"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Descrição</Label>
                              <Input
                                value={funcao.descricao}
                                onChange={(e) =>
                                  atualizarFuncao(index, "descricao", e.target.value)
                                }
                                placeholder="Descrição da função"
                              />
                            </div>
                          </div>

                          {/* Seleção de Membros */}
                          <div className="space-y-2">
                            <Label>Membros</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {membros.map((membro) => {
                                const conflitos = Array.isArray(indisponibilidades) ? indisponibilidades : indisponibilidades?.conflitos || [];
                                const temConflito = conflitos.some((ind: any) => ind.id === membro.id);
                                return (
                                  <div
                                    key={membro.id}
                                    className={`flex items-center space-x-2 p-2 rounded border hover:bg-accent/50 ${
                                      temConflito ? 'border-destructive/50 bg-destructive/5' : 'border-border'
                                    }`}
                                  >
                                    <Checkbox
                                      id={`membro-${index}-${membro.id}`}
                                      checked={funcao.membrosIds.includes(membro.id)}
                                      onCheckedChange={() =>
                                        toggleMembro(index, membro.id)
                                      }
                                    />
                                    <label
                                      htmlFor={`membro-${index}-${membro.id}`}
                                      className="flex-1 text-sm cursor-pointer flex items-center gap-2"
                                    >
                                      <span>
                                        {membro.nome}
                                        {membro.funcao && (
                                          <span className="text-muted-foreground ml-2">
                                            ({membro.funcao})
                                          </span>
                                        )}
                                      </span>
                                      {temConflito && (
                                        <Badge variant="destructive" className="text-xs">
                                          <AlertTriangle className="w-3 h-3 mr-1" />
                                          Indisponível
                                        </Badge>
                                      )}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removerFuncao(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/escalas")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={criarEscalaMutation.isPending}
            >
              {criarEscalaMutation.isPending ? "Criando..." : "Criar Escala"}
            </Button>
          </div>
        </form>

        {/* Modal de Conflito de Indisponibilidade */}
        <Dialog open={!!membroComConflito} onOpenChange={() => setMembroComConflito(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Membro Indisponível
              </DialogTitle>
              <DialogDescription>
                O membro selecionado possui uma indisponibilidade registrada para esta data.
              </DialogDescription>
            </DialogHeader>
            {membroComConflito && (
              <div className="space-y-3 py-4">
                <div>
                  <p className="text-sm font-medium">{membroComConflito.nome}</p>
                  {membroComConflito.funcao && (
                    <p className="text-sm text-muted-foreground">{membroComConflito.funcao}</p>
                  )}
                </div>
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Motivo:</span> {membroComConflito.motivo}
                  </p>
                  {membroComConflito.dataInicio && (
                    <p className="text-sm">
                      <span className="font-medium">Período:</span>{" "}
                      {new Date(membroComConflito.dataInicio).toLocaleDateString("pt-BR")}
                      {membroComConflito.dataFim && (
                        <> até {new Date(membroComConflito.dataFim).toLocaleDateString("pt-BR")}</>
                      )}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Deseja adicionar este membro mesmo assim?
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMembroComConflito(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmarAdicaoComConflito}
              >
                Adicionar Mesmo Assim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
