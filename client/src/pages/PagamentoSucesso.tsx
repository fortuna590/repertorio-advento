import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PagamentoSucesso() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [error, setError] = useState("");

  const getCheckoutSessionQuery = trpc.payments.getCheckoutSession.useQuery(
    {
      sessionId: new URLSearchParams(searchParams).get("session_id") || "",
    },
    {
      enabled: !!new URLSearchParams(searchParams).get("session_id"),
    }
  );

  useEffect(() => {
    if (getCheckoutSessionQuery.data) {
      setPaymentInfo(getCheckoutSessionQuery.data);
      setLoading(false);
    }
    if (getCheckoutSessionQuery.error) {
      setError("Erro ao recuperar informações do pagamento");
      setLoading(false);
    }
  }, [getCheckoutSessionQuery.data, getCheckoutSessionQuery.error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200">Processando seu pagamento...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentInfo?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
        <Card className="p-8 bg-slate-800 border-red-500/20 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-4">Erro no Pagamento</h1>
            <p className="text-red-200 mb-6">{error || "Ocorreu um erro ao processar seu pagamento"}</p>
            <Button
              onClick={() => setLocation("/produtos")}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Voltar aos Produtos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-12 bg-slate-800 border-green-500/20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-green-400" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">Pagamento Confirmado!</h1>
            <p className="text-purple-200 text-lg mb-8">
              Obrigado pela sua compra! Você receberá um email de confirmação em breve.
            </p>

            <div className="bg-slate-700/50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold text-white mb-4">Detalhes do Pedido</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-200">Email:</span>
                  <span className="text-white font-medium">
                    {paymentInfo.customerEmail}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-purple-200">Produto:</span>
                  <span className="text-white font-medium">
                    {paymentInfo.metadata?.productName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-purple-200">Valor:</span>
                  <span className="text-white font-medium">
                    R$ {paymentInfo.amountTotal?.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-purple-200">ID do Pedido:</span>
                  <span className="text-white font-mono text-sm">
                    {new URLSearchParams(searchParams).get("session_id")?.slice(0, 12)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
              <p className="text-blue-200">
                📧 Um email de confirmação foi enviado para <strong>{paymentInfo.customerEmail}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setLocation("/")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold"
              >
                Voltar para Home
              </Button>

              <Button
                onClick={() => setLocation("/produtos")}
                variant="outline"
                className="w-full"
              >
                Ver Mais Produtos
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-purple-200 text-sm">
          <p>Dúvidas? Entre em contato através da página de contato do site.</p>
        </div>
      </div>
    </div>
  );
}
