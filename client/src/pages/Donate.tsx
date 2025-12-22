import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Check } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

const SUGGESTED_AMOUNTS = [10, 25, 50, 100, 200];

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");

  const createCheckoutMutation = trpc.donations.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecionando para pagamento...");
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (error) => {
      toast.error("Erro ao processar doação", {
        description: error.message,
      });
    },
  });

  const handleDonate = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount < 5) {
      toast.error("Valor mínimo", {
        description: "O valor mínimo para doação é R$ 5,00",
      });
      return;
    }

    if (amount > 10000) {
      toast.error("Valor máximo", {
        description: "O valor máximo para doação é R$ 10.000,00",
      });
      return;
    }

    createCheckoutMutation.mutate({
      amount: Math.round(amount * 100), // Converter para centavos
      donorName: donorName || undefined,
      donorEmail: donorEmail || undefined,
      message: message || undefined,
    });
  };

  const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Apoie o Projeto</h1>
          <p className="text-xl text-purple-200">
            Sua doação ajuda a manter o LouvaMais funcionando e crescendo
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Formulário de Doação */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Fazer uma Doação
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Escolha um valor ou insira o quanto deseja doar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Valores Sugeridos */}
                <div className="space-y-2">
                  <Label className="text-white">Valores Sugeridos</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUGGESTED_AMOUNTS.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                        className={`relative ${
                          selectedAmount === amount
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            : "border-purple-500/30 text-purple-200 hover:text-white hover:bg-purple-500/10"
                        }`}
                      >
                        {selectedAmount === amount && (
                          <Check className="w-4 h-4 absolute top-1 right-1" />
                        )}
                        R$ {amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Valor Personalizado */}
                <div className="space-y-2">
                  <Label htmlFor="customAmount" className="text-white">Ou insira outro valor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300">
                      R$
                    </span>
                    <Input
                      id="customAmount"
                      type="number"
                      min="5"
                      max="10000"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="0,00"
                      className="pl-10 bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                  </div>
                  <p className="text-xs text-purple-300">
                    Valor mínimo: R$ 5,00 | Valor máximo: R$ 10.000,00
                  </p>
                </div>

                {/* Informações do Doador */}
                <div className="space-y-4 pt-4 border-t border-purple-500/20">
                  <div className="space-y-2">
                    <Label htmlFor="donorName" className="text-white">Seu Nome (opcional)</Label>
                    <Input
                      id="donorName"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Como gostaria de ser chamado"
                      className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donorEmail" className="text-white">Seu Email (opcional)</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">Mensagem (opcional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Deixe uma mensagem de apoio..."
                      rows={3}
                      className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                    />
                  </div>
                </div>

                {/* Botão de Doação */}
                <Button
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                  disabled={!finalAmount || finalAmount < 5 || createCheckoutMutation.isPending}
                  onClick={handleDonate}
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      Doar {finalAmount > 0 && `R$ ${finalAmount.toFixed(2)}`}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-purple-300">
                  Pagamento seguro processado pelo Stripe
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Informações sobre o Projeto */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Por que Doar?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-purple-100">
                <p>
                  O <span className="font-semibold text-white">LouvaMais</span> é um projeto gratuito 
                  que oferece soluções tecnológicas para igrejas, paróquias e comunidades católicas.
                </p>
                <p>
                  Sua doação nos ajuda a:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span>Manter o site e servidores funcionando</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span>Desenvolver novas funcionalidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span>Criar mais repertórios litúrgicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span>Oferecer suporte às comunidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span>Expandir para mais paróquias</span>
                  </li>
                </ul>
                <p className="pt-4 border-t border-purple-500/30">
                  <span className="font-semibold text-white">Toda doação</span>, por menor que seja, 
                  faz diferença e nos ajuda a continuar servindo a Igreja! 🙏
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-purple-500/20">
              <CardContent className="py-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-white">
                    Pagamento 100% Seguro
                  </p>
                  <p className="text-xs text-purple-200">
                    Processado pelo Stripe, líder mundial em pagamentos online
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="px-3 py-1 bg-purple-500/30 rounded text-xs font-medium text-purple-200">
                      🔒 SSL
                    </div>
                    <div className="px-3 py-1 bg-purple-500/30 rounded text-xs font-medium text-purple-200">
                      💳 Cartão
                    </div>
                    <div className="px-3 py-1 bg-purple-500/30 rounded text-xs font-medium text-purple-200">
                      🏦 Seguro
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 object-contain" />
                <span className="font-bold text-white">LouvaMais</span>
              </div>
              <p className="text-purple-200 text-sm">
                Músicas litúrgicas para enriquecer suas celebrações
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
              <nav className="space-y-2">
                <Link href="/repertorio" className="text-purple-200 hover:text-white transition text-sm block">
                  Repertório
                </Link>
                <Link href="/blog" className="text-purple-200 hover:text-white transition text-sm block">
                  Blog
                </Link>
                <Link href="/sobre" className="text-purple-200 hover:text-white transition text-sm block">
                  Sobre
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Redes Sociais</h4>
              <SocialLinks layout="horizontal" size="small" />
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-purple-200 text-sm">
            <p>© 2025 LouvaMais. Todos os direitos reservados.</p>
            <p className="mt-2">Para a maior glória de Deus ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
