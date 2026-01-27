import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Filter, Download, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function HistoricoEscalas() {
  const { user } = useAuth();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [funcaoId, setFuncaoId] = useState<number | undefined>();
  const [status, setStatus] = useState<"confirmado" | "pendente" | "ausente" | undefined>();

  const { data: historico, isLoading, refetch } = trpc.escalas.historicoParticipacoes.useQuery(
    {
      userId: user?.id || 0,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      funcaoId,
      status,
    },
    { enabled: !!user }
  );

  // Buscar funções disponíveis (pode ser implementado depois)
  const funcoes: any[] = [];

  const handleExportarCSV = () => {
    if (!historico || historico.length === 0) return;

    const headers = ["Data", "Escala", "Horário", "Local", "Função", "Status"];
    const rows = historico.map((h: any) => [
      new Date(h.data).toLocaleDateString("pt-BR"),
      h.tituloEscala,
      h.hora || "-",
      h.local || "-",
      h.funcao,
      h.status === "confirmado" ? "Confirmado" : h.status === "pendente" ? "Pendente" : "Ausente",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `historico-escalas-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">✓ Confirmado</span>;
      case "pendente":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">⏳ Pendente</span>;
      case "ausente":
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">✗ Ausente</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Histórico de Participações</h1>
          <p className="text-gray-700 mt-1">Visualize todas as suas escalas anteriores</p>
        </div>
        <Link href="/minhas-escalas">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Filtre o histórico por período, função ou status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div>
              <Label>Função</Label>
              <Select value={funcaoId?.toString()} onValueChange={(v) => setFuncaoId(v ? parseInt(v) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as funções" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as funções</SelectItem>
                  {funcoes?.map((f: any) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => refetch()}>Aplicar Filtros</Button>
            <Button
              variant="outline"
              onClick={() => {
                setDataInicio("");
                setDataFim("");
                setFuncaoId(undefined);
                setStatus(undefined);
              }}
            >
              Limpar Filtros
            </Button>
            <Button variant="outline" onClick={handleExportarCSV} disabled={!historico || historico.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico ({historico?.length || 0} participações)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando histórico...</div>
          ) : !historico || historico.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma participação encontrada com os filtros aplicados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Escala</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">
                        {new Date(h.data).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{h.tituloEscala}</TableCell>
                      <TableCell>{h.hora || "-"}</TableCell>
                      <TableCell>{h.local || "-"}</TableCell>
                      <TableCell>{h.funcao}</TableCell>
                      <TableCell>{getStatusBadge(h.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{h.observacoes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
