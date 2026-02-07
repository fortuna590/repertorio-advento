import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { musicasFavoritas } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const musicasFavoritasRouter = router({
  // Listar todas as músicas favoritas do usuário
  listar: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const favoritos = await db
      .select()
      .from(musicasFavoritas)
      .where(eq(musicasFavoritas.userId, ctx.user.id))
      .orderBy(desc(musicasFavoritas.createdAt));

    return favoritos;
  }),

  // Adicionar música aos favoritos
  adicionar: protectedProcedure
    .input(
      z.object({
        titulo: z.string().min(1, "Título é obrigatório"),
        artista: z.string().optional(),
        tom: z.string().optional(),
        linkCifra: z.string().optional(),
        linkYoutube: z.string().optional(),
        momento: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [favorito] = await db
        .insert(musicasFavoritas)
        .values({
          userId: ctx.user.id,
          titulo: input.titulo,
          artista: input.artista || null,
          tom: input.tom || null,
          linkCifra: input.linkCifra || null,
          linkYoutube: input.linkYoutube || null,
          momento: input.momento || null,
        })
        .$returningId();

      return favorito;
    }),

  // Remover música dos favoritos
  remover: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(musicasFavoritas)
        .where(
          and(
            eq(musicasFavoritas.id, input.id),
            eq(musicasFavoritas.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Verificar se uma música está nos favoritos
  verificar: protectedProcedure
    .input(
      z.object({
        titulo: z.string(),
        artista: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const favorito = await db
        .select()
        .from(musicasFavoritas)
        .where(
          and(
            eq(musicasFavoritas.userId, ctx.user.id),
            eq(musicasFavoritas.titulo, input.titulo),
            input.artista
              ? eq(musicasFavoritas.artista, input.artista)
              : undefined
          )
        )
        .limit(1);

      return favorito.length > 0 ? favorito[0] : null;
    }),
});
