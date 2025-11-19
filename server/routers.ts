import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { registerClick, getClickStats } from "./db";
import { z } from "zod";
import { contactRouter } from "./routers/contact";
import { donationsRouter } from "./routers/donations";
import { newsletterRouter } from "./routers/newsletter";

export const appRouter = router({
  contact: contactRouter,
  donations: donationsRouter,
  newsletter: newsletterRouter,
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

    // Obter estatísticas (público para visualização)
    getStats: publicProcedure.query(async () => {
      return await getClickStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
