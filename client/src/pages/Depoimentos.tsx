import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { APP_LOGO } from "@/const";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

export default function Depoimentos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Depoimentos</h1>
          <p className="text-xl text-purple-200 mb-8">
            Veja o que ministérios de música de todo o Brasil dizem sobre o Repertório Católico
          </p>
        </div>

        {/* Seção de Incentivo */}
        <Card className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 border-pink-500/50 p-12 mb-12 text-center max-w-2xl mx-auto">
          <MessageCircle className="w-16 h-16 text-pink-400 mb-6 mx-auto" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Compartilhe seu Depoimento
          </h2>
          <p className="text-purple-100 mb-8">
            Sua comunidade e ministério de música são importantes para nós. Compartilhe sua experiência com o Repertório Católico e inspire outros ministérios!
          </p>
          <Link href="/contato">
            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold">
              Entre em Contato
            </Button>
          </Link>
        </Card>

        {/* Mensagem de Em Breve */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-12 mb-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Depoimentos em Breve
          </h2>
          <p className="text-purple-200 max-w-2xl mx-auto">
            Estamos coletando depoimentos de ministérios que usam o Repertório Católico. Em breve, você verá histórias inspiradoras de comunidades que transformaram suas celebrações com nossas músicas litúrgicas.
          </p>
        </Card>
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
