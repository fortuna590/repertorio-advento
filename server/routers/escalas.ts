import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { escalas, funcoesEscala, participantesEscala } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, and, or, desc, gte, lte } from "drizzle-orm";
import { sendEmail, templateEmailEscala, templateEmailStatusEscala, templateEmailLembreteEscala } from "../_core/email";
import { sendWhatsApp, templateWhatsAppConvite, formatPhoneNumber } from "../_core/whatsapp";

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
  atualizar: protectedProcedure
    .input(z.object({
      escalaId: z.number(),
      titulo: z.string().optional(),
      descricao: z.string().optional(),
      data: z.string().optional(),
      hora: z.string().optional(),
      local: z.string().optional(),
      tipo: z.enum(["musicos", "reuniao", "grupo_oracao", "personalizado"]).optional(),
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
        // Buscar outras escalas do mesmo participante APENAS no mesmo dia e horário
        const dataEscalaStr = typeof escala.data === 'string' ? escala.data : new Date(escala.data).toISOString().split('T')[0];
        
        const escalasProximas = await db.select()
          .from(escalas)
          .where(
            and(
              eq(escalas.data, dataEscalaStr as any),
              escala.hora ? eq(escalas.hora, escala.hora) : undefined
            )
          );

        // Verificar se o participante já está em alguma dessas escalas (mesmo dia e horário)
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
            message: "Participante já está escalado em outra escala no mesmo dia e horário"
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

          // Enviar WhatsApp se tiver telefone
          if (input.telefone) {
            const telefoneFormatado = formatPhoneNumber(input.telefone);
            const mensagemWhatsApp = templateWhatsAppConvite(
              input.nome,
              escala.titulo,
              funcao.nome,
              dataFormatada,
              escala.hora || null,
              escala.local || null,
              linkConfirmacao
            );
            await sendWhatsApp({
              to: telefoneFormatado,
              message: mensagemWhatsApp,
            });
          }
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

  // Buscar usuários cadastrados
  buscarUsuarios: publicProcedure
    .input(z.object({
      busca: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { users } = await import("../../drizzle/schema");

      // Buscar todos os usuários (filtro simples)
      const todosUsuarios = await db.select({
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .limit(100);

      // Filtrar no JavaScript
      const resultados = input.busca
        ? todosUsuarios.filter(u => 
            u.name?.toLowerCase().includes(input.busca.toLowerCase()) ||
            u.email?.toLowerCase().includes(input.busca.toLowerCase())
          ).slice(0, 10)
        : todosUsuarios.slice(0, 10);

      return resultados;
    }),

  // Minhas escalas (escalas do usuário logado)
  minhasEscalas: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar escalas onde o usuário é participante
      const participacoes = await db.select()
        .from(participantesEscala)
        .where(eq(participantesEscala.userId, input.userId));

      const escalasIds = participacoes.map(p => p.escalaId);
      if (escalasIds.length === 0) return [];

      // Buscar detalhes das escalas
      const minhasEscalas = [];
      for (const id of escalasIds) {
        const [escala] = await db.select().from(escalas).where(eq(escalas.id, id));
        if (!escala) continue;

        // Buscar participantes
        const participantes = await db.select().from(participantesEscala)
          .where(eq(participantesEscala.escalaId, id));

        // Buscar funções
        const participantesComFuncao = [];
        for (const p of participantes) {
          const [funcao] = await db.select().from(funcoesEscala)
            .where(eq(funcoesEscala.id, p.funcaoId));
          participantesComFuncao.push({ ...p, funcao });
        }

        minhasEscalas.push({
          ...escala,
          participantes: participantesComFuncao,
        });
      }

      return minhasEscalas;
    }),

  // Estatísticas gerais
  estatisticas: protectedProcedure
    .input(z.object({
      userId: z.union([z.string(), z.number()]),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { participantes: [], resumo: {} };

      const userId = typeof input.userId === 'number' ? input.userId.toString() : input.userId;

      // Buscar todas as escalas do usuário
      const minhasEscalas = await db
        .select()
        .from(escalas)
        .where(eq(escalas.userId, userId))
        .orderBy(desc(escalas.data));

      const escalaIds = minhasEscalas.map(e => e.id);

      if (escalaIds.length === 0) {
        return { participantes: [], resumo: { totalEscalas: 0, totalParticipacoes: 0, totalConfirmados: 0, totalAusentes: 0, taxaConfirmacaoGeral: 0 } };
      }

      // Agrupar estatísticas por participante
      const estatisticasPorParticipante: any = {};

      for (const escalaId of escalaIds) {
        const participantes = await db
          .select()
          .from(participantesEscala)
          .where(eq(participantesEscala.escalaId, escalaId));

        for (const p of participantes) {
          const key = `${p.userId}-${p.nome}`;
          if (!estatisticasPorParticipante[key]) {
            estatisticasPorParticipante[key] = {
              userId: p.userId,
              nome: p.nome,
              email: p.email,
              totalParticipacoes: 0,
              confirmados: 0,
              pendentes: 0,
              ausentes: 0,
            };
          }

          estatisticasPorParticipante[key].totalParticipacoes++;
          if (p.status === "confirmado") estatisticasPorParticipante[key].confirmados++;
          if (p.status === "pendente") estatisticasPorParticipante[key].pendentes++;
          if (p.status === "ausente") estatisticasPorParticipante[key].ausentes++;
        }
      }

      // Converter para array e calcular taxas
      const participantesArray = Object.values(estatisticasPorParticipante).map((p: any) => ({
        ...p,
        taxaConfirmacao: p.totalParticipacoes > 0
          ? Math.round((p.confirmados / p.totalParticipacoes) * 100)
          : 0,
        taxaAusencia: p.totalParticipacoes > 0
          ? Math.round((p.ausentes / p.totalParticipacoes) * 100)
          : 0,
      }));

      // Ordenar por total de participações
      participantesArray.sort((a: any, b: any) => b.totalParticipacoes - a.totalParticipacoes);

      // Calcular resumo geral
      const totalParticipacoes = participantesArray.reduce((sum: number, p: any) => sum + p.totalParticipacoes, 0);
      const totalConfirmados = participantesArray.reduce((sum: number, p: any) => sum + p.confirmados, 0);
      const totalAusentes = participantesArray.reduce((sum: number, p: any) => sum + p.ausentes, 0);

      return {
        participantes: participantesArray,
        resumo: {
          totalEscalas: minhasEscalas.length,
          totalParticipacoes,
          totalConfirmados,
          totalAusentes,
          taxaConfirmacaoGeral: totalParticipacoes > 0
            ? Math.round((totalConfirmados / totalParticipacoes) * 100)
            : 0,
        },
      };
    }),

  // Histórico de participações
  historicoParticipacoes: publicProcedure
    .input(z.object({
      userId: z.number(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      funcaoId: z.number().optional(),
      status: z.enum(["confirmado", "pendente", "ausente"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar participações do usuário
      let participacoes = await db.select()
        .from(participantesEscala)
        .where(eq(participantesEscala.userId, input.userId));

      // Aplicar filtros
      if (input.funcaoId) {
        participacoes = participacoes.filter(p => p.funcaoId === input.funcaoId);
      }
      if (input.status) {
        participacoes = participacoes.filter(p => p.status === input.status);
      }

      // Buscar detalhes das escalas
      const historico = [];
      for (const p of participacoes) {
        const [escala] = await db.select().from(escalas)
          .where(eq(escalas.id, p.escalaId));
        if (!escala) continue;

        // Filtrar por data
        if (input.dataInicio && new Date(escala.data) < new Date(input.dataInicio)) continue;
        if (input.dataFim && new Date(escala.data) > new Date(input.dataFim)) continue;

        const [funcao] = await db.select().from(funcoesEscala)
          .where(eq(funcoesEscala.id, p.funcaoId));

        historico.push({
          id: p.id,
          escalaId: escala.id,
          tituloEscala: escala.titulo,
          data: escala.data,
          hora: escala.hora,
          local: escala.local,
          funcao: funcao?.nome || "Desconhecida",
          status: p.status,
          observacoes: p.observacoes,
        });
      }

      // Ordenar por data (mais recente primeiro)
      historico.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      return historico;
    }),

  // Enviar lembretes por email
  enviarLembretesEmail: protectedProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar escala
      const [escala] = await db.select().from(escalas)
        .where(eq(escalas.id, input.escalaId));
      if (!escala) throw new Error("Escala não encontrada");

      // Buscar participantes confirmados ou pendentes
      const participantes = await db.select()
        .from(participantesEscala)
        .where(
          and(
            eq(participantesEscala.escalaId, input.escalaId),
            or(
              eq(participantesEscala.status, "confirmado"),
              eq(participantesEscala.status, "pendente")
            )
          )
        );

      if (participantes.length === 0) {
        throw new Error("Nenhum participante para enviar lembretes");
      }

      // Importar helper de email
      const { sendEscalaReminder } = await import("../_core/emailReminder");

      let enviados = 0;
      let erros = 0;

      // Enviar email para cada participante
      for (const participante of participantes) {
        // Buscar função
        const [funcao] = await db.select().from(funcoesEscala)
          .where(eq(funcoesEscala.id, participante.funcaoId));

        const success = await sendEscalaReminder({
          to: participante.email || "",
          escalaTitle: escala.titulo,
          escalaDate: new Date(escala.data).toLocaleDateString("pt-BR"),
          escalaTime: escala.hora || "Não informado",
          escalaLocal: escala.local || "Não informado",
          participantName: participante.nome,
          participantRole: funcao?.nome || "Não especificada",
        });

        if (success) {
          enviados++;
        } else {
          erros++;
        }
      }

      return {
        total: participantes.length,
        enviados,
        erros,
      };
    }),
});
