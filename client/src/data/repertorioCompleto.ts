/**
 * Repertório Completo - Todas as músicas disponíveis
 * Consolidação de Advento, Missa do Galo e Tempo do Natal
 */

import { repertorio, type MomentoMissa } from "./repertorio";
import { repertorioMissaDoGalo } from "./repertorioMissaDoGalo";
import { repertorioTempoDoNatal } from "./repertorioTempoDoNatal";

// Converter Missa do Galo para o formato padrão
const missaDoGaloConvertido: MomentoMissa[] = repertorioMissaDoGalo.map((momento) => ({
  id: `missa-galo-${momento.id}`,
  numero: `🎄 ${momento.numero}`,
  titulo: `${momento.titulo} (Missa do Galo)`,
  observacao: momento.observacao,
  musicas: momento.musicas.map((musica) => ({
    numero: musica.numero,
    titulo: musica.titulo,
    artista: musica.artista || "Coral Sagrado",
    youtube: musica.youtube || "",
    cifra: musica.cifra || "",
    observacao: `Tom: ${musica.tom} | ${musica.categoria}`,
    momento: momento.titulo
  }))
}));

// Converter Tempo do Natal para o formato padrão
const tempoDoNatalConvertido: MomentoMissa[] = (() => {
  // Agrupar músicas por momento
  const momentosMap = new Map<string, any[]>();
  
  repertorioTempoDoNatal.forEach((musica) => {
    if (!momentosMap.has(musica.momento)) {
      momentosMap.set(musica.momento, []);
    }
    momentosMap.get(musica.momento)!.push({
      numero: parseInt(musica.id),
      titulo: musica.titulo,
      artista: "Católicas",
      youtube: musica.linkYoutube || "",
      cifra: musica.linkCifra || "",
      observacao: `Tom: ${musica.tom}`,
      momento: musica.momento
    });
  });

  // Converter para array de momentos
  const momentos: MomentoMissa[] = [];
  let index = 1;
  
  momentosMap.forEach((musicas, momentoTitulo) => {
    momentos.push({
      id: `tempo-natal-${momentoTitulo.toLowerCase().replace(/\s+/g, '-')}`,
      numero: `⭐ ${index}`,
      titulo: `${momentoTitulo} (Tempo do Natal)`,
      musicas
    });
    index++;
  });

  return momentos;
})();

// Consolidar todos os repertórios
export const repertorioCompleto: MomentoMissa[] = [
  ...repertorio, // Advento (original)
  ...missaDoGaloConvertido, // Missa do Galo
  ...tempoDoNatalConvertido // Tempo do Natal
];

export type { MomentoMissa };
