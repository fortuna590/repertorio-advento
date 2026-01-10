import { Share2, Mail, MessageCircle, Instagram, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface ShareArticleProps {
  titulo: string;
  url: string;
  descricao?: string;
  slug?: string;
  tipo?: "artigo" | "repertorio";
  repertorioId?: number;
}

export function ShareArticle({ titulo, url, descricao, slug, tipo = "artigo", repertorioId }: ShareArticleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const incrementarCompartilhamentosArtigoMutation = (trpc as any).artigos.incrementarCompartilhamentos.useMutation();
  const incrementarCompartilhamentosRepertorioMutation = (trpc as any).repertorio.incrementarCompartilhamentos.useMutation();

  const registrarCompartilhamento = () => {
    if (tipo === "artigo" && slug) {
      incrementarCompartilhamentosArtigoMutation.mutate({ slug });
    } else if (tipo === "repertorio" && repertorioId) {
      incrementarCompartilhamentosRepertorioMutation.mutate({ id: repertorioId });
    }
  };

  const textoCompartilhamento = descricao
    ? `${titulo}\n\n${descricao}\n\nLeia mais em: ${url}`
    : `${titulo}\n\nLeia mais em: ${url}`;

  const handleShareWhatsApp = () => {
    registrarCompartilhamento();
    const mensagem = encodeURIComponent(textoCompartilhamento);
    const whatsappUrl = `https://wa.me/?text=${mensagem}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  };

  const handleShareEmail = () => {
    registrarCompartilhamento();
    const assunto = encodeURIComponent(`Confira ${tipo === "artigo" ? "este artigo" : "este repertório"}: ${titulo}`);
    const corpo = encodeURIComponent(textoCompartilhamento);
    const emailUrl = `mailto:?subject=${assunto}&body=${corpo}`;
    window.location.href = emailUrl;
    setShowMenu(false);
  };

  const handleShareInstagram = () => {
    registrarCompartilhamento();
    const mensagem = `Confira ${tipo === "artigo" ? "este artigo" : "este repertório"} no LouvaMais:\n\n${titulo}\n\n${url}`;
    const textoParaCopiar = mensagem;
    
    navigator.clipboard.writeText(textoParaCopiar).then(() => {
      toast.success("Texto copiado! Cole no Instagram Stories ou DM");
      setShowMenu(false);
    }).catch(() => {
      toast.error("Erro ao copiar texto");
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copiado para a área de transferência!");
      setShowMenu(false);
    }).catch(() => {
      toast.error("Erro ao copiar link");
    });
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Compartilhar
      </Button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-purple-500/20 rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            <button
              onClick={handleShareWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded-md transition-colors text-left text-white"
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShareEmail}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded-md transition-colors text-left text-white"
            >
              <Mail className="w-4 h-4 text-blue-500" />
              <span>E-mail</span>
            </button>

            <button
              onClick={handleShareInstagram}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded-md transition-colors text-left text-white"
            >
              <Instagram className="w-4 h-4 text-pink-500" />
              <span>Instagram</span>
            </button>

            <div className="border-t border-slate-700 my-1" />

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-700 rounded-md transition-colors text-left text-white"
            >
              <Copy className="w-4 h-4 text-purple-400" />
              <span>Copiar Link</span>
            </button>
          </div>
        </div>
      )}

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
