import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
import { useLocation } from "wouter";

export default function AdminUsuarios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Filtros
  const [busca, setBusca] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  // Modal de edição
  const [openEdit, setOpenEdit] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editParoquia, setEditParoquia] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editStatus, setEditStatus] = useState<"active" | "suspended">("active");
  const [editNotes, setEditNotes] = useState("");

  // Modal de email
  const [openEmail, setOpenEmail] = useState(false);
  const [emailAssunto, setEmailAssunto] = useState("");
  const [emailMensagem, setEmailMensagem] = useState("");

  // Modal de confirmação de exclusão
  const [openDelete, setOpenDelete] = useState(false);

  // Queries
  const { data: usuarios = [], refetch } = trpc.adminUsers.listar.useQuery({
    busca,
    role: roleFilter,
    status: statusFilter,
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

  const handleAbrirEdicao = (usuario: any) => {
    setUsuarioSelecionado(usuario);
    setEditName(usuario.name || "");
    setEditParoquia(usuario.paroquia || "");
    setEditBio(usuario.bio || "");
    setEditRole(usuario.role);
    setEditStatus(usuario.status);
    setEditNotes(usuario.adminNotes || "");
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
      atualizarStatusMutation.mutate({
        userId: usuarioSelecionado.id,
        status: editStatus,
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-purple-200">
            Administre usuários, permissões e estatísticas
          </p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <SelectItem value="user">Usuários</SelectItem>
                  </SelectContent>
                </Select>
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
