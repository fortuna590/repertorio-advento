import { Music, ListMusic, Users, Heart, BookOpen, Star, Check, TrendingUp, Eye, Calendar, Sparkles } from "lucide-react";
import ModernHeader from "@/components/ModernHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SocialLinks from "@/components/SocialLinks";
import { APP_LOGO } from "@/const";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <ModernHeader />

      {/* 1. HERO (TOPO DA PÁGINA) */}
      <section className="w-full px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Repertórios litúrgicos organizados por tempo da Igreja
          </h1>
          
          <p className="text-lg md:text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
            Encontre músicas para cada momento da Missa e para cada tempo litúrgico. Monte repertórios, acesse cifras, escute no YouTube e organize seu ministério com mais clareza e espiritualidade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href="/repertorio">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Ver repertórios por tempo litúrgico
              </Button>
            </a>
            <a href="/montar-repertorio">
              <Button size="lg" variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-500/10 px-8 py-6 text-lg">
                <ListMusic className="w-5 h-5 mr-2" />
                Montar meu repertório
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 2. PROPOSTA DE VALOR */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Criado para quem serve na música da liturgia
        </h2>
        <p className="text-lg text-purple-200 leading-relaxed">
          O LouvaMais é uma plataforma pensada para corais, ministérios de música e agentes de liturgia que precisam escolher as músicas certas, no tempo certo, com organização e fidelidade litúrgica. Aqui você encontra repertórios organizados, prontos para uso e acessíveis em um só lugar.
        </p>
      </section>

      {/* 3. TEMPOS LITÚRGICOS (SEÇÃO PRINCIPAL) */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Repertórios por Tempo Litúrgico
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Advento */}
          <a href="/repertorio/advento" className="group">
            <Card className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 border-purple-500/30 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-4xl">🕯️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Advento</h3>
                <p className="text-purple-200 text-sm">Preparação, espera e esperança</p>
              </CardContent>
            </Card>
          </a>

          {/* Natal */}
          <a href="/repertorio/natal" className="group">
            <Card className="bg-gradient-to-br from-green-800/50 to-green-900/50 border-green-500/30 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-4xl">⭐</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Natal</h3>
                <p className="text-green-200 text-sm">Encarnação e alegria</p>
              </CardContent>
            </Card>
          </a>

          {/* Quaresma */}
          <a href="/repertorio/quaresma" className="group">
            <Card className="bg-gradient-to-br from-violet-800/50 to-violet-900/50 border-violet-500/30 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/20 transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-4xl">✝️</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Quaresma</h3>
                <p className="text-violet-200 text-sm">Conversão e silêncio</p>
              </CardContent>
            </Card>
          </a>

          {/* Páscoa */}
          <a href="/repertorio/pascoa" className="group">
            <Card className="bg-gradient-to-br from-yellow-800/50 to-yellow-900/50 border-yellow-500/30 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-4xl">🌅</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Páscoa</h3>
                <p className="text-yellow-200 text-sm">Ressurreição e vida nova</p>
              </CardContent>
            </Card>
          </a>

          {/* Tempo Comum */}
          <a href="/repertorio/tempo-comum" className="group">
            <Card className="bg-gradient-to-br from-teal-800/50 to-teal-900/50 border-teal-500/30 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-4xl">🌱</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Tempo Comum</h3>
                <p className="text-teal-200 text-sm">Caminhada da fé</p>
              </CardContent>
            </Card>
          </a>

          {/* Celebrações Especiais */}
          <a href="/repertorio/celebracoes-especiais" className="group">
            <Card className="bg-gradient-to-br from-rose-800/50 to-rose-900/50 border-rose-500/30 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/20 transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-4xl">🎊</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Celebrações Especiais</h3>
                <p className="text-rose-200 text-sm">Ramos, Tríduo Pascal, Pentecostes e mais</p>
              </CardContent>
            </Card>
          </a>
        </div>
      </section>

      {/* 4. COMO FUNCIONA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Como funciona na prática
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { number: 1, text: "Escolha o tempo litúrgico", icon: Calendar },
            { number: 2, text: "Veja músicas organizadas por momentos da Missa", icon: ListMusic },
            { number: 3, text: "Acesse cifras ou escute no YouTube", icon: Music },
            { number: 4, text: "Monte e salve seu repertório", icon: Check }
          ].map((step) => (
            <Card key={step.number} className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{step.number}</span>
                </div>
                <step.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <p className="text-purple-200 text-sm leading-relaxed">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. FERRAMENTAS DO LOUVAMAIS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Tudo o que você precisa em um único lugar
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: ListMusic, title: "Repertórios prontos e organizados", desc: "Músicas já separadas por tempo litúrgico" },
            { icon: Music, title: "Links diretos para cifras", desc: "Acesse cifras no Cifra Club instantaneamente" },
            { icon: BookOpen, title: "Links para ouvir no YouTube", desc: "Escute as músicas antes de escolher" },
            { icon: Star, title: "Favoritos para acesso rápido", desc: "Salve suas músicas preferidas" },
            { icon: Heart, title: "Repertórios personalizados", desc: "Monte e salve seus próprios repertórios" },
            { icon: TrendingUp, title: "Estatísticas de músicas", desc: "Veja as mais acessadas pela comunidade" }
          ].map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-400 transition-all">
              <CardContent className="p-6">
                <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-purple-200 text-sm">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. COMUNIDADE E ESTATÍSTICAS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 border border-purple-500/30 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Descubra o que a comunidade está cantando
            </h2>
            <p className="text-lg text-purple-200">
              Descubra o que outros ministérios estão cantando e planeje melhor suas celebrações.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">75+</div>
              <div className="text-purple-200">Músicas disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                <Eye className="w-12 h-12 mx-auto" />
              </div>
              <div className="text-purple-200">Repertórios mais acessados</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                <TrendingUp className="w-12 h-12 mx-auto" />
              </div>
              <div className="text-purple-200">Músicas mais utilizadas</div>
            </div>
          </div>

          <div className="text-center">
            <a href="/estatisticas">
              <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-500/10">
                Ver estatísticas completas
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 7. BLOG */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Formação, espiritualidade e música litúrgica
          </h2>
          <p className="text-lg text-purple-200 max-w-3xl mx-auto">
            Artigos sobre tempos litúrgicos, escolha de repertório, espiritualidade do ministério de música e formação pastoral.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: "Como escolher músicas para o Advento", desc: "Dicas práticas para montar repertórios que expressem espera e esperança" },
            { title: "A espiritualidade do ministério de música", desc: "Reflexões sobre o papel do músico na liturgia" },
            { title: "Guia completo dos tempos litúrgicos", desc: "Entenda cada tempo e suas características musicais" }
          ].map((article, index) => (
            <Card key={index} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-400 transition-all">
              <CardContent className="p-6">
                <BookOpen className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{article.title}</h3>
                <p className="text-purple-200 text-sm mb-4">{article.desc}</p>
                <a href="/blog" className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                  Ler artigo →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <a href="/blog">
            <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-500/10">
              Ler artigos do blog
            </Button>
          </a>
        </div>
      </section>

      {/* 8. LOJA / APOIO AO PROJETO */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-pink-800/40 to-pink-900/40 border-pink-500/30 hover:border-pink-500/60 transition-all">
          <CardContent className="p-8 md:p-12 text-center">
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Apoie o LouvaMais
            </h2>
            <p className="text-lg text-purple-200 mb-6 max-w-2xl mx-auto">
              Materiais e recursos que ajudam a manter o projeto vivo e sempre a serviço da Igreja e dos ministérios de música.
            </p>
            <a href="/loja">
              <Button size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-6">
                Acessar loja
              </Button>
            </a>
          </CardContent>
        </Card>
      </section>

      {/* 9. CTA FINAL */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center">
          <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Eleve o louvor da sua comunidade
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Cadastre-se gratuitamente e tenha acesso a favoritos, repertórios personalizados, estatísticas e conteúdos exclusivos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/signup">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6">
                Criar conta grátis
              </Button>
            </a>
            <a href="/repertorio">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6">
                Explorar repertórios
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 10. RODAPÉ */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo e descrição */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={APP_LOGO} alt="LouvaMais" className="w-8 h-8" />
                <span className="text-xl font-bold text-white">LouvaMais</span>
              </div>
              <p className="text-purple-200 text-sm">
                Sua plataforma completa para ministérios de música.
              </p>
            </div>

            {/* Links rápidos */}
            <div>
              <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
              <div className="space-y-2">
                <a href="/repertorio" className="block text-purple-200 hover:text-purple-100 text-sm">Repertórios</a>
                <a href="/montar-repertorio" className="block text-purple-200 hover:text-purple-100 text-sm">Montar repertório</a>
                <a href="/blog" className="block text-purple-200 hover:text-purple-100 text-sm">Blog</a>
                <a href="/loja" className="block text-purple-200 hover:text-purple-100 text-sm">Loja</a>
                <a href="/sobre" className="block text-purple-200 hover:text-purple-100 text-sm">Contato</a>
              </div>
            </div>

            {/* Redes sociais */}
            <div>
              <h3 className="text-white font-semibold mb-4">Redes Sociais</h3>
              <SocialLinks />
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center">
            <p className="text-purple-300 text-sm">
              © 2025 LouvaMais. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
