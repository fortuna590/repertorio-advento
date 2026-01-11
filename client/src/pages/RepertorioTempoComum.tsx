import EmBreve from "@/components/EmBreve";
import { Sprout } from "lucide-react";
import { useEffect } from "react";

export default function RepertorioTempoComum() {
  // Adicionar meta tags Open Graph
  useEffect(() => {
    const currentUrl = window.location.href;
    document.title = 'Tempo Comum | LouvaMais';
    const oldMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
    oldMetaTags.forEach(tag => tag.remove());
    const metaTags = [
      { property: 'og:title', content: 'Tempo Comum | LouvaMais' },
      { property: 'og:description', content: 'Repertório de músicas para o Tempo Comum. Músicas litúrgicas para os domingos do Tempo Comum.' },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'LouvaMais' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Tempo Comum | LouvaMais' },
      { name: 'twitter:description', content: 'Repertório de músicas para o Tempo Comum.' },
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
      titulo="Tempo Comum"
      descricao="Repertório para a caminhada ordinária da fé e crescimento espiritual"
      icone={Sprout}
      cor="verde"
    />
  );
}
