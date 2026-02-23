import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { musicasRepertorioBase, historicoMusicasBase } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const musicasBaseRouter = router({
  // Listar músicas adicionais de um repertório/momento
  listar: publicProcedure
    .input(
      z.object({
        repertorioId: z.string(),
        momentoId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(musicasRepertorioBase.repertorioId, input.repertorioId)];
      
      if (input.momentoId) {
        conditions.push(eq(musicasRepertorioBase.momentoId, input.momentoId));
      }

      const musicas = await db
        .select()
        .from(musicasRepertorioBase)
        .where(and(...conditions))
        .orderBy(musicasRepertorioBase.ordem);

      return musicas;
    }),

  // Adicionar música
  adicionar: protectedProcedure
    .input(
      z.object({
        repertorioId: z.string(),
        momentoId: z.string(),
        titulo: z.string(),
        artista: z.string().optional(),
        youtube: z.string().url().optional().or(z.literal("")),
        cifra: z.string().url().optional().or(z.literal("")),
        ordem: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem adicionar músicas",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const [musica] = await db.insert(musicasRepertorioBase).values({
        repertorioId: input.repertorioId,
        momentoId: input.momentoId,
        titulo: input.titulo,
        artista: input.artista || null,
        youtube: input.youtube || null,
        cifra: input.cifra || null,
        ordem: input.ordem || 999,
      });

      // Registrar no histórico
      await db.insert(historicoMusicasBase).values({
        musicaId: Number(musica.insertId),
        repertorioId: input.repertorioId,
        momentoId: input.momentoId,
        usuarioId: ctx.user.id,
        usuarioNome: ctx.user.name,
        acao: "adicionar",
        dadosNovos: JSON.stringify({
          titulo: input.titulo,
          artista: input.artista,
          youtube: input.youtube,
          cifra: input.cifra,
          ordem: input.ordem || 999,
        }),
      });

      return { success: true, id: musica.insertId };
    }),

  // Editar música
  editar: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        artista: z.string().optional(),
        youtube: z.string().url().optional().or(z.literal("")),
        cifra: z.string().url().optional().or(z.literal("")),
        ordem: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem editar músicas",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const { id, ...data } = input;

      // Buscar dados antigos
      const [musicaAntiga] = await db
        .select()
        .from(musicasRepertorioBase)
        .where(eq(musicasRepertorioBase.id, id))
        .limit(1);

      await db
        .update(musicasRepertorioBase)
        .set({
          ...data,
          youtube: data.youtube || null,
          cifra: data.cifra || null,
        })
        .where(eq(musicasRepertorioBase.id, id));

      // Registrar no histórico
      if (musicaAntiga) {
        await db.insert(historicoMusicasBase).values({
          musicaId: id,
          repertorioId: musicaAntiga.repertorioId,
          momentoId: musicaAntiga.momentoId,
          usuarioId: ctx.user.id,
          usuarioNome: ctx.user.name,
          acao: "editar",
          dadosAntigos: JSON.stringify(musicaAntiga),
          dadosNovos: JSON.stringify({ ...musicaAntiga, ...data }),
        });
      }

      return { success: true };
    }),

  // Remover música
  remover: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem remover músicas",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      // Buscar dados antes de remover
      const [musicaRemovida] = await db
        .select()
        .from(musicasRepertorioBase)
        .where(eq(musicasRepertorioBase.id, input.id))
        .limit(1);

      await db.delete(musicasRepertorioBase).where(eq(musicasRepertorioBase.id, input.id));

      // Registrar no histórico
      if (musicaRemovida) {
        await db.insert(historicoMusicasBase).values({
          musicaId: input.id,
          repertorioId: musicaRemovida.repertorioId,
          momentoId: musicaRemovida.momentoId,
          usuarioId: ctx.user.id,
          usuarioNome: ctx.user.name,
          acao: "remover",
          dadosAntigos: JSON.stringify(musicaRemovida),
        });
      }

      return { success: true };
    }),

  // Reordenar músicas
  reordenar: protectedProcedure
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
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem reordenar músicas",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      // Atualizar ordem de cada música
      for (const musica of input.musicas) {
        await db
          .update(musicasRepertorioBase)
          .set({ ordem: musica.ordem })
          .where(eq(musicasRepertorioBase.id, musica.id));
      }

      return { success: true };
    }),
});
