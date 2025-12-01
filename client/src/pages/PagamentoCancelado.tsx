import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function PagamentoCancelado() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
      <Card className="p-12 bg-slate-800 border-orange-500/20 max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <XCircle className="w-20 h-20 text-orange-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">Pagamento Cancelado</h1>
          <p className="text-purple-200 text-lg mb-8">
            Seu pagamento foi cancelado. Nenhuma cobrança foi realizada.
          </p>

          <div className="bg-slate-700/50 rounded-lg p-4 mb-8">
            <p className="text-purple-200 text-sm">
              Se deseja tentar novamente, clique no botão abaixo ou entre em contato conosco para obter ajuda.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setLocation("/produtos")}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold"
            >
              Tentar Novamente
            </Button>

            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="w-full"
            >
              Voltar para Home
            </Button>

            <Button
              onClick={() => setLocation("/contato")}
              variant="outline"
              className="w-full"
            >
              Entrar em Contato
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
