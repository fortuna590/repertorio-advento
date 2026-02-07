import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { callDataApi } from "../_core/dataApi";

export const youtubeSearchRouter = router({
  buscarVideos: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await callDataApi("Youtube/search", {
          query: {
            q: input.query,
            hl: "pt",
            gl: "BR",
          },
        }) as any;

        // Filtrar apenas vídeos e formatar resposta
        const videos = (result.contents || [])
          .filter((item: any) => item.type === "video")
          .slice(0, 10) // Limitar a 10 resultados
          .map((item: any) => {
            const video = item.video || {};
            return {
              videoId: video.videoId || "",
              titulo: video.title || "",
              canal: video.channelTitle || "",
              duracao: video.lengthText || "",
              visualizacoes: video.viewCountText || "",
              publicado: video.publishedTimeText || "",
              thumbnail: video.thumbnails?.[0]?.url || "",
              link: video.videoId
                ? `https://www.youtube.com/watch?v=${video.videoId}`
                : "",
            };
          });

        return { videos };
      } catch (error) {
        console.error("Erro ao buscar vídeos no YouTube:", error);
        throw new Error("Erro ao buscar vídeos no YouTube");
      }
    }),
});
