import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq, like, or, desc, sql, count } from "drizzle-orm";

// Email do superadmin - único usuário com acesso ao painel de administração
const SUPERADMIN_EMAIL = "fortuna590@gmail.com";

// Função para verificar se é superadmin
const isSuperAdmin = (email: string | null | undefined): boolean => {
  return email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
};

export const adminRouter = router({
  // Verificar se o usuário atual é superadmin
  checkSuperAdmin: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      console.log("[Admin] Usuario nao autenticado");
      return { isSuperAdmin: false };
    }
    const isAdmin = isSuperAdmin(ctx.user.email);
    console.log("[Admin] Email do usuario:", ctx.user.email);
    console.log("[Admin] E superadmin?", isAdmin);
    console.log("[Admin] Email esperado:", SUPERADMIN_EMAIL);
    return {
      isSuperAdmin: isAdmin,
    };
  }),

  // Listar todos os usuários com paginação e busca
  listUsers: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verificar se é superadmin
      if (!ctx.user || !isSuperAdmin(ctx.user.email)) {
        throw new Error("Acesso negado. Apenas o superadmin pode acessar esta área.");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offset = (input.page - 1) * input.limit;

      // Construir query base
      let whereClause = undefined;
      if (input.search) {
        const searchTerm = `%${input.search}%`;
        whereClause = or(
          like(users.name, searchTerm),
          like(users.email, searchTerm)
        );
      }

      // Buscar usuários
      const usersList = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(offset);

      // Contar total
      const totalResult = await db
        .select({ count: count() })
        .from(users)
        .where(whereClause);

      const total = totalResult[0]?.count || 0;

      return {
        users: usersList,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  // Obter estatísticas de usuários
  getStats: publicProcedure.query(async ({ ctx }) => {
    // Verificar se é superadmin
    if (!ctx.user || !isSuperAdmin(ctx.user.email)) {
      throw new Error("Acesso negado. Apenas o superadmin pode acessar esta área.");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Total de usuários
    const totalResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalResult[0]?.count || 0;

    // Usuários nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentResult = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${sevenDaysAgo.toISOString()}`);
    const recentUsers = recentResult[0]?.count || 0;

    // Usuários nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthResult = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${thirtyDaysAgo.toISOString()}`);
    const monthUsers = monthResult[0]?.count || 0;

    // Usuários por dia nos últimos 7 dias
    const dailyStats = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(sql`${users.createdAt} >= ${sevenDaysAgo.toISOString()}`)
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    return {
      totalUsers,
      recentUsers, // últimos 7 dias
      monthUsers, // últimos 30 dias
      dailyStats,
    };
  }),

  // Obter detalhes de um usuário específico
  getUserDetails: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verificar se é superadmin
      if (!ctx.user || !isSuperAdmin(ctx.user.email)) {
        throw new Error("Acesso negado. Apenas o superadmin pode acessar esta área.");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const user = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user[0]) {
        throw new Error("Usuário não encontrado");
      }

      return user[0];
    }),
});
