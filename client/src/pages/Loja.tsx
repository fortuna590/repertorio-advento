import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, BookOpen, Shield, Mail } from "lucide-react";
import { APP_LOGO } from "@/const";
import ModernHeader from "@/components/ModernHeader";
import SocialLinks from "@/components/SocialLinks";

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  beneficios: string[];
  icon: React.ReactNode;
  linkAfiliado: string;
}

const produtos: Produto[] = [
  {
    id: "1",
    nome: "Catecismo da Igreja Católica",
    descricao: "Referência completa para aprofundamento na fé católica",
    preco: "R$ 89,90",
    beneficios: ["Obra fundamental", "Doutrina completa", "Referência oficial"],
    icon: <BookOpen className="w-8 h-8" />,
    linkAfiliado: "https://mercadolivre.com/sec/1L32bE3",
  },
  {
    id: "2",
    nome: "Missal Romano",
    descricao: "Guia completo para celebrações litúrgicas",
    preco: "R$ 129,90",
    beneficios: ["Edição atualizada", "Referência oficial", "Qualidade premium"],
    icon: <BookOpen className="w-8 h-8" />,
    linkAfiliado: "https://mercadolivre.com/sec/2uS2z1T",
  },
];

export default function Loja() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      <ModernHeader />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Loja LouvaMais</h1>
          <p className="text-xl text-purple-200">
            Produtos recomendados para enriquecer seu ministério de música litúrgica
          </p>
        </div>

        {/* Produtos */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {produtos.map((produto) => (
            <Card
              key={produto.id}
              className="bg-slate-800 border-purple-500/20 hover:border-purple-500/50 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              {/* Ícone */}
              <div className="text-purple-400 mb-4">{produto.icon}</div>

              {/* Conteúdo */}
              <h3 className="text-xl font-bold text-white mb-2">{produto.nome}</h3>
              <p className="text-purple-200 text-sm mb-4">{produto.descricao}</p>

              {/* Benefícios */}
              <div className="space-y-2 mb-6">
                {produto.beneficios.map((beneficio, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-purple-200">
                    <span className="text-pink-400">✓</span>
                    <span>{beneficio}</span>
                  </div>
                ))}
              </div>

              {/* Preço e Botão */}
              <div className="border-t border-purple-500/20 pt-4">
                <p className="text-2xl font-bold text-white mb-4">{produto.preco}</p>
                <a href={produto.linkAfiliado} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Comprar no Mercado Livre
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>

        {/* Seção de Benefícios */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-12 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Por Que Comprar Conosco?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Plataformas Seguras</h3>
              <p className="text-purple-200">
                Todos os produtos oferecidos aqui são de plataformas seguras como o Mercado Livre. Utilizamos links de afiliados, e a garantia da venda é dada pela plataforma responsável.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Produtos Reais</h3>
              <p className="text-purple-200">
                Recomendamos apenas produtos genuínos e de qualidade que ajudam a enriquecer seu ministério de música litúrgica.
              </p>
            </div>
          </div>
        </div>

        {/* Contato para Dúvidas */}
        <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Dúvidas sobre os Produtos?</h2>
          <p className="text-purple-200 mb-6">
            Entre em contato conosco para tirar dúvidas sobre os produtos ou fazer sugestões de novos itens
          </p>
          <a href="mailto:contato@louvamais.com">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email
            </Button>
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
