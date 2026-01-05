import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  UserPlus,
  Shield,
  ArrowLeft,
  Download,
  ArrowUpDown,
  Filter,
  Mail,
  Send,
  BarChart3,
  Heart,
  Music,
  FileText,
  Clock,
  CheckCircle,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";

type SortField = "name" | "email" | "createdAt";
type SortOrder = "asc" | "desc";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para envio de email
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailRecipients, setEmailRecipients] = useState<"all" | "selected" | "filtered">("all");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Verificar se é superadmin
  const { data: adminCheck, isLoading: checkingAdmin } = trpc.admin.checkSuperAdmin.useQuery();

  // Buscar estatísticas
  const { data: stats, isLoading: loadingStats } = trpc.admin.getStats.useQuery(undefined, {
    enabled: adminCheck?.isSuperAdmin === true,
  });

  // Buscar estatísticas avançadas
  const { data: advancedStats, isLoading: loadingAdvanced } = trpc.admin.getAdvancedStats.useQuery(undefined, {
    enabled: adminCheck?.isSuperAdmin === true,
  });

  // Buscar usuários com filtros
  const { data: usersData, isLoading: loadingUsers } = trpc.admin.listUsers.useQuery(
    { 
      page, 
      limit: 15, 
      search: debouncedSearch || undefined,
      sortField,
      sortOrder,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { enabled: adminCheck?.isSuperAdmin === true }
  );

  // Mutation para enviar emails
  const sendEmailMutation = trpc.admin.sendBulkEmail.useMutation({
    onSuccess: (data) => {
      toast.success(`Email enviado para ${data.sentCount} usuários!`);
      setEmailDialogOpen(false);
      setEmailSubject("");
      setEmailBody("");
      setSelectedUsers([]);
    },
    onError: (error) => {
      toast.error(`Erro ao enviar email: ${error.message}`);
    },
  });

  // Redirect se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Redirect se não é superadmin
  useEffect(() => {
    if (!checkingAdmin && adminCheck && !adminCheck.isSuperAdmin) {
      toast.error("Acesso negado. Área restrita ao administrador.");
      navigate("/");
    }
  }, [checkingAdmin, adminCheck, navigate]);

  // Exportar CSV
  const handleExportCSV = () => {
    if (!usersData?.users) return;

    const headers = ["ID", "Nome", "Email", "Data de Cadastro"];
    const rows = usersData.users.map((u) => [
      u.id,
      u.name || "",
      u.email,
      u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Lista de usuários exportada com sucesso!");
  };

  // Toggle seleção de usuário
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Selecionar todos
  const toggleSelectAll = () => {
    if (!usersData?.users) return;
    if (selectedUsers.length === usersData.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersData.users.map((u) => u.id));
    }
  };

  // Enviar email
  const handleSendEmail = () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Preencha o assunto e o corpo do email");
      return;
    }

    setSendingEmail(true);
    sendEmailMutation.mutate({
      subject: emailSubject,
      body: emailBody,
      recipients: emailRecipients,
      selectedUserIds: emailRecipients === "selected" ? selectedUsers : undefined,
      filters: emailRecipients === "filtered" ? {
        search: debouncedSearch || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      } : undefined,
    });
    setSendingEmail(false);
  };

  // Ordenar coluna
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Limpar filtros
  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSortField("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!adminCheck?.isSuperAdmin) {
    return null;
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`h-4 w-4 ml-1 inline cursor-pointer ${
        sortField === field ? "text-purple-400" : "text-slate-500"
      }`}
      onClick={() => handleSort(field)}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Painel de Administração</h1>
                <p className="text-purple-300 text-sm">Gerenciamento completo do sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-purple-500/20">
            <TabsTrigger value="usuarios" className="data-[state=active]:bg-purple-600">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="emails" className="data-[state=active]:bg-purple-600">
              <Mail className="h-4 w-4 mr-2" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-purple-600">
              <FileText className="h-4 w-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="repertorios" className="data-[state=active]:bg-purple-600">
              <Music className="h-4 w-4 mr-2" />
              Repertórios
            </TabsTrigger>
          </TabsList>

          {/* Tab Usuários */}
          <TabsContent value="usuarios" className="space-y-6">
            {/* Cards de Estatísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Total de Usuários</p>
                      <p className="text-3xl font-bold text-white">
                        {loadingStats ? "..." : stats?.totalUsers || 0}
                      </p>
                    </div>
                    <Users className="h-10 w-10 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Últimos 7 dias</p>
                      <p className="text-3xl font-bold text-green-400">
                        +{loadingStats ? "..." : stats?.recentUsers || 0}
                      </p>
                    </div>
                    <UserPlus className="h-10 w-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Últimos 30 dias</p>
                      <p className="text-3xl font-bold text-blue-400">
                        +{loadingStats ? "..." : stats?.monthUsers || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Selecionados</p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {selectedUsers.length}
                      </p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros e Ações */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleExportCSV}
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                    <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-purple-500/20 text-white max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Enviar Email em Massa</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Envie um email para os usuários selecionados ou todos os usuários.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label className="text-purple-300">Destinatários</Label>
                            <Select value={emailRecipients} onValueChange={(v: any) => setEmailRecipients(v)}>
                              <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-purple-500/20">
                                <SelectItem value="all">Todos os usuários ({stats?.totalUsers || 0})</SelectItem>
                                <SelectItem value="selected" disabled={selectedUsers.length === 0}>
                                  Selecionados ({selectedUsers.length})
                                </SelectItem>
                                <SelectItem value="filtered">Filtrados ({usersData?.pagination.total || 0})</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-purple-300">Assunto</Label>
                            <Input
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              placeholder="Assunto do email..."
                              className="bg-slate-700/50 border-purple-500/30 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-purple-300">Mensagem</Label>
                            <Textarea
                              value={emailBody}
                              onChange={(e) => setEmailBody(e.target.value)}
                              placeholder="Corpo do email..."
                              rows={8}
                              className="bg-slate-700/50 border-purple-500/30 text-white"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEmailDialogOpen(false)} className="border-purple-500/30 text-purple-300">
                            Cancelar
                          </Button>
                          <Button onClick={handleSendEmail} disabled={sendingEmail} className="bg-purple-600 hover:bg-purple-700">
                            <Send className="h-4 w-4 mr-2" />
                            {sendingEmail ? "Enviando..." : "Enviar"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Filtros Avançados */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-purple-300 text-sm">Data de (cadastro)</Label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-slate-700/50 border-purple-500/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-purple-300 text-sm">Data até (cadastro)</Label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-slate-700/50 border-purple-500/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-purple-300 text-sm">Ordenar por</Label>
                      <Select value={sortField} onValueChange={(v: SortField) => setSortField(v)}>
                        <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-purple-500/20">
                          <SelectItem value="createdAt">Data de Cadastro</SelectItem>
                          <SelectItem value="name">Nome</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-purple-300 text-sm">Ordem</Label>
                      <Select value={sortOrder} onValueChange={(v: SortOrder) => setSortOrder(v)}>
                        <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-purple-500/20">
                          <SelectItem value="asc">Crescente</SelectItem>
                          <SelectItem value="desc">Decrescente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-4">
                      <Button variant="ghost" onClick={clearFilters} className="text-purple-300 hover:text-white">
                        Limpar filtros
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabela de Usuários */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Lista de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-purple-500/20">
                            <TableHead className="text-purple-300 w-12">
                              <Checkbox
                                checked={usersData?.users && selectedUsers.length === usersData.users.length && usersData.users.length > 0}
                                onCheckedChange={toggleSelectAll}
                              />
                            </TableHead>
                            <TableHead className="text-purple-300">ID</TableHead>
                            <TableHead className="text-purple-300 cursor-pointer" onClick={() => handleSort("name")}>
                              Nome <SortIcon field="name" />
                            </TableHead>
                            <TableHead className="text-purple-300 cursor-pointer" onClick={() => handleSort("email")}>
                              Email <SortIcon field="email" />
                            </TableHead>
                            <TableHead className="text-purple-300 cursor-pointer" onClick={() => handleSort("createdAt")}>
                              Data de Cadastro <SortIcon field="createdAt" />
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usersData?.users.map((user) => (
                            <TableRow key={user.id} className="border-purple-500/20 hover:bg-slate-700/30">
                              <TableCell>
                                <Checkbox
                                  checked={selectedUsers.includes(user.id)}
                                  onCheckedChange={() => toggleUserSelection(user.id)}
                                />
                              </TableCell>
                              <TableCell className="text-slate-300 font-mono">{user.id}</TableCell>
                              <TableCell className="text-white font-medium">{user.name || "-"}</TableCell>
                              <TableCell className="text-slate-300">{user.email}</TableCell>
                              <TableCell className="text-slate-400 text-sm">
                                {formatDate(user.createdAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                          {usersData?.users.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                                Nenhum usuário encontrado
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Paginação */}
                    {usersData && usersData.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-500/20">
                        <p className="text-slate-400 text-sm">
                          Mostrando {((page - 1) * 15) + 1} - {Math.min(page * 15, usersData.pagination.total)} de {usersData.pagination.total} usuários
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </Button>
                          <span className="text-slate-300 px-4">
                            Página {page} de {usersData.pagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(usersData.pagination.totalPages, p + 1))}
                            disabled={page === usersData.pagination.totalPages}
                            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                          >
                            Próxima
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Estatísticas */}
          <TabsContent value="estatisticas" className="space-y-6">
            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Total Favoritos</p>
                      <p className="text-3xl font-bold text-pink-400">
                        {loadingAdvanced ? "..." : advancedStats?.totalFavorites || 0}
                      </p>
                    </div>
                    <Heart className="h-10 w-10 text-pink-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Total Repertórios</p>
                      <p className="text-3xl font-bold text-cyan-400">
                        {loadingAdvanced ? "..." : advancedStats?.totalRepertorios || 0}
                      </p>
                    </div>
                    <FileText className="h-10 w-10 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Total Depoimentos</p>
                      <p className="text-3xl font-bold text-orange-400">
                        {loadingAdvanced ? "..." : advancedStats?.totalDepoimentos || 0}
                      </p>
                    </div>
                    <Music className="h-10 w-10 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Taxa Retenção (30d)</p>
                      <p className="text-3xl font-bold text-green-400">
                        {loadingAdvanced ? "..." : `${advancedStats?.retentionRate || 0}%`}
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Crescimento Mensal */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  Crescimento Mensal de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAdvanced ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : advancedStats?.monthlyGrowth && advancedStats.monthlyGrowth.length > 0 ? (
                  <div className="flex items-end justify-between gap-2 h-48">
                    {advancedStats.monthlyGrowth.map((month: { month: string; count: number }, index: number) => {
                      const maxCount = Math.max(...advancedStats.monthlyGrowth.map((m: { count: number }) => m.count));
                      const height = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-purple-300 text-sm font-medium">{month.count}</span>
                          <div
                            className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          />
                          <span className="text-slate-400 text-xs">{month.month}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">Sem dados disponíveis</p>
                )}
              </CardContent>
            </Card>

            {/* Gráfico de Cadastros Diários */}
            {stats?.dailyStats && stats.dailyStats.length > 0 && (
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    Cadastros nos Últimos 7 Dias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 h-40">
                    {stats.dailyStats.map((day, index) => {
                      const maxCount = Math.max(...stats.dailyStats.map((d) => d.count));
                      const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-purple-300 text-sm font-medium">{day.count}</span>
                          <div
                            className="w-full bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          />
                          <span className="text-slate-400 text-xs">
                            {new Date(day.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Músicas Mais Populares */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-400" />
                  Músicas Mais Favoritadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAdvanced ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : advancedStats?.topMusicas && advancedStats.topMusicas.length > 0 ? (
                  <div className="space-y-3">
                    {advancedStats.topMusicas.map((musica: { titulo: string; artista: string; count: number }, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-2xl font-bold text-purple-400 w-8">#{index + 1}</span>
                        <div className="flex-1">
                          <p className="text-white font-medium">{musica.titulo}</p>
                          <p className="text-slate-400 text-sm">{musica.artista}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-pink-400" />
                          <span className="text-pink-400 font-bold">{musica.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">Sem dados disponíveis</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Emails */}
          <TabsContent value="emails" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-400" />
                  Enviar Email em Massa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-purple-300">Destinatários</Label>
                  <Select value={emailRecipients} onValueChange={(v: any) => setEmailRecipients(v)}>
                    <SelectTrigger className="bg-slate-700/50 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/20">
                      <SelectItem value="all">Todos os usuários ({stats?.totalUsers || 0})</SelectItem>
                      <SelectItem value="selected" disabled={selectedUsers.length === 0}>
                        Selecionados na aba Usuários ({selectedUsers.length})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-300">Assunto</Label>
                  <Input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Assunto do email..."
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-300">Mensagem</Label>
                  <Textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Corpo do email..."
                    rows={10}
                    className="bg-slate-700/50 border-purple-500/30 text-white"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSendEmail} disabled={sendingEmail || !emailSubject || !emailBody} className="bg-purple-600 hover:bg-purple-700">
                    <Send className="h-4 w-4 mr-2" />
                    {sendingEmail ? "Enviando..." : "Enviar Email"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Templates de Email */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Templates de Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start border-purple-500/30 text-left hover:bg-purple-500/20"
                    onClick={() => {
                      setEmailSubject("Novidades no LouvaMais!");
                      setEmailBody("Olá!\n\nTemos novidades incríveis para você!\n\nNovas músicas foram adicionadas ao nosso repertório do Advento. Acesse agora e confira as novidades.\n\nAbraços,\nEquipe LouvaMais");
                    }}
                  >
                    <span className="text-white font-medium">Novidades</span>
                    <span className="text-slate-400 text-sm">Anunciar novas músicas ou funcionalidades</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start border-purple-500/30 text-left hover:bg-purple-500/20"
                    onClick={() => {
                      setEmailSubject("Prepare-se para o Advento!");
                      setEmailBody("Olá!\n\nO tempo do Advento está chegando! Prepare seu ministério de música com nosso repertório especialmente selecionado.\n\nAcesse nosso site e monte seu repertório personalizado.\n\nAbraços,\nEquipe LouvaMais");
                    }}
                  >
                    <span className="text-white font-medium">Tempo Litúrgico</span>
                    <span className="text-slate-400 text-sm">Lembrete sobre tempos litúrgicos</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start border-purple-500/30 text-left hover:bg-purple-500/20"
                    onClick={() => {
                      setEmailSubject("Obrigado por fazer parte da nossa comunidade!");
                      setEmailBody("Olá!\n\nQueremos agradecer por fazer parte da comunidade LouvaMais!\n\nSua participação é muito importante para nós. Continue explorando nosso repertório e compartilhando com outros ministérios.\n\nAbraços,\nEquipe LouvaMais");
                    }}
                  >
                    <span className="text-white font-medium">Agradecimento</span>
                    <span className="text-slate-400 text-sm">Agradecer aos usuários</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start border-purple-500/30 text-left hover:bg-purple-500/20"
                    onClick={() => {
                      setEmailSubject("Dicas para seu ministério de música");
                      setEmailBody("Olá!\n\nSeparamos algumas dicas especiais para ajudar seu ministério de música:\n\n1. Use a função de favoritos para salvar suas músicas preferidas\n2. Crie repertórios personalizados para cada celebração\n3. Compartilhe seus repertórios com outros membros do ministério\n\nAcesse nosso site e aproveite todas as funcionalidades!\n\nAbraços,\nEquipe LouvaMais");
                    }}
                  >
                    <span className="text-white font-medium">Dicas</span>
                    <span className="text-slate-400 text-sm">Compartilhar dicas e tutoriais</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Blog */}
          <TabsContent value="blog" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  Gerenciador de Blog
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Acesse o painel de administracao do blog para criar, editar e publicar artigos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-300">
                    Clique no botao abaixo para acessar o painel de admin do blog onde voce pode:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li>Criar novos artigos com editor rico</li>
                    <li>Fazer upload de imagens de capa para S3</li>
                    <li>Editar artigos existentes</li>
                    <li>Publicar e despublicar artigos</li>
                    <li>Gerenciar categorias e tags</li>
                  </ul>
                  <div className="pt-4">
                    <Link href="/blog-admin">
                      <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                        <BookOpen className="h-4 w-4" />
                        Ir para Painel do Blog
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Tab Repertórios */}
          <TabsContent value="repertorios" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-400" />
                  Gerenciador de Repertórios
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Acesse o painel de administração de repertórios para criar, editar e personalizar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-300">
                    Clique no botão abaixo para acessar o painel de admin de repertórios onde você pode:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li>Criar novos repertórios com personalização de cores</li>
                    <li>Adicionar momentos da missa (Entrada, Glória, Comunhão, etc)</li>
                    <li>Adicionar músicas com links para YouTube e Cifra</li>
                    <li>Visualizar preview do repertório antes de publicar</li>
                    <li>Editar e deletar repertórios existentes</li>
                  </ul>
                  <div className="pt-4">
                    <Link href="/repertorio-admin">
                      <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                        <Music className="h-4 w-4" />
                        Ir para Painel de Repertórios
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
