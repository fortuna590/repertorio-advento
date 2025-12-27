import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createRepertorio, getRepertorioById, getAllRepertorios, updateRepertorio, deleteRepertorio } from "../db";
import { sendEmail, templateEmailRepertorio } from "../_core/email";
import { gerarPDFRepertorio } from "../_core/pdf";
import { getDb } from "../db";
import { repertorios } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

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
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const musicasJson = JSON.stringify(input.musicas);
      const userId = ctx.user?.id || null;
      const emailUsuario = input.emailUsuario || ctx.user?.email || null;
      const nomeUsuario = input.nomeUsuario || ctx.user?.name || null;
      
      const [result] = await db
        .insert(repertorios)
        .values({
          userId,
          nome: input.nome,
          descricao: input.descricao || null,
          musicas: musicasJson,
          ordemMusicas: musicasJson,
          emailUsuario,
          nomeUsuario,
          isPublic: 0,
          shareId: null,
        })
        .$returningId();

      return {
        success: true,
        repertorioId: result.id,
        message: "Repertório criado com sucesso!",
      };
    }),

  // Obter repertório por ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db
        .select()
        .from(repertorios)
        .where(eq(repertorios.id, input.id))
        .limit(1);

      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      // Verificar permissão: público ou dono
      if (!repertorio.isPublic && repertorio.userId && repertorio.userId !== ctx.user?.id) {
        throw new Error("Você não tem permissão para acessar este repertório");
      }

      return {
        ...repertorio,
        musicas: JSON.parse(repertorio.musicas || "[]"),
        ordemMusicas: repertorio.ordemMusicas ? JSON.parse(repertorio.ordemMusicas) : null,
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
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        // Manter compatibilidade com sistema antigo
        await deleteRepertorio(input.id);
      } else {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [repertorio] = await db
          .select()
          .from(repertorios)
          .where(eq(repertorios.id, input.id))
          .limit(1);

        if (repertorio && repertorio.userId !== ctx.user.id) {
          throw new Error("Você não tem permissão para deletar este repertório");
        }
        await deleteRepertorio(input.id);
      }

      return {
        success: true,
        message: "Repertório deletado com sucesso!",
      };
    }),

  // Listar repertórios do usuário logado
  listMeus: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return [];
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const meusRepertorios = await db
      .select()
      .from(repertorios)
      .where(eq(repertorios.userId, ctx.user.id))
      .orderBy(desc(repertorios.createdAt));

    return meusRepertorios.map((r) => ({
      ...r,
      musicas: JSON.parse(r.musicas || "[]"),
      ordemMusicas: r.ordemMusicas ? JSON.parse(r.ordemMusicas) : null,
    }));
  }),

  // Obter repertório público por shareId
  getByShareId: publicProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db
        .select()
        .from(repertorios)
        .where(and(eq(repertorios.shareId, input.shareId), eq(repertorios.isPublic, 1)))
        .limit(1);

      if (!repertorio) {
        throw new Error("Repertório não encontrado ou não é público");
      }

      return {
        ...repertorio,
        musicas: JSON.parse(repertorio.musicas || "[]"),
        ordemMusicas: repertorio.ordemMusicas ? JSON.parse(repertorio.ordemMusicas) : null,
      };
    }),

  // Atualizar ordem das músicas (drag-and-drop)
  updateOrdem: publicProcedure
    .input(
      z.object({
        id: z.number(),
        ordemMusicas: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db
        .select()
        .from(repertorios)
        .where(eq(repertorios.id, input.id))
        .limit(1);

      if (!repertorio || repertorio.userId !== ctx.user.id) {
        throw new Error("Você não tem permissão para editar este repertório");
      }

      await db
        .update(repertorios)
        .set({ ordemMusicas: JSON.stringify(input.ordemMusicas) })
        .where(eq(repertorios.id, input.id));

      return { success: true, message: "Ordem atualizada!" };
    }),

  // Ativar/desativar compartilhamento público
  toggleShare: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db
        .select()
        .from(repertorios)
        .where(eq(repertorios.id, input.id))
        .limit(1);

      if (!repertorio || repertorio.userId !== ctx.user.id) {
        throw new Error("Você não tem permissão para compartilhar este repertório");
      }

      const isPublic = repertorio.isPublic ? 0 : 1;
      const shareId = isPublic ? (repertorio.shareId || randomUUID()) : repertorio.shareId;

      await db.update(repertorios).set({ isPublic, shareId }).where(eq(repertorios.id, input.id));

      return {
        success: true,
        isPublic: Boolean(isPublic),
        shareId,
        message: isPublic ? "Repertório agora é público!" : "Repertório agora é privado",
      };
    }),

  // Duplicar repertório
  duplicate: publicProcedure
    .input(z.object({ id: z.number(), novoNome: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [original] = await db
        .select()
        .from(repertorios)
        .where(eq(repertorios.id, input.id))
        .limit(1);

      if (!original) {
        throw new Error("Repertório não encontrado");
      }

      if (!original.isPublic && original.userId !== ctx.user.id) {
        throw new Error("Você não tem permissão para duplicar este repertório");
      }

      const [result] = await db
        .insert(repertorios)
        .values({
          userId: ctx.user.id,
          nome: input.novoNome || `${original.nome} (Cópia)`,
          descricao: original.descricao,
          notas: original.notas,
          musicas: original.musicas,
          ordemMusicas: original.ordemMusicas,
          emailUsuario: ctx.user.email || null,
          nomeUsuario: ctx.user.name || null,
          dataCelebracao: null,
          isPublic: 0,
          shareId: null,
        })
        .$returningId();

      return { success: true, id: result.id, message: "Repertório duplicado com sucesso!" };
    }),

  // Atualizar notas do repertório
  updateNotas: publicProcedure
    .input(
      z.object({
        id: z.number(),
        notas: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error("Usuário não autenticado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db
        .select()
        .from(repertorios)
        .where(eq(repertorios.id, input.id))
        .limit(1);

      if (!repertorio || repertorio.userId !== ctx.user.id) {
        throw new Error("Você não tem permissão para editar este repertório");
      }

      await db.update(repertorios).set({ notas: input.notas }).where(eq(repertorios.id, input.id));

      return { success: true, message: "Notas atualizadas!" };
    }),

  // Exportar repertório em PDF
  exportPDF: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [repertorio] = await db
        .select()
        .from(repertorios)
        .where(eq(repertorios.id, input.id))
        .limit(1);

      if (!repertorio) {
        throw new Error("Repertório não encontrado");
      }

      // Verificar permissão: público ou dono
      if (!repertorio.isPublic && repertorio.userId && repertorio.userId !== ctx.user?.id) {
        throw new Error("Você não tem permissão para acessar este repertório");
      }

      const musicasIds = JSON.parse(repertorio.musicas || "[]");
      
      // Importar repertório completo para buscar dados das músicas
      const { repertorioCompleto } = await import("../../client/src/data/repertorioCompleto");
      
      // Criar mapa de músicas por ID com TODOS os formatos possíveis
      const musicasMap = new Map();
      
      repertorioCompleto.forEach(momento => {
        momento.musicas.forEach(musica => {
          const musicaData = {
            id: `${momento.id}-${musica.numero}`,
            titulo: musica.titulo,
            artista: musica.artista,
            momento: momento.titulo.replace(/ \(.*\)$/, ''), // Remove sufixos como (Missa do Galo)
            tom: musica.observacao?.match(/Tom:\s*([A-G][#b]?[m]?)/)?.[1] || "",
            cifraResumo: "",
            linkYouTube: musica.youtube || "",
            linkCifra: musica.cifra || "",
          };
          
          // Gerar TODAS as variações possíveis de ID
          const variacoesId = [
            // Formato completo: momento.id-musica.numero
            `${momento.id}-${musica.numero}`,
            
            // Formato simplificado do template: apenas momento.id base + numero
            // Exemplo: "entrada-1" para momento.id="entrada"
            `${momento.id.split('-')[0]}-${musica.numero}`,
            
            // Formato com momento base normalizado
            // Exemplo: "ato-penitencial-1" para momento.id="penitencial"
            momento.id.includes('penitencial') ? `ato-penitencial-${musica.numero}` : null,
            momento.id.includes('aclamacao') || momento.id.includes('evangelho') ? `aclamacao-ao-evangelho-${musica.numero}` : null,
            momento.id.includes('acendimento') ? `acendimento-da-vela-do-advento-${musica.numero}` : null,
            momento.id.includes('ofertorio') ? `ofertorio-${musica.numero}` : null,
            momento.id.includes('santo') ? `santo-${musica.numero}` : null,
            momento.id.includes('cordeiro') ? `cordeiro-${musica.numero}` : null,
            momento.id.includes('comunhao') ? `comunhao-${musica.numero}` : null,
            momento.id.includes('final') ? `final-${musica.numero}` : null,
            momento.id.includes('entrada') ? `entrada-${musica.numero}` : null,
            momento.id.includes('gloria') ? `gloria-${musica.numero}` : null,
            
            // Formatos específicos de Missa do Galo
            momento.id.startsWith('missa-galo') ? `missa-galo-${momento.id.split('-').slice(2).join('-')}-${musica.numero}` : null,
            
            // Formatos específicos de Tempo do Natal
            momento.id.startsWith('tempo-natal') ? `tempo-natal-${momento.id.split('-').slice(2).join('-')}-${musica.numero}` : null,
          ].filter(Boolean); // Remove nulls
          
          // Registrar música com todas as variações
          variacoesId.forEach(id => {
            if (id) {
              musicasMap.set(id, musicaData);
            }
          });
        });
      });
      
      console.log("[PDF Export] Total de entradas no mapa:", musicasMap.size);
      console.log("[PDF Export] IDs recebidos do banco:", musicasIds);
      
      // Buscar dados completos das músicas
      const musicasCompletas = musicasIds
        .map((id: string) => {
          const musica = musicasMap.get(id);
          if (!musica) {
            console.log(`[PDF Export] ❌ Música NÃO encontrada para ID: "${id}"`);
          } else {
            console.log(`[PDF Export] ✓ Música encontrada: "${musica.titulo}" (${id})`);
          }
          return musica;
        })
        .filter((m: any) => m !== undefined);
      
      console.log("[PDF Export] Total de músicas encontradas:", musicasCompletas.length, "de", musicasIds.length);
      
      const pdfBuffer = await gerarPDFRepertorio({
        nome: repertorio.nome,
        descricao: repertorio.descricao || undefined,
        musicas: musicasCompletas,
        dataCelebracao: repertorio.dataCelebracao ? repertorio.dataCelebracao.toISOString() : undefined,
        notas: repertorio.notas || undefined,
      });

      // Retornar PDF como base64
      return {
        success: true,
        pdf: pdfBuffer.toString("base64"),
        filename: `${repertorio.nome.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
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
