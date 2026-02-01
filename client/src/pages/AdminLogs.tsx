import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, Filter, Download, ArrowLeft, Calendar, User, Activity } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function AdminLogs() {
  const [filtroAcao, setFiltroAcao] = useState<string>("todas");
  const [filtroUsuario, setFiltroUsuario] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

  const { data: logs, isLoading } = trpc.audit.listar.useQuery({
    action: filtroAcao === "todas" ? undefined : filtroAcao,
    userId: filtroUsuario ? parseInt(filtroUsuario) : undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  });

  const { data: stats } = trpc.audit.estatisticas.useQuery();

  const exportarParaExcel = () => {
    if (!logs || logs.length === 0) {
      toast.error("Nenhum log para exportar");
      return;
    }

    const dadosExportacao = logs.map((log) => ({
      Data: format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
      Usuário: log.userName,
      Ação: log.action,
      Tipo: log.targetType,
      Detalhes: log.details || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(dadosExportacao);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs de Auditoria");
    XLSX.writeFile(wb, `logs-auditoria-${format(new Date(), "dd-MM-yyyy")}.xlsx`);
    toast.success("Logs exportados com sucesso!");
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "text-green-400",
      update: "text-blue-400",
      delete: "text-red-400",
      suspend: "text-yellow-400",
      activate: "text-green-400",
      promote: "text-purple-400",
      demote: "text-orange-400",
    };
    return colors[action] || "text-gray-400";
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: "Criar",
      update: "Atualizar",
      delete: "Excluir",
      suspend: "Suspender",
      activate: "Ativar",
      promote: "Promover",
      demote: "Rebaixar",
    };
    return labels[action] || action;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-purple-100">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Logs de Auditoria
                </h1>
                <p className="text-purple-300 mt-1">Histórico completo de ações administrativas</p>
              </div>
            </div>
            <Button
              onClick={exportarParaExcel}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-purple-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Total de Ações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Usuários Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{stats.topUsuarios.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">-</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-700/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">-</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="bg-slate-800/50 border-purple-700/30 mb-6">
          <CardHeader>
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-purple-300 mb-2 block">Ação</label>
                <Select value={filtroAcao} onValueChange={setFiltroAcao}>
                  <SelectTrigger className="bg-slate-700/50 border-purple-600/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="create">Criar</SelectItem>
                    <SelectItem value="update">Atualizar</SelectItem>
                    <SelectItem value="delete">Excluir</SelectItem>
                    <SelectItem value="suspend">Suspender</SelectItem>
                    <SelectItem value="activate">Ativar</SelectItem>
                    <SelectItem value="promote">Promover</SelectItem>
                    <SelectItem value="demote">Rebaixar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-purple-300 mb-2 block">Usuário</label>
                <Input
                  placeholder="Nome do usuário..."
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  className="bg-slate-700/50 border-purple-600/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="text-sm text-purple-300 mb-2 block">Data Início</label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="bg-slate-700/50 border-purple-600/30 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-purple-300 mb-2 block">Data Fim</label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="bg-slate-700/50 border-purple-600/30 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <Card className="bg-slate-800/50 border-purple-700/30">
          <CardHeader>
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Histórico de Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-purple-300">Carregando logs...</div>
            ) : !logs || logs.length === 0 ? (
              <div className="text-center py-12 text-purple-300">Nenhum log encontrado</div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-700/30 border border-purple-700/20 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`font-semibold ${getActionColor(log.action)}`}>
                            {getActionLabel(log.action)}
                          </span>
                          <span className="text-purple-400">•</span>
                          <span className="text-purple-200">{log.targetType}</span>
                          {log.targetId && (
                            <>
                              <span className="text-purple-400">•</span>
                              <span className="text-gray-400 text-sm">ID: {log.targetId}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-300">
                          <User className="w-4 h-4" />
                          <span>{log.userName}</span>
                        </div>
                        {log.details && (
                          <p className="text-sm text-gray-400 mt-2">{log.details}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-purple-300">
                        {format(new Date(log.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        <br />
                        {format(new Date(log.createdAt), "HH:mm:ss", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
