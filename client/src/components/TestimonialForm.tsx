import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TestimonialFormProps {
  compact?: boolean;
}

export default function TestimonialForm({ compact = false }: TestimonialFormProps) {
  const [nomeAutor, setNomeAutor] = useState("");
  const [emailAutor, setEmailAutor] = useState("");
  const [organizacao, setOrganizacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [rating, setRating] = useState(5);

  const createMutation = trpc.depoimentos.create.useMutation({
    onSuccess: () => {
      toast.success("Depoimento enviado com sucesso! Será publicado após aprovação.");
      setNomeAutor("");
      setEmailAutor("");
      setOrganizacao("");
      setMensagem("");
      setRating(5);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar depoimento");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      nomeAutor,
      emailAutor,
      organizacao,
      mensagem,
      rating,
    });
  };

  if (compact) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Compartilhe sua Experiência</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Seu nome"
                value={nomeAutor}
                onChange={(e) => setNomeAutor(e.target.value)}
                required
                className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Seu email"
                value={emailAutor}
                onChange={(e) => setEmailAutor(e.target.value)}
                required
                className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <textarea
              placeholder="Seu depoimento..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer transition ${
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {createMutation.isPending ? "Enviando..." : "Enviar Depoimento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Compartilhe sua Experiência</CardTitle>
        <p className="text-purple-200">
          Seu depoimento será publicado após aprovação
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 mb-2">Nome *</label>
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nomeAutor}
                onChange={(e) => setNomeAutor(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-purple-200 mb-2">Email *</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={emailAutor}
                onChange={(e) => setEmailAutor(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Organização (opcional)</label>
            <input
              type="text"
              placeholder="Paróquia, ministério, etc."
              value={organizacao}
              onChange={(e) => setOrganizacao(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Depoimento *</label>
            <textarea
              placeholder="Conte-nos sobre sua experiência com o LouvaMais..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Avaliação *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition ${
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
              <span className="ml-2 text-purple-200">({rating} estrelas)</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
          >
            {createMutation.isPending ? "Enviando..." : "Enviar Depoimento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
