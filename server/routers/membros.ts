import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { membros, equipes, disponibilidades, indisponibilidades } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const membrosRouter = router({
  /**
   * Listar membros de uma equipe
   */
  listarPorEquipe: protectedProcedure
    .input(z.object({ equipeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se a equipe pertence ao usuário
      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, input.equipeId), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Equipe não encontrada");
      }

      const resultado = await db
        .select()
        .from(membros)
        .where(eq(membros.equipeId, input.equipeId))
        .orderBy(desc(membros.createdAt));

      return resultado;
    }),

  /**
   * Buscar membro por ID
   */
  buscarPorId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [membro] = await db
        .select()
        .from(membros)
        .where(eq(membros.id, input.id));

      if (!membro) {
        throw new Error("Membro não encontrado");
      }

      // Verificar se a equipe do membro pertence ao usuário
      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, membro.equipeId), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Acesso negado");
      }

      // Buscar disponibilidades
      const disponibilidadesMembro = await db
        .select()
        .from(disponibilidades)
        .where(eq(disponibilidades.membroId, input.id));

      // Buscar indisponibilidades
      const indisponibilidadesMembro = await db
        .select()
        .from(indisponibilidades)
        .where(eq(indisponibilidades.membroId, input.id));

      return {
        ...membro,
        disponibilidades: disponibilidadesMembro,
        indisponibilidades: indisponibilidadesMembro,
      };
    }),

  /**
   * Criar novo membro
   */
  criar: protectedProcedure
    .input(
      z.object({
        equipeId: z.number(),
        nome: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido").optional(),
        telefone: z.string().optional(),
        funcao: z.string().optional(),
        instrumento: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se a equipe pertence ao usuário
      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, input.equipeId), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Equipe não encontrada");
      }

      const [resultado] = await db.insert(membros).values({
        equipeId: input.equipeId,
        nome: input.nome,
        email: input.email || null,
        telefone: input.telefone || null,
        funcao: input.funcao || null,
        instrumento: input.instrumento || null,
        observacoes: input.observacoes || null,
        status: "ativo",
      });

      return {
        membroId: Number(resultado.insertId),
        mensagem: "Membro adicionado com sucesso",
      };
    }),

  /**
   * Atualizar membro
   */
  atualizar: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido").optional(),
        telefone: z.string().optional(),
        funcao: z.string().optional(),
        instrumento: z.string().optional(),
        status: z.enum(["ativo", "inativo"]),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o membro existe e pertence a uma equipe do usuário
      const [membro] = await db
        .select()
        .from(membros)
        .where(eq(membros.id, input.id));

      if (!membro) {
        throw new Error("Membro não encontrado");
      }

      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, membro.equipeId), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Acesso negado");
      }

      await db
        .update(membros)
        .set({
          nome: input.nome,
          email: input.email || null,
          telefone: input.telefone || null,
          funcao: input.funcao || null,
          instrumento: input.instrumento || null,
          status: input.status,
          observacoes: input.observacoes || null,
        })
        .where(eq(membros.id, input.id));

      return { mensagem: "Membro atualizado com sucesso" };
    }),

  /**
   * Deletar membro
   */
  deletar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o membro existe e pertence a uma equipe do usuário
      const [membro] = await db
        .select()
        .from(membros)
        .where(eq(membros.id, input.id));

      if (!membro) {
        throw new Error("Membro não encontrado");
      }

      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, membro.equipeId), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Acesso negado");
      }

      await db.delete(membros).where(eq(membros.id, input.id));

      return { mensagem: "Membro removido com sucesso" };
    }),

  /**
   * Atualizar disponibilidades do membro
   */
  atualizarDisponibilidades: protectedProcedure
    .input(
      z.object({
        membroId: z.number(),
        disponibilidades: z.array(
          z.object({
            diaSemana: z.number().min(0).max(6),
            periodo: z.enum(["manha", "tarde", "noite", "dia_todo"]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar acesso
      const [membro] = await db
        .select()
        .from(membros)
        .where(eq(membros.id, input.membroId));

      if (!membro) {
        throw new Error("Membro não encontrado");
      }

      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, membro.equipeId), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Acesso negado");
      }

      // Deletar disponibilidades antigas
      await db.delete(disponibilidades).where(eq(disponibilidades.membroId, input.membroId));

      // Inserir novas disponibilidades
      if (input.disponibilidades.length > 0) {
        await db.insert(disponibilidades).values(
          input.disponibilidades.map((disp) => ({
            membroId: input.membroId,
            diaSemana: disp.diaSemana,
            periodo: disp.periodo,
          }))
        );
      }

      return { mensagem: "Disponibilidades atualizadas com sucesso" };
    }),

  /**
   * Adicionar indisponibilidade
   */
  adicionarIndisponibilidade: protectedProcedure
    .input(
      z.object({
        membroId: z.number(),
        dataInicio: z.string(),
        dataFim: z.string(),
        motivo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar acesso
      const [membro] = await db
        .select()
        .from(membros)
        .where(eq(membros.id, input.membroId));

      if (!membro) {
        throw new Error("Membro não encontrado");
      }

      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, membro.equipeId), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Acesso negado");
      }

      const [resultado] = await db.insert(indisponibilidades).values({
        membroId: input.membroId,
        dataInicio: new Date(input.dataInicio),
        dataFim: new Date(input.dataFim),
        motivo: input.motivo || null,
      });

      return {
        indisponibilidadeId: Number(resultado.insertId),
        mensagem: "Indisponibilidade adicionada com sucesso",
      };
    }),

  /**
   * Remover indisponibilidade
   */
  removerIndisponibilidade: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar indisponibilidade e verificar acesso
      const [indisponibilidade] = await db
        .select()
        .from(indisponibilidades)
        .where(eq(indisponibilidades.id, input.id));

      if (!indisponibilidade) {
        throw new Error("Indisponibilidade não encontrada");
      }

      const [membro] = await db
        .select()
        .from(membros)
        .where(eq(membros.id, indisponibilidade.membroId));

      if (!membro) {
        throw new Error("Membro não encontrado");
      }

      const [equipe] = await db
        .select()
        .from(equipes)
        .where(and(eq(equipes.id, membro.equipeId), eq(equipes.userId, ctx.user.id)));

      if (!equipe) {
        throw new Error("Acesso negado");
      }

      await db.delete(indisponibilidades).where(eq(indisponibilidades.id, input.id));

      return { mensagem: "Indisponibilidade removida com sucesso" };
    }),
});
