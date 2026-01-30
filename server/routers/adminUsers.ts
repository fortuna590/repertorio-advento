import { z } from "zod";
import { adminProcedure, moderatorProcedure, router } from "../_core/trpc";
import { registrarLog } from "./audit";
import { users, escalas, participantesEscala, repertorios, historicoMusicasBase } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, like, or, desc, gte, sql } from "drizzle-orm";
import { sendEmail } from "../_core/email";

export const adminUsersRouter = router({
  // Listar todos os usuários com filtros
  listar: adminProcedure
    .input(z.object({
      busca: z.string().optional(),
      role: z.enum(["all", "admin", "moderator", "user"]).optional(),
      status: z.enum(["all", "active", "suspended"]).optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];

      // Filtro de busca por nome ou email
      if (input.busca) {
        conditions.push(
          or(
            like(users.name, `%${input.busca}%`),
            like(users.email, `%${input.busca}%`)
          )
        );
      }

      // Filtro por role
      if (input.role && input.role !== "all") {
        conditions.push(eq(users.role, input.role));
      }

      // Filtro por status
      if (input.status && input.status !== "all") {
        conditions.push(eq(users.status, input.status));
      }

      // Filtro por data de cadastro
      if (input.dataInicio) {
        conditions.push(gte(users.createdAt, new Date(input.dataInicio)));
      }

      const todosUsuarios = await db
        .select()
        .from(users)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
        .orderBy(desc(users.createdAt));

      return todosUsuarios;
    }),

  // Obter estatísticas gerais de usuários
  estatisticasGerais: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return { total: 0, novosNoMes: 0, ativos: 0, suspensos: 0 };

      const todosUsuarios = await db.select().from(users);
      
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      
      const novosNoMes = todosUsuarios.filter(u => 
        new Date(u.createdAt) >= inicioMes
      ).length;

      const ativos = todosUsuarios.filter(u => u.status === "active").length;
      const suspensos = todosUsuarios.filter(u => u.status === "suspended").length;

      return {
        total: todosUsuarios.length,
        novosNoMes,
        ativos,
        suspensos,
      };
    }),

  // Obter detalhes e estatísticas de um usuário específico
  obterDetalhes: adminProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [usuario] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));

      if (!usuario) return null;

      // Buscar escalas criadas pelo usuário
      const escalasCriadas = await db
        .select()
        .from(escalas)
        .where(eq(escalas.userId, usuario.openId));

      // Buscar participações em escalas
      const participacoes = await db
        .select()
        .from(participantesEscala)
        .where(sql`${participantesEscala.userId} = ${usuario.openId}`);

      const confirmados = participacoes.filter(p => p.status === "confirmado").length;
      const ausentes = participacoes.filter(p => p.status === "ausente").length;
      const taxaConfirmacao = participacoes.length > 0
        ? Math.round((confirmados / participacoes.length) * 100)
        : 0;

      return {
        usuario,
        estatisticas: {
          escalasCriadas: escalasCriadas.length,
          participacoes: participacoes.length,
          confirmados,
          ausentes,
          taxaConfirmacao,
        },
      };
    }),

  // Atualizar role do usuário
  atualizarRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "moderator", "admin"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar dados antigos para log
      const usuarioAntigo = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      const oldRole = usuarioAntigo[0]?.role;

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      // Registrar log
      await registrarLog({
        userId: ctx.user.id,
        userName: ctx.user.name || "Admin",
        userRole: ctx.user.role as "admin" | "moderator",
        action: "alterar_role",
        targetType: "user",
        targetId: input.userId,
        targetName: usuarioAntigo[0]?.name || undefined,
        details: { oldRole, newRole: input.role },
      });

      return { success: true };
    }),

  // Suspender ou reativar conta (moderadores podem suspender com justificativa)
  atualizarStatus: moderatorProcedure
    .input(z.object({
      userId: z.number(),
      status: z.enum(["active", "suspended"]),
      motivo: z.string().optional(), // Obrigatório ao suspender
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Validar motivo ao suspender
      if (input.status === "suspended" && !input.motivo) {
        throw new Error("É obrigatório informar o motivo da suspensão");
      }

      // Buscar dados antigos para log
      const usuarioAntigo = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      const oldStatus = usuarioAntigo[0]?.status;

      await db
        .update(users)
        .set({ 
          status: input.status,
          suspensionReason: input.status === "suspended" ? input.motivo : null,
        })
        .where(eq(users.id, input.userId));

      // Registrar log
      await registrarLog({
        userId: ctx.user.id,
        userName: ctx.user.name || "Admin",
        userRole: ctx.user.role as "admin" | "moderator",
        action: input.status === "suspended" ? "suspender" : "ativar",
        targetType: "user",
        targetId: input.userId,
        targetName: usuarioAntigo[0]?.name || undefined,
        details: { oldStatus, newStatus: input.status, motivo: input.motivo },
      });

      return { success: true };
    }),

  // Editar informações do perfil
  editarPerfil: adminProcedure
    .input(z.object({
      userId: z.number(),
      name: z.string().optional(),
      paroquia: z.string().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { userId, ...updates } = input;
      
      await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId));

      return { success: true };
    }),

  // Adicionar/atualizar notas administrativas
  atualizarNotas: adminProcedure
    .input(z.object({
      userId: z.number(),
      adminNotes: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({ adminNotes: input.adminNotes })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Enviar email para usuário
  enviarEmail: adminProcedure
    .input(z.object({
      userId: z.number(),
      assunto: z.string(),
      mensagem: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [usuario] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));

      if (!usuario || !usuario.email) {
        throw new Error("Usuário não encontrado ou sem email");
      }

      await sendEmail({
        to: usuario.email,
        subject: input.assunto,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b5cf6;">LouvaMais</h2>
            <p>${input.mensagem.replace(/\n/g, '<br>')}</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Este email foi enviado pela administração do LouvaMais.
            </p>
          </div>
        `,
      });

      return { success: true };
    }),

  // Excluir usuário permanentemente
  excluir: adminProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se não é o próprio admin
      const [usuario] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));

      if (!usuario) {
        throw new Error("Usuário não encontrado");
      }

      // Excluir dados relacionados antes de excluir o usuário
      // 1. Excluir repertórios do usuário
      await db.delete(repertorios).where(eq(repertorios.userId, input.userId));

      // 2. Excluir participações em escalas (atualizar para null ou excluir)
      await db.delete(participantesEscala).where(eq(participantesEscala.userId, input.userId));

      // 3. Excluir histórico de edições de músicas base
      await db.delete(historicoMusicasBase).where(eq(historicoMusicasBase.usuarioId, input.userId));

      // 4. Registrar log antes de excluir
      await registrarLog({
        userId: ctx.user.id,
        userName: ctx.user.name || "Admin",
        userRole: ctx.user.role as "admin" | "moderator",
        action: "excluir",
        targetType: "user",
        targetId: input.userId,
        targetName: usuario.name || undefined,
        details: { email: usuario.email, role: usuario.role },
      });

      // 5. Finalmente excluir o usuário
      await db
        .delete(users)
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Excluir múltiplos usuários em massa
  excluirEmMassa: adminProcedure
    .input(z.object({
      userIds: z.array(z.number()),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let excluidos = 0;
      let erros = 0;

      for (const userId of input.userIds) {
        try {
          // Buscar dados do usuário para log
          const [usuario] = await db.select().from(users).where(eq(users.id, userId));

          // Excluir dados relacionados
          await db.delete(repertorios).where(eq(repertorios.userId, userId));
          await db.delete(participantesEscala).where(eq(participantesEscala.userId, userId));
          await db.delete(historicoMusicasBase).where(eq(historicoMusicasBase.usuarioId, userId));
          
          // Registrar log
          await registrarLog({
            userId: ctx.user.id,
            userName: ctx.user.name || "Admin",
            userRole: ctx.user.role as "admin" | "moderator",
            action: "excluir_massa",
            targetType: "user",
            targetId: userId,
            targetName: usuario?.name || undefined,
            details: { email: usuario?.email },
          });

          // Excluir usuário
          await db.delete(users).where(eq(users.id, userId));
          excluidos++;
        } catch (error) {
          console.error(`Erro ao excluir usuário ${userId}:`, error);
          erros++;
        }
      }

      return { success: true, excluidos, erros };
    }),

  // Suspender múltiplos usuários em massa
  suspenderEmMassa: adminProcedure
    .input(z.object({
      userIds: z.array(z.number()),
      motivo: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      for (const userId of input.userIds) {
        const [usuario] = await db.select().from(users).where(eq(users.id, userId));

        await db
          .update(users)
          .set({ 
            status: "suspended",
            suspensionReason: input.motivo || "Suspensão em massa",
          })
          .where(eq(users.id, userId));

        // Registrar log
        await registrarLog({
          userId: ctx.user.id,
          userName: ctx.user.name || "Admin",
          userRole: ctx.user.role as "admin" | "moderator",
          action: "suspender_massa",
          targetType: "user",
          targetId: userId,
          targetName: usuario?.name || undefined,
          details: { motivo: input.motivo },
        });
      }

      return { success: true, total: input.userIds.length };
    }),

  // Ativar múltiplos usuários em massa
  ativarEmMassa: adminProcedure
    .input(z.object({
      userIds: z.array(z.number()),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      for (const userId of input.userIds) {
        const [usuario] = await db.select().from(users).where(eq(users.id, userId));

        await db
          .update(users)
          .set({ 
            status: "active",
            suspensionReason: null,
          })
          .where(eq(users.id, userId));

        // Registrar log
        await registrarLog({
          userId: ctx.user.id,
          userName: ctx.user.name || "Admin",
          userRole: ctx.user.role as "admin" | "moderator",
          action: "ativar_massa",
          targetType: "user",
          targetId: userId,
          targetName: usuario?.name || undefined,
          details: {},
        });
      }

      return { success: true, total: input.userIds.length };
    }),
});
