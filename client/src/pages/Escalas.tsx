import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Calendar, Clock, MapPin, Plus, Music, Users, Heart, Sparkles, Trash2, Edit, Eye } from "lucide-react";
import { toast } from "sonner";

// Templates padrão
const TEMPLATES = {
  musicos: {
    nome: "Músicos",
    icon: Music,
    funcoes: [
      { nome: "Violão", ordem: 1 },
      { nome: "Teclado", ordem: 2 },
      { nome: "Bateria", ordem: 3 },
      { nome: "Baixo", ordem: 4 },
      { nome: "Vocal 1", ordem: 5 },
      { nome: "Vocal 2", ordem: 6 },
      { nome: "Vocal 3", ordem: 7 },
    ],
  },
  reuniao: {
    nome: "Reunião",
    icon: Users,
    funcoes: [
      { nome: "Coordenador", ordem: 1 },
      { nome: "Secretário", ordem: 2 },
      { nome: "Tesoureiro", ordem: 3 },
      { nome: "Membro 1", ordem: 4 },
      { nome: "Membro 2", ordem: 5 },
    ],
  },
  grupo_oracao: {
    nome: "Grupo de Oração",
    icon: Heart,
    funcoes: [
      { nome: "Acolhida", ordem: 1 },
      { nome: "Animação", ordem: 2 },
      { nome: "Oração", ordem: 3 },
      { nome: "Palavra", ordem: 4 },
    ],
  },
  personalizado: {
    nome: "Personalizado",
    icon: Sparkles,
    funcoes: [],
  },
};

export default function Escalas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroMes, setFiltroMes] = useState<string>("");

  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState<"musicos" | "reuniao" | "grupo_oracao" | "personalizado">("musicos");
  const [funcoes, setFuncoes] = useState<{ nome: string; ordem: number }[]>([]);

  // Queries
  const { data: escalas, refetch } = trpc.escalas.listar.useQuery({
    userId: user?.openId || "",
    tipo: filtroTipo as any,
  });

  const criarMutation = trpc.escalas.criar.useMutation({
    onSuccess: () => {
      toast.success("Escala criada com sucesso!");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar escala: " + error.message);
    },
  });

  const deletarMutation = trpc.escalas.deletar.useMutation({
    onSuccess: () => {
      toast.success("Escala deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar escala: " + error.message);
    },
  });

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setData("");
    setHora("");
    setLocal("");
    setTipo("musicos");
    setFuncoes([]);
  };

  const handleTipoChange = (novoTipo: string) => {
    setTipo(novoTipo as any);
    const template = TEMPLATES[novoTipo as keyof typeof TEMPLATES];
    setFuncoes(template.funcoes);
  };

  const handleCriar = () => {
    if (!titulo || !data) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    criarMutation.mutate({
      userId: user?.openId || "",
      titulo,
      descricao,
      data,
      hora,
      local,
      tipo,
      template: TEMPLATES[tipo].nome,
      funcoes,
    });
  };

  const handleDeletar = (escalaId: number) => {
    if (confirm("Tem certeza que deseja deletar esta escala?")) {
      deletarMutation.mutate({ escalaId });
    }
  };

  const getIconeTipo = (tipo: string) => {
    const Icon = TEMPLATES[tipo as keyof typeof TEMPLATES]?.icon || Sparkles;
    return <Icon className="w-5 h-5" />;
  };

  const escalasFiltradas = escalas?.filter((escala) => {
    if (filtroMes) {
      const [ano, mes] = filtroMes.split("-");
      const dataEscala = new Date(escala.data);
      return dataEscala.getFullYear() === parseInt(ano) && dataEscala.getMonth() + 1 === parseInt(mes);
    }
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Gerenciamento de Escalas</h1>
            <p className="text-gray-600 mt-2">Organize músicos, reuniões e grupos de oração</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-5 h-5 mr-2" />
                Nova Escala
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Escala</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <Label>Tipo de Escala *</Label>
                  <Select value={tipo} onValueChange={handleTipoChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="musicos">🎵 Músicos</SelectItem>
                      <SelectItem value="reuniao">👥 Reunião</SelectItem>
                      <SelectItem value="grupo_oracao">❤️ Grupo de Oração</SelectItem>
                      <SelectItem value="personalizado">✨ Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Título *</Label>
                  <Input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Missa Dominical, Reunião Mensal..."
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Detalhes adicionais sobre a escala..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data *</Label>
                    <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
                  </div>
                  <div>
                    <Label>Horário</Label>
                    <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Local</Label>
                  <Input
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: Igreja Matriz, Salão Paroquial..."
                  />
                </div>

                {/* Funções */}
                <div>
                  <Label>Funções/Momentos</Label>
                  <div className="mt-2 space-y-2">
                    {funcoes.map((funcao, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={funcao.nome}
                          onChange={(e) => {
                            const novasFuncoes = [...funcoes];
                            novasFuncoes[index].nome = e.target.value;
                            setFuncoes(novasFuncoes);
                          }}
                          placeholder="Nome da função"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFuncoes(funcoes.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFuncoes([...funcoes, { nome: "", ordem: funcoes.length + 1 }])}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Função
                    </Button>
                  </div>
                </div>

                <Button onClick={handleCriar} className="w-full" disabled={criarMutation.isPending}>
                  {criarMutation.isPending ? "Criando..." : "Criar Escala"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="musicos">Músicos</SelectItem>
              <SelectItem value="reuniao">Reunião</SelectItem>
              <SelectItem value="grupo_oracao">Grupo de Oração</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="month"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="w-[200px]"
            placeholder="Filtrar por mês"
          />
        </div>

        {/* Lista de Escalas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {escalasFiltradas?.map((escala) => (
            <Card key={escala.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getIconeTipo(escala.tipo)}
                  <div>
                    <h3 className="font-semibold text-lg">{escala.titulo}</h3>
                    <p className="text-sm text-gray-500">{TEMPLATES[escala.tipo as keyof typeof TEMPLATES]?.nome}</p>
                  </div>
                </div>
              </div>

              {escala.descricao && <p className="text-sm text-gray-600 mb-4">{escala.descricao}</p>}

              <div className="space-y-2 text-sm text-gray-600">
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

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/escala/${escala.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletar(escala.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {escalasFiltradas?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma escala encontrada. Crie sua primeira escala!</p>
          </div>
        )}
      </div>
    </div>
  );
}
