import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { escalas, funcoesEscala, participantesEscala, historicoEscalas, templatesEscalas } from "../../drizzle/schema";
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
      console.log("[Escalas] Atualizando escala", escalaId, "com dados:", updates);
      
      await db.update(escalas).set(updates).where(eq(escalas.id, escalaId));
      
      // Verificar se foi atualizado
      const [escalaAtualizada] = await db.select().from(escalas).where(eq(escalas.id, escalaId));
      console.log("[Escalas] Escala após update:", escalaAtualizada);
      
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

      // Buscar userId pelo email se fornecido
      let userId = null;
      if (input.email) {
        const { users } = await import("../../drizzle/schema");
        const [usuario] = await db.select().from(users).where(eq(users.email, input.email));
        if (usuario) {
          userId = usuario.id;
          console.log("[Escalas] Usuário encontrado pelo email:", input.email, "-> userId:", userId);
        } else {
          console.log("[Escalas] Nenhum usuário encontrado com email:", input.email);
        }
      }

      // Inserir participante com token e userId
      const [participanteInserido] = await db.insert(participantesEscala).values({
        ...input,
        userId,
        token,
      });
      
      console.log("[Escalas] Participante inserido com userId:", userId);

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

  // Duplicar escala
  duplicarEscala: protectedProcedure
    .input(z.object({
      escalaId: z.number(),
      novaData: z.string(),
      novaHora: z.string().optional(),
      copiarParticipantes: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar escala original
      const [escalaOriginal] = await db.select().from(escalas)
        .where(eq(escalas.id, input.escalaId));
      if (!escalaOriginal) throw new Error("Escala não encontrada");

      // Criar nova escala com dados da original
      const [novaEscala] = await db.insert(escalas).values({
        userId: escalaOriginal.userId,
        titulo: `${escalaOriginal.titulo} (Cópia)`,
        descricao: escalaOriginal.descricao,
        data: new Date(input.novaData),
        hora: input.novaHora || escalaOriginal.hora,
        local: escalaOriginal.local,
        tipo: escalaOriginal.tipo,
        template: escalaOriginal.template,
      });

      const novaEscalaId = novaEscala.insertId;

      // Copiar funções
      const funcoesOriginais = await db.select().from(funcoesEscala)
        .where(eq(funcoesEscala.escalaId, input.escalaId));

      const mapFuncoesIds: { [oldId: number]: number } = {};

      for (const funcao of funcoesOriginais) {
        const [novaFuncao] = await db.insert(funcoesEscala).values({
          escalaId: novaEscalaId,
          nome: funcao.nome,
          descricao: funcao.descricao,
          ordem: funcao.ordem,
        });
        mapFuncoesIds[funcao.id] = novaFuncao.insertId;
      }

      // Copiar participantes se solicitado
      if (input.copiarParticipantes) {
        const participantesOriginais = await db.select().from(participantesEscala)
          .where(eq(participantesEscala.escalaId, input.escalaId));

        for (const participante of participantesOriginais) {
          const novaFuncaoId = mapFuncoesIds[participante.funcaoId];
          if (!novaFuncaoId) continue;

          // Gerar novo token
          const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

          await db.insert(participantesEscala).values({
            escalaId: novaEscalaId,
            funcaoId: novaFuncaoId,
            userId: participante.userId,
            nome: participante.nome,
            email: participante.email,
            telefone: participante.telefone,
            status: "pendente", // Resetar status para pendente
            observacoes: participante.observacoes,
            token,
          });
        }
      }

      return { 
        success: true, 
        novaEscalaId,
        mensagem: input.copiarParticipantes 
          ? "Escala duplicada com sucesso, incluindo participantes!"
          : "Escala duplicada com sucesso!"
      };
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

  // Verificar conflitos de horário de um participante
  verificarConflitos: publicProcedure
    .input(z.object({
      email: z.string().optional(),
      telefone: z.string().optional(),
      escalaId: z.number(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return { conflitos: [] };

      // Buscar escala atual
      const [escalaAtual] = await db.select().from(escalas).where(eq(escalas.id, input.escalaId));
      if (!escalaAtual) return { conflitos: [] };

      // Buscar participações do mesmo email/telefone
      const condicoes = [];
      if (input.email) {
        condicoes.push(eq(participantesEscala.email, input.email));
      }
      if (input.telefone) {
        condicoes.push(eq(participantesEscala.telefone, input.telefone));
      }

      if (condicoes.length === 0) return { conflitos: [] };

      // Buscar todas as participações do usuário
      const participacoes = await db.select()
        .from(participantesEscala)
        .where(or(...condicoes));

      const conflitos = [];

      // Para cada participação, verificar se há conflito de horário
      for (const participacao of participacoes) {
        if (participacao.escalaId === input.escalaId) continue;

        const [outraEscala] = await db.select().from(escalas)
          .where(eq(escalas.id, participacao.escalaId));

        if (!outraEscala) continue;

        // Verificar se é no mesmo dia
        const dataAtual = new Date(escalaAtual.data).toDateString();
        const dataOutra = new Date(outraEscala.data).toDateString();

        if (dataAtual === dataOutra) {
          // Buscar função do participante
          const [funcao] = await db.select().from(funcoesEscala)
            .where(eq(funcoesEscala.id, participacao.funcaoId));

          conflitos.push({
            escalaId: outraEscala.id,
            titulo: outraEscala.titulo,
            data: outraEscala.data,
            hora: outraEscala.hora,
            funcao: funcao?.nome || "Não especificada",
            status: participacao.status,
          });
        }
      }

      return { conflitos };
    }),

  // Buscar histórico de alterações de uma escala
  buscarHistorico: publicProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return [];

      const historico = await db.select()
        .from(historicoEscalas)
        .where(eq(historicoEscalas.escalaId, input.escalaId))
        .orderBy(desc(historicoEscalas.createdAt));

      return historico;
    }),

  // Registrar ação no histórico (helper interno)
  registrarHistorico: publicProcedure
    .input(z.object({
      escalaId: z.number(),
      userId: z.number().optional(),
      userName: z.string().optional(),
      tipoAcao: z.enum([
        "criacao",
        "edicao",
        "adicao_participante",
        "remocao_participante",
        "alteracao_status",
        "edicao_participante",
        "duplicacao"
      ]),
      descricao: z.string(),
      dadosAnteriores: z.any().optional(),
      dadosNovos: z.any().optional(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(historicoEscalas).values({
        escalaId: input.escalaId,
        userId: input.userId,
        userName: input.userName,
        tipoAcao: input.tipoAcao,
        descricao: input.descricao,
        dadosAnteriores: input.dadosAnteriores ? JSON.stringify(input.dadosAnteriores) : null,
        dadosNovos: input.dadosNovos ? JSON.stringify(input.dadosNovos) : null,
      });

      return { success: true };
    }),

  // Listar templates do usuário
  listarTemplates: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return [];

      const templates = await db.select()
        .from(templatesEscalas)
        .where(eq(templatesEscalas.userId, input.userId))
        .orderBy(desc(templatesEscalas.createdAt));

      // Parsear JSON das funções
      return templates.map(t => ({
        ...t,
        funcoes: JSON.parse(t.funcoes),
      }));
    }),

  // Criar template
  criarTemplate: publicProcedure
    .input(z.object({
      userId: z.string(),
      nome: z.string(),
      descricao: z.string().optional(),
      tipo: z.enum(["musicos", "reuniao", "grupo_oracao", "personalizado"]),
      funcoes: z.array(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        ordem: z.number(),
      })),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [template] = await db.insert(templatesEscalas).values({
        userId: input.userId,
        nome: input.nome,
        descricao: input.descricao,
        tipo: input.tipo,
        funcoes: JSON.stringify(input.funcoes),
      });

      return { success: true, templateId: template.insertId };
    }),

  // Atualizar template
  atualizarTemplate: publicProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string(),
      descricao: z.string().optional(),
      tipo: z.enum(["musicos", "reuniao", "grupo_oracao", "personalizado"]),
      funcoes: z.array(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        ordem: z.number(),
      })),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(templatesEscalas)
        .set({
          nome: input.nome,
          descricao: input.descricao,
          tipo: input.tipo,
          funcoes: JSON.stringify(input.funcoes),
        })
        .where(eq(templatesEscalas.id, input.id));

      return { success: true };
    }),

  // Deletar template
  deletarTemplate: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(templatesEscalas)
        .where(eq(templatesEscalas.id, input.id));

      return { success: true };
    }),

  // Estatísticas - Taxa de confirmação média
  estatisticasTaxaConfirmacao: protectedProcedure
    .input(z.object({
      userId: z.string(),
      periodo: z.enum(["mes", "trimestre", "ano", "tudo"]).optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calcular data de início baseado no período
      const hoje = new Date();
      let dataInicio: Date | null = null;
      
      if (input.periodo === "mes") {
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      } else if (input.periodo === "trimestre") {
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
      } else if (input.periodo === "ano") {
        dataInicio = new Date(hoje.getFullYear(), 0, 1);
      }

      // Buscar escalas do usuário
      const condicoes = [eq(escalas.userId, input.userId)];
      if (dataInicio) {
        condicoes.push(gte(escalas.data, dataInicio.toISOString().split('T')[0] as any));
      }

      const escalasUsuario = await db.select().from(escalas)
        .where(and(...condicoes));

      if (escalasUsuario.length === 0) {
        return { taxaConfirmacao: 0, totalEscalas: 0, totalParticipantes: 0, confirmados: 0 };
      }

      // Buscar participantes de todas as escalas
      const escalasIds = escalasUsuario.map(e => e.id);
      const participantes = await db.select().from(participantesEscala)
        .where(or(...escalasIds.map(id => eq(participantesEscala.escalaId, id))));

      const totalParticipantes = participantes.length;
      const confirmados = participantes.filter(p => p.status === "confirmado").length;
      const taxaConfirmacao = totalParticipantes > 0 ? (confirmados / totalParticipantes) * 100 : 0;

      return {
        taxaConfirmacao: Math.round(taxaConfirmacao * 10) / 10,
        totalEscalas: escalasUsuario.length,
        totalParticipantes,
        confirmados,
      };
    }),

  // Estatísticas - Participantes mais ativos
  estatisticasParticipantesAtivos: protectedProcedure
    .input(z.object({
      userId: z.string(),
      limite: z.number().optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar escalas do usuário
      const escalasUsuario = await db.select().from(escalas)
        .where(eq(escalas.userId, input.userId));

      if (escalasUsuario.length === 0) {
        return [];
      }

      // Buscar participantes de todas as escalas
      const escalasIds = escalasUsuario.map(e => e.id);
      const participantes = await db.select().from(participantesEscala)
        .where(or(...escalasIds.map(id => eq(participantesEscala.escalaId, id))));

      // Agrupar por participante e contar
      const contagemPorParticipante: Record<string, { nome: string; total: number; confirmados: number }> = {};
      
      participantes.forEach(p => {
        if (!contagemPorParticipante[p.nome]) {
          contagemPorParticipante[p.nome] = { nome: p.nome, total: 0, confirmados: 0 };
        }
        contagemPorParticipante[p.nome].total++;
        if (p.status === "confirmado") {
          contagemPorParticipante[p.nome].confirmados++;
        }
      });

      // Converter para array e ordenar por total
      const ranking = Object.values(contagemPorParticipante)
        .map(p => ({
          ...p,
          taxaConfirmacao: p.total > 0 ? Math.round((p.confirmados / p.total) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, input.limite || 10);

      return ranking;
    }),

  // Estatísticas - Funções mais demandadas
  estatisticasFuncoesDemandadas: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar escalas do usuário
      const escalasUsuario = await db.select().from(escalas)
        .where(eq(escalas.userId, input.userId));

      if (escalasUsuario.length === 0) {
        return [];
      }

      // Buscar funções de todas as escalas
      const escalasIds = escalasUsuario.map(e => e.id);
      const funcoes = await db.select().from(funcoesEscala)
        .where(or(...escalasIds.map(id => eq(funcoesEscala.escalaId, id))));

      // Agrupar por nome de função e contar
      const contagemPorFuncao: Record<string, number> = {};
      
      funcoes.forEach(f => {
        if (!contagemPorFuncao[f.nome]) {
          contagemPorFuncao[f.nome] = 0;
        }
        contagemPorFuncao[f.nome]++;
      });

      // Converter para array e ordenar por total
      const ranking = Object.entries(contagemPorFuncao)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total);

      return ranking;
    }),

  // Estatísticas - Por tipo de escala
  estatisticasPorTipo: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar escalas do usuário
      const escalasUsuario = await db.select().from(escalas)
        .where(eq(escalas.userId, input.userId));

      // Agrupar por tipo e contar
      const contagemPorTipo: Record<string, number> = {};
      
      escalasUsuario.forEach(e => {
        if (!contagemPorTipo[e.tipo]) {
          contagemPorTipo[e.tipo] = 0;
        }
        contagemPorTipo[e.tipo]++;
      });

      // Converter para array
      const estatisticas = Object.entries(contagemPorTipo)
        .map(([tipo, total]) => ({ tipo, total }))
        .sort((a, b) => b.total - a.total);

      return estatisticas;
    }),
});
