import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { escalas, funcoesEscala, participantesEscala } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export const escalasRouter = router({
  // Criar nova escala
  criar: publicProcedure
    .input(z.object({
      userId: z.string(),
      titulo: z.string(),
      descricao: z.string().optional(),
      data: z.string(), // formato YYYY-MM-DD
      hora: z.string().optional(),
      local: z.string().optional(),
      tipo: z.enum(["musicos", "reuniao", "grupo_oracao", "personalizado"]),
      template: z.string().optional(),
      funcoes: z.array(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        ordem: z.number(),
      })),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Criar escala
      const [escala] = await db.insert(escalas).values({
        userId: input.userId,
        titulo: input.titulo,
        descricao: input.descricao,
        data: input.data,
        hora: input.hora,
        local: input.local,
        tipo: input.tipo,
        template: input.template,
      });

      // Criar funções
      if (input.funcoes.length > 0) {
        await db.insert(funcoesEscala).values(
          input.funcoes.map((funcao: any) => ({
            escalaId: escala.insertId,
            nome: funcao.nome,
            descricao: funcao.descricao,
            ordem: funcao.ordem,
          }))
        );
      }

      return { success: true, escalaId: escala.insertId };
    }),

  // Listar escalas do usuário
  listar: publicProcedure
    .input(z.object({
      userId: z.string(),
      tipo: z.enum(["musicos", "reuniao", "grupo_oracao", "personalizado", "todos"]).optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(escalas.userId, input.userId)];

      // Filtrar por tipo
      if (input.tipo && input.tipo !== "todos") {
        conditions.push(eq(escalas.tipo, input.tipo));
      }

      // Filtrar por data
      if (input.dataInicio) {
        conditions.push(gte(escalas.data, input.dataInicio));
      }

      if (input.dataFim) {
        conditions.push(lte(escalas.data, input.dataFim));
      }

      const result = await db.select().from(escalas).where(and(...conditions)).orderBy(desc(escalas.data));
      return result;
    }),

  // Buscar escala por ID com funções e participantes
  buscarPorId: publicProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [escala] = await db.select().from(escalas).where(eq(escalas.id, input.escalaId));
      
      if (!escala) {
        throw new Error("Escala não encontrada");
      }

      const funcoes = await db.select().from(funcoesEscala).where(eq(funcoesEscala.escalaId, input.escalaId));
      const participantes = await db.select().from(participantesEscala).where(eq(participantesEscala.escalaId, input.escalaId));

      return {
        ...escala,
        funcoes,
        participantes,
      };
    }),

  // Atualizar escala
  atualizar: publicProcedure
    .input(z.object({
      escalaId: z.number(),
      titulo: z.string().optional(),
      descricao: z.string().optional(),
      data: z.string().optional(),
      hora: z.string().optional(),
      local: z.string().optional(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { escalaId, ...updates } = input;
      await db.update(escalas).set(updates).where(eq(escalas.id, escalaId));
      return { success: true };
    }),

  // Deletar escala
  deletar: publicProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(escalas).where(eq(escalas.id, input.escalaId));
      return { success: true };
    }),

  // Adicionar participante
  adicionarParticipante: publicProcedure
    .input(z.object({
      escalaId: z.number(),
      funcaoId: z.number(),
      nome: z.string(),
      email: z.string().optional(),
      telefone: z.string().optional(),
      status: z.enum(["confirmado", "pendente", "ausente"]).default("pendente"),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(participantesEscala).values(input);
      return { success: true };
    }),

  // Atualizar participante
  atualizarParticipante: publicProcedure
    .input(z.object({
      participanteId: z.number(),
      nome: z.string().optional(),
      email: z.string().optional(),
      telefone: z.string().optional(),
      status: z.enum(["confirmado", "pendente", "ausente"]).optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { participanteId, ...updates } = input;
      await db.update(participantesEscala).set(updates).where(eq(participantesEscala.id, participanteId));
      return { success: true };
    }),

  // Remover participante
  removerParticipante: publicProcedure
    .input(z.object({
      participanteId: z.number(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(participantesEscala).where(eq(participantesEscala.id, input.participanteId));
      return { success: true };
    }),

  // Atualizar status de participante
  atualizarStatus: publicProcedure
    .input(z.object({
      participanteId: z.number(),
      status: z.enum(["confirmado", "pendente", "ausente"]),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(participantesEscala)
        .set({ status: input.status })
        .where(eq(participantesEscala.id, input.participanteId));
      return { success: true };
    }),
});
