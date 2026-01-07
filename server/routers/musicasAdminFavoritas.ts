import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { musicasAdminFavoritas, musicasRepertorio } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const musicasAdminFavoritasRouter = router({
  // Listar favoritas do usuário
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    try {
      const favoritas = await db
        .select({
          id: musicasAdminFavoritas.id,
          musicaRepertorioId: musicasAdminFavoritas.musicaRepertorioId,
          createdAt: musicasAdminFavoritas.createdAt,
          musica: musicasRepertorio,
        })
        .from(musicasAdminFavoritas)
        .leftJoin(
          musicasRepertorio,
          eq(musicasAdminFavoritas.musicaRepertorioId, musicasRepertorio.id)
        )
        .where(eq(musicasAdminFavoritas.userId, ctx.user.id));

      return favoritas;
    } catch (e) {
      console.error("Error listing favoritas:", e);
      return [];
    }
  }),

  // Adicionar favorita
  add: protectedProcedure
    .input(
      z.object({
        musicaRepertorioId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar se já existe
        const existing = await db
          .select()
          .from(musicasAdminFavoritas)
          .where(
            and(
              eq(musicasAdminFavoritas.userId, ctx.user.id),
              eq(musicasAdminFavoritas.musicaRepertorioId, input.musicaRepertorioId)
            )
          );

        if (existing.length > 0) {
          return { success: false, message: "Música já está nos favoritos" };
        }

        await db.insert(musicasAdminFavoritas).values({
          userId: ctx.user.id,
          musicaRepertorioId: input.musicaRepertorioId,
        });

        return { success: true };
      } catch (e) {
        console.error("Error adding favorita:", e);
        throw new Error("Erro ao adicionar favorita");
      }
    }),

  // Remover favorita
  remove: protectedProcedure
    .input(
      z.object({
        musicaRepertorioId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .delete(musicasAdminFavoritas)
          .where(
            and(
              eq(musicasAdminFavoritas.userId, ctx.user.id),
              eq(musicasAdminFavoritas.musicaRepertorioId, input.musicaRepertorioId)
            )
          );

        return { success: true };
      } catch (e) {
        console.error("Error removing favorita:", e);
        throw new Error("Erro ao remover favorita");
      }
    }),

  // Verificar se música é favorita
  isFavorite: protectedProcedure
    .input(
      z.object({
        musicaRepertorioId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return false;

      try {
        const result = await db
          .select()
          .from(musicasAdminFavoritas)
          .where(
            and(
              eq(musicasAdminFavoritas.userId, ctx.user.id),
              eq(musicasAdminFavoritas.musicaRepertorioId, input.musicaRepertorioId)
            )
          );

        return result.length > 0;
      } catch (e) {
        console.error("Error checking favorite:", e);
        return false;
      }
    }),
});
