import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createRepertorio, getRepertorioById, getAllRepertorios, updateRepertorio, deleteRepertorio } from "../db";
import { sendEmail, templateEmailRepertorio } from "../_core/email";

export const repertoriosRouter = router({
  // Criar novo repertório
  create: publicProcedure
    .input(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        descricao: z.string().optional(),
        musicas: z.array(z.any()), // Array de objetos de músicas
        emailUsuario: z.string().email().optional(),
        nomeUsuario: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const musicasJson = JSON.stringify(input.musicas);
      
      const repertorioId = await createRepertorio({
        nome: input.nome,
        descricao: input.descricao,
        musicas: musicasJson,
        emailUsuario: input.emailUsuario,
        nomeUsuario: input.nomeUsuario,
      });

      return {
        success: true,
        repertorioId,
        message: "Repertório criado com sucesso!",
      };
    }),

  // Obter repertório por ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const repertorio = await getRepertorioById(input.id);
      
      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      return {
        ...repertorio,
        musicas: JSON.parse(repertorio.musicas),
      };
    }),

  // Listar todos os repertórios
  getAll: publicProcedure.query(async () => {
    const repertorios = await getAllRepertorios();
    
    return repertorios.map(r => ({
      ...r,
      musicas: JSON.parse(r.musicas),
    }));
  }),

  // Atualizar repertório
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        descricao: z.string().optional(),
        musicas: z.array(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updates: any = {};
      
      if (input.nome) updates.nome = input.nome;
      if (input.descricao !== undefined) updates.descricao = input.descricao;
      if (input.musicas) updates.musicas = JSON.stringify(input.musicas);

      await updateRepertorio(input.id, updates);

      return {
        success: true,
        message: "Repertório atualizado com sucesso!",
      };
    }),

  // Deletar repertório
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteRepertorio(input.id);

      return {
        success: true,
        message: "Repertório deletado com sucesso!",
      };
    }),

  // Enviar repertório por email
  sendByEmail: publicProcedure
    .input(
      z.object({
        repertorioId: z.number(),
        destinatarioEmail: z.string().email(),
        destinatarioNome: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const repertorio = await getRepertorioById(input.repertorioId);
      
      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      const musicas = JSON.parse(repertorio.musicas);
      const nomeDestinatario = input.destinatarioNome || input.destinatarioEmail;

      const emailResult = await sendEmail({
        to: input.destinatarioEmail,
        subject: `Repertório: ${repertorio.nome}`,
        html: templateEmailRepertorio(nomeDestinatario, musicas),
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error || "Erro ao enviar email");
      }

      return {
        success: true,
        message: "Repertório enviado por email com sucesso!",
      };
    }),
});
