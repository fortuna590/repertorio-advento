import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users, musicasFavoritas, repertorios, depoimentos } from "../../drizzle/schema";
import { eq, like, or, desc, asc, sql, count, gte, lte, and } from "drizzle-orm";

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

  // Listar todos os usuários com paginação, busca, filtros e ordenação
  listUsers: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        sortField: z.enum(["name", "email", "createdAt"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
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

      // Construir condições de filtro
      const conditions = [];
      
      if (input.search) {
        const searchTerm = `%${input.search}%`;
        conditions.push(or(
          like(users.name, searchTerm),
          like(users.email, searchTerm)
        ));
      }

      if (input.dateFrom) {
        conditions.push(gte(users.createdAt, new Date(input.dateFrom)));
      }

      if (input.dateTo) {
        const endDate = new Date(input.dateTo);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lte(users.createdAt, endDate));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Determinar ordenação
      const sortColumn = input.sortField === "name" ? users.name : 
                         input.sortField === "email" ? users.email : 
                         users.createdAt;
      const orderBy = input.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

      // Buscar usuários
      console.log("[Admin] Buscando usuários com filtros:", {
        page: input.page,
        limit: input.limit,
        search: input.search,
        sortField: input.sortField,
        sortOrder: input.sortOrder,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        offset,
        whereClause: whereClause ? "com filtros" : "sem filtros"
      });

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
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(offset);

      console.log("[Admin] Usuários encontrados:", usersList.length);

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

  // Estatísticas avançadas
  getAdvancedStats: publicProcedure.query(async ({ ctx }) => {
    // Verificar se é superadmin
    if (!ctx.user || !isSuperAdmin(ctx.user.email)) {
      throw new Error("Acesso negado. Apenas o superadmin pode acessar esta área.");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Total de favoritos
    const favoritosResult = await db.select({ count: count() }).from(musicasFavoritas);
    const totalFavorites = favoritosResult[0]?.count || 0;

    // Total de repertórios
    const repertoriosResult = await db.select({ count: count() }).from(repertorios);
    const totalRepertorios = repertoriosResult[0]?.count || 0;

    // Total de depoimentos
    const depoimentosResult = await db.select({ count: count() }).from(depoimentos);
    const totalDepoimentos = depoimentosResult[0]?.count || 0;

    // Taxa de retenção (usuários que criaram repertório ou favoritaram nos últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsersResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${musicasFavoritas.userId})` })
      .from(musicasFavoritas)
      .where(sql`${musicasFavoritas.createdAt} >= ${thirtyDaysAgo.toISOString()}`);
    
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 1;
    const activeUsers = activeUsersResult[0]?.count || 0;
    const retentionRate = Math.round((activeUsers / totalUsers) * 100);

    // Crescimento mensal (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await db
      .select({
        month: sql<string>`DATE_FORMAT(${users.createdAt}, '%Y-%m')`,
        count: count(),
      })
      .from(users)
      .where(sql`${users.createdAt} >= ${sixMonthsAgo.toISOString()}`)
      .groupBy(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${users.createdAt}, '%Y-%m')`);

    // Músicas mais favoritadas
    const topMusicasRaw = await db
      .select({
        titulo: musicasFavoritas.titulo,
        artista: musicasFavoritas.artista,
        count: count(),
      })
      .from(musicasFavoritas)
      .groupBy(musicasFavoritas.titulo, musicasFavoritas.artista)
      .orderBy(desc(count()))
      .limit(10);

    // Converter artista null para string vazia
    const topMusicas = topMusicasRaw.map(m => ({
      titulo: m.titulo,
      artista: m.artista || "",
      count: m.count,
    }));

    return {
      totalFavorites,
      totalRepertorios,
      totalDepoimentos,
      retentionRate,
      monthlyGrowth,
      topMusicas,
    };
  }),

  // Enviar email em massa
  sendBulkEmail: publicProcedure
    .input(
      z.object({
        subject: z.string().min(1),
        body: z.string().min(1),
        recipients: z.enum(["all", "selected", "filtered"]),
        selectedUserIds: z.array(z.number()).optional(),
        filters: z.object({
          search: z.string().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é superadmin
      if (!ctx.user || !isSuperAdmin(ctx.user.email)) {
        throw new Error("Acesso negado. Apenas o superadmin pode acessar esta área.");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar emails dos destinatários
      let emailList: string[] = [];

      if (input.recipients === "all") {
        const allUsers = await db.select({ email: users.email }).from(users);
        emailList = allUsers.map(u => u.email).filter((e): e is string => e !== null);
      } else if (input.recipients === "selected" && input.selectedUserIds) {
        const selectedUsers = await db
          .select({ email: users.email })
          .from(users)
          .where(sql`${users.id} IN (${input.selectedUserIds.join(",")})`);
        emailList = selectedUsers.map(u => u.email).filter((e): e is string => e !== null);
      } else if (input.recipients === "filtered" && input.filters) {
        const conditions = [];
        
        if (input.filters.search) {
          const searchTerm = `%${input.filters.search}%`;
          conditions.push(or(
            like(users.name, searchTerm),
            like(users.email, searchTerm)
          ));
        }

        if (input.filters.dateFrom) {
          conditions.push(gte(users.createdAt, new Date(input.filters.dateFrom)));
        }

        if (input.filters.dateTo) {
          const endDate = new Date(input.filters.dateTo);
          endDate.setHours(23, 59, 59, 999);
          conditions.push(lte(users.createdAt, endDate));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const filteredUsers = await db.select({ email: users.email }).from(users).where(whereClause);
        emailList = filteredUsers.map(u => u.email).filter((e): e is string => e !== null);
      }

      // Aqui você integraria com um serviço de email como Resend, SendGrid, etc.
      // Por enquanto, apenas logamos e retornamos sucesso
      console.log(`[Admin] Enviando email para ${emailList.length} usuários`);
      console.log(`[Admin] Assunto: ${input.subject}`);
      console.log(`[Admin] Corpo: ${input.body.substring(0, 100)}...`);

      // TODO: Integrar com Resend API
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // for (const email of emailList) {
      //   await resend.emails.send({
      //     from: 'noreply@louvamais.com',
      //     to: email,
      //     subject: input.subject,
      //     text: input.body,
      //   });
      // }

      return {
        success: true,
        sentCount: emailList.length,
        message: `Email enviado para ${emailList.length} usuários`,
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
