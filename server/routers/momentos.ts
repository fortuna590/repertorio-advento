import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import * as dbMomentos from "../db/momentos";

export const momentosRouter = router({
  // Tipos de Repertório
  listarTipos: publicProcedure.query(async () => {
    return dbMomentos.listarTiposRepertorio();
  }),

  criarTipo: adminProcedure
    .input(z.object({
      nome: z.string().min(1),
      descricao: z.string().optional(),
      ordem: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      return dbMomentos.criarTipoRepertorio({
        nome: input.nome,
        descricao: input.descricao,
        ordem: input.ordem,
        ativo: true,
      });
    }),

  atualizarTipo: adminProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      descricao: z.string().optional(),
      ordem: z.number().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await dbMomentos.atualizarTipoRepertorio(id, data);
      return { success: true };
    }),

  deletarTipo: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await dbMomentos.deletarTipoRepertorio(input.id);
      return { success: true };
    }),

  // Momentos
  listarPorTipo: publicProcedure
    .input(z.object({ tipoRepertorioId: z.number() }))
    .query(async ({ input }) => {
      return dbMomentos.listarMomentosPorTipo(input.tipoRepertorioId);
    }),

  listarTodos: publicProcedure.query(async () => {
    return dbMomentos.listarTodosMomentos();
  }),

  criar: adminProcedure
    .input(z.object({
      tipoRepertorioId: z.number(),
      nome: z.string().min(1),
      descricao: z.string().optional(),
      ordem: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      return dbMomentos.criarMomento({
        tipoRepertorioId: input.tipoRepertorioId,
        nome: input.nome,
        descricao: input.descricao,
        ordem: input.ordem,
        ativo: true,
      });
    }),

  atualizar: adminProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      descricao: z.string().optional(),
      ordem: z.number().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await dbMomentos.atualizarMomento(id, data);
      return { success: true };
    }),

  deletar: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await dbMomentos.deletarMomento(input.id);
      return { success: true };
    }),
});
