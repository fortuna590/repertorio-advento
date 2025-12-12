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

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedText}`,
      color: "hover:text-green-500",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=Liturgia de ${data}&body=${encodedText}`,
      color: "hover:text-blue-500",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:text-blue-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
      color: "hover:text-blue-400",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400 flex items-center gap-1">
        <Share2 className="w-4 h-4" />
        Compartilhar:
      </span>
      
      <div className="flex gap-2">
        {shareLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Compartilhar no ${link.name}`}
              className={`p-2 rounded-lg text-gray-400 transition-colors ${link.color} hover:bg-slate-700/50`}
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}

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
