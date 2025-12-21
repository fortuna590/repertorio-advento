import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset para página 1 ao buscar
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Verificar se é superadmin
  const { data: adminCheck, isLoading: checkingAdmin } = trpc.admin.checkSuperAdmin.useQuery();

  // Buscar estatísticas
  const { data: stats, isLoading: loadingStats } = trpc.admin.getStats.useQuery(undefined, {
    enabled: adminCheck?.isSuperAdmin === true,
  });

  // Buscar usuários
  const { data: usersData, isLoading: loadingUsers } = trpc.admin.listUsers.useQuery(
    { page, limit: 15, search: debouncedSearch || undefined },
    { enabled: adminCheck?.isSuperAdmin === true }
  );

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
                <p className="text-purple-300 text-sm">Gerenciamento de usuários</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                  <p className="text-purple-300 text-sm">Média/dia (7d)</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {loadingStats
                      ? "..."
                      : stats?.recentUsers
                      ? (stats.recentUsers / 7).toFixed(1)
                      : "0"}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Usuários */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Lista de Usuários
              </CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
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
                        <TableHead className="text-purple-300">ID</TableHead>
                        <TableHead className="text-purple-300">Nome</TableHead>
                        <TableHead className="text-purple-300">Email</TableHead>
                        <TableHead className="text-purple-300">Data de Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData?.users.map((user) => (
                        <TableRow key={user.id} className="border-purple-500/20 hover:bg-slate-700/30">
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
                          <TableCell colSpan={4} className="text-center text-slate-400 py-8">
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

        {/* Gráfico de cadastros diários */}
        {stats?.dailyStats && stats.dailyStats.length > 0 && (
          <Card className="bg-slate-800/50 border-purple-500/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
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
                        className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t"
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
      </div>
    </div>
  );
}
