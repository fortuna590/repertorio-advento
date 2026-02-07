import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { musicasFavoritas } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const favoritosRouter = router({
  // Adicionar música aos favoritos
  add: publicProcedure
    .input(
      z.object({
        musicaId: z.string(),
        musicaTitulo: z.string(),
        musicaArtista: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se já existe
      const existing = await db
        .select()
        .from(musicasFavoritas)
        .where(
          and(
            eq(musicasFavoritas.userId, ctx.user.id),
            eq(musicasFavoritas.titulo, input.musicaTitulo)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: true, message: "Música já está nos favoritos" };
      }

      await db.insert(musicasFavoritas).values({
        userId: ctx.user.id,
        titulo: input.musicaTitulo,
        artista: input.musicaArtista,
      });

      return { success: true, message: "Música adicionada aos favoritos!" };
    }),

  // Remover música dos favoritos
  remove: publicProcedure
    .input(z.object({ musicaId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(musicasFavoritas)
        .where(
          and(
            eq(musicasFavoritas.userId, ctx.user.id),
            eq(musicasFavoritas.titulo, input.musicaId) // Usando titulo como identificador temporário
          )
        );

      return { success: true, message: "Música removida dos favoritos" };
    }),

  // Listar favoritos do usuário
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return [];
    }

    const db = await getDb();
    if (!db) return [];

    const favoritos = await db
      .select()
      .from(musicasFavoritas)
      .where(eq(musicasFavoritas.userId, ctx.user.id))
      .orderBy(desc(musicasFavoritas.createdAt));

    return favoritos;
  }),

  // Verificar se música está nos favoritos
  isFavorite: publicProcedure
    .input(z.object({ musicaId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        return false;
      }

      const db = await getDb();
      if (!db) return false;

      const result = await db
        .select()
        .from(musicasFavoritas)
        .where(
          and(
            eq(musicasFavoritas.userId, ctx.user.id),
            eq(musicasFavoritas.titulo, input.musicaId) // Usando titulo como identificador temporário
          )
        )
        .limit(1);

      return result.length > 0;
    }),
});
