import { Link } from "wouter";
// Removed - using ModernHeader instead
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, BookOpen, Heart, Sparkles, ArrowRight, Users, Calendar } from "lucide-react";
import { APP_LOGO } from "@/const";
import SocialLinks from "@/components/SocialLinks";
import ModernHeader from "@/components/ModernHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-8 animate-fadeInDown">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Repertório Católico
            <br />
            <span className="gradient-text">Para Sua Comunidade</span>
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Músicas litúrgicas cuidadosamente selecionadas e organizadas por momentos da Santa Missa. Comece com o Advento e explore nossa coleção completa.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-scaleIn">
          <a href="/repertorio">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
              <Music className="w-5 h-5 mr-2" />
              Explorar Repertório
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
          <a href="/blog">
            <Button variant="outline" className="border-purple-500 text-purple-200 hover:bg-purple-500/10 px-8 py-6 text-lg">
              <BookOpen className="w-5 h-5 mr-2" />
              Ler Artigos
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <Music className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">29+</p>
              <p className="text-purple-200">Músicas Litúrgicas</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">Artigos</p>
              <p className="text-purple-200">Conteúdo Educativo</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">Comunidade</p>
              <p className="text-purple-200">Paróquias Conectadas</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Destaque do Advento e Liturgia */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Card Advento */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-12 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Tempo do Advento</h2>
            <p className="text-purple-200 mb-6">
              Explore nossa colecao completa de 29 musicas liturgicas organizadas por momentos da Santa Missa.
            </p>
            <a href="/repertorio">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Ver Repertorio Completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>

          {/* Card Liturgia Diaria */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-12 text-center">
            <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Liturgia Diaria</h2>
            <p className="text-blue-200 mb-6">
              Acompanhe as leituras, evangelhos e salmos de cada dia da CNBB com navegacao simples.
            </p>
            <a href="/liturgia">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                Acessar Liturgia
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Últimos Artigos</h2>
          <p className="text-purple-200">Conteúdo educativo sobre música litúrgica e espiritualidade</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Artigo 1 - Advento */}
          <Card className="bg-slate-800/50 border-purple-500/20 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <CardContent className="p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-600/30 text-purple-200 text-sm rounded-full">Liturgia</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">A Importância da Música no Advento</h3>
              <p className="text-purple-200 mb-4">Descubra o significado profundo das 4 velas do Advento e como a música litúrgica enriquece esse tempo de preparação espiritual...</p>
              <Link href="/blog/advento-tempo-espera-preparacao-natal" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition">
                Ler Artigo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </CardContent>
          </Card>

          {/* Artigo 2 - Placeholder */}
          <Card className="bg-slate-800/50 border-purple-500/20 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <CardContent className="p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-pink-600/30 text-pink-200 text-sm rounded-full">Em Breve</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Próximo Artigo</h3>
              <p className="text-purple-200 mb-4">Estamos preparando mais conteúdo educativo sobre música litúrgica, técnicas de direção de coro e dicas práticas para ministérios...</p>
              <span className="inline-flex items-center text-purple-400">
                Em Breve
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <a href="/blog">
            <Button variant="outline" className="border-purple-500 text-purple-200 hover:bg-purple-500/10">
              Ver Todos os Artigos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para Começar?</h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Explore nosso repertório do Advento e enriqueça suas celebrações com músicas litúrgicas de qualidade.
          </p>
          <a href="/repertorio">
            <Button className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3">
              Acessar Repertório
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 rounded-lg" />
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
                <Link href="/depoimentos" className="text-purple-200 hover:text-white transition text-sm block">
                  Depoimentos
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
