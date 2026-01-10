import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { repertoriosAdmin, momentosMissa, musicasRepertorio } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const repertorioRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      const result = await db.select().from(repertoriosAdmin);
      return result || [];
    } catch (e) {
      console.error("Error listing repertorios:", e);
      return [];
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        descricao: z.string().optional(),
        corPrimaria: z.string().regex(/^#[0-9A-F]{6}$/i),
        corSecundaria: z.string().regex(/^#[0-9A-F]{6}$/i),
        corFundo: z.string().regex(/^#[0-9A-F]{6}$/i),
        corTexto: z.string().regex(/^#[0-9A-F]{6}$/i),
        imagemCapa: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const slug = input.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      await db.insert(repertoriosAdmin).values({
        nome: input.nome,
        descricao: input.descricao || null,
        slug,
        corPrimaria: input.corPrimaria,
        corSecundaria: input.corSecundaria,
        corFundo: input.corFundo,
        corTexto: input.corTexto,
        imagemCapa: input.imagemCapa || null,
      });

      return { success: true };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db
          .select()
          .from(repertoriosAdmin)
          .where(eq(repertoriosAdmin.id, input.id));

        return result[0] || null;
      } catch (e) {
        console.error("Error getting repertorio:", e);
        return null;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        corPrimaria: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        corSecundaria: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        corFundo: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        corTexto: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        imagemCapa: z.string().optional(),
        publicado: z.number().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;

      await db
        .update(repertoriosAdmin)
        .set(updates)
        .where(eq(repertoriosAdmin.id, id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(musicasRepertorio)
        .where(eq(musicasRepertorio.repertorioId, input.id));

      await db
        .delete(momentosMissa)
        .where(eq(momentosMissa.repertorioId, input.id));

      await db
        .delete(repertoriosAdmin)
        .where(eq(repertoriosAdmin.id, input.id));

      return { success: true };
    }),

  createMomento: protectedProcedure
    .input(
      z.object({
        repertorioId: z.number(),
        nome: z.string().min(1),
        descricao: z.string().optional(),
        ordem: z.number(),
        icone: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(momentosMissa).values(input);
      return { success: true };
    }),

  listMomentos: publicProcedure
    .input(z.object({ repertorioId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db
          .select()
          .from(momentosMissa)
          .where(eq(momentosMissa.repertorioId, input.repertorioId));
        return result || [];
      } catch (e) {
        console.error("Error listing momentos:", e);
        return [];
      }
    }),

  updateMomento: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        ordem: z.number().optional(),
        icone: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;

      await db
        .update(momentosMissa)
        .set(updates)
        .where(eq(momentosMissa.id, id));

      return { success: true };
    }),

  deleteMomento: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(musicasRepertorio)
        .where(eq(musicasRepertorio.momentoId, input.id));

      await db
        .delete(momentosMissa)
        .where(eq(momentosMissa.id, input.id));

      return { success: true };
    }),

  createMusica: protectedProcedure
    .input(
      z.object({
        repertorioId: z.number(),
        momentoId: z.number(),
        titulo: z.string().min(1),
        artista: z.string().optional(),
        descricao: z.string().optional(),
        linkYoutube: z.string().url().optional().or(z.literal("")),
        linkCifra: z.string().url().optional().or(z.literal("")),
        ordem: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(musicasRepertorio).values({
        ...input,
        linkYoutube: input.linkYoutube || null,
        linkCifra: input.linkCifra || null,
      });

      return { success: true };
    }),

  listMusicasPorMomento: publicProcedure
    .input(z.object({ momentoId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db
          .select()
          .from(musicasRepertorio)
          .where(eq(musicasRepertorio.momentoId, input.momentoId));
        return result || [];
      } catch (e) {
        console.error("Error listing musicas:", e);
        return [];
      }
    }),

  listMusicasRepertorio: publicProcedure
    .input(z.object({ repertorioId: z.number() }))
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const result = await db
          .select()
          .from(musicasRepertorio)
          .where(eq(musicasRepertorio.repertorioId, input.repertorioId));
        return result || [];
      } catch (e) {
        console.error("Error listing musicas:", e);
        return [];
      }
    }),

  updateMusica: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        artista: z.string().optional(),
        descricao: z.string().optional(),
        linkYoutube: z.string().url().optional().or(z.literal("")),
        linkCifra: z.string().url().optional().or(z.literal("")),
        ordem: z.number().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;

      if (updates.linkYoutube === "") updates.linkYoutube = null;
      if (updates.linkCifra === "") updates.linkCifra = null;

      await db
        .update(musicasRepertorio)
        .set(updates)
        .where(eq(musicasRepertorio.id, id));

      return { success: true };
    }),

  deleteMusica: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(musicasRepertorio)
        .where(eq(musicasRepertorio.id, input.id));

      return { success: true };
    }),

  reordenarMusicas: protectedProcedure
    .input(
      z.object({
        musicas: z.array(
          z.object({
            id: z.number(),
            ordem: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      for (const musica of input.musicas) {
        await db
          .update(musicasRepertorio)
          .set({ ordem: musica.ordem })
          .where(eq(musicasRepertorio.id, musica.id));
      }

      return { success: true };
    }),

  incrementarVisualizacoes: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const repertorio = await db
          .select()
          .from(repertoriosAdmin)
          .where(eq(repertoriosAdmin.id, input.id));

        if (!repertorio[0]) return { success: false };

        const novasVisualizacoes = (repertorio[0].visualizacoes || 0) + 1;

        await db
          .update(repertoriosAdmin)
          .set({ visualizacoes: novasVisualizacoes })
          .where(eq(repertoriosAdmin.id, input.id));

        return { success: true, visualizacoes: novasVisualizacoes };
      } catch (e) {
        console.error("Error incrementing visualizacoes:", e);
        return { success: false };
      }
    }),

  // Incrementar cliques em músicas
  incrementarCliqueMusica: publicProcedure
    .input(
      z.object({
        musicaId: z.number(),
        tipo: z.enum(["youtube", "cifra"]),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const musica = await db
          .select()
          .from(musicasRepertorio)
          .where(eq(musicasRepertorio.id, input.musicaId));

        if (!musica[0]) return { success: false };

        const campo = input.tipo === "youtube" ? "cliquesYoutube" : "cliquesCifra";
        const novosCliques = (musica[0][campo] || 0) + 1;

        await db
          .update(musicasRepertorio)
          .set({ [campo]: novosCliques })
          .where(eq(musicasRepertorio.id, input.musicaId));

        return { success: true, cliques: novosCliques };
      } catch (e) {
        console.error("Error incrementing clique:", e);
        return { success: false };
      }
    }),

  // Atualizar tempo litúrgico
  updateTempoLiturgico: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tempoLiturgico: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .update(repertoriosAdmin)
          .set({ tempoLiturgico: input.tempoLiturgico })
          .where(eq(repertoriosAdmin.id, input.id));

        return { success: true };
      } catch (e) {
        console.error("Error updating tempo liturgico:", e);
        return { success: false };
      }
    }),

  getMusicasAdminMaisClicadas: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const musicas = await db
          .select({
            id: musicasRepertorio.id,
            titulo: musicasRepertorio.titulo,
            artista: musicasRepertorio.artista,
            cliquesYoutube: musicasRepertorio.cliquesYoutube,
            cliquesCifra: musicasRepertorio.cliquesCifra,
            repertorioId: musicasRepertorio.repertorioId,
          })
          .from(musicasRepertorio);

        const musicasComTotal = musicas.map((m: any) => ({
          ...m,
          totalCliques: (m.cliquesYoutube || 0) + (m.cliquesCifra || 0),
        }));

        return musicasComTotal
          .sort((a: any, b: any) => b.totalCliques - a.totalCliques)
          .slice(0, input.limit);
      } catch (e) {
        console.error("Error getting musicas admin mais clicadas:", e);
        return [];
      }
    }),

  incrementarCompartilhamentos: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        await db
          .update(repertoriosAdmin)
          .set({ compartilhamentos: sql`compartilhamentos + 1` })
          .where(eq(repertoriosAdmin.id, input.id));

        return { success: true };
      } catch (e) {
        console.error("Error incrementing compartilhamentos:", e);
        return { success: false };
      }
    }),
});
