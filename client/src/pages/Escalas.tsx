import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Calendar, Clock, MapPin, Plus, Music, Users, Heart, Sparkles, Trash2, Edit, Eye, Bell, Download, BarChart3, TrendingUp } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { EscalasNavigation } from "../components/EscalasNavigation";
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
  // Navegação via Link do wouter
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroMes, setFiltroMes] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroEquipe, setFiltroEquipe] = useState<string>("todas");
  const [escalasSelecionadas, setEscalasSelecionadas] = useState<number[]>([]);

  // Buscar equipes do usuário para filtro
  const { data: equipes = [] } = trpc.equipes.listar.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [local, setLocal] = useState("");
  const [tipo, setTipo] = useState<"musicos" | "reuniao" | "grupo_oracao" | "personalizado">("musicos");
  const [funcoes, setFuncoes] = useState<{ nome: string; ordem: number }[]>([]);
  const [templateSelecionado, setTemplateSelecionado] = useState<string>("");

  // Query para carregar templates do usuário
  const { data: templatesUsuario } = trpc.escalas.listarTemplates.useQuery(
    { userId: user?.openId || "" },
    { enabled: !!user?.openId }
  );

  // Queries
  const { data: escalas, refetch } = trpc.escalas.listar.useQuery({
    userId: user?.openId || "",
    tipo: filtroTipo as any,
  });

  const enviarLembretesMutation = trpc.escalas.enviarLembretes.useMutation({
    onSuccess: (data) => {
      toast.success(`Lembretes enviados! ${data.emailsEnviados} emails enviados.`);
      if (data.erros > 0) {
        toast.error(`${data.erros} erros ao enviar lembretes.`);
      }
    },
    onError: (error) => {
      toast.error("Erro ao enviar lembretes: " + error.message);
    },
  });

  // Query para exportação (controlada manualmente)
  const exportQuery = trpc.escalas.exportarEscalasEmLote.useQuery(
    { escalaIds: escalasSelecionadas },
    { enabled: false }
  );

  const handleExportarEmLote = async (formato: 'pdf' | 'excel') => {
    if (escalasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma escala para exportar");
      return;
    }

    try {
      toast.info(`Exportando ${escalasSelecionadas.length} escalas...`);
      
      // Buscar dados das escalas selecionadas
      const result = await exportQuery.refetch();
      const escalasExportadas = result.data;

      if (!escalasExportadas) {
        toast.error("Erro ao buscar dados das escalas");
        return;
      }

      if (formato === 'pdf') {
        // Gerar PDF com jsPDF
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        let yPosition = 20;

        escalasExportadas.forEach((escala: any, index: number) => {
          if (index > 0) {
            doc.addPage();
            yPosition = 20;
          }

          // Título da escala
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text(escala.titulo, 20, yPosition);
          yPosition += 10;

          // Informações
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
          doc.text(`Data: ${new Date(escala.data).toLocaleDateString('pt-BR')}`, 20, yPosition);
          yPosition += 7;
          if (escala.hora) {
            doc.text(`Horário: ${escala.hora}`, 20, yPosition);
            yPosition += 7;
          }
          if (escala.local) {
            doc.text(`Local: ${escala.local}`, 20, yPosition);
            yPosition += 7;
          }
          yPosition += 5;

          // Funções e participantes
          escala.funcoes?.forEach((funcao: any) => {
            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.text(funcao.nome, 20, yPosition);
            yPosition += 7;

            const participantes = escala.participantes?.filter((p: any) => p.funcaoId === funcao.id);
            if (participantes && participantes.length > 0) {
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              participantes.forEach((p: any) => {
                doc.text(`  • ${p.nome}`, 25, yPosition);
                yPosition += 6;
              });
            }
            yPosition += 3;
          });
        });

        doc.save(`escalas_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success(`${escalasExportadas.length} escalas exportadas em PDF!`);
      } else {
        // Gerar Excel com xlsx
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();

        escalasExportadas.forEach((escala: any) => {
          const rows: any[] = [];
          rows.push([escala.titulo]);
          rows.push([`Data: ${new Date(escala.data).toLocaleDateString('pt-BR')}`]);
          if (escala.hora) rows.push([`Horário: ${escala.hora}`]);
          if (escala.local) rows.push([`Local: ${escala.local}`]);
          rows.push([]);

          escala.funcoes?.forEach((funcao: any) => {
            rows.push([funcao.nome]);
            const participantes = escala.participantes?.filter((p: any) => p.funcaoId === funcao.id);
            participantes?.forEach((p: any) => {
              rows.push([`  ${p.nome}`, p.email || '', p.telefone || '', p.status]);
            });
            rows.push([]);
          });

          const ws = XLSX.utils.aoa_to_sheet(rows);
          const nomeAba = escala.titulo.substring(0, 30);
          XLSX.utils.book_append_sheet(wb, ws, nomeAba);
        });

        XLSX.writeFile(wb, `escalas_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success(`${escalasExportadas.length} escalas exportadas em Excel!`);
      }

      setEscalasSelecionadas([]);
    } catch (error: any) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar escalas: " + error.message);
    }
  };

  const handleToggleSelecao = (escalaId: number) => {
    setEscalasSelecionadas(prev => 
      prev.includes(escalaId) 
        ? prev.filter(id => id !== escalaId)
        : [...prev, escalaId]
    );
  };

  const handleSelecionarTodas = () => {
    if (escalasSelecionadas.length === escalasFiltradas?.length) {
      setEscalasSelecionadas([]);
    } else {
      setEscalasSelecionadas(escalasFiltradas?.map(e => e.id) || []);
    }
  };

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
    setTemplateSelecionado(""); // Limpar template ao mudar tipo
  };

  const handleTemplateSelecionado = (templateId: string) => {
    setTemplateSelecionado(templateId);
    if (!templateId) return;

    const template = templatesUsuario?.find((t: any) => t.id === parseInt(templateId));
    if (template && template.funcoes) {
      try {
        const funcoesTemplate = typeof template.funcoes === 'string' 
          ? JSON.parse(template.funcoes) 
          : template.funcoes;
        setFuncoes(funcoesTemplate);
        toast.success(`Template "${template.nome}" carregado!`);
      } catch (error) {
        console.error("Erro ao carregar template:", error);
        toast.error("Erro ao carregar template");
      }
    }
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
    // Filtro por equipe
    if (filtroEquipe !== "todas") {
      const equipeId = parseInt(filtroEquipe);
      if ((escala as any).equipeId !== equipeId) return false;
    }

    // Filtro por mês
    if (filtroMes) {
      const [ano, mes] = filtroMes.split("-");
      const dataEscala = new Date(escala.data);
      const mesMatch = dataEscala.getFullYear() === parseInt(ano) && dataEscala.getMonth() + 1 === parseInt(mes);
      if (!mesMatch) return false;
    }

    // Filtro por status
    if (filtroStatus !== "todos") {
      const participantes = (escala as any).participantes || [];
      if (filtroStatus === "confirmadas") {
        // Escala confirmada: todos participantes confirmados
        return participantes.length > 0 && participantes.every((p: any) => p.status === "confirmado");
      } else if (filtroStatus === "pendentes") {
        // Escala pendente: pelo menos um participante pendente
        return participantes.some((p: any) => p.status === "pendente");
      } else if (filtroStatus === "com_ausencias") {
        // Escala com ausências: pelo menos um participante ausente
        return participantes.some((p: any) => p.status === "ausente");
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <EscalasNavigation />
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Gerenciamento de Escalas</h1>
            <p className="text-purple-200 mt-2">Organize músicos, reuniões e grupos de oração</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {escalasSelecionadas.length > 0 && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => handleExportarEmLote('pdf')}
                  className="border-purple-400 text-purple-300 hover:bg-purple-50 hover:text-purple-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exportar {escalasSelecionadas.length} em PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleExportarEmLote('excel')}
                  className="border-purple-400 text-purple-300 hover:bg-purple-50 hover:text-purple-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exportar {escalasSelecionadas.length} em Excel
                </Button>
              </>
            )}
            <Button 
              variant="outline"
              onClick={() => enviarLembretesMutation.mutate({ userId: user?.openId || "" })}
              disabled={enviarLembretesMutation.isPending}
            >
              <Bell className="w-5 h-5 mr-2" />
              {enviarLembretesMutation.isPending ? "Enviando..." : "Enviar Lembretes"}
            </Button>
            <Link href="/escalas/estatisticas">
              <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-50 hover:text-purple-700">
                <BarChart3 className="w-5 h-5 mr-2" />
                Estatísticas
              </Button>
            </Link>
            <Link href="/escalas/relatorios">
              <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-50 hover:text-purple-700">
                <TrendingUp className="w-5 h-5 mr-2" />
                Relatórios
              </Button>
            </Link>
            <Link href="/escalas/gerar-automatica">
              <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-50 hover:text-purple-700">
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Automaticamente
              </Button>
            </Link>
            <Link href="/escalas/nova-de-equipe">
              <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-50 hover:text-purple-700">
                <Users className="w-5 h-5 mr-2" />
                Criar de Equipe
              </Button>
            </Link>
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

                {/* Dropdown de Templates Personalizados */}
                {templatesUsuario && templatesUsuario.length > 0 && (
                  <div>
                    <Label>Ou use um template salvo</Label>
                    <Select value={templateSelecionado} onValueChange={handleTemplateSelecionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum template</SelectItem>
                        {templatesUsuario.map((template: any) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.nome} ({template.tipo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Templates salvos substituem as funções do tipo selecionado
                    </p>
                  </div>
                )}

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
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
            className="w-full sm:w-[200px]"
            placeholder="Filtrar por mês"
          />

          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="confirmadas">✅ Confirmadas</SelectItem>
              <SelectItem value="pendentes">⏳ Pendentes</SelectItem>
              <SelectItem value="com_ausencias">❌ Com Ausências</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroEquipe} onValueChange={setFiltroEquipe}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Equipes</SelectItem>
              {equipes.map((equipe) => (
                <SelectItem key={equipe.id} value={equipe.id.toString()}>
                  {equipe.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filtroTipo !== "todos" || filtroMes || filtroStatus !== "todos" || filtroEquipe !== "todas") && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setFiltroTipo("todos");
                setFiltroMes("");
                setFiltroStatus("todos");
                setFiltroEquipe("todas");
              }}
              className="text-purple-300 hover:text-white"
            >
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Contador de escalas */}
        {escalasFiltradas && (
          <div className="text-sm text-purple-300 mb-4">
            Exibindo {escalasFiltradas.length} de {escalas?.length || 0} escala(s)
          </div>
        )}

         {/* Barra de seleção em massa */}
        {escalasFiltradas && escalasFiltradas.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
            <Checkbox 
              checked={escalasSelecionadas.length === escalasFiltradas.length}
              onCheckedChange={handleSelecionarTodas}
            />
            <span className="text-sm text-purple-200">
              {escalasSelecionadas.length > 0 
                ? `${escalasSelecionadas.length} escala(s) selecionada(s)`
                : "Selecionar todas"}
            </span>
          </div>
        )}

        {/* Listagem de Escalas - Cards Compactos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {escalasFiltradas?.map((escala) => {
            const participantes = (escala as any).participantes || [];
            const totalParticipantes = participantes.length;
            const confirmados = participantes.filter((p: any) => p.status === "confirmado").length;
            const pendentes = participantes.filter((p: any) => p.status === "pendente").length;
            
            return (
              <Card key={escala.id} className="p-4 hover:shadow-lg transition-all bg-slate-900/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 hover:scale-[1.02]">
                <div className="flex items-start gap-3 mb-3">
                  <Checkbox 
                    checked={escalasSelecionadas.includes(escala.id)}
                    onCheckedChange={() => handleToggleSelecao(escala.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getIconeTipo(escala.tipo)}
                      <h3 className="font-semibold text-base text-white truncate">{escala.titulo}</h3>
                    </div>
                    <p className="text-xs text-purple-300">{TEMPLATES[escala.tipo as keyof typeof TEMPLATES]?.nome}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-purple-300 mb-3">
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

                {/* Estatísticas Compactas */}
                {totalParticipantes > 0 && (
                  <div className="flex items-center gap-3 text-xs mb-3 p-2 bg-slate-800/50 rounded">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-purple-200">{totalParticipantes}</span>
                    </div>
                    {confirmados > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-green-400">✓ {confirmados}</span>
                      </div>
                    )}
                    {pendentes > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⏳ {pendentes}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/escala/${escala.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletar(escala.id)}
                    className="h-8 px-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {escalasFiltradas?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-purple-200">Nenhuma escala encontrada. Crie sua primeira escala!</p>
          </div>
        )}
      </div>
    </div>
  );
}
