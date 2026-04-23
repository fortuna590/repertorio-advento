import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import * as db from "./db";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Auth Router ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query(async ({ ctx }) => {
    return ctx.user ?? null;
  }),
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie("session");
    return { success: true };
  }),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────
const adminRouter = router({
  checkAdmin: publicProcedure.query(async ({ ctx }) => {
    return { isAdmin: ctx.user?.role === "admin" };
  }),
  listarUsuarios: adminProcedure.query(async () => {
    return db.listarUsuarios();
  }),

  // Repertórios
  listarRepertorios: adminProcedure.query(async () => {
    return db.listarRepertorios(false);
  }),
  criarRepertorio: adminProcedure
    .input(z.object({
      titulo: z.string().min(3),
      tempoLiturgico: z.string(),
      categoria: z.string().optional(),
      descricao: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      palavrasChave: z.string().optional(),
      musicas: z.array(z.object({
        titulo: z.string(),
        artista: z.string().optional(),
        momento: z.enum(["ENTRADA","ATO_PENITENCIAL","GLORIA","SALMO","ACLAMACAO","OFERTORIO","SANTO","COMUNHAO","FINAL","OUTROS"]),
        youtube: z.string().optional(),
        cifra: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const { musicas, ...rest } = input;
      const slug = gerarSlug(input.titulo);
      const rep = await db.criarRepertorio({ ...rest, slug, visivel: true, tempoLiturgico: rest.tempoLiturgico as any });
      if (rep && musicas && musicas.length > 0) {
        for (const m of musicas) {
          await db.criarMusica({ ...m, repertorioId: rep.id });
        }
      }
      return rep;
    }),
  editarRepertorio: adminProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().min(3).optional(),
      tempoLiturgico: z.string().optional(),
      categoria: z.string().optional(),
      descricao: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      palavrasChave: z.string().optional(),
      musicas: z.array(z.object({
        titulo: z.string(),
        artista: z.string().optional(),
        momento: z.enum(["ENTRADA","ATO_PENITENCIAL","GLORIA","SALMO","ACLAMACAO","OFERTORIO","SANTO","COMUNHAO","FINAL","OUTROS"]),
        youtube: z.string().optional(),
        cifra: z.string().optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, musicas, titulo, ...rest } = input;
      const data: any = { ...rest };
      if (titulo) { data.titulo = titulo; data.slug = gerarSlug(titulo); }
      await db.atualizarRepertorio(id, data);
      if (musicas !== undefined) {
        await db.excluirMusicasDoRepertorio(id);
        for (const m of musicas) {
          await db.criarMusica({ ...m, repertorioId: id });
        }
      }
      return { success: true };
    }),
  deletarRepertorio: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.excluirMusicasDoRepertorio(input.id);
      await db.excluirRepertorio(input.id);
      return { success: true };
    }),

  // Artigos
  listarArtigos: adminProcedure.query(async () => {
    return db.listarArtigos(false);
  }),
  criarArtigo: adminProcedure
    .input(z.object({
      titulo: z.string().min(3),
      resumo: z.string().optional(),
      conteudo: z.string(),
      imagemCapa: z.string().optional(),
      categoria: z.string().optional(),
      tags: z.array(z.string()).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      palavrasChave: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const slug = gerarSlug(input.titulo);
      const tags = input.tags ? JSON.stringify(input.tags) : undefined;
      return db.criarArtigo({ ...input, tags, slug, publicado: true });
    }),
  editarArtigo: adminProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().min(3).optional(),
      resumo: z.string().optional(),
      conteudo: z.string().optional(),
      imagemCapa: z.string().optional(),
      categoria: z.string().optional(),
      tags: z.array(z.string()).optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      palavrasChave: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, titulo, tags, ...rest } = input;
      const data: any = { ...rest };
      if (titulo) { data.titulo = titulo; data.slug = gerarSlug(titulo); }
      if (tags !== undefined) data.tags = JSON.stringify(tags);
      return db.atualizarArtigo(id, data);
    }),
  deletarArtigo: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.excluirArtigo(input.id);
      return { success: true };
    }),
});

// ─── Repertórios Router ───────────────────────────────────────────────────────
const repertoriosRouter = router({
  listar: publicProcedure
    .input(z.object({
      tempoLiturgico: z.string().optional(),
      busca: z.string().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const todos = await db.listarRepertorios(true);
      let resultado = todos;
      if (input?.tempoLiturgico) resultado = resultado.filter(r => r.tempoLiturgico === input.tempoLiturgico);
      if (input?.busca) {
        const b = input.busca.toLowerCase();
        resultado = resultado.filter(r => r.titulo.toLowerCase().includes(b) || (r.descricao || "").toLowerCase().includes(b));
      }
      if (input?.limit) resultado = resultado.slice(0, input.limit);
      return resultado;
    }),

  listarTodos: adminProcedure.query(async () => {
    return db.listarRepertorios(false);
  }),

  buscarPorSlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const repertorio = await db.buscarRepertorioPorSlug(input.slug);
      if (!repertorio) return null;
      const musicasDoRepertorio = await db.listarMusicasPorRepertorio(repertorio.id);
      return { ...repertorio, musicas: musicasDoRepertorio };
    }),

  buscarPorId: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const repertorio = await db.buscarRepertorioPorId(input.id);
      if (!repertorio) return null;
      const musicasDoRepertorio = await db.listarMusicasPorRepertorio(repertorio.id);
      return { ...repertorio, musicas: musicasDoRepertorio };
    }),

  criar: adminProcedure
    .input(
      z.object({
        titulo: z.string().min(3),
        tempoLiturgico: z.enum(["ADVENTO", "NATAL", "QUARESMA", "PASCOA", "TEMPO_COMUM", "CELEBRACOES"]),
        categoria: z.string().default("Missa Dominical"),
        descricao: z.string().optional(),
        visivel: z.boolean().default(true),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        palavrasChave: z.string().optional(),
        ogImage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const slug = gerarSlug(input.titulo);
      return db.criarRepertorio({ ...input, slug });
    }),

  atualizar: adminProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().min(3).optional(),
        tempoLiturgico: z.enum(["ADVENTO", "NATAL", "QUARESMA", "PASCOA", "TEMPO_COMUM", "CELEBRACOES"]).optional(),
        categoria: z.string().optional(),
        descricao: z.string().optional(),
        visivel: z.boolean().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        palavrasChave: z.string().optional(),
        ogImage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, titulo, ...rest } = input;
      const data: any = { ...rest };
      if (titulo) {
        data.titulo = titulo;
        data.slug = gerarSlug(titulo);
      }
      return db.atualizarRepertorio(id, data);
    }),

  excluir: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.excluirMusicasDoRepertorio(input.id);
      await db.excluirRepertorio(input.id);
      return { success: true };
    }),

  // ─── Músicas ──────────────────────────────────────────────────────────────
  adicionarMusica: adminProcedure
    .input(
      z.object({
        repertorioId: z.number(),
        momento: z.enum(["ENTRADA", "ATO_PENITENCIAL", "GLORIA", "SALMO", "ACLAMACAO", "OFERTORIO", "SANTO", "COMUNHAO", "FINAL", "OUTROS"]),
        titulo: z.string().min(1),
        artista: z.string().optional(),
        tom: z.string().optional(),
        linkYoutube: z.string().url().optional().or(z.literal("")),
        linkCifra: z.string().url().optional().or(z.literal("")),
        linkLetra: z.string().url().optional().or(z.literal("")),
        ordem: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      await db.criarMusica(input);
      return { success: true };
    }),

  atualizarMusica: adminProcedure
    .input(
      z.object({
        id: z.number(),
        momento: z.enum(["ENTRADA", "ATO_PENITENCIAL", "GLORIA", "SALMO", "ACLAMACAO", "OFERTORIO", "SANTO", "COMUNHAO", "FINAL", "OUTROS"]).optional(),
        titulo: z.string().min(1).optional(),
        artista: z.string().optional(),
        tom: z.string().optional(),
        linkYoutube: z.string().optional(),
        linkCifra: z.string().optional(),
        linkLetra: z.string().optional(),
        ordem: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.atualizarMusica(id, data);
      return { success: true };
    }),

  excluirMusica: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.excluirMusica(input.id);
      return { success: true };
    }),
});

// ─── Blog Router ──────────────────────────────────────────────────────────────
const blogRouter = router({
  listar: publicProcedure
    .input(z.object({ busca: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const todos = await db.listarArtigos(true);
      if (!input?.busca) return todos;
      const b = input.busca.toLowerCase();
      return todos.filter(a => a.titulo.toLowerCase().includes(b) || (a.resumo || "").toLowerCase().includes(b));
    }),

  listarTodos: adminProcedure.query(async () => {
    return db.listarArtigos(false);
  }),

  buscarPorSlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const artigo = await db.buscarArtigoPorSlug(input.slug);
      if (artigo) {
        // Incrementar visualizações de forma assíncrona
        db.incrementarVisualizacoesArtigo(artigo.id).catch(() => {});
      }
      return artigo;
    }),

  buscarPorId: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.buscarArtigoPorId(input.id);
    }),

  criar: adminProcedure
    .input(
      z.object({
        titulo: z.string().min(3),
        resumo: z.string().optional(),
        conteudo: z.string().min(10),
        imagemCapa: z.string().optional(),
        categoria: z.string().default("Liturgia"),
        tags: z.string().optional(),
        publicado: z.boolean().default(false),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        palavrasChave: z.string().optional(),
        ogImage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const slug = gerarSlug(input.titulo);
      return db.criarArtigo({ ...input, slug });
    }),

  atualizar: adminProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().min(3).optional(),
        resumo: z.string().optional(),
        conteudo: z.string().optional(),
        imagemCapa: z.string().optional(),
        categoria: z.string().optional(),
        tags: z.string().optional(),
        publicado: z.boolean().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        palavrasChave: z.string().optional(),
        ogImage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, titulo, ...rest } = input;
      const data: any = { ...rest };
      if (titulo) {
        data.titulo = titulo;
        data.slug = gerarSlug(titulo);
      }
      return db.atualizarArtigo(id, data);
    }),

  excluir: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.excluirArtigo(input.id);
      return { success: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  auth: authRouter,
  admin: adminRouter,
  repertorios: repertoriosRouter,
  blog: blogRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;
