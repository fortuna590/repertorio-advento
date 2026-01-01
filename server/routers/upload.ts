import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

export const uploadRouter = router({
  uploadImage: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const extension = input.fileName.split('.').pop() || 'jpg';
        const uniqueFileName = `blog/${timestamp}-${randomSuffix}.${extension}`;

        // Converter base64 para Buffer
        const buffer = Buffer.from(input.fileData, 'base64');

        // Upload para S3
        const result = await storagePut(uniqueFileName, buffer, input.contentType);

        return {
          url: result.url,
          key: result.key,
        };
      } catch (error) {
        console.error('[Upload] Erro ao fazer upload:', error);
        throw new Error('Erro ao fazer upload da imagem');
      }
    }),
});
