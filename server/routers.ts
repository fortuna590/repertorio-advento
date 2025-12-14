import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { registerClick, getClickStats, getSiteStats, getClickStatsByPeriod } from "./db";
import { z } from "zod";
import { contactRouter } from "./routers/contact";
import { donationsRouter } from "./routers/donations";
import { newsletterRouter } from "./routers/newsletter";
import { notificationsRouter } from "./routers/notifications";
import { repertoriosRouter } from "./routers/repertorios";
import { artigosRouter } from "./routers/artigos";
import { paymentsRouter } from "./routers/payments";
import { productsRouter } from "./routers/products";
import { liturgiasRouter } from "./routers/liturgias";
import { depoimentosRouter } from "./routers/depoimentos";
import { favoritosRouter } from "./routers/favoritos";

export const appRouter = router({
  contact: contactRouter,
  donations: donationsRouter,
  newsletter: newsletterRouter,
  notifications: notificationsRouter,
  repertorios: repertoriosRouter,
  artigos: artigosRouter,
  payments: paymentsRouter,
  products: productsRouter,
  liturgias: liturgiasRouter,
  depoimentos: depoimentosRouter,
  favoritos: favoritosRouter,
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Router para rastreamento de cliques
  clicks: router({
    // Registrar um clique (público - não requer autenticação)
    register: publicProcedure
      .input(
        z.object({
          musicaId: z.string(),
          musicaTitulo: z.string(),
          musicaArtista: z.string(),
          momentoId: z.string(),
          momentoTitulo: z.string(),
          linkType: z.enum(["youtube", "cifra"]),
        })
      )
      .mutation(async ({ input }) => {
        await registerClick(input);
        return { success: true };
      }),

    // Obter estatu00edsticas (pu00e9blico para visualização)
    getStats: publicProcedure.query(async () => {
      return await getClickStats();
    }),

    // Obter estatu00edsticas gerais do site
    getSiteStats: publicProcedure.query(async () => {
      return await getSiteStats();
    }),

    // Obter estatu00edsticas por peru00edodo
    getStatsByPeriod: publicProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ input }) => {
        return await getClickStatsByPeriod(input.days);
      }),
  }),
});

export type AppRouter = typeof appRouter;