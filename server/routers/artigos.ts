import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createArtigo, getArtigoBySlug, getArtigoById, getAllArtigos, updateArtigo, deleteArtigo, incrementArtigoViews } from "../db";

export const artigosRouter = router({
  // Criar novo artigo
  create: publicProcedure
    .input(
      z.object({
        titulo: z.string().min(1, "Título é obrigatório"),
        slug: z.string().min(1, "Slug é obrigatório"),
        resumo: z.string().min(1, "Resumo é obrigatório"),
        conteudo: z.string().min(1, "Conteúdo é obrigatório"),
        imagemCapa: z.string().optional(),
        categoria: z.string().optional(),
        tags: z.array(z.string()).optional(),
        autorNome: z.string().optional(),
        publicado: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const tagsJson = input.tags ? JSON.stringify(input.tags) : undefined;
      
      const artigoId = await createArtigo({
        titulo: input.titulo,
        slug: input.slug,
        resumo: input.resumo,
        conteudo: input.conteudo,
        imagemCapa: input.imagemCapa,
        categoria: input.categoria,
        tags: tagsJson,
        autorNome: input.autorNome,
        publicado: input.publicado,
      });

      return {
        success: true,
        artigoId,
        message: "Artigo criado com sucesso!",
      };
    }),

  // Obter artigo por slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const artigo = await getArtigoBySlug(input.slug);
      
      if (!artigo) {
        throw new Error("Artigo não encontrado");
      }

      // Incrementar visualizações
      await incrementArtigoViews(artigo.id);

      return {
        ...artigo,
        tags: artigo.tags ? JSON.parse(artigo.tags) : [],
      };
    }),

  // Obter artigo por ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const artigo = await getArtigoById(input.id);
      
      if (!artigo) {
        throw new Error("Artigo não encontrado");
      }

      return {
        ...artigo,
        tags: artigo.tags ? JSON.parse(artigo.tags) : [],
      };
    }),

  // Listar todos os artigos
  getAll: publicProcedure
    .input(z.object({ includeRascunhos: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const artigos = await getAllArtigos(input?.includeRascunhos || false);
      
      return artigos.map(a => ({
        ...a,
        tags: a.tags ? JSON.parse(a.tags) : [],
      }));
    }),

  // Atualizar artigo
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        resumo: z.string().min(1).optional(),
        conteudo: z.string().min(1).optional(),
        imagemCapa: z.string().optional(),
        categoria: z.string().optional(),
        tags: z.array(z.string()).optional(),
        autorNome: z.string().optional(),
        publicado: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updates: any = {};
      
      if (input.titulo) updates.titulo = input.titulo;
      if (input.slug) updates.slug = input.slug;
      if (input.resumo) updates.resumo = input.resumo;
      if (input.conteudo) updates.conteudo = input.conteudo;
      if (input.imagemCapa !== undefined) updates.imagemCapa = input.imagemCapa;
      if (input.categoria !== undefined) updates.categoria = input.categoria;
      if (input.tags) updates.tags = JSON.stringify(input.tags);
      if (input.autorNome !== undefined) updates.autorNome = input.autorNome;
      if (input.publicado !== undefined) updates.publicado = input.publicado;

      await updateArtigo(input.id, updates);

      return {
        success: true,
        message: "Artigo atualizado com sucesso!",
      };
    }),

   // Deletar artigo
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteArtigo(input.id);
      return {
        success: true,
        message: "Artigo deletado com sucesso!",
      };
    }),

  // Incrementar compartilhamentos
  incrementarCompartilhamentos: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ input }) => {
      const artigo = await getArtigoBySlug(input.slug);
      if (!artigo) {
        throw new Error("Artigo não encontrado");
      }
      
      await updateArtigo(artigo.id, {
        compartilhamentos: (artigo.compartilhamentos || 0) + 1,
      });
      
      return {
        success: true,
      };
    }),
});
