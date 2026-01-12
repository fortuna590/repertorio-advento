import EmBreve from "@/components/EmBreve";
import { Cross } from "lucide-react";
import { useEffect } from "react";

export default function RepertorioQuaresma() {
  // Adicionar meta tags Open Graph
  useEffect(() => {
    const currentUrl = window.location.href;
    document.title = 'Quaresma | LouvaMais';
    const oldMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
    oldMetaTags.forEach(tag => tag.remove());
    const metaTags = [
      { property: 'og:title', content: 'Quaresma | LouvaMais' },
      { property: 'og:description', content: 'Repertório de músicas para a Quaresma. Músicas litúrgicas para o tempo de preparação para a Páscoa.' },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'LouvaMais' },
      { property: 'og:image', content: `${window.location.origin}/og-quaresma.jpg` },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Quaresma | LouvaMais' },
      { name: 'twitter:description', content: 'Repertório de músicas para a Quaresma.' },
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
      titulo="Tempo da Quaresma"
      descricao="Repertório para o tempo de conversão, penitência e preparação para a Páscoa"
      icone={Cross}
      cor="roxo"
    />
  );
}
