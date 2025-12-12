import { Share2, MessageCircle, Mail, Copy, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LiturgiaShareProps {
  data: string;
  liturgia: string;
  url?: string;
}

export function LiturgiaShare({ data, liturgia, url = "" }: LiturgiaShareProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Liturgia de ${data}\n${liturgia}\n\nAcesse: ${url}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 flex items-center gap-1">
        <Share2 className="w-4 h-4" />
        Compartilhar:
      </span>
      
      <div className="flex gap-2">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Compartilhar no WhatsApp"
          className="p-2 rounded-lg text-gray-400 transition-colors hover:text-green-500 hover:bg-slate-700/50"
        >
          <MessageCircle className="w-4 h-4" />
        </a>

        {/* Email */}
        <a
          href={`mailto:?subject=Liturgia de ${data}&body=${encodedText}`}
          title="Compartilhar por Email"
          className="p-2 rounded-lg text-gray-400 transition-colors hover:text-blue-500 hover:bg-slate-700/50"
        >
          <Mail className="w-4 h-4" />
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Compartilhar no Facebook"
          className="p-2 rounded-lg text-gray-400 transition-colors hover:text-blue-600 hover:bg-slate-700/50"
        >
          <Facebook className="w-4 h-4" />
        </a>

        {/* Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Compartilhar no Twitter"
          className="p-2 rounded-lg text-gray-400 transition-colors hover:text-blue-400 hover:bg-slate-700/50"
        >
          <Twitter className="w-4 h-4" />
        </a>

        {/* Copy */}
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="p-2 text-gray-400 hover:text-purple-400 hover:bg-slate-700/50"
          title="Copiar para clipboard"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      {copied && (
        <span className="text-xs text-green-400 ml-2">
          ✓ Copiado!
        </span>
      )}
    </div>
  );
}
