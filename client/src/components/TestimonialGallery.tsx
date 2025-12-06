import { useEffect, useState } from "react";
import { Star, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Depoimento {
  id: number;
  nomeAutor: string;
  organizacao: string | null;
  mensagem: string;
  rating: number;
  createdAt: Date;
}

interface TestimonialGalleryProps {
  title?: string;
  limit?: number;
  showViewAll?: boolean;
}

export function TestimonialGallery({
  title = "Depoimentos de Usuários",
  limit,
  showViewAll = false,
}: TestimonialGalleryProps) {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: allDepoimentos } = trpc.depoimentos.list.useQuery();

  useEffect(() => {
    if (allDepoimentos) {
      setDepoimentos(limit ? allDepoimentos.slice(0, limit) : allDepoimentos);
      setIsLoading(false);
    }
  }, [allDepoimentos, limit]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (depoimentos.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
        <p className="text-purple-300">Nenhum depoimento publicado ainda.</p>
        <p className="text-purple-400 text-sm mt-2">Seja o primeiro a compartilhar sua experiência!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {title && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          <p className="text-purple-300">Veja o que dizem sobre nosso repertório</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {depoimentos.map((depoimento) => (
          <div
            key={depoimento.id}
            className="group bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
          >
            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < depoimento.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-600"
                  }
                />
              ))}
            </div>

            {/* Mensagem */}
            <p className="text-purple-100 mb-4 line-clamp-4 group-hover:line-clamp-none transition-all">
              "{depoimento.mensagem}"
            </p>

            {/* Autor */}
            <div className="border-t border-purple-500/20 pt-4">
              <p className="font-semibold text-white">{depoimento.nomeAutor}</p>
              {depoimento.organizacao && (
                <p className="text-sm text-purple-300">{depoimento.organizacao}</p>
              )}
              <p className="text-xs text-purple-400 mt-2">
                {new Date(depoimento.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showViewAll && limit && depoimentos.length < (allDepoimentos?.length || 0) && (
        <div className="text-center">
          <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all">
            Ver todos os depoimentos
          </button>
        </div>
      )}
    </div>
  );
}
