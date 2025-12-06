import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createDepoimento, getAllDepoimentos, deleteDepoimento, approveDepoimento, getPendingDepoimentos } from "../db";

export const depoimentosRouter = router({
  // Listar todos os depoimentos aprovados
  list: publicProcedure.query(async () => {
    return await getAllDepoimentos();
  }),

  // Criar novo depoimento (pendente de aprovação)
  create: publicProcedure
    .input(
      z.object({
        nomeAutor: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        emailAutor: z.string().email("Email inválido"),
        organizacao: z.string().optional(),
        mensagem: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
        rating: z.number().min(1).max(5, "Rating deve ser entre 1 e 5"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const novoDepoimento = await createDepoimento({
          nomeAutor: input.nomeAutor,
          emailAutor: input.emailAutor,
          organizacao: input.organizacao || null,
          mensagem: input.mensagem,
          rating: input.rating,
          aprovado: 0, // Começa como pendente
        });

        return {
          success: true,
          depoimento: novoDepoimento,
          message: "Depoimento enviado com sucesso! Será revisado e publicado em breve.",
        };
      } catch (error) {
        console.error("Erro ao criar depoimento:", error);
        throw new Error("Falha ao enviar depoimento");
      }
    }),

  // Listar depoimentos pendentes (admin)
  getPending: publicProcedure.query(async () => {
    return await getPendingDepoimentos();
  }),

  // Aprovar depoimento (admin)
  approve: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await approveDepoimento(input.id);
        return { success: true, message: "Depoimento aprovado com sucesso" };
      } catch (error) {
        console.error("Erro ao aprovar depoimento:", error);
        throw new Error("Falha ao aprovar depoimento");
      }
    }),

  // Deletar depoimento (admin)
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await deleteDepoimento(input.id);
        return { success: true, message: "Depoimento deletado com sucesso" };
      } catch (error) {
        console.error("Erro ao deletar depoimento:", error);
        throw new Error("Falha ao deletar depoimento");
      }
    }),
});
