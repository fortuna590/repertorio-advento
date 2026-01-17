import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { escalas, funcoesEscala, participantesEscala } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { sendEmail, templateEmailEscala, templateEmailStatusEscala, templateEmailLembreteEscala } from "../_core/email";

export const escalasRouter = router({
  // Criar nova escala
  criar: publicProcedure
    .input(z.object({
      userId: z.string(),
      titulo: z.string(),
      descricao: z.string().optional(),
      data: z.string(), // formato YYYY-MM-DD
      hora: z.string().optional(),
      local: z.string().optional(),
      tipo: z.enum(["musicos", "reuniao", "grupo_oracao", "personalizado"]),
      template: z.string().optional(),
      funcoes: z.array(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        ordem: z.number(),
      })),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Criar escala
      const [escala] = await db.insert(escalas).values({
        userId: input.userId,
        titulo: input.titulo,
        descricao: input.descricao,
        data: input.data,
        hora: input.hora,
        local: input.local,
        tipo: input.tipo,
        template: input.template,
      });

      // Criar funções
      if (input.funcoes.length > 0) {
        await db.insert(funcoesEscala).values(
          input.funcoes.map((funcao: any) => ({
            escalaId: escala.insertId,
            nome: funcao.nome,
            descricao: funcao.descricao,
            ordem: funcao.ordem,
          }))
        );
      }

      return { success: true, escalaId: escala.insertId };
    }),

  // Listar escalas do usuário
  listar: publicProcedure
    .input(z.object({
      userId: z.string(),
      tipo: z.enum(["musicos", "reuniao", "grupo_oracao", "personalizado", "todos"]).optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(escalas.userId, input.userId)];

      // Filtrar por tipo
      if (input.tipo && input.tipo !== "todos") {
        conditions.push(eq(escalas.tipo, input.tipo));
      }

      // Filtrar por data
      if (input.dataInicio) {
        conditions.push(gte(escalas.data, input.dataInicio));
      }

      if (input.dataFim) {
        conditions.push(lte(escalas.data, input.dataFim));
      }

      const result = await db.select().from(escalas).where(and(...conditions)).orderBy(desc(escalas.data));
      return result;
    }),

  // Buscar escala por ID com funções e participantes
  buscarPorId: publicProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [escala] = await db.select().from(escalas).where(eq(escalas.id, input.escalaId));
      
      if (!escala) {
        throw new Error("Escala não encontrada");
      }

      const funcoes = await db.select().from(funcoesEscala).where(eq(funcoesEscala.escalaId, input.escalaId));
      const participantes = await db.select().from(participantesEscala).where(eq(participantesEscala.escalaId, input.escalaId));

      return {
        ...escala,
        funcoes,
        participantes,
      };
    }),

  // Atualizar escala
  atualizar: publicProcedure
    .input(z.object({
      escalaId: z.number(),
      titulo: z.string().optional(),
      descricao: z.string().optional(),
      data: z.string().optional(),
      hora: z.string().optional(),
      local: z.string().optional(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { escalaId, ...updates } = input;
      await db.update(escalas).set(updates).where(eq(escalas.id, escalaId));
      return { success: true };
    }),

  // Deletar escala
  deletar: publicProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(escalas).where(eq(escalas.id, input.escalaId));
      return { success: true };
    }),

  // Adicionar participante
  adicionarParticipante: publicProcedure
    .input(z.object({
      escalaId: z.number(),
      funcaoId: z.number(),
      nome: z.string(),
      email: z.string().optional(),
      telefone: z.string().optional(),
      status: z.enum(["confirmado", "pendente", "ausente"]).default("pendente"),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar conflitos de agendamento
      const [escala] = await db.select().from(escalas).where(eq(escalas.id, input.escalaId));
      
      if (escala && input.email) {
        // Buscar outras escalas do mesmo participante em datas próximas (7 dias antes e depois)
        const dataEscala = new Date(escala.data);
        const dataInicio = new Date(dataEscala);
        dataInicio.setDate(dataInicio.getDate() - 7);
        const dataFim = new Date(dataEscala);
        dataFim.setDate(dataFim.getDate() + 7);

        const dataInicioStr = dataInicio.toISOString().split('T')[0];
        const dataFimStr = dataFim.toISOString().split('T')[0];
        
        const escalasProximas = await db.select()
          .from(escalas)
          .where(
            and(
              gte(escalas.data, dataInicioStr as any),
              lte(escalas.data, dataFimStr as any)
            )
          );

        // Verificar se o participante já está em alguma dessas escalas
        const conflitos = [];
        for (const escalaProxima of escalasProximas) {
          if (escalaProxima.id === input.escalaId) continue;
          
          const participantesConflito = await db.select()
            .from(participantesEscala)
            .where(
              and(
                eq(participantesEscala.escalaId, escalaProxima.id),
                eq(participantesEscala.email, input.email)
              )
            );
          
          if (participantesConflito.length > 0) {
            conflitos.push({
              titulo: escalaProxima.titulo,
              data: escalaProxima.data,
              hora: escalaProxima.hora,
            });
          }
        }

        // Se houver conflitos, retornar para exibir alerta
        if (conflitos.length > 0) {
          return { 
            success: false, 
            conflitos,
            message: "Participante já está escalado em outra(s) data(s) próxima(s)"
          };
        }
      }

      // Gerar token único para confirmação rápida
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Inserir participante com token
      const [participanteInserido] = await db.insert(participantesEscala).values({
        ...input,
        token,
      });

      // Enviar email de notificação se tiver email
      if (input.email && escala) {
        const [funcao] = await db.select().from(funcoesEscala).where(eq(funcoesEscala.id, input.funcaoId));
        
        if (funcao) {
          const dataFormatada = new Date(escala.data).toLocaleDateString('pt-BR');
          const linkConfirmacao = `${process.env.VITE_OAUTH_PORTAL_URL || 'http://localhost:3000'}/confirmar/${token}`;
          
          // Criar HTML do email com link de confirmação
          const emailHtml = templateEmailEscala(
            input.nome,
            escala.titulo,
            funcao.nome,
            dataFormatada,
            escala.hora || null,
            escala.local || null,
            escala.descricao || null
          ).replace(
            '</body>',
            `<div style="text-align: center; margin: 30px 0; padding: 20px; background: #f3f4f6; border-radius: 8px;">
              <p style="margin-bottom: 15px; font-weight: bold;">Confirme sua presença:</p>
              <a href="${linkConfirmacao}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                ✅ Confirmar Presença
              </a>
            </div></body>`
          );
          
          await sendEmail({
            to: input.email,
            subject: `Você foi escalado: ${escala.titulo}`,
            html: emailHtml,
          });
        }
      }

      return { success: true, token, participanteId: participanteInserido.insertId };
    }),

  // Atualizar participante
  atualizarParticipante: publicProcedure
    .input(z.object({
      participanteId: z.number(),
      nome: z.string().optional(),
      email: z.string().optional(),
      telefone: z.string().optional(),
      status: z.enum(["confirmado", "pendente", "ausente"]).optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { participanteId, ...updates } = input;
      await db.update(participantesEscala).set(updates).where(eq(participantesEscala.id, participanteId));
      return { success: true };
    }),

  // Remover participante
  removerParticipante: publicProcedure
    .input(z.object({
      participanteId: z.number(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(participantesEscala).where(eq(participantesEscala.id, input.participanteId));
      return { success: true };
    }),

  // Atualizar status de participante
  atualizarStatus: publicProcedure
    .input(z.object({
      participanteId: z.number(),
      status: z.enum(["confirmado", "pendente", "ausente"]),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar participante antes de atualizar
      const [participante] = await db.select()
        .from(participantesEscala)
        .where(eq(participantesEscala.id, input.participanteId));

      if (!participante) {
        throw new Error("Participante não encontrado");
      }

      // Atualizar status
      await db.update(participantesEscala)
        .set({ status: input.status })
        .where(eq(participantesEscala.id, input.participanteId));

      // Enviar email de notificação se tiver email
      if (participante.email) {
        const [escala] = await db.select().from(escalas).where(eq(escalas.id, participante.escalaId));
        const [funcao] = await db.select().from(funcoesEscala).where(eq(funcoesEscala.id, participante.funcaoId));

        if (escala && funcao) {
          await sendEmail({
            to: participante.email,
            subject: `Status atualizado: ${escala.titulo}`,
            html: templateEmailStatusEscala(
              participante.nome,
              escala.titulo,
              funcao.nome,
              input.status
            ),
          });
        }
      }

      return { success: true };
    }),

  // Buscar próximas escalas do usuário (para widget de dashboard)
  proximasEscalas: publicProcedure
    .input(z.object({
      userId: z.string(),
      limite: z.number().default(3),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return [];

      const hoje = new Date().toISOString().split('T')[0];
      
      const result = await db.select()
        .from(escalas)
        .where(
          and(
            eq(escalas.userId, input.userId),
            gte(escalas.data, hoje as any)
          )
        )
        .orderBy(escalas.data)
        .limit(input.limite);
      
      return result;
    }),

  // Confirmar participação via token (público, sem autenticação)
  confirmarPorToken: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar participante pelo token
      const [participante] = await db.select()
        .from(participantesEscala)
        .where(eq(participantesEscala.token, input.token));

      if (!participante) {
        throw new Error("Token inválido ou participante não encontrado");
      }

      // Atualizar status para confirmado
      await db.update(participantesEscala)
        .set({ status: "confirmado" })
        .where(eq(participantesEscala.id, participante.id));

      // Buscar informações da escala para retornar
      const [escala] = await db.select().from(escalas).where(eq(escalas.id, participante.escalaId));
      const [funcao] = await db.select().from(funcoesEscala).where(eq(funcoesEscala.id, participante.funcaoId));

      return { 
        success: true,
        participante: participante.nome,
        escala: escala?.titulo,
        funcao: funcao?.nome,
        data: escala?.data,
        hora: escala?.hora,
        local: escala?.local,
      };
    }),

  // Buscar informações de participante por token (para exibir página de confirmação)
  buscarPorToken: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [participante] = await db.select()
        .from(participantesEscala)
        .where(eq(participantesEscala.token, input.token));

      if (!participante) {
        throw new Error("Token inválido");
      }

      const [escala] = await db.select().from(escalas).where(eq(escalas.id, participante.escalaId));
      const [funcao] = await db.select().from(funcoesEscala).where(eq(funcoesEscala.id, participante.funcaoId));

      return {
        participante: participante.nome,
        email: participante.email,
        status: participante.status,
        escala: escala?.titulo,
        funcao: funcao?.nome,
        data: escala?.data,
        hora: escala?.hora,
        local: escala?.local,
        descricao: escala?.descricao,
      };
    }),

  // Buscar escalas próximas (24h) com participantes pendentes (para lembretes)
  escalasParaLembrete: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return [];

      // Data de amanhã (24h a partir de agora)
      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      const amanhaStr = amanha.toISOString().split('T')[0];

      // Buscar escalas do usuário para amanhã
      const escalasAmanha = await db.select()
        .from(escalas)
        .where(
          and(
            eq(escalas.userId, input.userId),
            eq(escalas.data, amanhaStr as any)
          )
        );

      const resultado = [];
      
      for (const escala of escalasAmanha) {
        // Buscar participantes pendentes
        const participantesPendentes = await db.select()
          .from(participantesEscala)
          .where(
            and(
              eq(participantesEscala.escalaId, escala.id),
              eq(participantesEscala.status, "pendente")
            )
          );

        if (participantesPendentes.length > 0) {
          // Buscar funções para cada participante
          for (const participante of participantesPendentes) {
            const [funcao] = await db.select()
              .from(funcoesEscala)
              .where(eq(funcoesEscala.id, participante.funcaoId));

            resultado.push({
              escala,
              participante,
              funcao,
            });
          }
        }
      }

      return resultado;
    }),

  // Enviar lembretes para escalas próximas (24h)
  enviarLembretes: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Data de amanhã (24h a partir de agora)
      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      const amanhaStr = amanha.toISOString().split('T')[0];

      // Buscar escalas do usuário para amanhã
      const escalasAmanha = await db.select()
        .from(escalas)
        .where(
          and(
            eq(escalas.userId, input.userId),
            eq(escalas.data, amanhaStr as any)
          )
        );

      let emailsEnviados = 0;
      let erros = 0;
      
      for (const escala of escalasAmanha) {
        // Buscar participantes pendentes
        const participantesPendentes = await db.select()
          .from(participantesEscala)
          .where(
            and(
              eq(participantesEscala.escalaId, escala.id),
              eq(participantesEscala.status, "pendente")
            )
          );

        for (const participante of participantesPendentes) {
          if (!participante.email || !participante.token) continue;

          // Buscar função
          const [funcao] = await db.select()
            .from(funcoesEscala)
            .where(eq(funcoesEscala.id, participante.funcaoId));

          if (!funcao) continue;

          const dataFormatada = new Date(escala.data).toLocaleDateString('pt-BR');
          const linkConfirmacao = `${process.env.VITE_OAUTH_PORTAL_URL || 'http://localhost:3000'}/confirmar/${participante.token}`;

          try {
            await sendEmail({
              to: participante.email,
              subject: `⏰ Lembrete: ${escala.titulo} é amanhã!`,
              html: templateEmailLembreteEscala(
                participante.nome,
                escala.titulo,
                funcao.nome,
                dataFormatada,
                escala.hora || null,
                escala.local || null,
                linkConfirmacao
              ),
            });
            emailsEnviados++;
          } catch (error) {
            console.error(`Erro ao enviar lembrete para ${participante.email}:`, error);
            erros++;
          }
        }
      }

      return { 
        success: true,
        emailsEnviados,
        erros,
        escalasProcessadas: escalasAmanha.length,
      };
    }),
});
