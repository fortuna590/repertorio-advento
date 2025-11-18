import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart, Sparkles, Check } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Repertório
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-primary/20 shadow-lg">
              <img 
                src={APP_LOGO} 
                alt="LouvaMais Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Apoie o Projeto
              </h1>
              <p className="text-muted-foreground mt-1">
                Sua doação ajuda a manter o LouvaMais funcionando
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Formulário de Doação */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Fazer uma Doação
                </CardTitle>
                <CardDescription>
                  Escolha um valor ou insira o quanto deseja doar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Valores Sugeridos */}
                <div className="space-y-2">
                  <Label>Valores Sugeridos</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUGGESTED_AMOUNTS.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                        className="relative"
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
                  <Label htmlFor="customAmount">Ou insira outro valor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor mínimo: R$ 5,00 | Valor máximo: R$ 10.000,00
                  </p>
                </div>

                {/* Informações do Doador */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="donorName">Seu Nome (opcional)</Label>
                    <Input
                      id="donorName"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Como gostaria de ser chamado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donorEmail">Seu Email (opcional)</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem (opcional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Deixe uma mensagem de apoio..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Botão de Doação */}
                <Button
                  size="lg"
                  className="w-full gap-2"
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

                <p className="text-xs text-center text-muted-foreground">
                  Pagamento seguro processado pelo Stripe
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Informações sobre o Projeto */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Por que Doar?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  O <span className="font-semibold text-foreground">LouvaMais</span> é um projeto gratuito 
                  que oferece soluções tecnológicas para igrejas, paróquias e comunidades católicas.
                </p>
                <p>
                  Sua doação nos ajuda a:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Manter o site e servidores funcionando</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Desenvolver novas funcionalidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Criar mais repertórios litúrgicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Oferecer suporte às comunidades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Expandir para mais paróquias</span>
                  </li>
                </ul>
                <p className="pt-4 border-t">
                  <span className="font-semibold text-foreground">Toda doação</span>, por menor que seja, 
                  faz diferença e nos ajuda a continuar servindo a Igreja! 🙏
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Pagamento 100% Seguro
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Processado pelo Stripe, líder mundial em pagamentos online
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="px-3 py-1 bg-muted rounded text-xs font-medium">
                      🔒 SSL
                    </div>
                    <div className="px-3 py-1 bg-muted rounded text-xs font-medium">
                      💳 Cartão
                    </div>
                    <div className="px-3 py-1 bg-muted rounded text-xs font-medium">
                      🏦 Seguro
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
        <div className="container py-10 md:py-12">
          <div className="text-center space-y-4">
            <div className="pt-4 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                Uma produção de{" "}
                <span className="font-semibold text-primary">LouvaMais - Church Solutions</span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                © 2025 LouvaMais. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
