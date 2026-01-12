import EmBreve from "@/components/EmBreve";
import { PartyPopper } from "lucide-react";
import { useEffect } from "react";

export default function RepertorioCelebracoes() {
  // Adicionar meta tags Open Graph
  useEffect(() => {
    const currentUrl = window.location.href;
    document.title = 'Celebrações Especiais | LouvaMais';
    const oldMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
    oldMetaTags.forEach(tag => tag.remove());
    const metaTags = [
      { property: 'og:title', content: 'Celebrações Especiais | LouvaMais' },
      { property: 'og:description', content: 'Repertório de músicas para Celebrações Especiais. Músicas para casamentos, batizados e outras celebrações.' },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'LouvaMais' },
      { property: 'og:image', content: `${window.location.origin}/og-celebracoes.jpg` },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Celebrações Especiais | LouvaMais' },
      { name: 'twitter:description', content: 'Repertório de músicas para Celebrações Especiais.' },
    ];
    metaTags.forEach(({ property, name, content }) => {
      const meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      if (name) meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });
  }, []);
  return (
    <EmBreve
      titulo="Celebrações Especiais"
      descricao="Repertório para Domingo de Ramos, Tríduo Pascal, Pentecostes e outras solenidades"
      icone={PartyPopper}
      cor="vermelho"
    />
  );
}
