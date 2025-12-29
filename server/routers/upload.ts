import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { storagePut } from "../storage";

export const uploadRouter = router({
  uploadImage: publicProcedure
    .input(
      z.object({
        base64: z.string(),
        filename: z.string(),
        contentType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input }) => {
      // Converter base64 para Buffer
      const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const ext = input.filename.split(".").pop() || "jpg";
      const key = `blog/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      // Upload para S3
      const result = await storagePut(key, buffer, input.contentType);

      return {
        url: result.url,
        key: result.key,
      };
    }),
});
