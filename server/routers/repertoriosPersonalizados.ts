import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { repertoriosPersonalizados, musicasRepertorioPersonalizado, RepertorioPersonalizado, MusicaRepertorioPersonalizado } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export const repertoriosPersonalizadosRouter = router({
  // Criar novo repertório
  criar: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        descricao: z.string().optional(),
        tags: z.array(z.string()).optional(),
        tipoTemplate: z.enum(["missa", "grupo_oracao", "livre"]).default("missa"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db.insert(repertoriosPersonalizados).values({
        userId: ctx.user.id,
        nome: input.nome,
        descricao: input.descricao || null,
        tags: input.tags && input.tags.length > 0 ? JSON.stringify(input.tags) : null,
        tipoTemplate: input.tipoTemplate,
        isPublic: 0,
      });

      return {
        success: true,
        message: "Repertório criado com sucesso!",
        repertorioId: repertorio.insertId,
      };
    }),

  // Listar meus repertórios
  listMeus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const repertorios = await db
      .select()
      .from(repertoriosPersonalizados)
      .where(eq(repertoriosPersonalizados.userId, ctx.user.id))
      .orderBy(desc(repertoriosPersonalizados.updatedAt));

    // Para cada repertório, buscar quantidade de músicas
    const repertoriosComMusicas = await Promise.all(
      repertorios.map(async (rep: RepertorioPersonalizado) => {
        const musicas = await db
          .select()
          .from(musicasRepertorioPersonalizado)
          .where(eq(musicasRepertorioPersonalizado.repertorioId, rep.id));

        return {
          ...rep,
          quantidadeMusicas: musicas.length,
        };
      })
    );

    return repertoriosComMusicas;
  }),

  // Buscar repertório por ID (com músicas)
  buscarPorId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db
        .select()
        .from(repertoriosPersonalizados)
        .where(
          and(
            eq(repertoriosPersonalizados.id, input.id),
            eq(repertoriosPersonalizados.userId, ctx.user.id)
          )
        );

      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      const musicas = await db
        .select()
        .from(musicasRepertorioPersonalizado)
        .where(eq(musicasRepertorioPersonalizado.repertorioId, input.id))
        .orderBy(musicasRepertorioPersonalizado.ordem);

      return {
        ...repertorio,
        musicas,
      };
    }),

  // Buscar repertório por shareId (público)
  buscarPorShareId: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db
        .select()
        .from(repertoriosPersonalizados)
        .where(
          and(
            eq(repertoriosPersonalizados.shareId, input.shareId),
            eq(repertoriosPersonalizados.isPublic, 1)
          )
        );

      if (!repertorio) {
        throw new Error("Repertório não encontrado ou não está público");
      }

      const musicas = await db
        .select()
        .from(musicasRepertorioPersonalizado)
        .where(eq(musicasRepertorioPersonalizado.repertorioId, repertorio.id))
        .orderBy(musicasRepertorioPersonalizado.ordem);

      return {
        ...repertorio,
        musicas,
      };
    }),

  // Atualizar repertório
  atualizar: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1, "Nome é obrigatório"),
        descricao: z.string().optional(),
        tags: z.array(z.string()).optional(),
        tipoTemplate: z.enum(["missa", "grupo_oracao", "livre"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(repertoriosPersonalizados)
        .set({
          nome: input.nome,
          descricao: input.descricao || null,
          tags: input.tags && input.tags.length > 0 ? JSON.stringify(input.tags) : null,
          ...(input.tipoTemplate && { tipoTemplate: input.tipoTemplate }),
        })
        .where(
          and(
            eq(repertoriosPersonalizados.id, input.id),
            eq(repertoriosPersonalizados.userId, ctx.user.id)
          )
        );

      return {
        success: true,
        message: "Repertório atualizado com sucesso!",
      };
    }),

  // Duplicar repertório
  duplicar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar repertório original
      const [original] = await db
        .select()
        .from(repertoriosPersonalizados)
        .where(eq(repertoriosPersonalizados.id, input.id));

      if (!original) {
        throw new Error("Repertório não encontrado");
      }

      // Verificar se é público ou se pertence ao usuário
      if (original.isPublic === 0 && original.userId !== ctx.user.id) {
        throw new Error("Você não tem permissão para duplicar este repertório");
      }

      // Criar cópia do repertório
      const [novoRepertorio] = await db.insert(repertoriosPersonalizados).values({
        userId: ctx.user.id,
        nome: `${original.nome} (Cópia)`,
        descricao: original.descricao,
        isPublic: 0,
      });

      // Copiar músicas
      const musicasOriginais = await db
        .select()
        .from(musicasRepertorioPersonalizado)
        .where(eq(musicasRepertorioPersonalizado.repertorioId, input.id));

      if (musicasOriginais.length > 0) {
        await db.insert(musicasRepertorioPersonalizado).values(
          musicasOriginais.map((musica: MusicaRepertorioPersonalizado) => ({
            repertorioId: novoRepertorio.insertId,
            titulo: musica.titulo,
            artista: musica.artista,
            tom: musica.tom,
            linkCifra: musica.linkCifra,
            linkYoutube: musica.linkYoutube,
            momento: musica.momento,
            ordem: musica.ordem,
          }))
        );
      }

      return {
        success: true,
        message: "Repertório duplicado com sucesso!",
        repertorioId: novoRepertorio.insertId,
      };
    }),

  // Excluir repertório
  excluir: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(repertoriosPersonalizados)
        .where(
          and(
            eq(repertoriosPersonalizados.id, input.id),
            eq(repertoriosPersonalizados.userId, ctx.user.id)
          )
        );

      return {
        success: true,
        message: "Repertório excluído com sucesso!",
      };
    }),

  // Toggle compartilhamento (gerar/remover shareId)
  toggleShare: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db
        .select()
        .from(repertoriosPersonalizados)
        .where(
          and(
            eq(repertoriosPersonalizados.id, input.id),
            eq(repertoriosPersonalizados.userId, ctx.user.id)
          )
        );

      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      const isPublic = repertorio.isPublic === 1 ? 0 : 1;
      const shareId = isPublic === 1 ? randomUUID() : null;

      await db
        .update(repertoriosPersonalizados)
        .set({
          isPublic,
          shareId,
        })
        .where(eq(repertoriosPersonalizados.id, input.id));

      return {
        success: true,
        message: isPublic === 1 ? "Repertório compartilhado!" : "Compartilhamento desativado",
        isPublic: isPublic === 1,
        shareId,
      };
    }),

  // Adicionar música ao repertório
  adicionarMusica: protectedProcedure
    .input(
      z.object({
        repertorioId: z.number(),
        titulo: z.string().min(1, "Título é obrigatório"),
        artista: z.string().optional(),
        tom: z.string().optional(),
        linkCifra: z.string().optional(),
        linkYoutube: z.string().optional(),
        momento: z.string().min(1, "Momento é obrigatório"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o repertório pertence ao usuário
      const [repertorio] = await db
        .select()
        .from(repertoriosPersonalizados)
        .where(
          and(
            eq(repertoriosPersonalizados.id, input.repertorioId),
            eq(repertoriosPersonalizados.userId, ctx.user.id)
          )
        );

      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      // Buscar última ordem
      const musicas = await db
        .select()
        .from(musicasRepertorioPersonalizado)
        .where(eq(musicasRepertorioPersonalizado.repertorioId, input.repertorioId));

      const proximaOrdem = musicas.length > 0 ? Math.max(...musicas.map((m: MusicaRepertorioPersonalizado) => m.ordem)) + 1 : 1;

      const [musica] = await db.insert(musicasRepertorioPersonalizado).values({
        repertorioId: input.repertorioId,
        titulo: input.titulo,
        artista: input.artista || null,
        tom: input.tom || null,
        linkCifra: input.linkCifra || null,
        linkYoutube: input.linkYoutube || null,
        momento: input.momento,
        ordem: proximaOrdem,
      });

      return {
        success: true,
        message: "Música adicionada com sucesso!",
        musicaId: musica.insertId,
      };
    }),

  // Atualizar música
  atualizarMusica: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        repertorioId: z.number(),
        titulo: z.string().min(1, "Título é obrigatório"),
        artista: z.string().optional(),
        tom: z.string().optional(),
        linkCifra: z.string().optional(),
        linkYoutube: z.string().optional(),
        momento: z.string().min(1, "Momento é obrigatório"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o repertório pertence ao usuário
      const [repertorio] = await db
        .select()
        .from(repertoriosPersonalizados)
        .where(
          and(
            eq(repertoriosPersonalizados.id, input.repertorioId),
            eq(repertoriosPersonalizados.userId, ctx.user.id)
          )
        );

      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      await db
        .update(musicasRepertorioPersonalizado)
        .set({
          titulo: input.titulo,
          artista: input.artista || null,
          tom: input.tom || null,
          linkCifra: input.linkCifra || null,
          linkYoutube: input.linkYoutube || null,
          momento: input.momento,
        })
        .where(eq(musicasRepertorioPersonalizado.id, input.id));

      return {
        success: true,
        message: "Música atualizada com sucesso!",
      };
    }),

  // Excluir música
  excluirMusica: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        repertorioId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o repertório pertence ao usuário
      const [repertorio] = await db
        .select()
        .from(repertoriosPersonalizados)
        .where(
          and(
            eq(repertoriosPersonalizados.id, input.repertorioId),
            eq(repertoriosPersonalizados.userId, ctx.user.id)
          )
        );

      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      await db
        .delete(musicasRepertorioPersonalizado)
        .where(eq(musicasRepertorioPersonalizado.id, input.id));

      return {
        success: true,
        message: "Música excluída com sucesso!",
      };
    }),

  // Reordenar músicas
  reordenarMusicas: protectedProcedure
    .input(
      z.object({
        repertorioId: z.number(),
        musicasOrdenadas: z.array(
          z.object({
            id: z.number(),
            ordem: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o repertório pertence ao usuário
      const [repertorio] = await db
        .select()
        .from(repertoriosPersonalizados)
        .where(
          and(
            eq(repertoriosPersonalizados.id, input.repertorioId),
            eq(repertoriosPersonalizados.userId, ctx.user.id)
          )
        );

      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      // Atualizar ordem de cada música
      for (const musica of input.musicasOrdenadas) {
        await db
          .update(musicasRepertorioPersonalizado)
          .set({ ordem: musica.ordem })
          .where(eq(musicasRepertorioPersonalizado.id, musica.id));
      }

      return {
        success: true,
        message: "Músicas reordenadas com sucesso!",
      };
    }),
});
