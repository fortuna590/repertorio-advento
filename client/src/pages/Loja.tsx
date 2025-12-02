import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, BookOpen, Zap, Users, Award } from "lucide-react";
import ModernHeader from "@/components/ModernHeader";

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  status: "disponivel" | "em-breve";
  beneficios: string[];
  icon: React.ReactNode;
  destaque?: boolean;
}

const produtos: Produto[] = [
  {
    id: "1",
    nome: "Catecismo da Igreja Católica",
    descricao: "Referência completa para aprofundamento na fé católica",
    preco: "R$ 89,90",
    status: "disponivel",
    beneficios: ["Compra segura", "Entrega rápida", "Garantia de satisfação"],
    icon: <BookOpen className="w-8 h-8" />,
  },
  {
    id: "2",
    nome: "Missal Romano",
    descricao: "Guia completo para celebrações litúrgicas",
    preco: "R$ 129,90",
    status: "disponivel",
    beneficios: ["Edição atualizada", "Referência oficial", "Qualidade premium"],
    icon: <BookOpen className="w-8 h-8" />,
  },
  {
    id: "3",
    nome: "Guia Completo de Repertório Litúrgico",
    descricao: "E-book com seleção de 200+ músicas organizadas por liturgia",
    preco: "R$ 49,90",
    status: "em-breve",
    beneficios: ["200+ músicas", "Organizadas por liturgia", "Dicas práticas"],
    icon: <Zap className="w-8 h-8" />,
    destaque: true,
  },
  {
    id: "4",
    nome: "Curso de Ministério de Música",
    descricao: "Formação completa para coordenadores de coros e ministros",
    preco: "R$ 199,90",
    status: "em-breve",
    beneficios: ["6 módulos", "Certificado", "Suporte exclusivo"],
    icon: <Users className="w-8 h-8" />,
    destaque: true,
  },
  {
    id: "5",
    nome: "Pack de Partituras Digitais",
    descricao: "Coleção de 50 partituras em PDF para impressão",
    preco: "R$ 79,90",
    status: "em-breve",
    beneficios: ["50 partituras", "Alta qualidade", "Uso comercial"],
    icon: <Award className="w-8 h-8" />,
  },
  {
    id: "6",
    nome: "Consultoria para Ministérios",
    descricao: "Sessão personalizada para otimizar seu ministério de música",
    preco: "R$ 299,90",
    status: "em-breve",
    beneficios: ["Análise completa", "Recomendações", "Suporte 30 dias"],
    icon: <Star className="w-8 h-8" />,
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
            Produtos e recursos para enriquecer seu ministério de música litúrgica
          </p>
        </div>

        {/* Produtos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {produtos.map((produto) => (
            <Card
              key={produto.id}
              className={`relative p-6 border transition-all duration-300 ${
                produto.destaque
                  ? "bg-gradient-to-br from-pink-600/20 to-purple-600/20 border-pink-500/50 lg:col-span-1"
                  : "bg-slate-800 border-purple-500/20 hover:border-purple-500/50"
              } ${produto.status === "disponivel" ? "hover:shadow-lg hover:shadow-purple-500/20" : ""}`}
            >
              {/* Badge Destaque */}
              {produto.destaque && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ Destaque
                </div>
              )}

              {/* Badge Status */}
              <div className="absolute top-4 left-4">
                {produto.status === "disponivel" ? (
                  <span className="bg-green-500/30 text-green-200 text-xs font-semibold px-3 py-1 rounded-full">
                    Disponível
                  </span>
                ) : (
                  <span className="bg-yellow-500/30 text-yellow-200 text-xs font-semibold px-3 py-1 rounded-full">
                    Em Breve
                  </span>
                )}
              </div>

              {/* Ícone */}
              <div className="text-purple-400 mb-4 mt-8">{produto.icon}</div>

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
                {produto.status === "disponivel" ? (
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Comprar Agora
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full bg-slate-700 text-slate-400 cursor-not-allowed"
                  >
                    Disponível em Breve
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Seção de Benefícios */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-12 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Por Que Comprar Conosco?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Compra Segura</h3>
              <p className="text-purple-200">Transações criptografadas e protegidas com Stripe</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Entrega Rápida</h3>
              <p className="text-purple-200">Acesso imediato aos produtos digitais</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💯</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Garantia</h3>
              <p className="text-purple-200">Satisfação garantida ou dinheiro de volta</p>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Receba Ofertas Exclusivas</h2>
          <p className="text-purple-200 mb-6">
            Inscreva-se na newsletter para receber descontos e lançamentos em primeira mão
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu email"
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700 border border-purple-500/20 text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
            />
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Inscrever
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
