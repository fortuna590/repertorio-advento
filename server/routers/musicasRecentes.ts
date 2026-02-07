import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { repertoriosPersonalizados, musicasRepertorioPersonalizado } from "../../drizzle/schema";
import { desc, eq, sql } from "drizzle-orm";

export const musicasRecentesRouter = router({
  listarRecentes: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    // Buscar últimas 20 músicas únicas adicionadas pelo usuário
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const musicasRecentes = await db
      .select({
        titulo: musicasRepertorioPersonalizado.titulo,
        artista: musicasRepertorioPersonalizado.artista,
        tom: musicasRepertorioPersonalizado.tom,
        linkCifra: musicasRepertorioPersonalizado.linkCifra,
        linkYoutube: musicasRepertorioPersonalizado.linkYoutube,
        momento: musicasRepertorioPersonalizado.momento,
        ultimoUso: sql<Date>`MAX(${musicasRepertorioPersonalizado.createdAt})`.as('ultimoUso'),
      })
      .from(musicasRepertorioPersonalizado)
      .innerJoin(
        repertoriosPersonalizados,
        eq(musicasRepertorioPersonalizado.repertorioId, repertoriosPersonalizados.id)
      )
      .where(eq(repertoriosPersonalizados.userId, userId))
      .groupBy(
        musicasRepertorioPersonalizado.titulo,
        musicasRepertorioPersonalizado.artista,
        musicasRepertorioPersonalizado.tom,
        musicasRepertorioPersonalizado.linkCifra,
        musicasRepertorioPersonalizado.linkYoutube,
        musicasRepertorioPersonalizado.momento
      )
      .orderBy(desc(sql`MAX(${musicasRepertorioPersonalizado.createdAt})`))
      .limit(20);
    
    return musicasRecentes;
  }),
});
