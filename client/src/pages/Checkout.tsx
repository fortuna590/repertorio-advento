import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    productName: "Guia Completo de Repertório Litúrgico",
    price: 49.9,
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const createCheckoutMutation = trpc.payments.createCheckoutSession.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createCheckoutMutation.mutateAsync({
        productId: "guia-completo",
        productName: formData.productName,
        price: formData.price,
        quantity: formData.quantity,
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
      });

      if (result.success && result.url) {
        setSuccess(true);
        // Redirecionar para Stripe
        window.location.href = result.url;
      } else {
        setError(result.error || "Erro ao criar sessão de pagamento");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Checkout</h1>
          <p className="text-purple-200">Finalize sua compra com segurança</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="md:col-span-2">
            <Card className="p-8 bg-slate-800 border-purple-500/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Nome Completo
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="Seu nome"
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
                    placeholder="seu@email.com"
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Quantidade
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-200">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-200">Redirecionando para pagamento...</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Ir para Pagamento"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/produtos")}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </form>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div>
            <Card className="p-6 bg-slate-800 border-purple-500/20 sticky top-4">
              <h3 className="text-lg font-semibold text-white mb-4">Resumo do Pedido</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-purple-200 text-sm">Produto</p>
                  <p className="text-white font-medium">{formData.productName}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-purple-200">Preço unitário:</span>
                  <span className="text-white font-medium">
                    R$ {formData.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-purple-200">Quantidade:</span>
                  <span className="text-white font-medium">{formData.quantity}</span>
                </div>

                <div className="border-t border-purple-500/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      R$ {(formData.price * formData.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-sm text-purple-200">
                <p className="font-semibold mb-2">🔒 Pagamento Seguro</p>
                <p>Seu pagamento é processado com segurança pelo Stripe.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
