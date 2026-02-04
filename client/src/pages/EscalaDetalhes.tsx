import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Calendar, Clock, MapPin, Plus, ArrowLeft, Share2, Mail, MessageCircle, Copy, Check, Trash2, FileDown, Link as LinkIcon, CalendarPlus, Edit, AlertTriangle, FileSpreadsheet, History } from "lucide-react";
import { EscalasNavigation } from "@/components/EscalasNavigation";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { UserAutocomplete } from "@/components/UserAutocomplete";
import { adicionarAoGoogleCalendar } from "@/lib/googleCalendar";
import * as XLSX from 'xlsx';
import { EstatisticasConfirmacao } from "@/components/EstatisticasConfirmacao";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Componente para exibir timeline de histórico
function HistoricoTimeline({ escalaId }: { escalaId: number }) {
  const { data: historico, isLoading } = trpc.escalas.buscarHistorico.useQuery({ escalaId });

  if (isLoading) {
    return <div className="text-center py-8 text-purple-300">Carregando histórico...</div>;
  }

  if (!historico || historico.length === 0) {
    return (
      <Card className="p-8 bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
        <p className="text-center text-purple-300">Nenhuma alteração registrada ainda.</p>
      </Card>
    );
  }

  const getTipoAcaoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      criacao: "Escala criada",
      edicao: "Escala editada",
      adicao_participante: "Participante adicionado",
      remocao_participante: "Participante removido",
      alteracao_status: "Status alterado",
      edicao_participante: "Participante editado",
      duplicacao: "Escala duplicada",
    };
    return labels[tipo] || tipo;
  };

  const getTipoAcaoIcon = (tipo: string) => {
    switch (tipo) {
      case "criacao":
        return <Plus className="w-5 h-5 text-green-400" />;
      case "edicao":
        return <Edit className="w-5 h-5 text-blue-400" />;
      case "adicao_participante":
        return <Plus className="w-5 h-5 text-purple-400" />;
      case "remocao_participante":
        return <Trash2 className="w-5 h-5 text-red-400" />;
      case "alteracao_status":
        return <Check className="w-5 h-5 text-yellow-400" />;
      case "edicao_participante":
        return <Edit className="w-5 h-5 text-blue-400" />;
      case "duplicacao":
        return <Copy className="w-5 h-5 text-cyan-400" />;
      default:
        return <History className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatarData = (data: Date | string) => {
    const d = new Date(data);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {historico.map((item: any, index: number) => (
        <Card key={item.id} className="p-6 bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
          <div className="flex items-start gap-4">
            <div className="mt-1">{getTipoAcaoIcon(item.tipoAcao)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{getTipoAcaoLabel(item.tipoAcao)}</h4>
                <span className="text-sm text-purple-300">{formatarData(item.createdAt)}</span>
              </div>
              <p className="text-purple-200 mb-2">{item.descricao}</p>
              {item.userName && (
                <p className="text-sm text-purple-400">Por: {item.userName}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Componente para exibir badge de conflito
function ConflitoBadge({ participante, escalaId }: { participante: any; escalaId: number }) {
  const { data: conflitosData } = trpc.escalas.verificarConflitos.useQuery({
    email: participante.email || undefined,
    telefone: participante.telefone || undefined,
    escalaId,
  }, {
    enabled: !!(participante.email || participante.telefone),
  });

  const conflitos = conflitosData?.conflitos || [];

  if (conflitos.length === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/50 border border-yellow-500/50 rounded text-yellow-300 text-xs cursor-help">
            <AlertTriangle className="w-3 h-3" />
            <span>Conflito</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">Escalado em outro horário no mesmo dia:</p>
            {conflitos.map((conflito: any, idx: number) => (
              <div key={idx} className="text-sm">
                <p className="font-medium">{conflito.titulo}</p>
                <p className="text-muted-foreground">
                  {conflito.hora || "Horário não definido"} - {conflito.funcao}
                </p>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function EscalaDetalhes() {
  const { user } = useAuth();
  const [, params] = useRoute("/escala/:id");
  const [, setLocation] = useLocation();
  const escalaId = parseInt(params?.id || "0");

  const [openAddParticipante, setOpenAddParticipante] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openEditEscala, setOpenEditEscala] = useState(false);
  const [openEditParticipante, setOpenEditParticipante] = useState(false);
  const [openDuplicar, setOpenDuplicar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [participanteEditando, setParticipanteEditando] = useState<any>(null);

  // Form state para duplicação
  const [duplicarData, setDuplicarData] = useState("");
  const [duplicarHora, setDuplicarHora] = useState("");
  const [copiarParticipantes, setCopiarParticipantes] = useState(false);

  // Form state para edição de escala
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editData, setEditData] = useState("");
  const [editHora, setEditHora] = useState("");
  const [editLocal, setEditLocal] = useState("");
  const [editTipo, setEditTipo] = useState<"musicos" | "reuniao" | "grupo_oracao" | "personalizado">("musicos");

  // Form state para adicionar participante
  const [funcaoId, setFuncaoId] = useState<number>(0);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Form state para editar participante
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editObservacoes, setEditObservacoes] = useState("");

  // Queries
  const { data: escala, refetch } = trpc.escalas.buscarPorId.useQuery({ escalaId });

  const adicionarParticipanteMutation = trpc.escalas.adicionarParticipante.useMutation({
    onSuccess: () => {
      toast.success("Participante adicionado! Adicione mais ou feche o diálogo.");
      refetch();
      // Não fechar automaticamente - permitir adicionar vários participantes
      // setOpenAddParticipante(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar participante: " + error.message);
    },
  });

  const atualizarStatusMutation = trpc.escalas.atualizarStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const atualizarEscalaMutation = trpc.escalas.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Escala atualizada com sucesso!");
      refetch();
      setOpenEditEscala(false);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar escala: " + error.message);
    },
  });

  const removerParticipanteMutation = trpc.escalas.removerParticipante.useMutation({
    onSuccess: () => {
      toast.success("Participante removido!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover participante: " + error.message);
    },
  });

  const atualizarParticipanteMutation = trpc.escalas.atualizarParticipante.useMutation({
    onSuccess: () => {
      toast.success("Participante atualizado com sucesso!");
      refetch();
      setOpenEditParticipante(false);
      setParticipanteEditando(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar participante: " + error.message);
    },
  });

  const duplicarEscalaMutation = trpc.escalas.duplicarEscala.useMutation({
    onSuccess: (data) => {
      toast.success(data.mensagem);
      setOpenDuplicar(false);
      // Redirecionar para a nova escala
      setLocation(`/escala/${data.novaEscalaId}`);
    },
    onError: (error) => {
      toast.error("Erro ao duplicar escala: " + error.message);
    },
  });

  const enviarLembretesMutation = trpc.escalas.enviarLembretesEmail.useMutation({
    onSuccess: (data) => {
      toast.success(`Lembretes enviados! ${data.enviados} de ${data.total} emails enviados com sucesso.`);
    },
    onError: (error) => {
      toast.error("Erro ao enviar lembretes: " + error.message);
    },
  });

  const resetForm = () => {
    setFuncaoId(0);
    setNome("");
    setEmail("");
    setTelefone("");
    setObservacoes("");
  };

  // Preencher formulário de edição quando abrir o modal
  const handleAbrirEdicao = () => {
    if (escala) {
      setEditTitulo(escala.titulo);
      setEditDescricao(escala.descricao || "");
      setEditData(typeof escala.data === 'string' ? escala.data : new Date(escala.data).toISOString().split('T')[0]);
      setEditHora(escala.hora || "");
      setEditLocal(escala.local || "");
      setEditTipo(escala.tipo as any);
      setOpenEditEscala(true);
    }
  };

  const handleAtualizarEscala = () => {
    if (!editTitulo || !editData) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    // Atualizar título se contiver data antiga
    let tituloAtualizado = editTitulo;
    if (escala) {
      // Converter data antiga (formato YYYY-MM-DD ou Date) para DD/MM/YYYY sem timezone
      const dataAntigaStr = typeof escala.data === 'string' ? escala.data : escala.data.toISOString().split('T')[0];
      const [anoAntigo, mesAntigo, diaAntigo] = dataAntigaStr.split('-');
      const dataAntigaFormatada = `${diaAntigo}/${mesAntigo}/${anoAntigo}`;
      
      // Converter data nova (formato YYYY-MM-DD) para DD/MM/YYYY
      const [anoNovo, mesNovo, diaNovo] = editData.split('-');
      const dataNovaFormatada = `${diaNovo}/${mesNovo}/${anoNovo}`;
      
      // Se o título contém a data antiga, substituir pela nova
      if (tituloAtualizado.includes(dataAntigaFormatada)) {
        tituloAtualizado = tituloAtualizado.replace(dataAntigaFormatada, dataNovaFormatada);
      }
    }

    atualizarEscalaMutation.mutate({
      escalaId,
      titulo: tituloAtualizado,
      descricao: editDescricao,
      data: editData,
      hora: editHora,
      local: editLocal,
      tipo: editTipo,
    });
  };

  const handleAbrirEdicaoParticipante = (participante: any) => {
    setParticipanteEditando(participante);
    setEditNome(participante.nome);
    setEditEmail(participante.email || "");
    setEditTelefone(participante.telefone || "");
    setEditObservacoes(participante.observacoes || "");
    setOpenEditParticipante(true);
  };

  const handleSalvarEdicaoParticipante = () => {
    if (!editNome) {
      toast.error("O nome é obrigatório");
      return;
    }

    atualizarParticipanteMutation.mutate({
      participanteId: participanteEditando.id,
      nome: editNome,
      email: editEmail,
      telefone: editTelefone,
      observacoes: editObservacoes,
    });
  };

  const handleAbrirDuplicacao = () => {
    if (escala) {
      // Sugerir data uma semana depois
      const dataOriginal = new Date(escala.data);
      dataOriginal.setDate(dataOriginal.getDate() + 7);
      setDuplicarData(dataOriginal.toISOString().split('T')[0]);
      setDuplicarHora(escala.hora || "");
      setCopiarParticipantes(false);
      setOpenDuplicar(true);
    }
  };

  const handleDuplicarEscala = () => {
    if (!duplicarData) {
      toast.error("Selecione uma data para a nova escala");
      return;
    }

    duplicarEscalaMutation.mutate({
      escalaId,
      novaData: duplicarData,
      novaHora: duplicarHora,
      copiarParticipantes,
    });
  };

  const handleAdicionarParticipante = () => {
    if (!funcaoId || !nome) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    adicionarParticipanteMutation.mutate({
      escalaId,
      funcaoId,
      nome,
      email,
      telefone,
      status: "pendente",
      observacoes,
    }, {
      onSuccess: (data: any) => {
        if (!data.success && data.conflitos) {
          // Exibir alerta de conflito
          const conflitosTexto = data.conflitos.map((c: any) => 
            `- ${c.titulo} (${new Date(c.data).toLocaleDateString('pt-BR')}${c.hora ? ' às ' + c.hora : ''})`
          ).join('\n');
          
          const confirmar = confirm(
            `⚠️ ATENÇÃO: Conflito de Agendamento!\n\n` +
            `${nome} já está escalado em:\n${conflitosTexto}\n\n` +
            `Deseja adicionar mesmo assim?`
          );
          
          if (confirmar) {
            // Forçar adição mesmo com conflito
            toast.info("Participante adicionado com conflito de horário");
          }
        }
      }
    });
  };

  const handleAtualizarStatus = (participanteId: number, status: "confirmado" | "pendente" | "ausente") => {
    atualizarStatusMutation.mutate({ participanteId, status });
  };

  const handleRemoverParticipante = (participanteId: number) => {
    if (confirm("Tem certeza que deseja remover este participante?")) {
      removerParticipanteMutation.mutate({ participanteId });
    }
  };

  const gerarTextoEscala = () => {
    if (!escala) return "";

    let texto = `📅 *${escala.titulo}*\n\n`;
    texto += `📆 Data: ${new Date(escala.data).toLocaleDateString("pt-BR")}\n`;
    if (escala.hora) texto += `🕐 Horário: ${escala.hora}\n`;
    if (escala.local) texto += `📍 Local: ${escala.local}\n`;
    if (escala.descricao) texto += `\n${escala.descricao}\n`;
    texto += `\n*Escala:*\n\n`;

    escala.funcoes?.forEach((funcao: any) => {
      const participantes = escala.participantes?.filter((p: any) => p.funcaoId === funcao.id);
      texto += `*${funcao.nome}:*\n`;
      if (participantes && participantes.length > 0) {
        participantes.forEach((p: any) => {
          const statusEmoji = p.status === "confirmado" ? "✅" : p.status === "ausente" ? "❌" : "⏳";
          texto += `  ${statusEmoji} ${p.nome}\n`;
        });
      } else {
        texto += `  (Vago)\n`;
      }
      texto += `\n`;
    });

    return texto;
  };

  const handleCompartilharWhatsApp = () => {
    const texto = gerarTextoEscala();
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  const handleCompartilharEmail = () => {
    const texto = gerarTextoEscala();
    const assunto = `Escala: ${escala?.titulo}`;
    const url = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`;
    window.location.href = url;
  };

  const handleCopiarTexto = () => {
    const texto = gerarTextoEscala();
    navigator.clipboard.writeText(texto);
    setCopied(true);
    toast.success("Texto copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportarPDF = () => {
    if (!escala) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Título
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(escala.titulo, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Informações da escala
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const dataFormatada = new Date(escala.data).toLocaleDateString("pt-BR");
    doc.text(`Data: ${dataFormatada}`, 20, yPosition);
    yPosition += 7;

    if (escala.hora) {
      doc.text(`Horário: ${escala.hora}`, 20, yPosition);
      yPosition += 7;
    }

    if (escala.local) {
      doc.text(`Local: ${escala.local}`, 20, yPosition);
      yPosition += 7;
    }

    if (escala.descricao) {
      doc.text(`Descrição: ${escala.descricao}`, 20, yPosition);
      yPosition += 7;
    }

    yPosition += 5;
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Funções e Participantes
    escala.funcoes?.forEach((funcao: any) => {
      // Verificar se precisa de nova página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(funcao.nome, 20, yPosition);
      yPosition += 8;

      const participantes = escala.participantes?.filter((p: any) => p.funcaoId === funcao.id);
      
      if (participantes && participantes.length > 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        
        participantes.forEach((participante: any) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          const status = participante.status === "confirmado" ? "✓" : participante.status === "ausente" ? "✗" : "?";
          doc.text(`${status} ${participante.nome}`, 25, yPosition);
          yPosition += 6;

          if (participante.email) {
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`   Email: ${participante.email}`, 25, yPosition);
            doc.setTextColor(0);
            doc.setFontSize(11);
            yPosition += 5;
          }

          if (participante.telefone) {
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`   Tel: ${participante.telefone}`, 25, yPosition);
            doc.setTextColor(0);
            doc.setFontSize(11);
            yPosition += 5;
          }
        });
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Nenhum participante adicionado", 25, yPosition);
        doc.setTextColor(0);
        yPosition += 6;
      }

      yPosition += 5;
    });

    // Salvar PDF
    const nomeArquivo = `escala-${escala.titulo.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    doc.save(nomeArquivo);
    toast.success("PDF exportado com sucesso!");
  };

  const handleExportarExcel = () => {
    if (!escala) return;

    // Preparar dados para a planilha
    const dadosExcel: any[] = [];

    // Adicionar informações da escala no topo
    dadosExcel.push(["LISTA DE PRESENÇA - " + escala.titulo.toUpperCase()]);
    dadosExcel.push([]);
    
    const dataFormatada = (() => {
      if (escala.data instanceof Date) {
        const ano = escala.data.getFullYear();
        const mes = String(escala.data.getMonth() + 1).padStart(2, '0');
        const dia = String(escala.data.getDate()).padStart(2, '0');
        return `${dia}/${mes}/${ano}`;
      }
      const dataStr = String(escala.data);
      if (dataStr.includes('-')) {
        const [ano, mes, dia] = dataStr.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
      }
      return new Date(escala.data).toLocaleDateString("pt-BR");
    })();

    dadosExcel.push(["Data:", dataFormatada]);
    if (escala.hora) dadosExcel.push(["Horário:", escala.hora]);
    if (escala.local) dadosExcel.push(["Local:", escala.local]);
    if (escala.descricao) dadosExcel.push(["Descrição:", escala.descricao]);
    dadosExcel.push([]);

    // Adicionar participantes por função
    escala.funcoes?.forEach((funcao: any) => {
      const participantes = escala.participantes?.filter((p: any) => p.funcaoId === funcao.id);
      
      if (participantes && participantes.length > 0) {
        dadosExcel.push([funcao.nome.toUpperCase()]);
        dadosExcel.push(["Nome", "Email", "Telefone", "Status", "Observações"]);
        
        participantes.forEach((participante: any) => {
          const statusTexto = participante.status === "confirmado" ? "Confirmado" : 
                             participante.status === "ausente" ? "Ausente" : "Pendente";
          
          dadosExcel.push([
            participante.nome,
            participante.email || "-",
            participante.telefone || "-",
            statusTexto,
            participante.observacoes || "-"
          ]);
        });
        
        dadosExcel.push([]);
      }
    });

    // Criar workbook e worksheet
    const ws = XLSX.utils.aoa_to_sheet(dadosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lista de Presença");

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome
      { wch: 30 }, // Email
      { wch: 15 }, // Telefone
      { wch: 12 }, // Status
      { wch: 40 }, // Observações
    ];
    ws['!cols'] = colWidths;

    // Salvar arquivo
    const nomeArquivo = `lista-presenca-${escala.titulo.replace(/\s+/g, '-').toLowerCase()}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
    toast.success("Planilha Excel exportada com sucesso!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-green-900/50 text-green-300 border-green-500/50";
      case "ausente":
        return "bg-red-900/50 text-red-300 border-red-500/50";
      default:
        return "bg-yellow-900/50 text-yellow-300 border-yellow-500/50";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmado":
        return "Confirmado";
      case "ausente":
        return "Ausente";
      default:
        return "Pendente";
    }
  };

  if (!escala) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <EscalasNavigation />
      <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button variant="ghost" onClick={() => setLocation("/escalas")} className="self-start">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{escala.titulo}</h1>
              <p className="text-sm sm:text-base text-purple-300 mt-1 font-medium">{escala.template}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {user && escala.userId === user.openId && (
              <Button 
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none border-purple-400 text-purple-300 hover:bg-purple-900/50"
                onClick={handleAbrirEdicao}
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            )}
            <Button 
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => {
                if (!escala) return;
                const dataFormatada = typeof escala.data === 'string' 
                  ? escala.data 
                  : new Date(escala.data).toISOString().split('T')[0];
                adicionarAoGoogleCalendar({
                  titulo: escala.titulo,
                  descricao: escala.descricao || undefined,
                  local: escala.local || undefined,
                  dataInicio: dataFormatada,
                  horaInicio: escala.hora || undefined,
                });
                toast.success("Abrindo Google Calendar...");
              }}
            >
              <CalendarPlus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Google Calendar</span>
            </Button>
            {user && escala && escala.userId === user.openId && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none"
                  onClick={handleAbrirDuplicacao}
                >
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Duplicar</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  onClick={() => enviarLembretesMutation.mutate({ escalaId })}
                  disabled={enviarLembretesMutation.isPending}
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {enviarLembretesMutation.isPending ? "Enviando..." : "Enviar Lembretes"}
                  </span>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleExportarPDF}>
              <FileDown className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleExportarExcel}>
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Dialog open={openShare} onOpenChange={setOpenShare}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </Button>
              </DialogTrigger>
            <DialogContent className="animate-in fade-in-0 zoom-in-95 duration-300">
              <DialogHeader>
                <DialogTitle>Compartilhar Escala</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                <Button onClick={handleCompartilharWhatsApp} className="w-full" variant="outline">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
                <Button onClick={handleCompartilharEmail} className="w-full" variant="outline">
                  <Mail className="w-5 h-5 mr-2" />
                  E-mail
                </Button>
                <Button onClick={handleCopiarTexto} className="w-full" variant="outline">
                  {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                  {copied ? "Copiado!" : "Copiar Texto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal de Edição */}
          <Dialog open={openEditEscala} onOpenChange={setOpenEditEscala}>
            <DialogContent className="animate-in fade-in-0 zoom-in-95 duration-300">
              <DialogHeader>
                <DialogTitle>Editar Escala</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="edit-titulo">Título *</Label>
                  <Input
                    id="edit-titulo"
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                    placeholder="Ex: Missa Domingo 07h"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-descricao">Descrição</Label>
                  <Textarea
                    id="edit-descricao"
                    value={editDescricao}
                    onChange={(e) => setEditDescricao(e.target.value)}
                    placeholder="Informações adicionais sobre a escala"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-data">Data *</Label>
                  <Input
                    id="edit-data"
                    type="date"
                    value={editData}
                    onChange={(e) => setEditData(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-hora">Horário</Label>
                  <Input
                    id="edit-hora"
                    type="time"
                    value={editHora}
                    onChange={(e) => setEditHora(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-local">Local</Label>
                  <Input
                    id="edit-local"
                    value={editLocal}
                    onChange={(e) => setEditLocal(e.target.value)}
                    placeholder="Ex: Igreja Matriz"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tipo">Tipo de Escala</Label>
                  <Select value={editTipo} onValueChange={(value: any) => setEditTipo(value)}>
                    <SelectTrigger id="edit-tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="musicos">🎵 Músicos</SelectItem>
                      <SelectItem value="reuniao">💼 Reunião</SelectItem>
                      <SelectItem value="grupo_oracao">🙏 Grupo de Oração</SelectItem>
                      <SelectItem value="personalizado">✨ Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAdicionarParticipante}
                    className="flex-1"
                    disabled={adicionarParticipanteMutation.isPending}
                  >
                    {adicionarParticipanteMutation.isPending ? "Adicionando..." : "Adicionar Participante"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenAddParticipante(false);
                      resetForm();
                    }}
                    disabled={adicionarParticipanteMutation.isPending}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Informações da Escala */}
        <Card className="p-6 mb-6 bg-slate-800/50 backdrop-blur-sm border-purple-500/30 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-200">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">Data:</span>
              {(() => {
                // Se for Date object, extrair componentes diretamente
                if (escala.data instanceof Date) {
                  const ano = escala.data.getFullYear();
                  const mes = String(escala.data.getMonth() + 1).padStart(2, '0');
                  const dia = String(escala.data.getDate()).padStart(2, '0');
                  return `${dia}/${mes}/${ano}`;
                }
                // Se for string no formato YYYY-MM-DD
                const dataStr = String(escala.data);
                if (dataStr.includes('-')) {
                  const [ano, mes, dia] = dataStr.split('T')[0].split('-');
                  return `${dia}/${mes}/${ano}`;
                }
                // Fallback
                return new Date(escala.data).toLocaleDateString("pt-BR");
              })()}
            </div>
            {escala.hora && (
              <div className="flex items-center gap-2 text-purple-200">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="font-semibold">Horário:</span>
                {escala.hora}
              </div>
            )}
            {escala.local && (
              <div className="flex items-center gap-2 text-purple-200">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span className="font-semibold">Local:</span>
                {escala.local}
              </div>
            )}
            {escala.descricao && (
              <div className="mt-4">
                <p className="font-semibold text-purple-200 mb-2">Descrição:</p>
                <p className="text-purple-300">{escala.descricao}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Estatísticas de Confirmação */}
        {escala.participantes && escala.participantes.length > 0 && (
          <EstatisticasConfirmacao participantes={escala.participantes} />
        )}

        {/* Tabs: Participantes e Histórico */}
        <Tabs defaultValue="participantes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="historico">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participantes" className="space-y-6">
          {escala.funcoes?.map((funcao: any) => {
            const participantes = escala.participantes?.filter((p: any) => p.funcaoId === funcao.id);
            return (
              <Card key={funcao.id} className="p-6 bg-slate-800/50 backdrop-blur-sm border-purple-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{funcao.nome}</h3>
                  <Dialog open={openAddParticipante && funcaoId === funcao.id} onOpenChange={(open) => {
                    setOpenAddParticipante(open);
                    if (open) setFuncaoId(funcao.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-900/50 hover:text-purple-200 hover:border-purple-300 transition-all duration-300 hover:scale-105">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="animate-in fade-in-0 zoom-in-95 duration-300">
                      <DialogHeader>
                        <DialogTitle>Adicionar Participante - {funcao.nome}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Buscar Usuário Cadastrado</Label>
                          <UserAutocomplete
                            value={nome}
                            onSelect={(user) => {
                              setNome(user.name);
                              setEmail(user.email);
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Ou preencha manualmente abaixo
                          </p>
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            Nome <span className="text-red-500">*</span>
                          </Label>
                          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" required />
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            E-mail
                            <span className="text-xs text-muted-foreground" title="Necessário para enviar notificações por email">
                              (opcional - para notificações)
                            </span>
                          </Label>
                          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            Telefone
                            <span className="text-xs text-muted-foreground" title="Necessário para enviar convite por WhatsApp">
                              (opcional - para WhatsApp)
                            </span>
                          </Label>
                          <Input
                            value={telefone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 11) {
                                const formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                                  .replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
                                  .replace(/(\d{2})(\d{0,5})/, '($1) $2');
                                setTelefone(formatted);
                              }
                            }}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div>
                          <Label>Observações</Label>
                          <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Informações adicionais..." />
                        </div>
                        <Button onClick={handleAdicionarParticipante} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={adicionarParticipanteMutation.isPending}>
                          {adicionarParticipanteMutation.isPending ? "Adicionando..." : "Adicionar Participante"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {participantes && participantes.length > 0 ? (
                  <div className="space-y-3">
                    {participantes.map((participante: any) => (
                      <div key={participante.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-purple-500/30 rounded-lg bg-slate-900/30">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white truncate">{participante.nome}</p>
                            <ConflitoBadge participante={participante} escalaId={escalaId} />
                          </div>
                          {participante.email && <p className="text-sm text-purple-300 truncate">{participante.email}</p>}
                          {participante.telefone && <p className="text-sm text-purple-300">{participante.telefone}</p>}
                          {participante.observacoes && <p className="text-sm text-purple-400 mt-1 line-clamp-2">{participante.observacoes}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          {participante.token && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const linkConfirmacao = `${window.location.origin}/confirmar/${participante.token}`;
                                  navigator.clipboard.writeText(linkConfirmacao);
                                  toast.success("Link de confirmação copiado!");
                                }}
                                title="Copiar link de confirmação"
                              >
                                <LinkIcon className="w-4 h-4 text-purple-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  console.log("[WhatsApp] Participante:", participante);
                                  console.log("[WhatsApp] Telefone:", participante.telefone);
                                  console.log("[WhatsApp] Token:", participante.token);
                                  
                                  if (!participante.telefone) {
                                    console.error("[WhatsApp] Erro: Participante sem telefone");
                                    toast.error("Participante sem telefone cadastrado");
                                    return;
                                  }
                                  if (!participante.token) {
                                    console.error("[WhatsApp] Erro: Token não encontrado");
                                    toast.error("Token de confirmação não encontrado");
                                    return;
                                  }
                                  
                                  const linkConfirmacao = `${window.location.origin}/confirmar/${participante.token}`;
                                  const mensagem = `Olá ${participante.nome}! Você foi convidado(a) para participar da escala *${escala?.titulo}* no dia ${new Date(escala?.data || '').toLocaleDateString('pt-BR')}${escala?.hora ? ` às ${escala.hora}` : ''}. Por favor, confirme sua presença clicando no link: ${linkConfirmacao}`;
                                  const telefone = participante.telefone.replace(/\D/g, '');
                                  const urlWhatsApp = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
                                  
                                  console.log("[WhatsApp] URL gerada:", urlWhatsApp);
                                  console.log("[WhatsApp] Abrindo janela...");
                                  
                                  const janela = window.open(urlWhatsApp, '_blank');
                                  if (!janela) {
                                    console.error("[WhatsApp] Pop-up bloqueado pelo navegador");
                                    toast.error("Pop-up bloqueado! Permita pop-ups para este site.");
                                  } else {
                                    console.log("[WhatsApp] Janela aberta com sucesso");
                                    toast.success("Abrindo WhatsApp...");
                                  }
                                }}
                                title={participante.telefone ? "Compartilhar por WhatsApp" : "Adicione um telefone para compartilhar"}
                                disabled={!participante.telefone}
                                className={!participante.telefone ? "opacity-50 cursor-not-allowed" : ""}
                              >
                                <MessageCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAbrirEdicaoParticipante(participante)}
                            title="Editar participante"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Select
                            value={participante.status}
                            onValueChange={(value) => handleAtualizarStatus(participante.id, value as any)}
                          >
                            <SelectTrigger className={`w-full sm:w-[140px] ${getStatusColor(participante.status)} transition-all duration-300`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">⏳ Pendente</SelectItem>
                              <SelectItem value="confirmado">✅ Confirmado</SelectItem>
                              <SelectItem value="ausente">❌ Ausente</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoverParticipante(participante.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-purple-400 text-center py-4">Nenhum participante adicionado</p>
                )}
              </Card>
            );
          })}
          </TabsContent>

          <TabsContent value="historico">
            <HistoricoTimeline escalaId={escalaId} />
          </TabsContent>
        </Tabs>

        {/* Modal de Duplicação de Escala */}
        <Dialog open={openDuplicar} onOpenChange={setOpenDuplicar}>
          <DialogContent className="animate-in fade-in-0 zoom-in-95 duration-300">
            <DialogHeader>
              <DialogTitle>Duplicar Escala</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Criar uma cópia desta escala com uma nova data. Você pode optar por copiar os participantes ou começar com uma escala vazia.
              </p>
              <div>
                <Label htmlFor="duplicar-data">Nova Data *</Label>
                <Input 
                  id="duplicar-data"
                  type="date" 
                  value={duplicarData} 
                  onChange={(e) => setDuplicarData(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="duplicar-hora">Horário</Label>
                <Input 
                  id="duplicar-hora"
                  type="time" 
                  value={duplicarHora} 
                  onChange={(e) => setDuplicarHora(e.target.value)} 
                />
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  id="copiar-participantes"
                  checked={copiarParticipantes}
                  onChange={(e) => setCopiarParticipantes(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <Label htmlFor="copiar-participantes" className="cursor-pointer">
                  Copiar participantes (status será resetado para pendente)
                </Label>
              </div>
              <Button 
                onClick={handleDuplicarEscala} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                disabled={duplicarEscalaMutation.isPending}
              >
                {duplicarEscalaMutation.isPending ? "Duplicando..." : "Duplicar Escala"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Participante */}
        <Dialog open={openEditParticipante} onOpenChange={setOpenEditParticipante}>
          <DialogContent className="animate-in fade-in-0 zoom-in-95 duration-300">
            <DialogHeader>
              <DialogTitle>Editar Participante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nome *</Label>
                <Input 
                  value={editNome} 
                  onChange={(e) => setEditNome(e.target.value)} 
                  placeholder="Nome completo" 
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  placeholder="email@exemplo.com" 
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={editTelefone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                      const formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                        .replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
                        .replace(/(\d{2})(\d{0,5})/, '($1) $2');
                      setEditTelefone(formatted);
                    }
                  }}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea 
                  value={editObservacoes} 
                  onChange={(e) => setEditObservacoes(e.target.value)} 
                  placeholder="Informações adicionais..." 
                />
              </div>
              <Button 
                onClick={handleSalvarEdicaoParticipante} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                disabled={atualizarParticipanteMutation.isPending}
              >
                {atualizarParticipanteMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
  );
}
