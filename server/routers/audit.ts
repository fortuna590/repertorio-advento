import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { auditLogs } from "../../drizzle/schema";
import { desc, and, gte, lte, eq, sql } from "drizzle-orm";

/**
 * Helper function to register audit log
 */
export async function registrarLog(params: {
  userId: number;
  userName: string;
  userRole: "admin" | "moderator";
  action: string;
  targetType: string;
  targetId: number;
  targetName?: string;
  details?: any;
}) {
  try {
    const db = await getDb();
    if (!db) return false;
    await db.insert(auditLogs).values({
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      targetName: params.targetName,
      details: params.details ? JSON.stringify(params.details) : null,
    });
    return true;
  } catch (error) {
    console.error("[Audit] Erro ao registrar log:", error);
    return false;
  }
}

export const auditRouter = router({
  /**
   * Listar logs de auditoria com filtros
   */
  listar: adminProcedure
    .input(
      z.object({
        action: z.string().optional(),
        targetType: z.string().optional(),
        userId: z.number().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];

      if (input.action) {
        conditions.push(eq(auditLogs.action, input.action));
      }

      if (input.targetType) {
        conditions.push(eq(auditLogs.targetType, input.targetType));
      }

      if (input.userId) {
        conditions.push(eq(auditLogs.userId, input.userId));
      }

      if (input.dataInicio) {
        conditions.push(gte(auditLogs.createdAt, new Date(input.dataInicio)));
      }

      if (input.dataFim) {
        conditions.push(lte(auditLogs.createdAt, new Date(input.dataFim)));
      }

      const logs = await db
        .select()
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(auditLogs.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return logs.map((log: any) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      }));
    }),

  /**
   * Obter estatísticas de logs
   */
  estatisticas: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, porAcao: [], topUsuarios: [] };

    const totalLogs = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs);

    const logsPorAcao = await db
      .select({
        action: auditLogs.action,
        count: sql<number>`count(*)`,
      })
      .from(auditLogs)
      .groupBy(auditLogs.action);

    const logsPorUsuario = await db
      .select({
        userId: auditLogs.userId,
        userName: auditLogs.userName,
        count: sql<number>`count(*)`,
      })
      .from(auditLogs)
      .groupBy(auditLogs.userId, auditLogs.userName)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    return {
      total: totalLogs[0]?.count || 0,
      porAcao: logsPorAcao,
      topUsuarios: logsPorUsuario,
    };
  }),
});
