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
import { Calendar, Clock, MapPin, Plus, ArrowLeft, Share2, Mail, MessageCircle, Copy, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-green-100 text-green-800 border-green-300";
      case "ausente":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/escalas")}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{escala.titulo}</h1>
              <p className="text-gray-600 mt-1">{escala.template}</p>
            </div>
          </div>

          <Dialog open={openShare} onOpenChange={setOpenShare}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="w-5 h-5 mr-2" />
                Compartilhar
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

        {/* Informações da Escala */}
        <Card className="p-6 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Data:</span>
              {new Date(escala.data).toLocaleDateString("pt-BR")}
            </div>
            {escala.hora && (
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Horário:</span>
                {escala.hora}
              </div>
            )}
            {escala.local && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">Local:</span>
                {escala.local}
              </div>
            )}
            {escala.descricao && (
              <div className="mt-4">
                <p className="font-semibold text-gray-700 mb-2">Descrição:</p>
                <p className="text-gray-600">{escala.descricao}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Funções e Participantes */}
        <div className="space-y-6">
          {escala.funcoes?.map((funcao: any) => {
            const participantes = escala.participantes?.filter((p: any) => p.funcaoId === funcao.id);
            return (
              <Card key={funcao.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{funcao.nome}</h3>
                  <Dialog open={openAddParticipante && funcaoId === funcao.id} onOpenChange={(open) => {
                    setOpenAddParticipante(open);
                    if (open) setFuncaoId(funcao.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
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
                        <Button onClick={handleAdicionarParticipante} className="w-full" disabled={adicionarParticipanteMutation.isPending}>
                          {adicionarParticipanteMutation.isPending ? "Adicionando..." : "Adicionar Participante"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {participantes && participantes.length > 0 ? (
                  <div className="space-y-3">
                    {participantes.map((participante: any) => (
                      <div key={participante.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{participante.nome}</p>
                          {participante.email && <p className="text-sm text-gray-600">{participante.email}</p>}
                          {participante.telefone && <p className="text-sm text-gray-600">{participante.telefone}</p>}
                          {participante.observacoes && <p className="text-sm text-gray-500 mt-1">{participante.observacoes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
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
                  <p className="text-gray-500 text-center py-4">Nenhum participante adicionado</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
