import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";


interface TestimonialFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function TestimonialForm({ onSuccess, compact = false }: TestimonialFormProps) {
  const [nomeAutor, setNomeAutor] = useState("");
  const [emailAutor, setEmailAutor] = useState("");
  const [organizacao, setOrganizacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDepoimento = trpc.depoimentos.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomeAutor.trim() || !emailAutor.trim() || !mensagem.trim()) {
      alert("Por favor, preencha nome, email e mensagem.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createDepoimento.mutateAsync({
        nomeAutor,
        emailAutor,
        organizacao: organizacao || undefined,
        mensagem,
        rating,
      });

      alert("Seu depoimento foi enviado! Será revisado e publicado em breve.");

      // Limpar formulário
      setNomeAutor("");
      setEmailAutor("");
      setOrganizacao("");
      setMensagem("");
      setRating(5);

      onSuccess?.();
    } catch (error) {
      alert("Falha ao enviar depoimento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-lg border border-purple-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            placeholder="Seu nome"
            value={nomeAutor}
            onChange={(e) => setNomeAutor(e.target.value)}
            className="bg-slate-900/50 border-purple-500/30"
            disabled={isSubmitting}
          />
          <Input
            type="email"
            placeholder="Seu email"
            value={emailAutor}
            onChange={(e) => setEmailAutor(e.target.value)}
            className="bg-slate-900/50 border-purple-500/30"
            disabled={isSubmitting}
          />
        </div>

        <Input
          placeholder="Sua paróquia ou ministério (opcional)"
          value={organizacao}
          onChange={(e) => setOrganizacao(e.target.value)}
          className="bg-slate-900/50 border-purple-500/30"
          disabled={isSubmitting}
        />

        <Textarea
          placeholder="Compartilhe sua experiência com o repertório..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="bg-slate-900/50 border-purple-500/30 min-h-[100px]"
          disabled={isSubmitting}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-purple-200">Avaliação:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
                disabled={isSubmitting}
              >
                <Star
                  size={20}
                  className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}
                />
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSubmitting ? "Enviando..." : "Enviar Depoimento"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-xl border border-purple-500/30">
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Deixe seu Depoimento</h3>
        <p className="text-purple-200 mb-6">Sua opinião é importante para nós! Compartilhe sua experiência com o Repertório Católico.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">Nome *</label>
          <Input
            placeholder="Seu nome completo"
            value={nomeAutor}
            onChange={(e) => setNomeAutor(e.target.value)}
            className="bg-slate-900/50 border-purple-500/30"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">Email *</label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={emailAutor}
            onChange={(e) => setEmailAutor(e.target.value)}
            className="bg-slate-900/50 border-purple-500/30"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-purple-200 mb-2">Paróquia / Ministério</label>
        <Input
          placeholder="Ex: Paróquia São João, Ministério de Música"
          value={organizacao}
          onChange={(e) => setOrganizacao(e.target.value)}
          className="bg-slate-900/50 border-purple-500/30"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-purple-200 mb-2">Seu Depoimento *</label>
        <Textarea
          placeholder="Conte-nos como o Repertório Católico ajudou sua comunidade, o impacto nas celebrações, sugestões, etc..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="bg-slate-900/50 border-purple-500/30 min-h-[150px]"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-purple-200 mb-3">Avaliação *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
              disabled={isSubmitting}
            >
              <Star
                size={32}
                className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}
              />
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
      >
        {isSubmitting ? "Enviando seu depoimento..." : "Enviar Depoimento"}
      </Button>

      <p className="text-xs text-purple-300 text-center">
        Seu depoimento será revisado antes de ser publicado no site.
      </p>
    </form>
  );
}
