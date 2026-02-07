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
        // Buscar cifras usando scraping simples do CifraClub
        const searchUrl = `https://www.cifraclub.com.br/busca/?q=${encodeURIComponent(input.query)}`;
        
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar cifras');
        }
        
        const html = await response.text();
        
        // Parse HTML para extrair resultados
        const cifras: Array<{
          titulo: string;
          artista: string;
          link: string;
        }> = [];
        
        // Regex para extrair informações dos resultados
        const resultRegex = /<a[^>]*href="(https:\/\/www\.cifraclub\.com\.br\/[^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi;
        
        let match;
        while ((match = resultRegex.exec(html)) !== null && cifras.length < 10) {
          cifras.push({
            link: match[1],
            titulo: match[2].trim(),
            artista: match[3].trim()
          });
        }
        
        return { cifras };
      } catch (error) {
        console.error('[CifraSearch] Erro ao buscar cifras:', error);
        return { cifras: [] };
      }
    }),
});
