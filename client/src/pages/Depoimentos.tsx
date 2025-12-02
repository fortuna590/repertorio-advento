import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Sparkles } from "lucide-react";
import { APP_LOGO } from "@/const";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

export default function Depoimentos() {
  const [depoimentos] = useState([]);

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

        {/* Estado Vazio - Incentivo */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Seção de Incentivo */}
          <Card className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500/50 p-8 flex flex-col justify-center">
            <div className="mb-6">
              <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-center">
              Seja o Primeiro!
            </h2>
            <p className="text-purple-100 mb-6 text-center leading-relaxed">
              Sua comunidade e ministério de música são importantes para nós. Compartilhe sua experiência com o Repertório Católico e inspire outros ministérios!
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                <p className="text-purple-100">Conte como o repertório ajudou seu ministério</p>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                <p className="text-purple-100">Compartilhe dicas e experiências com outras paróquias</p>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
                <p className="text-purple-100">Ajude a crescer nossa comunidade de música litúrgica</p>
              </div>
            </div>
          </Card>

          {/* Seção de CTA */}
          <Card className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 border-pink-500/50 p-8 flex flex-col justify-center items-center text-center">
            <MessageCircle className="w-16 h-16 text-pink-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Compartilhe seu Depoimento
            </h3>
            <p className="text-purple-100 mb-8">
              Envie-nos um depoimento sobre sua experiência com o Repertório Católico. Queremos ouvir sua história!
            </p>
            <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold">
              Enviar Depoimento
            </Button>
            <p className="text-xs text-purple-300 mt-6">
              📧 Envie para: louvamais590@gmail.com
            </p>
          </Card>
        </div>

        {/* Seção de Benefícios */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-12 mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Por que compartilhar seu depoimento?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Inspire Outros</h3>
              <p className="text-purple-200">Sua história pode motivar outros ministérios a melhorar suas celebrações</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fortaleça a Comunidade</h3>
              <p className="text-purple-200">Conecte-se com outras paróquias e ministérios que compartilham sua paixão</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Melhore o Projeto</h3>
              <p className="text-purple-200">Seus comentários nos ajudam a aprimorar o Repertório Católico</p>
            </div>
          </div>
        </Card>

        {/* Estatísticas Vazias */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-slate-800 border-purple-500/20 text-center">
            <p className="text-4xl font-bold text-purple-400 mb-2">0</p>
            <p className="text-purple-200">Depoimentos Recebidos</p>
            <p className="text-xs text-purple-400 mt-2">Seja o primeiro!</p>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500/20 text-center">
            <p className="text-4xl font-bold text-yellow-400 mb-2">⭐⭐⭐⭐⭐</p>
            <p className="text-purple-200">Esperando sua Avaliação</p>
            <p className="text-xs text-purple-400 mt-2">Compartilhe sua experiência</p>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500/20 text-center">
            <p className="text-4xl font-bold text-green-400 mb-2">∞</p>
            <p className="text-purple-200">Impacto Potencial</p>
            <p className="text-xs text-purple-400 mt-2">Sua história importa</p>
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
