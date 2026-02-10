import { useState } from "react";
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
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Sparkles, Plus, Trash2, Wand2 } from "lucide-react";

interface Funcao {
  nome: string;
  descricao: string;
  ordem: number;
  quantidadeMembros: number;
  essencial: boolean;
}

type Recorrencia = "unica" | "semanal" | "quinzenal" | "mensal";

export default function GerarEscalaAutomatica() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [equipeId, setEquipeId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [hora, setHora] = useState("");
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState<"musicos" | "reuniao" | "grupo_oracao" | "personalizado">("musicos");
  const [recorrencia, setRecorrencia] = useState<Recorrencia>("unica");
  const [quantidadeOcorrencias, setQuantidadeOcorrencias] = useState(1);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);

  // Buscar equipes do usuário
  const { data: equipes = [] } = trpc.equipes.listar.useQuery(
    undefined,
    { enabled: !!user }
  );

  const gerarEscalaMutation = trpc.escalas.gerarEscalaAutomatica.useMutation({
    onSuccess: (data) => {
      alert(`${data.escalasIds.length} escala(s) gerada(s) com sucesso!`);
      setLocation("/escalas");
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
        quantidadeMembros: 1,
        essencial: false,
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

  const calcularDatas = (): string[] => {
    if (!dataInicial) return [];

    const datas: string[] = [];
    const dataBase = new Date(dataInicial + "T00:00:00");

    for (let i = 0; i < quantidadeOcorrencias; i++) {
      const novaData = new Date(dataBase);

      switch (recorrencia) {
        case "unica":
          if (i === 0) datas.push(dataInicial);
          break;
        case "semanal":
          novaData.setDate(dataBase.getDate() + (i * 7));
          datas.push(novaData.toISOString().split("T")[0]);
          break;
        case "quinzenal":
          novaData.setDate(dataBase.getDate() + (i * 14));
          datas.push(novaData.toISOString().split("T")[0]);
          break;
        case "mensal":
          novaData.setMonth(dataBase.getMonth() + i);
          datas.push(novaData.toISOString().split("T")[0]);
          break;
      }
    }

    return datas;
  };

  const handleGerar = () => {
    if (!user || !equipeId) {
      alert("Selecione uma equipe");
      return;
    }

    if (!titulo || !dataInicial) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    if (funcoes.length === 0) {
      alert("Adicione pelo menos uma função");
      return;
    }

    const datas = calcularDatas();

    if (datas.length === 0) {
      alert("Erro ao calcular datas");
      return;
    }

    gerarEscalaMutation.mutate({
      userId: user.id.toString(),
      equipeId,
      titulo,
      descricao,
      datas,
      hora,
      local,
      tipo,
      template: tipo,
      funcoes,
    });
  };

  const datasPreview = calcularDatas();

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
              <Wand2 className="w-8 h-8 text-primary" />
              Gerar Escala Automaticamente
            </h1>
            <p className="text-muted-foreground">
              Distribuição equilibrada e inteligente de participantes
            </p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleGerar(); }} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Escala</CardTitle>
              <CardDescription>
                Configure os dados básicos da escala automática
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
                  placeholder="Ex: Missa de Domingo"
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
                  placeholder="Descrição adicional"
                  rows={2}
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

              {/* Hora */}
              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recorrência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recorrência
              </CardTitle>
              <CardDescription>
                Configure se a escala será única ou recorrente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recorrencia">Tipo de Recorrência</Label>
                  <Select
                    value={recorrencia}
                    onValueChange={(value: Recorrencia) => {
                      setRecorrencia(value);
                      if (value === "unica") setQuantidadeOcorrencias(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unica">Única</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataInicial">Data Inicial *</Label>
                  <Input
                    id="dataInicial"
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                    required
                  />
                </div>
              </div>

              {recorrencia !== "unica" && (
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade de Ocorrências</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    max="52"
                    value={quantidadeOcorrencias}
                    onChange={(e) => setQuantidadeOcorrencias(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}

              {/* Preview de Datas */}
              {datasPreview.length > 0 && (
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview de Datas:</p>
                  <div className="flex flex-wrap gap-2">
                    {datasPreview.map((data, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-primary/20 rounded">
                        {new Date(data + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funções */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Funções e Distribuição
                  </CardTitle>
                  <CardDescription>
                    Configure as funções e quantos membros por função
                  </CardDescription>
                </div>
                <Button type="button" onClick={adicionarFuncao} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Função
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {funcoes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma função adicionada. Clique em "Adicionar Função" para começar.
                </p>
              ) : (
                funcoes.map((funcao, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                            <Label>Quantidade de Membros</Label>
                            <Input
                              type="number"
                              min="1"
                              value={funcao.quantidadeMembros}
                              onChange={(e) =>
                                atualizarFuncao(index, "quantidadeMembros", parseInt(e.target.value) || 1)
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Input
                            value={funcao.descricao}
                            onChange={(e) =>
                              atualizarFuncao(index, "descricao", e.target.value)
                            }
                            placeholder="Descrição opcional"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`essencial-${index}`}
                            checked={funcao.essencial}
                            onCheckedChange={(checked) =>
                              atualizarFuncao(index, "essencial", checked)
                            }
                          />
                          <label
                            htmlFor={`essencial-${index}`}
                            className="text-sm cursor-pointer"
                          >
                            Função essencial (garante pelo menos 1 membro)
                          </label>
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
              disabled={gerarEscalaMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {gerarEscalaMutation.isPending ? "Gerando..." : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Gerar Escala{datasPreview.length > 1 ? "s" : ""} Automaticamente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
