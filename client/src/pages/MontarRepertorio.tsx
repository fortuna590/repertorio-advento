import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Music, ArrowLeft, Bell, CheckCircle2 } from "lucide-react";
import { APP_LOGO } from "@/const";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MontarRepertorio() {
  const [emailNotificacao, setEmailNotificacao] = useState("");
  const [nomeNotificacao, setNomeNotificacao] = useState("");
  const newsletterMutation = trpc.newsletter.subscribe.useMutation();

  const handleRegistrarInteresse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailNotificacao.trim()) {
      toast.error("Por favor, digite seu email");
      return;
    }

    try {
      await newsletterMutation.mutateAsync({
        email: emailNotificacao,
        nome: nomeNotificacao || undefined,
      });

      toast.success("Obrigado! Você será avisado quando a funcionalidade estiver disponível! 🎉");
      setEmailNotificacao("");
      setNomeNotificacao("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar interesse");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-br from-card via-card/95 to-accent/20 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10" />
                <div className="text-left">
                  <div className="font-bold text-lg text-foreground">Repertório Católico</div>
                  <div className="text-xs text-muted-foreground">LouvaMais Solutions</div>
                </div>
              </button>
            </Link>
            <Link href="/">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Alert Box */}
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-50/10 to-orange-50/10 mb-8">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-amber-500/20">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-amber-900 mb-2">
                    🚀 Funcionalidade em Desenvolvimento
                  </CardTitle>
                  <CardDescription className="text-amber-800/80">
                    O sistema de montagem de repertório personalizado será disponibilizado em breve! 
                    Esta ferramenta permitirá que você selecione suas músicas favoritas, organize-as 
                    por momento da missa, visualize uma prévia, imprima e envie por email.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Features Coming Soon */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                O que você poderá fazer:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Selecionar Músicas</p>
                    <p className="text-sm text-muted-foreground">Escolha as músicas do nosso repertório que deseja incluir</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Organizar por Momentos</p>
                    <p className="text-sm text-muted-foreground">Organize as músicas por momento da missa (Entrada, Comunhão, etc)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Visualizar Prévia</p>
                    <p className="text-sm text-muted-foreground">Veja como ficará seu repertório antes de finalizar</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Imprimir</p>
                    <p className="text-sm text-muted-foreground">Imprima seu repertório personalizado com design profissional</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Enviar por Email</p>
                    <p className="text-sm text-muted-foreground">Compartilhe seu repertório com a equipe por email</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Salvar Repertórios</p>
                    <p className="text-sm text-muted-foreground">Guarde seus repertórios favoritos para reutilizar depois</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Notification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Receba uma Notificação
              </CardTitle>
              <CardDescription>
                Deixe seu email e será avisado assim que a funcionalidade estiver disponível
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegistrarInteresse} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Seu Nome (opcional)
                  </label>
                  <Input
                    placeholder="João Silva"
                    value={nomeNotificacao}
                    onChange={(e) => setNomeNotificacao(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Seu Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={emailNotificacao}
                    onChange={(e) => setEmailNotificacao(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={newsletterMutation.isPending}
                >
                  {newsletterMutation.isPending ? "Registrando..." : "Notifique-me"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Box */}
          <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground text-center">
              ℹ️ Enquanto isso, você pode explorar nosso <Link href="/"><span className="text-primary hover:underline">repertório de Advento</span></Link> com 29 músicas organizadas, 
              criar <Link href="/"><span className="text-primary hover:underline">seus próprios repertórios personalizados</span></Link> através do sistema de montagem, 
              ou ler nossos <Link href="/blog"><span className="text-primary hover:underline">artigos sobre música litúrgica</span></Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
