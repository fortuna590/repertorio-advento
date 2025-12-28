import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, BookOpen, Heart, Sparkles, ArrowRight, Users, Star, Mic2, ListMusic, Eye, TrendingUp } from "lucide-react";
import { APP_LOGO } from "@/const";
import SocialLinks from "@/components/SocialLinks";
import ModernHeader from "@/components/ModernHeader";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      {/* Hero Section - Compacto */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-8 animate-fadeInDown text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            LouvaMais
            <br />
            <span className="gradient-text">Louve com Excelência</span>
          </h1>
          <p className="text-lg text-purple-200 mb-6 max-w-2xl mx-auto">
            Sua plataforma completa para ministérios de música. Repertórios prontos, cifras organizadas e ferramentas para elevar o louvor da sua comunidade.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 animate-scaleIn">
          <a href="/repertorios">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-5">
              <Music className="w-5 h-5 mr-2" />
              Explorar Repertório
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
          <a href="/montar-repertorio">
            <Button variant="outline" className="border-purple-500 text-purple-200 hover:bg-purple-500/10 px-6 py-5">
              <ListMusic className="w-5 h-5 mr-2" />
              Montar Meu Repertório
            </Button>
          </a>
        </div>

        {/* Stats - Compacto */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-4 pb-4 text-center">
              <Music className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">75+</p>
              <p className="text-xs text-purple-200">Músicas</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-4 pb-4 text-center">
              <ListMusic className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white leading-tight">Separadas por Momentos</p>
              <p className="text-xs text-purple-200 mt-1">Organizado</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-4 pb-4 text-center">
              <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="text-xs text-purple-200">Comunidade</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards Blog e Loja */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mt-6">
          <a href="/blog">
            <Card className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 cursor-pointer">
              <CardContent className="pt-5 pb-5 text-center">
                <BookOpen className="w-7 h-7 text-purple-300 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">Blog</p>
                <p className="text-xs text-purple-200 mt-1">Artigos e dicas</p>
              </CardContent>
            </Card>
          </a>

          <a href="/loja">
            <Card className="bg-gradient-to-br from-pink-800/40 to-pink-900/40 border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 cursor-pointer">
              <CardContent className="pt-5 pb-5 text-center">
                <Heart className="w-7 h-7 text-pink-300 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">Loja</p>
                <p className="text-xs text-purple-200 mt-1">Apoie o projeto</p>
              </CardContent>
            </Card>
          </a>
        </div>
      </section>

      {/* Funcionalidades - Grid 2x2 Compacto */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Tudo que Você Precisa</h2>
          <p className="text-purple-200 text-sm">Ferramentas completas para seu ministério</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Repertório Completo</h3>
                  <p className="text-purple-200 text-sm">75+ músicas organizadas por momentos da Santa Missa</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <ListMusic className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Monte Repertórios</h3>
                  <p className="text-purple-200 text-sm">Crie, salve e compartilhe repertórios personalizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Cifras e Vídeos</h3>
                  <p className="text-purple-200 text-sm">Links diretos para CifraClub e YouTube</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Favoritos</h3>
                  <p className="text-purple-200 text-sm">Salve suas músicas preferidas para acesso rápido</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Destaque do Advento - Compacto */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-8 text-center">
          <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">Repertório do Advento</h2>
          <p className="text-purple-200 text-sm mb-5 max-w-xl mx-auto">
            75+ músicas litúrgicas para Advento, Missa do Galo e Tempo do Natal. Organize sua celebração com facilidade e excelência.
          </p>
          <a href="/repertorios">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Ver Repertório Completo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* CTA Final - Compacto */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center">
          <Mic2 className="w-10 h-10 text-white mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">Eleve o Louvor da Sua Comunidade</h2>
          <p className="text-purple-100 text-sm mb-6 max-w-xl mx-auto">
            Cadastre-se gratuitamente e tenha acesso a todas as funcionalidades: favoritos, repertórios personalizados e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/cadastro">
              <Button className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-2">
                Criar Conta Grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <a href="/repertorios">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-2">
                Explorar Repertório
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Compacto */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src={APP_LOGO} alt="LouvaMais" className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-white text-lg">LouvaMais</span>
              </div>
              <p className="text-purple-200 text-xs">
                Sua plataforma completa para ministérios de música. Louve com excelência!
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Links Rápidos</h4>
              <nav className="space-y-1">
                <Link href="/repertorio" className="text-purple-200 hover:text-white transition text-xs block">
                  Repertório
                </Link>
                <Link href="/montar-repertorio" className="text-purple-200 hover:text-white transition text-xs block">
                  Montar Repertório
                </Link>
                <Link href="/blog" className="text-purple-200 hover:text-white transition text-xs block">
                  Blog
                </Link>
                <Link href="/depoimentos" className="text-purple-200 hover:text-white transition text-xs block">
                  Depoimentos
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Redes Sociais</h4>
              <SocialLinks layout="horizontal" size="small" />
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-6 text-center text-purple-200 text-xs">
            <p>© 2024 LouvaMais. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
