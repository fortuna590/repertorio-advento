import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, BookOpen, Heart, Sparkles, ArrowRight, Users, Star, Mic2, ListMusic } from "lucide-react";
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
            LouvaMais
            <br />
            <span className="gradient-text">Louve com Excelência</span>
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Sua plataforma completa para ministérios de música. Repertórios prontos, cifras organizadas e ferramentas para elevar o louvor da sua comunidade.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-scaleIn">
          <a href="/repertorios">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
              <Music className="w-5 h-5 mr-2" />
              Explorar Repertório
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
          <a href="/montar-repertorio">
            <Button variant="outline" className="border-purple-500 text-purple-200 hover:bg-purple-500/10 px-8 py-6 text-lg">
              <ListMusic className="w-5 h-5 mr-2" />
              Montar Meu Repertório
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
              <ListMusic className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">11</p>
              <p className="text-purple-200">Momentos da Missa</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">Comunidade</p>
              <p className="text-purple-200">Ministérios Conectados</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Tudo que Você Precisa</h2>
          <p className="text-purple-200">Ferramentas completas para seu ministério de música</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold text-white mb-2">Repertório Completo</h3>
              <p className="text-purple-200 text-sm">Músicas organizadas por momentos da Santa Missa</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-pink-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-bold text-white mb-2">Favoritos</h3>
              <p className="text-purple-200 text-sm">Salve suas músicas preferidas para acesso rápido</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ListMusic className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-bold text-white mb-2">Monte Repertórios</h3>
              <p className="text-purple-200 text-sm">Crie e compartilhe repertórios personalizados</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-yellow-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-bold text-white mb-2">Cifras e Vídeos</h3>
              <p className="text-purple-200 text-sm">Links diretos para CifraClub e YouTube</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Destaque do Advento */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-12 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Repertório do Advento</h2>
            <p className="text-purple-200 mb-6">
              29 músicas litúrgicas cuidadosamente selecionadas para o tempo do Advento. Organize sua celebração com facilidade e excelência.
            </p>
            <a href="/repertorios">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Ver Repertório Completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Aprenda Mais</h2>
          <p className="text-purple-200">Conteúdo educativo para ministérios de música</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
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

          <Card className="bg-slate-800/50 border-purple-500/20 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <CardContent className="p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-pink-600/30 text-pink-200 text-sm rounded-full">Dicas</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dicas para Ministérios de Música</h3>
              <p className="text-purple-200 mb-4">Técnicas de direção de coro, escolha de repertório e dicas práticas para elevar o louvor da sua comunidade...</p>
              <Link href="/blog" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition">
                Ver Blog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
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
          <Mic2 className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Eleve o Louvor da Sua Comunidade</h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e tenha acesso a todas as funcionalidades: favoritos, repertórios personalizados e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/cadastro">
              <Button className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3">
                Criar Conta Grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <a href="/repertorios">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
                Explorar Repertório
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={APP_LOGO} alt="LouvaMais" className="w-10 h-10 rounded-lg" />
                <span className="font-bold text-white text-xl">LouvaMais</span>
              </div>
              <p className="text-purple-200 text-sm">
                Sua plataforma completa para ministérios de música. Louve com excelência!
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
              <nav className="space-y-2">
                <Link href="/repertorio" className="text-purple-200 hover:text-white transition text-sm block">
                  Repertório
                </Link>
                <Link href="/montar-repertorio" className="text-purple-200 hover:text-white transition text-sm block">
                  Montar Repertório
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
            <p>© 2025 LouvaMais. Todos os direitos reservados.</p>
            <p className="mt-2">Para a maior glória de Deus ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
