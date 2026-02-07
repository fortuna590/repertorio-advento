import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const cifraSearchRouter = router({
  buscarCifras: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        // Gerar sugestões de URL baseadas no padrão do CifraClub
        // Formato: https://www.cifraclub.com.br/artista/musica/
        
        const cifras: Array<{
          titulo: string;
          artista: string;
          link: string;
        }> = [];
        
        // Tentar extrair artista e música da query
        const parts = input.query.split('-').map(p => p.trim());
        
        if (parts.length >= 2) {
          // Formato: "artista - música"
          const artista = parts[0];
          const musica = parts.slice(1).join(' ');
          
          const artistaSlug = artista.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '-'); // Substitui espaços por hífens
            
          const musicaSlug = musica.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
          
          cifras.push({
            titulo: musica,
            artista: artista,
            link: `https://www.cifraclub.com.br/${artistaSlug}/${musicaSlug}/`
          });
        }
        
        // Adicionar link de busca genérica como fallback
        const searchQuery = input.query.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s]/g, ' ')
          .trim()
          .replace(/\s+/g, '+');
        
        cifras.push({
          titulo: `Buscar "${input.query}" no CifraClub`,
          artista: "Resultado da busca",
          link: `https://www.cifraclub.com.br/busca/?q=${searchQuery}`
        });
        
        return { cifras };
      } catch (error) {
        console.error('[CifraSearch] Erro ao gerar links de cifras:', error);
        return { cifras: [] };
      }
    }),
});
