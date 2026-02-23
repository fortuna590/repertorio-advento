import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { equipes, membros } from "../../drizzle/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

export const equipesRouter = router({
  /**
   * Listar todas as equipes do usuário logado
   */
  listar: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const resultado = await db
      .select({
        id: equipes.id,
        nome: equipes.nome,
        tipo: equipes.tipo,
        descricao: equipes.descricao,
        createdAt: equipes.createdAt,
        updatedAt: equipes.updatedAt,
      })
      .from(equipes)
      .where(eq(equipes.userId, ctx.user.id))
      .orderBy(desc(equipes.createdAt));

    // Contar membros de cada equipe
    const equipesComMembros = await Promise.all(
      resultado.map(async (equipe) => {
        const [{ totalMembros }] = await db
          .select({ totalMembros: count() })
          .from(membros)
          .where(eq(membros.equipeId, equipe.id));
        
        return {
          ...equipe,
          totalMembros: Number(totalMembros) || 0,
        };
      })
    );

    return equipesComMembros;
  }),

  /**
   * Buscar equipe por ID
   */
  buscarPorId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, input.id), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Equipe não encontrada");
      }

      return equipe;
    }),

  /**
   * Criar nova equipe
   */
  criar: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        tipo: z.enum(["musica", "grupo_oracao", "leitura", "acolhida", "outro"]),
        descricao: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [resultado] = await db.insert(equipes).values({
        userId: ctx.user.id,
        nome: input.nome,
        tipo: input.tipo,
        descricao: input.descricao || null,
      });

      return {
        equipeId: Number(resultado.insertId),
        mensagem: "Equipe criada com sucesso",
      };
    }),

  /**
   * Atualizar equipe
   */
  atualizar: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1, "Nome é obrigatório"),
        tipo: z.enum(["musica", "grupo_oracao", "leitura", "acolhida", "outro"]),
        descricao: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se a equipe pertence ao usuário
      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, input.id), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Equipe não encontrada");
      }

      await db
        .update(equipes)
        .set({
          nome: input.nome,
          tipo: input.tipo,
          descricao: input.descricao || null,
        })
        .where(eq(equipes.id, input.id));

      return { mensagem: "Equipe atualizada com sucesso" };
    }),

  /**
   * Deletar equipe
   */
  deletar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se a equipe pertence ao usuário
      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, input.id), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Equipe não encontrada");
      }

      await db.delete(equipes).where(eq(equipes.id, input.id));

      return { mensagem: "Equipe deletada com sucesso" };
    }),
});
