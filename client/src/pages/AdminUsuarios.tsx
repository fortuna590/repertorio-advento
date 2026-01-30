import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Shield, 
  ShieldOff,
  Ban,
  CheckCircle,
  ArrowLeft,
  StickyNote
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsuarios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Filtros
  const [busca, setBusca] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "moderator" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Modal de edição
  const [openEdit, setOpenEdit] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editParoquia, setEditParoquia] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editRole, setEditRole] = useState<"user" | "moderator" | "admin">("user");
  const [editStatus, setEditStatus] = useState<"active" | "suspended">("active");
  const [editNotes, setEditNotes] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");

  // Modal de email
  const [openEmail, setOpenEmail] = useState(false);
  const [emailAssunto, setEmailAssunto] = useState("");
  const [emailMensagem, setEmailMensagem] = useState("");

  // Modal de confirmação de exclusão
  const [openDelete, setOpenDelete] = useState(false);

  // Seleção múltipla
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<number[]>([]);
  const [openBulkAction, setOpenBulkAction] = useState(false);
  const [bulkAction, setBulkAction] = useState<'excluir' | 'suspender' | 'ativar' | null>(null);
  const [bulkSuspensionReason, setBulkSuspensionReason] = useState("");

  // Queries
  const { data: usuarios = [], refetch } = trpc.adminUsers.listar.useQuery({
    busca,
    role: roleFilter,
    status: statusFilter,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  });

  const { data: stats } = trpc.adminUsers.estatisticasGerais.useQuery();

  const { data: detalhes, refetch: refetchDetalhes } = trpc.adminUsers.obterDetalhes.useQuery(
    { userId: usuarioSelecionado?.id || 0 },
    { enabled: !!usuarioSelecionado }
  );

  // Mutations
  const atualizarRoleMutation = trpc.adminUsers.atualizarRole.useMutation({
    onSuccess: () => {
      toast.success("Permissões atualizadas!");
      refetch();
      refetchDetalhes();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const atualizarStatusMutation = trpc.adminUsers.atualizarStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
      refetchDetalhes();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const editarPerfilMutation = trpc.adminUsers.editarPerfil.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado!");
      refetch();
      refetchDetalhes();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const atualizarNotasMutation = trpc.adminUsers.atualizarNotas.useMutation({
    onSuccess: () => {
      toast.success("Notas atualizadas!");
      refetch();
      refetchDetalhes();
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const enviarEmailMutation = trpc.adminUsers.enviarEmail.useMutation({
    onSuccess: () => {
      toast.success("Email enviado!");
      setOpenEmail(false);
      setEmailAssunto("");
      setEmailMensagem("");
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const excluirMutation = trpc.adminUsers.excluir.useMutation({
    onSuccess: () => {
      toast.success("Usuário excluído!");
      refetch();
      setOpenDelete(false);
      setOpenEdit(false);
      setUsuarioSelecionado(null);
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const excluirEmMassaMutation = trpc.adminUsers.excluirEmMassa.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.excluidos} usuário(s) excluído(s)!`);
      if (data.erros > 0) {
        toast.warning(`${data.erros} erro(s) ao excluir alguns usuários`);
      }
      refetch();
      setUsuariosSelecionados([]);
      setOpenBulkAction(false);
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const suspenderEmMassaMutation = trpc.adminUsers.suspenderEmMassa.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.total} usuário(s) suspendido(s)!`);
      refetch();
      setUsuariosSelecionados([]);
      setOpenBulkAction(false);
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  const ativarEmMassaMutation = trpc.adminUsers.ativarEmMassa.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.total} usuário(s) ativado(s)!`);
      refetch();
      setUsuariosSelecionados([]);
      setOpenBulkAction(false);
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });

  // Exportar dados para Excel
  const exportarParaExcel = () => {
    if (!usuarios || usuarios.length === 0) {
      toast.error("Nenhum usuário para exportar");
      return;
    }

    // Preparar dados para exportação
    const dadosExportacao = usuarios.map((u: any) => ({
      ID: u.id,
      Nome: u.name || "-",
      Email: u.email || "-",
      Role: u.role === "admin" ? "Administrador" : u.role === "moderator" ? "Moderador" : "Usuário",
      Status: u.status === "active" ? "Ativo" : "Suspenso",
      Paróquia: u.paroquia || "-",
      "Data de Cadastro": new Date(u.createdAt).toLocaleDateString("pt-BR"),
      "Último Acesso": new Date(u.lastSignedIn).toLocaleDateString("pt-BR"),
    }));

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dadosExportacao);

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 10 }, // ID
      { wch: 25 }, // Nome
      { wch: 30 }, // Email
      { wch: 15 }, // Role
      { wch: 12 }, // Status
      { wch: 25 }, // Paróquia
      { wch: 18 }, // Data de Cadastro
      { wch: 18 }, // Último Acesso
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Usuários");

    // Gerar arquivo
    const dataAtual = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `usuarios_louvamais_${dataAtual}.xlsx`);

    toast.success(`${usuarios.length} usuários exportados com sucesso!`);
  };

  const handleAbrirEdicao = (usuario: any) => {
    setUsuarioSelecionado(usuario);
    setEditName(usuario.name || "");
    setEditParoquia(usuario.paroquia || "");
    setEditBio(usuario.bio || "");
    setEditRole(usuario.role);
    setEditStatus(usuario.status);
    setEditNotes(usuario.adminNotes || "");
    setSuspensionReason(usuario.suspensionReason || "");
    setOpenEdit(true);
  };

  const handleSalvarEdicao = () => {
    if (!usuarioSelecionado) return;

    // Atualizar perfil
    editarPerfilMutation.mutate({
      userId: usuarioSelecionado.id,
      name: editName,
      paroquia: editParoquia,
      bio: editBio,
    });

    // Atualizar role se mudou
    if (editRole !== usuarioSelecionado.role) {
      atualizarRoleMutation.mutate({
        userId: usuarioSelecionado.id,
        role: editRole,
      });
    }

    // Atualizar status se mudou
    if (editStatus !== usuarioSelecionado.status) {
      if (editStatus === "suspended" && !suspensionReason.trim()) {
        toast.error("Informe o motivo da suspensão");
        return;
      }
      atualizarStatusMutation.mutate({
        userId: usuarioSelecionado.id,
        status: editStatus,
        motivo: editStatus === "suspended" ? suspensionReason : undefined,
      });
    }

    // Atualizar notas se mudou
    if (editNotes !== (usuarioSelecionado.adminNotes || "")) {
      atualizarNotasMutation.mutate({
        userId: usuarioSelecionado.id,
        adminNotes: editNotes,
      });
    }

    setOpenEdit(false);
  };

  const handleEnviarEmail = () => {
    if (!usuarioSelecionado || !emailAssunto || !emailMensagem) {
      toast.error("Preencha todos os campos");
      return;
    }

    enviarEmailMutation.mutate({
      userId: usuarioSelecionado.id,
      assunto: emailAssunto,
      mensagem: emailMensagem,
    });
  };

  const handleExcluir = () => {
    if (!usuarioSelecionado) return;

    excluirMutation.mutate({
      userId: usuarioSelecionado.id,
    });
  };

  const handleToggleSelecionarUsuario = (userId: number) => {
    setUsuariosSelecionados(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelecionarTodos = () => {
    if (usuariosSelecionados.length === usuarios.length) {
      setUsuariosSelecionados([]);
    } else {
      setUsuariosSelecionados(usuarios.map((u: any) => u.id));
    }
  };

  const handleAbrirAcaoEmMassa = (acao: 'excluir' | 'suspender' | 'ativar') => {
    setBulkAction(acao);
    setOpenBulkAction(true);
  };

  const handleConfirmarAcaoEmMassa = () => {
    if (usuariosSelecionados.length === 0) return;

    // Validar motivo se for suspensão
    if (bulkAction === 'suspender' && !bulkSuspensionReason.trim()) {
      toast.error("Informe o motivo da suspensão em massa");
      return;
    }

    switch (bulkAction) {
      case 'excluir':
        excluirEmMassaMutation.mutate({ userIds: usuariosSelecionados });
        break;
      case 'suspender':
        suspenderEmMassaMutation.mutate({ 
          userIds: usuariosSelecionados,
          motivo: bulkSuspensionReason 
        });
        break;
      case 'ativar':
        ativarEmMassaMutation.mutate({ userIds: usuariosSelecionados });
        break;
    }

    // Resetar motivo após ação
    setBulkSuspensionReason("");
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Acesso Restrito</CardTitle>
            <CardDescription className="text-purple-300">
              Você precisa ser administrador para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin")}
              className="text-purple-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao Painel
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Gerenciamento de Usuários
              </h1>
              <p className="text-purple-200">
                Administre usuários, permissões e estatísticas
              </p>
            </div>
            <Button
              onClick={exportarParaExcel}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Exportar Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Novos no Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{stats?.novosNoMes || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{stats?.ativos || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <UserX className="w-4 h-4" />
                Suspensos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{stats?.suspensos || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="busca" className="text-purple-200">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <Input
                    id="busca"
                    placeholder="Nome ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role" className="text-purple-200">Permissão</Label>
                <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                    <SelectItem value="moderator">Moderadores</SelectItem>
                    <SelectItem value="user">Usuários</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dataInicio" className="text-purple-200">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="dataFim" className="text-purple-200">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="status" className="text-purple-200">Status</Label>
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="suspended">Suspensos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ações em Massa */}
        {usuariosSelecionados.length > 0 && (
          <Card className="bg-purple-900/30 backdrop-blur-sm border-purple-500/50 mb-4">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">
                  {usuariosSelecionados.length} usuário(s) selecionado(s)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAbrirAcaoEmMassa('ativar')}
                    className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ativar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAbrirAcaoEmMassa('suspender')}
                    className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspender
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAbrirAcaoEmMassa('excluir')}
                    className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Usuários */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Usuários Cadastrados</CardTitle>
            <CardDescription className="text-purple-300">
              {usuarios.length} usuário(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold w-12">
                      <input
                        type="checkbox"
                        checked={usuariosSelecionados.length === usuarios.length && usuarios.length > 0}
                        onChange={handleSelecionarTodos}
                        className="w-4 h-4 rounded border-purple-500/50 bg-slate-700 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Nome</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Email</th>
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold">Permissão</th>
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold">Cadastro</th>
                    <th className="text-center py-3 px-4 text-purple-200 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario: any) => (
                    <tr key={usuario.id} className="border-b border-purple-500/20 hover:bg-purple-900/20 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={usuariosSelecionados.includes(usuario.id)}
                          onChange={() => handleToggleSelecionarUsuario(usuario.id)}
                          className="w-4 h-4 rounded border-purple-500/50 bg-slate-700 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{usuario.name || "Sem nome"}</td>
                      <td className="py-3 px-4 text-purple-200">{usuario.email || "Sem email"}</td>
                      <td className="py-3 px-4 text-center">
                        {usuario.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                            <ShieldOff className="w-3 h-3" />
                            Usuário
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {usuario.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">
                            <Ban className="w-3 h-3" />
                            Suspenso
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-purple-300 text-sm">
                        {new Date(usuario.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAbrirEdicao(usuario)}
                          className="text-purple-300 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuário</DialogTitle>
            <DialogDescription>
              {usuarioSelecionado?.name} ({usuarioSelecionado?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Estatísticas do Usuário */}
            {detalhes && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Escalas Criadas</div>
                  <div className="text-2xl font-bold">{detalhes.estatisticas.escalasCriadas}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Participações</div>
                  <div className="text-2xl font-bold">{detalhes.estatisticas.participacoes}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Confirmados</div>
                  <div className="text-2xl font-bold text-green-600">{detalhes.estatisticas.confirmados}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Taxa</div>
                  <div className="text-2xl font-bold">{detalhes.estatisticas.taxaConfirmacao}%</div>
                </div>
              </div>
            )}

            {/* Informações do Perfil */}
            <div className="space-y-4">
              <h3 className="font-semibold">Informações do Perfil</h3>
              
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="edit-paroquia">Paróquia/Ministério</Label>
                <Input
                  id="edit-paroquia"
                  value={editParoquia}
                  onChange={(e) => setEditParoquia(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="edit-bio">Biografia</Label>
                <Textarea
                  id="edit-bio"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Permissões e Status */}
            <div className="space-y-4">
              <h3 className="font-semibold">Permissões e Status</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Permissão</Label>
                  <Select value={editRole} onValueChange={(v: any) => setEditRole(v)}>
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-status">Status da Conta</Label>
                  <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campo de justificativa (aparece apenas se suspender) */}
              {editStatus === "suspended" && (
                <div className="space-y-2">
                  <Label htmlFor="suspension-reason" className="text-red-400">
                    Motivo da Suspensão *
                  </Label>
                  <Textarea
                    id="suspension-reason"
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Descreva brevemente o motivo da suspensão..."
                    className="min-h-[80px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Este motivo será registrado nos logs de auditoria.
                  </p>
                </div>
              )}
            </div>

            {/* Notas Administrativas */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Notas Administrativas
              </h3>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notas internas sobre este usuário..."
                rows={4}
              />
            </div>

            {/* Ações */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                onClick={handleSalvarEdicao}
                className="flex-1"
                disabled={editarPerfilMutation.isPending}
              >
                Salvar Alterações
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setOpenEmail(true);
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>

              <Button
                variant="destructive"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Email */}
      <Dialog open={openEmail} onOpenChange={setOpenEmail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Email</DialogTitle>
            <DialogDescription>
              Enviar mensagem para {usuarioSelecionado?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="email-assunto">Assunto</Label>
              <Input
                id="email-assunto"
                value={emailAssunto}
                onChange={(e) => setEmailAssunto(e.target.value)}
                placeholder="Assunto do email"
              />
            </div>

            <div>
              <Label htmlFor="email-mensagem">Mensagem</Label>
              <Textarea
                id="email-mensagem"
                value={emailMensagem}
                onChange={(e) => setEmailMensagem(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={6}
              />
            </div>

            <Button
              onClick={handleEnviarEmail}
              className="w-full"
              disabled={enviarEmailMutation.isPending}
            >
              {enviarEmailMutation.isPending ? "Enviando..." : "Enviar Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Ações em Massa */}
      <Dialog open={openBulkAction} onOpenChange={setOpenBulkAction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === 'excluir' && 'Confirmar Exclusão em Massa'}
              {bulkAction === 'suspender' && 'Confirmar Suspensão em Massa'}
              {bulkAction === 'ativar' && 'Confirmar Ativação em Massa'}
            </DialogTitle>
            <DialogDescription>
              {bulkAction === 'excluir' && (
                <span>
                  Tem certeza que deseja <strong className="text-red-500">excluir permanentemente</strong> {usuariosSelecionados.length} usuário(s)?
                  Esta ação não pode ser desfeita e todos os dados relacionados (repertórios, participações em escalas) serão excluídos.
                </span>
              )}
              {bulkAction === 'suspender' && (
                <>
                  <span className="block mb-4">
                    Tem certeza que deseja <strong className="text-yellow-500">suspender</strong> {usuariosSelecionados.length} usuário(s)?
                    Eles não poderão acessar o sistema até serem reativados.
                  </span>
                  <div className="space-y-2">
                    <Label htmlFor="bulk-suspension-reason" className="text-red-400">
                      Motivo da Suspensão *
                    </Label>
                    <Textarea
                      id="bulk-suspension-reason"
                      value={bulkSuspensionReason}
                      onChange={(e) => setBulkSuspensionReason(e.target.value)}
                      placeholder="Descreva brevemente o motivo da suspensão em massa..."
                      className="min-h-[80px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      Este motivo será registrado nos logs de auditoria.
                    </p>
                  </div>
                </>
              )}
              {bulkAction === 'ativar' && (
                <span>
                  Tem certeza que deseja <strong className="text-green-500">ativar</strong> {usuariosSelecionados.length} usuário(s)?
                  Eles poderão acessar o sistema normalmente.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenBulkAction(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant={bulkAction === 'excluir' ? 'destructive' : 'default'}
              onClick={handleConfirmarAcaoEmMassa}
              className="flex-1"
            >
              {bulkAction === 'excluir' && 'Excluir'}
              {bulkAction === 'suspender' && 'Suspender'}
              {bulkAction === 'ativar' && 'Ativar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir permanentemente o usuário <strong>{usuarioSelecionado?.name}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleExcluir}
              className="flex-1"
              disabled={excluirMutation.isPending}
            >
              {excluirMutation.isPending ? "Excluindo..." : "Excluir Permanentemente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
