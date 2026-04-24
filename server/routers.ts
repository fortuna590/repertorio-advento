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

// ─── Usuário Router ───────────────────────────────────────────────────────────
const usuarioRouter = router({
  // Favoritos
  listarFavoritos: protectedProcedure.query(async ({ ctx }) => {
    const favs = await db.listarFavoritosUsuario(ctx.user.id);
    if (!favs.length) return [];
    const repertorioIds = favs.map(f => f.repertorioId);
    const todos = await db.listarRepertorios(false);
    return todos.filter(r => repertorioIds.includes(r.id));
  }),
  toggleFavorito: protectedProcedure
    .input(z.object({ repertorioId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existe = await db.verificarFavorito(ctx.user.id, input.repertorioId);
      if (existe) {
        await db.removerFavorito(ctx.user.id, input.repertorioId);
        return { favoritado: false };
      } else {
        await db.adicionarFavorito(ctx.user.id, input.repertorioId);
        return { favoritado: true };
      }
    }),
  verificarFavorito: protectedProcedure
    .input(z.object({ repertorioId: z.number() }))
    .query(async ({ ctx, input }) => {
      return { favoritado: await db.verificarFavorito(ctx.user.id, input.repertorioId) };
    }),
  // Repertórios próprios
  listarMeusRepertorios: protectedProcedure.query(async ({ ctx }) => {
    return db.listarRepertoriosUsuario(ctx.user.id);
  }),
  buscarMeuRepertorio: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const rep = await db.buscarRepertorioUsuarioPorId(input.id);
      if (!rep || rep.userId !== ctx.user.id) return null;
      const musicas = await db.listarMusicasUsuario(rep.id);
      return { ...rep, musicas };
    }),
  criarMeuRepertorio: protectedProcedure
    .input(z.object({
      titulo: z.string().min(2),
      descricao: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.criarRepertorioUsuario({ ...input, userId: ctx.user.id });
    }),
  atualizarMeuRepertorio: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().min(2).optional(),
      descricao: z.string().optional(),
      compartilhado: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const rep = await db.buscarRepertorioUsuarioPorId(input.id);
      if (!rep || rep.userId !== ctx.user.id) throw new Error("Não autorizado");
      const { id, ...data } = input;
      return db.atualizarRepertorioUsuario(id, data);
    }),
  excluirMeuRepertorio: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const rep = await db.buscarRepertorioUsuarioPorId(input.id);
      if (!rep || rep.userId !== ctx.user.id) throw new Error("Não autorizado");
      await db.excluirRepertorioUsuario(input.id);
      return { success: true };
    }),
  adicionarMusica: protectedProcedure
    .input(z.object({
      repertorioId: z.number(),
      titulo: z.string().min(1),
      artista: z.string().optional(),
      tom: z.string().optional(),
      momento: z.enum(["ENTRADA","ATO_PENITENCIAL","GLORIA","SALMO","ACLAMACAO","OFERTORIO","SANTO","COMUNHAO","FINAL","OUTROS"]).default("OUTROS"),
      youtube: z.string().optional(),
      cifra: z.string().optional(),
      letra: z.string().optional(),
      ordem: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const rep = await db.buscarRepertorioUsuarioPorId(input.repertorioId);
      if (!rep || rep.userId !== ctx.user.id) throw new Error("Não autorizado");
      return db.criarMusicaUsuario(input);
    }),
  removerMusica: protectedProcedure
    .input(z.object({ id: z.number(), repertorioId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const rep = await db.buscarRepertorioUsuarioPorId(input.repertorioId);
      if (!rep || rep.userId !== ctx.user.id) throw new Error("Não autorizado");
      await db.excluirMusicaUsuario(input.id);
      return { success: true };
    }),
});

// ─── Recomendações Router ───────────────────────────────────────────────────
// Mapa de contexto inteligente: ao estar num tempo, sugere o próximo
const PROXIMO_TEMPO: Record<string, string[]> = {
  ADVENTO:      ["NATAL", "TEMPO_COMUM"],
  NATAL:        ["TEMPO_COMUM", "QUARESMA"],
  QUARESMA:     ["PASCOA", "TEMPO_COMUM"],
  PASCOA:       ["TEMPO_COMUM", "NATAL"],
  TEMPO_COMUM:  ["ADVENTO", "QUARESMA"],
  CELEBRACOES:  ["TEMPO_COMUM", "ADVENTO"],
  GERAL:        ["TEMPO_COMUM", "ADVENTO"],
};

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {}
  return raw.split(",").map(t => t.trim()).filter(Boolean);
}

function scoreRepertorio(
  candidato: any,
  tempoAtual: string,
  categoriaAtual: string | null,
  tagsAtuais: string[]
): number {
  let score = 0;
  // mesmo tempo litúrgico = maior peso
  if (candidato.tempoLiturgico === tempoAtual) score += 10;
  // tempo sugerido pelo contexto
  const proximoTempos = PROXIMO_TEMPO[tempoAtual] ?? [];
  if (proximoTempos.includes(candidato.tempoLiturgico)) score += 5;
  // mesma categoria
  if (categoriaAtual && candidato.categoria === categoriaAtual) score += 4;
  // tags em comum
  const tagsCandidate = parseTags(candidato.tags);
  const intersecao = tagsAtuais.filter(t => tagsCandidate.includes(t));
  score += intersecao.length * 2;
  return score;
}

function scoreArtigo(
  candidato: any,
  categoriaAtual: string | null,
  tagsAtuais: string[]
): number {
  let score = 0;
  if (categoriaAtual && candidato.categoria === categoriaAtual) score += 6;
  const tagsCandidate = parseTags(candidato.tags);
  const intersecao = tagsAtuais.filter(t => tagsCandidate.includes(t));
  score += intersecao.length * 3;
  return score;
}

const recomendacoesRouter = router({
  // Recomendações a partir de um repertório
  paraRepertorio: publicProcedure
    .input(z.object({
      repertorioId: z.number(),
      limit: z.number().default(3),
    }))
    .query(async ({ input }) => {
      const [todosRep, todosArt] = await Promise.all([
        db.listarRepertorios(true),
        db.listarArtigos(true),
      ]);
      const atual = todosRep.find(r => r.id === input.repertorioId);
      if (!atual) return { repertorios: [], artigos: [] };

      const tagsAtuais = parseTags(atual.tags);

      // Repertórios relacionados (excluindo o atual)
      const repertoriosScored = todosRep
        .filter(r => r.id !== input.repertorioId)
        .map(r => ({ ...r, _score: scoreRepertorio(r, atual.tempoLiturgico, atual.categoria, tagsAtuais) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, input.limit);

      // Artigos relacionados por categoria/tags do repertório
      const artigosScored = todosArt
        .map(a => ({ ...a, _score: scoreArtigo(a, atual.categoria, tagsAtuais) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, input.limit);

      return {
        repertorios: repertoriosScored,
        artigos: artigosScored,
        contexto: atual.tempoLiturgico,
      };
    }),

  // Recomendações a partir de um artigo
  paraArtigo: publicProcedure
    .input(z.object({
      artigoId: z.number(),
      limit: z.number().default(3),
    }))
    .query(async ({ input }) => {
      const [todosRep, todosArt] = await Promise.all([
        db.listarRepertorios(true),
        db.listarArtigos(true),
      ]);
      const atual = todosArt.find(a => a.id === input.artigoId);
      if (!atual) return { repertorios: [], artigos: [] };

      const tagsAtuais = parseTags(atual.tags);

      // Artigos relacionados (excluindo o atual)
      const artigosScored = todosArt
        .filter(a => a.id !== input.artigoId)
        .map(a => ({ ...a, _score: scoreArtigo(a, atual.categoria, tagsAtuais) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, input.limit);

      // Repertórios relacionados por categoria/tags do artigo
      // Usa tempoLiturgico mais próximo da categoria do artigo como heurística
      const tempoHint = tagsAtuais.find(t =>
        ["ADVENTO","NATAL","QUARESMA","PASCOA","TEMPO_COMUM","CELEBRACOES"].includes(t.toUpperCase())
      )?.toUpperCase() ?? "TEMPO_COMUM";

      const repertoriosScored = todosRep
        .map(r => ({ ...r, _score: scoreRepertorio(r, tempoHint, atual.categoria, tagsAtuais) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, input.limit);

      return {
        repertorios: repertoriosScored,
        artigos: artigosScored,
        contexto: atual.categoria,
      };
    }),

  // Recomendações gerais para a Home (destaques por tempo litúrgico atual)
  destaques: publicProcedure
    .input(z.object({
      tempoLiturgico: z.string().optional(),
      limit: z.number().default(3),
    }).optional())
    .query(async ({ input }) => {
      const [todosRep, todosArt] = await Promise.all([
        db.listarRepertorios(true),
        db.listarArtigos(true),
      ]);
      const tempo = input?.tempoLiturgico ?? "TEMPO_COMUM";
      const proximoTempos = PROXIMO_TEMPO[tempo] ?? [];
      const limit = input?.limit ?? 3;

      // Prioriza mesmo tempo, depois os próximos
      const repertorios = [
        ...todosRep.filter(r => r.tempoLiturgico === tempo),
        ...todosRep.filter(r => proximoTempos.includes(r.tempoLiturgico)),
        ...todosRep.filter(r => r.tempoLiturgico !== tempo && !proximoTempos.includes(r.tempoLiturgico)),
      ].slice(0, limit);

      const artigos = todosArt.slice(0, limit);

      return { repertorios, artigos, contexto: tempo };
    }),
});

import { analyticsRouter } from "./routers/analytics";
// ─── App Router ──────────────────────────────────────────────────
export const appRouter = router({
  auth: authRouter,
  admin: adminRouter,
  repertorios: repertoriosRouter,
  blog: blogRouter,
  system: systemRouter,
  usuario: usuarioRouter,
  recomendacoes: recomendacoesRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;