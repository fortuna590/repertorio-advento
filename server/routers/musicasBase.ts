import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { musicasRepertorioBase } from "../../drizzle/schema";
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
        observacao: z.string().optional(),
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
        observacao: input.observacao || null,
        ordem: input.ordem || 999,
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
        observacao: z.string().optional(),
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

      await db
        .update(musicasRepertorioBase)
        .set({
          ...data,
          youtube: data.youtube || null,
          cifra: data.cifra || null,
        })
        .where(eq(musicasRepertorioBase.id, id));

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

      await db.delete(musicasRepertorioBase).where(eq(musicasRepertorioBase.id, input.id));

      return { success: true };
    }),
});
