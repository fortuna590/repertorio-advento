import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { MessageCircle, Sparkles } from "lucide-react";
import { APP_LOGO } from "@/const";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";
import TestimonialGallery from "@/components/TestimonialGallery";
import TestimonialForm from "@/components/TestimonialForm";

export default function Depoimentos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Depoimentos</h1>
          <p className="text-xl text-purple-200 mb-8">
            Veja o que ministérios de música de todo o Brasil dizem sobre o LouvaMais
          </p>
        </div>

        {/* Galeria de Depoimentos */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Depoimentos da Comunidade</h2>
          </div>
          <TestimonialGallery />
        </div>

        {/* Formulário de Envio */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <MessageCircle className="w-8 h-8 text-pink-400" />
            <h2 className="text-3xl font-bold text-white">Compartilhe sua Experiência</h2>
          </div>
          <TestimonialForm />
        </div>

        {/* Seção de Benefícios */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 p-8 text-center">
            <div className="text-4xl mb-4">💫</div>
            <h3 className="text-xl font-bold text-white mb-2">Inspire Outros</h3>
            <p className="text-purple-200">
              Sua história pode motivar outros ministérios a melhorarem suas celebrações
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border-pink-500/30 p-8 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-white mb-2">Fortaleça a Comunidade</h3>
            <p className="text-purple-200">
              Ajude a construir uma comunidade forte de ministérios de música católica
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 p-8 text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-white mb-2">Melhore o Projeto</h3>
            <p className="text-purple-200">
              Seu feedback nos ajuda a criar recursos ainda melhores para todos
            </p>
          </Card>
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
