import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target, Users, Zap } from "lucide-react";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

export default function Sobre() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Seção Principal */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Sobre o LouvaMais</h1>
          <p className="text-xl text-purple-200 mb-8 leading-relaxed">
            O Repertório Católico é uma plataforma dedicada a facilitar a vida dos ministérios de música litúrgica. 
            Nosso objetivo é fornecer uma seleção cuidadosa de músicas organizadas por momentos da Santa Missa, 
            ajudando paróquias, comunidades e grupos de oração a celebrar com qualidade e devoção.
          </p>
        </div>

        {/* Missão, Visão, Valores */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-8 bg-slate-800 border-purple-500/20">
            <Target className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Nossa Missão</h3>
            <p className="text-purple-200">
              Facilitar e enriquecer a experiência musical nas celebrações litúrgicas católicas, 
              conectando ministérios de música com repertório de qualidade.
            </p>
          </Card>

          <Card className="p-8 bg-slate-800 border-purple-500/20">
            <Zap className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Nossa Visão</h3>
            <p className="text-purple-200">
              Ser a plataforma de referência para música litúrgica na Igreja Católica, 
              promovendo excelência e devoção em cada celebração.
            </p>
          </Card>

          <Card className="p-8 bg-slate-800 border-purple-500/20">
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Nossos Valores</h3>
            <p className="text-purple-200">
              Qualidade, devoção, comunidade e acessibilidade. Acreditamos que toda celebração 
              merece música de excelência.
            </p>
          </Card>
        </div>

        {/* Seção Apoie o Projeto */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-12 mb-16">
          <div className="flex items-center gap-4 mb-6">
            <Heart className="w-12 h-12 text-pink-400" />
            <h2 className="text-4xl font-bold text-white">Apoie o Projeto</h2>
          </div>

          <p className="text-purple-200 mb-8 text-lg leading-relaxed">
            O LouvaMais é um projeto dedicado a servir a comunidade católica. 
            Se você acredita na importância da música litúrgica de qualidade, 
            considere apoiar nosso trabalho através de doações ou adquirindo nossos produtos educacionais.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">💝 Doações</h3>
              <p className="text-purple-200 mb-4">
                Suas doações ajudam a manter a plataforma funcionando e a criar novo conteúdo educativo.
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full">
                Fazer Doação
              </Button>
            </div>

            <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📚 Produtos</h3>
              <p className="text-purple-200 mb-4">
                Adquira nossos e-books, cursos e guias para aprimorar seu ministério de música.
              </p>
              <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white w-full">
                Ver Produtos
              </Button>
            </div>
          </div>

          <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">🙏 Outras Formas de Apoiar</h3>
            <ul className="space-y-3 text-purple-200">
              <li className="flex items-start gap-3">
                <span className="text-pink-400 mt-1">✓</span>
                <span>Compartilhe o LouvaMais com seu ministério e comunidade</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-pink-400 mt-1">✓</span>
                <span>Envie sugestões de músicas e melhorias para a plataforma</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-pink-400 mt-1">✓</span>
                <span>Compartilhe seus depoimentos e experiências conosco</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-pink-400 mt-1">✓</span>
                <span>Siga nossas redes sociais e participe da comunidade</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Equipe */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Quem Somos</h2>
          <Card className="p-8 bg-slate-800 border-purple-500/20 text-center">
            <p className="text-purple-200 mb-6 leading-relaxed">
              O LouvaMais é desenvolvido por apaixonados por música litúrgica e tecnologia. 
              Nossa equipe trabalha para criar ferramentas que facilitem a vida dos ministérios de música 
              e enriqueçam as celebrações litúrgicas em toda a Igreja Católica.
            </p>
            <p className="text-purple-300 italic">
              "Que a música seja sempre um instrumento de louvor e comunhão."
            </p>
          </Card>
        </div>

        {/* Contato */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Entre em Contato</h2>
          <p className="text-purple-200 mb-6">
            Tem dúvidas, sugestões ou gostaria de conversar conosco?
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              📧 Email: louvamais590@gmail.com
            </Button>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-6">Siga-nos nas Redes Sociais</h3>
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
