import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function TestimonialGallery() {
  const { data: depoimentos, isLoading } = trpc.depoimentos.listApproved.useQuery();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800/50 border-purple-500/20 animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-slate-700 rounded mb-4"></div>
              <div className="h-4 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!depoimentos || depoimentos.length === 0) {
    return (
      <div className="text-center py-12">
        <Quote className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <p className="text-purple-200 text-lg">
          Nenhum depoimento publicado ainda. Seja o primeiro a compartilhar sua experiência!
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {depoimentos.map((depoimento) => (
        <Card
          key={depoimento.id}
          className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
        >
          <CardContent className="p-6">
            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= depoimento.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>

            {/* Mensagem */}
            <div className="relative mb-6">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-purple-500/30" />
              <p className="text-purple-100 italic pl-6 line-clamp-6">
                "{depoimento.mensagem}"
              </p>
            </div>

            {/* Autor */}
            <div className="border-t border-purple-500/20 pt-4">
              <p className="text-white font-semibold">{depoimento.nomeAutor}</p>
              {depoimento.organizacao && (
                <p className="text-purple-300 text-sm">{depoimento.organizacao}</p>
              )}
              <p className="text-purple-400 text-xs mt-1">
                {new Date(depoimento.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
