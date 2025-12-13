import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { depoimentos } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const depoimentosRouter = router({
  // Criar novo depoimento (público - fica pendente de aprovação)
  create: publicProcedure
    .input(
      z.object({
        nomeAutor: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        emailAutor: z.string().email("Email inválido"),
        organizacao: z.string().optional(),
        mensagem: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
        rating: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(depoimentos).values({
        ...input,
        aprovado: 0, // Pendente de aprovação
      });

      return {
        success: true,
        id: result.insertId,
        message: "Depoimento enviado com sucesso! Será publicado após aprovação.",
      };
    }),

  // Listar depoimentos aprovados (público)
  listApproved: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const approved = await db
      .select()
      .from(depoimentos)
      .where(eq(depoimentos.aprovado, 1))
      .orderBy(desc(depoimentos.createdAt));

    return approved;
  }),

  // Listar depoimentos pendentes (admin)
  listPending: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const pending = await db
      .select()
      .from(depoimentos)
      .where(eq(depoimentos.aprovado, 0))
      .orderBy(desc(depoimentos.createdAt));

    return pending;
  }),

  // Aprovar depoimento (admin)
  approve: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(depoimentos)
        .set({ aprovado: 1 })
        .where(eq(depoimentos.id, input.id));

      return { success: true, message: "Depoimento aprovado com sucesso!" };
    }),

  // Deletar depoimento (admin)
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(depoimentos).where(eq(depoimentos.id, input.id));

      return { success: true, message: "Depoimento deletado com sucesso!" };
    }),
});
