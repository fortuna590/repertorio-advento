import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, X, Clock } from "lucide-react";
import { VoltarPainelAdminButton } from "@/components/VoltarPainelAdminButton";
import { APP_LOGO } from "@/const";
import ModernHeader from "@/components/ModernHeader";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DepoimentosAdmin() {
  const utils = trpc.useUtils();
  const { data: pending, isLoading } = trpc.depoimentos.listPending.useQuery();

  const approveMutation = trpc.depoimentos.approve.useMutation({
    onSuccess: () => {
      toast.success("Depoimento aprovado com sucesso!");
      utils.depoimentos.listPending.invalidate();
      utils.depoimentos.listApproved.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao aprovar depoimento");
    },
  });

  const deleteMutation = trpc.depoimentos.delete.useMutation({
    onSuccess: () => {
      toast.success("Depoimento rejeitado com sucesso!");
      utils.depoimentos.listPending.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao rejeitar depoimento");
    },
  });

  const handleApprove = (id: number) => {
    if (confirm("Deseja aprovar este depoimento?")) {
      approveMutation.mutate({ id });
    }
  };

  const handleReject = (id: number) => {
    if (confirm("Deseja rejeitar este depoimento? Esta ação não pode ser desfeita.")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <VoltarPainelAdminButton />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Moderação de Depoimentos</h1>
          <p className="text-xl text-purple-200 mb-8">
            Revise e aprove depoimentos antes de publicá-los
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">
                {pending?.length || 0}
              </p>
              <p className="text-purple-200">Pendentes</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <Check className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">-</p>
              <p className="text-purple-200">Aprovados</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">-</p>
              <p className="text-purple-200">Avaliação Média</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Depoimentos Pendentes */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">Depoimentos Pendentes</h2>

          {isLoading && (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Card key={i} className="bg-slate-800/50 border-purple-500/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-slate-700 rounded mb-4"></div>
                    <div className="h-4 bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && (!pending || pending.length === 0) && (
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 text-lg">
                  Nenhum depoimento pendente de aprovação
                </p>
              </CardContent>
            </Card>
          )}

          {pending && pending.length > 0 && (
            <div className="space-y-6">
              {pending.map((depoimento) => (
                <Card
                  key={depoimento.id}
                  className="bg-slate-800/50 border-yellow-500/30 hover:border-yellow-500/50 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white mb-2">
                          {depoimento.nomeAutor}
                        </CardTitle>
                        {depoimento.organizacao && (
                          <p className="text-purple-300 text-sm mb-2">
                            {depoimento.organizacao}
                          </p>
                        )}
                        <p className="text-purple-400 text-sm">
                          {depoimento.emailAutor}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= depoimento.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-100 mb-6 italic">
                      "{depoimento.mensagem}"
                    </p>
                    <p className="text-purple-400 text-xs mb-4">
                      Enviado em{" "}
                      {new Date(depoimento.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleApprove(depoimento.id)}
                        disabled={approveMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleReject(depoimento.id)}
                        disabled={deleteMutation.isPending}
                        variant="outline"
                        className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
