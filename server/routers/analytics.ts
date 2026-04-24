import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { views, musicClicks, userActions } from "../../drizzle/schema";
import { desc, eq, sql, and, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function isAdmin(ctx: any) {
  return ctx.user?.role === "admin";
}

export const analyticsRouter = router({
  // ─── Registro de Visualização (fire-and-forget) ───────────────────────────
  registrarView: publicProcedure
    .input(
      z.object({
        tipo: z.enum(["repertorio", "artigo"]),
        referenciaId: z.number().int().positive(),
        titulo: z.string().optional(),
        slug: z.string().optional(),
        sessionId: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { ok: true };
        await db.insert(views).values({
          tipo: input.tipo,
          referenciaId: input.referenciaId,
          titulo: input.titulo ?? null,
          slug: input.slug ?? null,
          sessionId: input.sessionId ?? null,
        });
      } catch {
        // silencioso — não impacta UX
      }
      return { ok: true };
    }),

  // ─── Registro de Clique em Música ─────────────────────────────────────────
  registrarMusicClick: publicProcedure
    .input(
      z.object({
        musicaTitulo: z.string().max(255),
        musicaArtista: z.string().max(255).optional(),
        repertorioId: z.number().int().optional(),
        repertorioTitulo: z.string().max(255).optional(),
        tipoLink: z.enum(["youtube", "cifra", "letra"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { ok: true };
        await db.insert(musicClicks).values({
          musicaTitulo: input.musicaTitulo,
          musicaArtista: input.musicaArtista ?? null,
          repertorioId: input.repertorioId ?? null,
          repertorioTitulo: input.repertorioTitulo ?? null,
          tipoLink: input.tipoLink,
        });
      } catch {
        // silencioso
      }
      return { ok: true };
    }),

  // ─── Registro de Ação do Usuário ──────────────────────────────────────────
  registrarAcao: publicProcedure
    .input(
      z.object({
        acao: z.enum(["salvar_repertorio", "exportar_pdf", "favoritar", "copiar_repertorio", "compartilhar"]),
        referenciaId: z.number().int().optional(),
        referenciaTitle: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return { ok: true };
        await db.insert(userActions).values({
          acao: input.acao,
          referenciaId: input.referenciaId ?? null,
          referenciaTitle: input.referenciaTitle ?? null,
          userId: (ctx as any).user?.id ?? null,
        });
      } catch {
        // silencioso
      }
      return { ok: true };
    }),

  // ─── Dashboard de Analytics (admin only) ─────────────────────────────────
  dashboard: publicProcedure
    .input(
      z.object({
        periodo: z.enum(["7d", "30d", "90d", "total"]).default("30d"),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!isAdmin(ctx)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });

      const agora = new Date();
      const dataInicio =
        input.periodo === "total"
          ? null
          : new Date(
              agora.getTime() -
                (input.periodo === "7d" ? 7 : input.periodo === "30d" ? 30 : 90) * 24 * 60 * 60 * 1000
            );

      // Top repertórios visualizados
      const topRepertorios = await db
        .select({
          referenciaId: views.referenciaId,
          titulo: views.titulo,
          slug: views.slug,
          total: sql<number>`COUNT(*)`.as("total"),
        })
        .from(views)
        .where(
          dataInicio
            ? and(eq(views.tipo, "repertorio"), gte(views.createdAt, dataInicio))
            : eq(views.tipo, "repertorio")
        )
        .groupBy(views.referenciaId, views.titulo, views.slug)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      // Top artigos visualizados
      const topArtigos = await db
        .select({
          referenciaId: views.referenciaId,
          titulo: views.titulo,
          slug: views.slug,
          total: sql<number>`COUNT(*)`.as("total"),
        })
        .from(views)
        .where(
          dataInicio
            ? and(eq(views.tipo, "artigo"), gte(views.createdAt, dataInicio))
            : eq(views.tipo, "artigo")
        )
        .groupBy(views.referenciaId, views.titulo, views.slug)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      // Top músicas clicadas
      const topMusicas = await db
        .select({
          musicaTitulo: musicClicks.musicaTitulo,
          musicaArtista: musicClicks.musicaArtista,
          repertorioTitulo: musicClicks.repertorioTitulo,
          tipoLink: musicClicks.tipoLink,
          total: sql<number>`COUNT(*)`.as("total"),
        })
        .from(musicClicks)
        .where(dataInicio ? gte(musicClicks.createdAt, dataInicio) : undefined)
        .groupBy(
          musicClicks.musicaTitulo,
          musicClicks.musicaArtista,
          musicClicks.repertorioTitulo,
          musicClicks.tipoLink
        )
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      // Totais gerais
      const [totalViewsResult] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(views)
        .where(dataInicio ? gte(views.createdAt, dataInicio) : undefined);

      const [totalClicksResult] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(musicClicks)
        .where(dataInicio ? gte(musicClicks.createdAt, dataInicio) : undefined);

      const [totalActionsResult] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(userActions)
        .where(dataInicio ? gte(userActions.createdAt, dataInicio) : undefined);

      // Distribuição de ações
      const distribuicaoAcoes = await db
        .select({
          acao: userActions.acao,
          total: sql<number>`COUNT(*)`.as("total"),
        })
        .from(userActions)
        .where(dataInicio ? gte(userActions.createdAt, dataInicio) : undefined)
        .groupBy(userActions.acao)
        .orderBy(desc(sql`COUNT(*)`));

      // Distribuição de cliques por tipo de link
      const distribuicaoLinks = await db
        .select({
          tipoLink: musicClicks.tipoLink,
          total: sql<number>`COUNT(*)`.as("total"),
        })
        .from(musicClicks)
        .where(dataInicio ? gte(musicClicks.createdAt, dataInicio) : undefined)
        .groupBy(musicClicks.tipoLink)
        .orderBy(desc(sql`COUNT(*)`));

      // Views por dia (últimos 30 dias para gráfico de tendência)
      const viewsPorDia = await db
        .select({
          dia: sql<string>`DATE(createdAt)`.as("dia"),
          total: sql<number>`COUNT(*)`.as("total"),
        })
        .from(views)
        .where(gte(views.createdAt, new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)))
        .groupBy(sql`DATE(createdAt)`)
        .orderBy(sql`DATE(createdAt)`);

      return {
        totais: {
          views: Number(totalViewsResult?.total ?? 0),
          clicks: Number(totalClicksResult?.total ?? 0),
          acoes: Number(totalActionsResult?.total ?? 0),
        },
        topRepertorios: topRepertorios.map((r) => ({ ...r, total: Number(r.total) })),
        topArtigos: topArtigos.map((a) => ({ ...a, total: Number(a.total) })),
        topMusicas: topMusicas.map((m) => ({ ...m, total: Number(m.total) })),
        distribuicaoAcoes: distribuicaoAcoes.map((a) => ({ ...a, total: Number(a.total) })),
        distribuicaoLinks: distribuicaoLinks.map((l) => ({ ...l, total: Number(l.total) })),
        viewsPorDia: viewsPorDia.map((v) => ({ ...v, total: Number(v.total) })),
      };
    }),
});
