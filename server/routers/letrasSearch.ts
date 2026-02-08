import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

export const letrasSearchRouter = router({
  buscarLetras: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, "Query é obrigatória"),
      })
    )
    .query(async ({ input }) => {
      try {
        const searchUrl = `https://www.letras.mus.br/winamp.php?t=${encodeURIComponent(input.query)}`;
        
        const response = await axios.get(searchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const resultados: Array<{
          titulo: string;
          artista: string;
          url: string;
        }> = [];

        // Extrair resultados da busca
        $(".gs-title").each((i: number, element: any) => {
          if (i >= 10) return false; // Limitar a 10 resultados
          
          const linkElement = $(element).find("a");
          const titulo = linkElement.text().trim();
          const url = linkElement.attr("href");
          
          if (titulo && url) {
            // Extrair artista do título (formato geralmente é "Artista - Música")
            const partes = titulo.split(" - ");
            const artista = partes.length > 1 ? partes[0] : "Desconhecido";
            const nomeMusica = partes.length > 1 ? partes.slice(1).join(" - ") : titulo;
            
            resultados.push({
              titulo: nomeMusica,
              artista: artista,
              url: url.startsWith("http") ? url : `https://www.letras.mus.br${url}`,
            });
          }
        });

        return resultados;
      } catch (error) {
        console.error("[Letras Search] Erro ao buscar:", error);
        return [];
      }
    }),
});
