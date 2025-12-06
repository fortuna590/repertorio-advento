import { Link } from "wouter";
import { TestimonialGallery } from "@/components/TestimonialGallery";
import { TestimonialForm } from "@/components/TestimonialForm";
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
          <h1 className="text-5xl font-bold text-white mb-4">Depoimentos da Comunidade</h1>
          <p className="text-xl text-purple-200 mb-8">
            Veja o que ministérios de música de todo o Brasil dizem sobre o Repertório Católico
          </p>
        </div>

        {/* Galeria de Depoimentos */}
        <div className="mb-20">
          <TestimonialGallery />
        </div>

        {/* Formulário de Depoimento */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Compartilhe sua Experiência</h2>
          <TestimonialForm />
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-12 text-center mb-16">
          <h3 className="text-2xl font-bold text-white mb-4">Quer conhecer mais?</h3>
          <p className="text-purple-200 mb-6">
            Explore nosso repertório completo e descubra como o LouvaMais pode enriquecer suas celebrações
          </p>
          <a href="/repertorio" className="inline-block">
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all">
              Explorar Repertório
            </button>
          </a>
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
