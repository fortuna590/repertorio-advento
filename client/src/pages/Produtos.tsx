import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

export default function Produtos() {
  const [emailInteresse, setEmailInteresse] = useState("");
  const [nomeInteresse, setNomeInteresse] = useState("");
  
  const newsletterMutation = trpc.newsletter.subscribe.useMutation();

  const handleNotificar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInteresse || !nomeInteresse) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    newsletterMutation.mutate(
      { email: emailInteresse },
      {
        onSuccess: () => {
          toast.success("Você será notificado quando novos produtos forem lançados!");
          setEmailInteresse("");
          setNomeInteresse("");
        },
        onError: () => {
          toast.error("Erro ao se inscrever. Tente novamente.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Loja</h1>
          <p className="text-xl text-purple-200 mb-8">
            Recursos e produtos para enriquecer seu ministério de música
          </p>
        </div>

        {/* Seção de Em Breve */}
        <Card className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 border-pink-500/50 p-12 mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Produtos em Breve
          </h2>
          <p className="text-purple-100 mb-8">
            Estamos preparando produtos exclusivos para ajudar seu ministério de música a crescer. Em breve, você terá acesso a e-books, cursos, guias práticos e muito mais!
          </p>
          <Link href="/contato">
            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold">
              Saiba Mais
            </Button>
          </Link>
        </Card>

        {/* Formulário de Notificação */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-12 mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Bell className="w-8 h-8 text-pink-400 mr-3" />
              <h3 className="text-2xl font-bold text-white">
                Seja Notificado
              </h3>
            </div>
            <p className="text-purple-200 text-center mb-8">
              Deixe seu email e nome para receber notificações quando novos produtos forem lançados
            </p>
            <form onSubmit={handleNotificar} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nomeInteresse}
                  onChange={(e) => setNomeInteresse(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-purple-500/30 text-white placeholder:text-purple-400 focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={emailInteresse}
                  onChange={(e) => setEmailInteresse(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-purple-500/30 text-white placeholder:text-purple-400 focus:border-pink-500 focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                disabled={newsletterMutation.isPending}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
              >
                {newsletterMutation.isPending ? "Inscrevendo..." : "Receber Notificações"}
              </Button>
            </form>
          </div>
        </Card>

        {/* Seção de Benefícios */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            O que você receberá
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-purple-500/20 p-6">
              <div className="text-4xl mb-4">📚</div>
              <h4 className="text-lg font-semibold text-white mb-2">E-books Exclusivos</h4>
              <p className="text-purple-200">Guias completos sobre repertório litúrgico, organização de ministérios e muito mais</p>
            </Card>
            <Card className="bg-slate-800 border-purple-500/20 p-6">
              <div className="text-4xl mb-4">🎓</div>
              <h4 className="text-lg font-semibold text-white mb-2">Cursos Online</h4>
              <p className="text-purple-200">Aprenda com especialistas em música litúrgica e ministério de música</p>
            </Card>
            <Card className="bg-slate-800 border-purple-500/20 p-6">
              <div className="text-4xl mb-4">🎵</div>
              <h4 className="text-lg font-semibold text-white mb-2">Recursos Práticos</h4>
              <p className="text-purple-200">Materiais prontos para usar em suas celebrações e reuniões</p>
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
