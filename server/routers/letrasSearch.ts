import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const letrasSearchRouter = router({
  buscarLetras: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, "Query é obrigatória"),
      })
    )
    .query(async ({ input }) => {
      try {
        // Como o Letras.mus.br usa JavaScript para carregar resultados,
        // vamos retornar um link de busca direto para o usuário abrir
        const searchUrl = `https://www.letras.mus.br/mais.html?q=${encodeURIComponent(input.query)}`;
        
        // Gerar sugestões baseadas na query
        const partes = input.query.split(/[-–]/);
        const artista = partes[0]?.trim() || "";
        const musica = partes[1]?.trim() || input.query;
        
        // Criar URL direta para a música (formato padrão do Letras.mus.br)
        const artistaSlug = artista
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        
        const musicaSlug = musica
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        
        const resultados = [];
        
        // Se temos artista e música, sugerir URL direta
        if (artistaSlug && musicaSlug) {
          resultados.push({
            titulo: musica,
            artista: artista,
            url: `https://www.letras.mus.br/${artistaSlug}/${musicaSlug}/`,
          });
        }
        
        // Sempre adicionar link de busca como fallback
        resultados.push({
          titulo: `Buscar "${input.query}" no Letras.mus.br`,
          artista: "Abrir página de busca",
          url: searchUrl,
        });
        
        return resultados;
      } catch (error) {
        console.error("[Letras Search] Erro ao buscar:", error);
        return [];
      }
    }),
});
