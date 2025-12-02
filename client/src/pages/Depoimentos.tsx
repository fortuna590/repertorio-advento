import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageCircle } from "lucide-react";

interface Depoimento {
  id: string;
  nome: string;
  cargo: string;
  ministerio: string;
  texto: string;
  rating: number;
  imagem?: string;
}

const depoimentosIniciais: Depoimento[] = [
  {
    id: "1",
    nome: "Padre João Silva",
    cargo: "Pároco",
    ministerio: "Paróquia São José",
    texto: "O Repertório Católico transformou nosso ministério de música. As músicas são bem selecionadas e organizadas por momentos da missa. Nosso coro melhorou muito!",
    rating: 5,
  },
  {
    id: "2",
    nome: "Maria Santos",
    cargo: "Coordenadora de Música",
    ministerio: "Comunidade Católica Vida Nova",
    texto: "Excelente ferramenta! Facilita muito a preparação das celebrações. As músicas do Advento são especialmente lindas e envolventes.",
    rating: 5,
  },
  {
    id: "3",
    nome: "Pe. Carlos Mendes",
    cargo: "Pároco",
    ministerio: "Catedral Metropolitana",
    texto: "Recomendo para todos os ministérios de música. A qualidade das seleções é notável e a organização por liturgia é muito prática.",
    rating: 5,
  },
  {
    id: "4",
    nome: "Ana Paula Costa",
    cargo: "Ministra de Música",
    ministerio: "Igreja Matriz do Bairro",
    texto: "Desde que comecei a usar o Repertório Católico, as celebrações ficaram muito mais bonitas. As músicas tocam o coração dos fiéis!",
    rating: 5,
  },
  {
    id: "5",
    nome: "Frei Benedito",
    cargo: "Responsável Litúrgico",
    ministerio: "Convento Franciscano",
    texto: "Perfeito para nossas necessidades. A integração com a liturgia é impecável e as músicas são todas bem conhecidas e apreciadas.",
    rating: 5,
  },
  {
    id: "6",
    nome: "Isabela Ferreira",
    cargo: "Diretora de Coro",
    ministerio: "Paróquia Santa Maria",
    texto: "Que recurso maravilhoso! Meu coro adora trabalhar com essas músicas. A qualidade é excelente e o preço é justo.",
    rating: 5,
  },
];

export default function Depoimentos() {
  const [depoimentos] = useState<Depoimento[]>(depoimentosIniciais);
  const [filtroRating, setFiltroRating] = useState<number | null>(null);

  const depoimentosFiltrados = filtroRating
    ? depoimentos.filter((d) => d.rating >= filtroRating)
    : depoimentos;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Depoimentos</h1>
          <p className="text-xl text-purple-200 mb-8">
            Veja o que ministérios de música de todo o Brasil dizem sobre o Repertório Católico
          </p>

          {/* Filtro por Rating */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Button
              onClick={() => setFiltroRating(null)}
              variant={filtroRating === null ? "default" : "outline"}
              className={filtroRating === null ? "bg-purple-600" : ""}
            >
              Todos
            </Button>
            {[5, 4, 3].map((rating) => (
              <Button
                key={rating}
                onClick={() => setFiltroRating(rating)}
                variant={filtroRating === rating ? "default" : "outline"}
                className={filtroRating === rating ? "bg-purple-600" : ""}
              >
                {rating}+ ⭐
              </Button>
            ))}
          </div>
        </div>

        {/* Grid de Depoimentos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {depoimentosFiltrados.map((depoimento) => (
            <Card
              key={depoimento.id}
              className="p-6 bg-slate-800 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {renderStars(depoimento.rating)}
              </div>

              {/* Texto */}
              <p className="text-purple-100 mb-6 italic leading-relaxed">
                "{depoimento.texto}"
              </p>

              {/* Autor */}
              <div className="border-t border-purple-500/20 pt-4">
                <p className="font-semibold text-white">{depoimento.nome}</p>
                <p className="text-sm text-purple-300">{depoimento.cargo}</p>
                <p className="text-xs text-purple-400">{depoimento.ministerio}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-12 text-center mb-12">
          <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Compartilhe seu depoimento!
          </h2>
          <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
            Sua experiência com o Repertório Católico é importante para nós. Entre em contato e nos conte como o site tem ajudado seu ministério de música.
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3">
            Enviar Depoimento
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-slate-800 border-purple-500/20 text-center">
            <p className="text-4xl font-bold text-purple-400 mb-2">
              {depoimentos.length}+
            </p>
            <p className="text-purple-200">Depoimentos</p>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500/20 text-center">
            <p className="text-4xl font-bold text-yellow-400 mb-2">
              {(
                depoimentos.reduce((acc, d) => acc + d.rating, 0) /
                depoimentos.length
              ).toFixed(1)}
            </p>
            <p className="text-purple-200">Avaliação Média</p>
          </Card>

          <Card className="p-6 bg-slate-800 border-purple-500/20 text-center">
            <p className="text-4xl font-bold text-green-400 mb-2">100%</p>
            <p className="text-purple-200">Recomendado</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
