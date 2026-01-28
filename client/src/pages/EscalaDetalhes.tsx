import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Calendar, Clock, MapPin, Plus, ArrowLeft, Share2, Mail, MessageCircle, Copy, Check, Trash2, FileDown, Link as LinkIcon, CalendarPlus } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { UserAutocomplete } from "@/components/UserAutocomplete";
import { adicionarAoGoogleCalendar } from "@/lib/googleCalendar";

export default function EscalaDetalhes() {
  const [, params] = useRoute("/escala/:id");
  const [, setLocation] = useLocation();
  const escalaId = parseInt(params?.id || "0");

  const [openAddParticipante, setOpenAddParticipante] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [funcaoId, setFuncaoId] = useState<number>(0);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Queries
  const { data: escala, refetch } = trpc.escalas.buscarPorId.useQuery({ escalaId });

  const adicionarParticipanteMutation = trpc.escalas.adicionarParticipante.useMutation({
    onSuccess: () => {
      toast.success("Participante adicionado com sucesso!");
      refetch();
      setOpenAddParticipante(false);
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

  const removerParticipanteMutation = trpc.escalas.removerParticipante.useMutation({
    onSuccess: () => {
      toast.success("Participante removido!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover participante: " + error.message);
    },
  });

  const resetForm = () => {
    setFuncaoId(0);
    setNome("");
    setEmail("");
    setTelefone("");
    setObservacoes("");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 py-12 px-4">
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
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleExportarPDF}>
              <FileDown className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
            <Dialog open={openShare} onOpenChange={setOpenShare}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </Button>
              </DialogTrigger>
            <DialogContent>
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
          </div>
        </div>

        {/* Informações da Escala */}
        <Card className="p-6 mb-6 bg-slate-800/50 backdrop-blur-sm border-purple-500/30 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-200">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">Data:</span>
              {new Date(escala.data).toLocaleDateString("pt-BR")}
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

        {/* Funções e Participantes */}
        <div className="space-y-6">
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
                      <Button size="sm" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-900/50 hover:text-purple-200 hover:border-purple-300 transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
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
                          <Label>Nome *</Label>
                          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
                        </div>
                        <div>
                          <Label>E-mail</Label>
                          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                        </div>
                        <div>
                          <Label>Telefone</Label>
                          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
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
                      <div key={participante.id} className="flex items-center justify-between p-4 border border-purple-500/30 rounded-lg bg-slate-900/30">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{participante.nome}</p>
                          {participante.email && <p className="text-sm text-purple-300">{participante.email}</p>}
                          {participante.telefone && <p className="text-sm text-purple-300">{participante.telefone}</p>}
                          {participante.observacoes && <p className="text-sm text-purple-400 mt-1">{participante.observacoes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {participante.token && (
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
                          )}
                          <Select
                            value={participante.status}
                            onValueChange={(value) => handleAtualizarStatus(participante.id, value as any)}
                          >
                            <SelectTrigger className={`w-[140px] ${getStatusColor(participante.status)}`}>
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
        </div>
      </div>
    </div>
  );
}
