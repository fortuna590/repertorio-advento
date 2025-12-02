import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Music, Bell, CheckCircle2 } from "lucide-react";
import { APP_LOGO } from "@/const";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Alert Box */}
        <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 mb-8">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <AlertCircle className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-yellow-200 mb-2">
                  🚀 Funcionalidade em Desenvolvimento
                </CardTitle>
                <CardDescription className="text-yellow-100/80">
                  O sistema de montagem de repertório personalizado será disponibilizado em breve! 
                  Esta ferramenta permitirá que você selecione suas músicas favoritas, organize-as 
                  por momento da missa, visualize uma prévia, imprima e envie por email.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Features Coming Soon */}
        <Card className="mb-8 bg-slate-800 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Music className="w-5 h-5 text-purple-400" />
              O que você poderá fazer:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-white">Selecionar Músicas</p>
                  <p className="text-sm text-purple-200">Escolha as músicas do nosso repertório que deseja incluir</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-white">Organizar por Momentos</p>
                  <p className="text-sm text-purple-200">Organize as músicas por momento da missa (Entrada, Comunhão, etc)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-white">Visualizar Prévia</p>
                  <p className="text-sm text-purple-200">Veja como ficará seu repertório antes de finalizar</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-white">Imprimir</p>
                  <p className="text-sm text-purple-200">Imprima seu repertório personalizado com design profissional</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-white">Enviar por Email</p>
                  <p className="text-sm text-purple-200">Compartilhe seu repertório com a equipe por email</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-white">Salvar Repertórios</p>
                  <p className="text-sm text-purple-200">Guarde seus repertórios favoritos para reutilizar depois</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Notification Form */}
        <Card className="bg-slate-800 border-purple-500/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5 text-purple-400" />
              Receba uma Notificação
            </CardTitle>
            <CardDescription className="text-purple-200">
              Deixe seu email e será avisado assim que a funcionalidade estiver disponível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegistrarInteresse} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Seu Nome (opcional)
                </label>
                <Input
                  placeholder="João Silva"
                  value={nomeNotificacao}
                  onChange={(e) => setNomeNotificacao(e.target.value)}
                  className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Seu Email *
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={emailNotificacao}
                  onChange={(e) => setEmailNotificacao(e.target.value)}
                  required
                  className="bg-slate-700 border-purple-500/30 text-white placeholder:text-purple-400"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                disabled={newsletterMutation.isPending}
              >
                {newsletterMutation.isPending ? "Registrando..." : "Notifique-me"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="p-6 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-12">
          <p className="text-sm text-purple-200 text-center">
            ℹ️ Enquanto isso, você pode explorar nosso <Link href="/repertorio"><span className="text-pink-400 hover:underline">repertório de Advento</span></Link> com 29 músicas organizadas, 
            ou ler nossos <Link href="/blog"><span className="text-pink-400 hover:underline">artigos sobre música litúrgica</span></Link>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 object-contain" />
                <span className="font-bold text-white">Repertório Católico</span>
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
            <p>© 2025 LouvaMais - Repertório Católico. Todos os direitos reservados.</p>
            <p className="mt-2">Para a maior glória de Deus ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
