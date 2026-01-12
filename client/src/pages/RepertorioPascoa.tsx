import EmBreve from "@/components/EmBreve";
import { Sunrise } from "lucide-react";
import { useEffect } from "react";

export default function RepertorioPascoa() {
  // Adicionar meta tags Open Graph
  useEffect(() => {
    const currentUrl = window.location.href;
    document.title = 'Páscoa | LouvaMais';
    const oldMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
    oldMetaTags.forEach(tag => tag.remove());
    const metaTags = [
      { property: 'og:title', content: 'Páscoa | LouvaMais' },
      { property: 'og:description', content: 'Repertório de músicas para a Páscoa. Celebre a Ressurreição de Cristo com músicas litúrgicas especiais.' },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'LouvaMais' },
      { property: 'og:image', content: `${window.location.origin}/og-pascoa.jpg` },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Páscoa | LouvaMais' },
      { name: 'twitter:description', content: 'Repertório de músicas para a Páscoa.' },
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
      titulo="Tempo da Páscoa"
      descricao="Repertório para o tempo de ressurreição, alegria e vida nova em Cristo"
      icone={Sunrise}
      cor="amarelo"
    />
  );
}
