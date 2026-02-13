import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { escalas, funcoesEscala, participantesEscala, historicoEscalas, templatesEscalas } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, and, or, desc, gte, lte, sql } from "drizzle-orm";
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
      equipeId: z.number().optional(), // Vincular escala a uma equipe
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
        equipeId: input.equipeId,
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

      // Enviar email de notificação se tiver email válido
      if (input.email && input.email.trim() !== "" && escala) {
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

      // Enviar email de notificação se tiver email válido
      if (participante.email && participante.email.trim() !== "") {
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
            
            // Delay de 600ms entre envios para respeitar limite de 2 req/s do Resend
            await new Promise(resolve => setTimeout(resolve, 600));
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
      const semEmail: string[] = [];

      // Enviar email para cada participante
      for (const participante of participantes) {
        // Validar se participante tem email
        if (!participante.email || participante.email.trim() === "") {
          console.warn(`[Lembrete] Participante ${participante.nome} sem email cadastrado`);
          semEmail.push(participante.nome);
          erros++;
          continue;
        }

        // Buscar função
        const [funcao] = await db.select().from(funcoesEscala)
          .where(eq(funcoesEscala.id, participante.funcaoId));

        const success = await sendEscalaReminder({
          to: participante.email,
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

        // Delay de 600ms entre envios para respeitar limite de 2 req/s do Resend
        if (participantes.indexOf(participante) < participantes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }

      return {
        total: participantes.length,
        enviados,
        erros,
        semEmail: semEmail.length > 0 ? semEmail : undefined,
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

  // Contar escalas pendentes de confirmação
  contarPendentes: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const hoje = new Date().toISOString().split('T')[0];

      // Buscar participações pendentes não arquivadas em escalas futuras
      const participacoes = await db.select()
        .from(participantesEscala)
        .where(
          and(
            eq(participantesEscala.userId, input.userId),
            eq(participantesEscala.status, "pendente"),
            eq(participantesEscala.arquivado, 0)
          )
        );

      // Filtrar apenas escalas futuras
      let count = 0;
      for (const p of participacoes) {
        const [escala] = await db.select().from(escalas)
          .where(eq(escalas.id, p.escalaId));
        if (escala && (escala.data as any) >= hoje) {
          count++;
        }
      }

      return { count };
    }),

  // Arquivar participação
  arquivarParticipacao: publicProcedure
    .input(z.object({
      participanteId: z.number(),
      arquivado: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(participantesEscala)
        .set({ arquivado: input.arquivado ? 1 : 0 })
        .where(eq(participantesEscala.id, input.participanteId));

      return { success: true };
    }),

  // Confirmar múltiplas escalas
  confirmarMultiplas: publicProcedure
    .input(z.object({
      tokens: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let confirmados = 0;
      const erros: string[] = [];

      for (const token of input.tokens) {
        try {
          const [participante] = await db.select()
            .from(participantesEscala)
            .where(eq(participantesEscala.token, token));

          if (!participante) {
            erros.push(`Token inválido: ${token}`);
            continue;
          }

          if (participante.status === "confirmado") {
            continue; // Já confirmado, pular
          }

          await db.update(participantesEscala)
            .set({ status: "confirmado" })
            .where(eq(participantesEscala.token, token));

          confirmados++;

          // Enviar email de confirmação se tiver email válido
          if (participante.email && participante.email.trim() !== "") {
            const [escala] = await db.select().from(escalas)
              .where(eq(escalas.id, participante.escalaId));
            
            if (escala) {
              const [funcao] = await db.select().from(funcoesEscala)
                .where(eq(funcoesEscala.id, participante.funcaoId));

              await sendEmail({
                to: participante.email,
                subject: `Confirmação de Presença - ${escala.titulo}`,
                html: templateEmailStatusEscala(
                  participante.nome,
                  escala.titulo,
                  funcao?.nome || "Participante",
                  "confirmado"
                ),
              });
              
              // Delay de 600ms entre envios para respeitar limite de 2 req/s do Resend
              await new Promise(resolve => setTimeout(resolve, 600));
            }
          }
        } catch (error) {
          console.error(`Erro ao confirmar token ${token}:`, error);
          erros.push(`Erro ao processar: ${token}`);
        }
      }

      return { confirmados, erros };
    }),

  // Criar escala a partir de uma equipe
  criarEscalaDeEquipe: publicProcedure
    .input(z.object({
      userId: z.string(),
      equipeId: z.number(),
      titulo: z.string(),
      descricao: z.string().optional(),
      data: z.string(),
      hora: z.string().optional(),
      local: z.string().optional(),
      tipo: z.enum(["musicos", "reuniao", "grupo_oracao", "personalizado"]),
      template: z.string().optional(),
      funcoes: z.array(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        ordem: z.number(),
        membrosIds: z.array(z.number()).optional(), // IDs dos membros da equipe para esta função
      })),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Importar tabelas de equipes e membros
      const { equipes, membros } = await import("../../drizzle/schema");

      // Verificar se a equipe existe e pertence ao usuário
      const [equipe] = await db.select().from(equipes)
        .where(and(
          eq(equipes.id, input.equipeId),
          eq(equipes.userId, parseInt(input.userId))
        ));

      if (!equipe) {
        throw new Error("Equipe não encontrada ou sem permissão");
      }

      // Criar escala vinculada à equipe
      const [escala] = await db.insert(escalas).values({
        userId: input.userId,
        titulo: input.titulo,
        descricao: input.descricao,
        data: input.data,
        hora: input.hora,
        local: input.local,
        tipo: input.tipo,
        template: input.template,
        equipeId: input.equipeId,
      });

      const escalaId = escala.insertId;

      // Criar funções e adicionar participantes
      for (const funcao of input.funcoes) {
        // Criar função
        const [funcaoCriada] = await db.insert(funcoesEscala).values({
          escalaId,
          nome: funcao.nome,
          descricao: funcao.descricao,
          ordem: funcao.ordem,
        });

        const funcaoId = funcaoCriada.insertId;

        // Adicionar membros à função (se especificados)
        if (funcao.membrosIds && funcao.membrosIds.length > 0) {
          for (const membroId of funcao.membrosIds) {
            // Buscar dados do membro
            const [membro] = await db.select().from(membros)
              .where(and(
                eq(membros.id, membroId),
                eq(membros.equipeId, input.equipeId)
              ));

            if (membro) {
              // Gerar token único
              const token = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);

              // Adicionar participante
              await db.insert(participantesEscala).values({
                escalaId,
                funcaoId,
                nome: membro.nome,
                email: membro.email || "",
                telefone: membro.telefone || "",
                status: "pendente",
                token,
              });
            }
          }
        }
      }

      return { success: true, escalaId };
    }),

  // Listar escalas por equipe
  listarPorEquipe: publicProcedure
    .input(z.object({
      equipeId: z.number(),
      userId: z.string(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.select().from(escalas)
        .where(and(
          eq(escalas.equipeId, input.equipeId),
          eq(escalas.userId, input.userId)
        ))
        .orderBy(desc(escalas.data));

      return result;
    }),

  // Gerar escala automaticamente com distribuição equilibrada
  gerarEscalaAutomatica: publicProcedure
    .input(z.object({
      userId: z.string(),
      equipeId: z.number(),
      titulo: z.string(),
      descricao: z.string().optional(),
      datas: z.array(z.string()), // Array de datas para escalas recorrentes
      hora: z.string().optional(),
      local: z.string().optional(),
      tipo: z.enum(["musicos", "reuniao", "grupo_oracao", "personalizado"]),
      template: z.string().optional(),
      funcoes: z.array(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        ordem: z.number(),
        quantidadeMembros: z.number(), // Quantos membros são necessários para esta função
        essencial: z.boolean().optional(), // Se true, garante pelo menos 1 membro
      })),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { equipes, membros, indisponibilidades } = await import("../../drizzle/schema");

      // Verificar se a equipe existe e pertence ao usuário
      const [equipe] = await db.select().from(equipes)
        .where(and(
          eq(equipes.id, input.equipeId),
          eq(equipes.userId, parseInt(input.userId))
        ));

      if (!equipe) {
        throw new Error("Equipe não encontrada ou sem permissão");
      }

      // Buscar todos os membros da equipe
      const todosMembros = await db.select().from(membros)
        .where(eq(membros.equipeId, input.equipeId));

      if (todosMembros.length === 0) {
        throw new Error("A equipe não possui membros cadastrados");
      }

      // Buscar histórico de participações para equilibrar
      const historicoParticipacoes = await db.select({
        membroNome: participantesEscala.nome,
        count: sql<number>`COUNT(*)`
      })
      .from(participantesEscala)
      .innerJoin(escalas, eq(participantesEscala.escalaId, escalas.id))
      .where(eq(escalas.equipeId, input.equipeId))
      .groupBy(participantesEscala.nome);

      // Criar mapa de participações
      const participacoesPorMembro = new Map<string, number>();
      historicoParticipacoes.forEach((h: any) => {
        participacoesPorMembro.set(h.membroNome, h.count);
      });

      const escalasIds: number[] = [];

      // Gerar escala para cada data
      for (const data of input.datas) {
        // Buscar indisponibilidades para esta data
        // Nota: Assumindo que a tabela indisponibilidades tem campos equipeId e data
        // Se não existir, este filtro será ignorado
        const indisponiveisNaData: any[] = [];
        // TODO: Implementar busca de indisponibilidades quando tabela estiver disponível

        const membrosIndisponiveis = new Set(
          indisponiveisNaData.map((i: any) => i.membroId)
        );

        // Filtrar membros disponíveis
        const membrosDisponiveis = todosMembros.filter(
          (m: any) => !membrosIndisponiveis.has(m.id)
        );

        if (membrosDisponiveis.length === 0) {
          throw new Error(`Nenhum membro disponível para a data ${data}`);
        }

        // Criar escala
        const [escala] = await db.insert(escalas).values({
          userId: input.userId,
          titulo: input.titulo,
          descricao: input.descricao,
          data,
          hora: input.hora,
          local: input.local,
          tipo: input.tipo,
          template: input.template,
          equipeId: input.equipeId,
        });

        const escalaId = escala.insertId;
        escalasIds.push(escalaId);

        // Ordenar membros por número de participações (menos participações primeiro)
        const membrosOrdenados = [...membrosDisponiveis].sort((a: any, b: any) => {
          const participacoesA = participacoesPorMembro.get(a.nome) || 0;
          const participacoesB = participacoesPorMembro.get(b.nome) || 0;
          return participacoesA - participacoesB;
        });

        // Distribuir membros por função
        const membrosUsados = new Set<number>();

        for (const funcao of input.funcoes) {
          // Criar função
          const [funcaoCriada] = await db.insert(funcoesEscala).values({
            escalaId,
            nome: funcao.nome,
            descricao: funcao.descricao,
            ordem: funcao.ordem,
          });

          const funcaoId = funcaoCriada.insertId;

          // Selecionar membros para esta função
          const quantidadeNecessaria = funcao.quantidadeMembros || 1;
          let adicionados = 0;

          for (const membro of membrosOrdenados) {
            if (adicionados >= quantidadeNecessaria) break;
            if (membrosUsados.has(membro.id)) continue;

            // Gerar token único
            const token = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);

            // Adicionar participante
            await db.insert(participantesEscala).values({
              escalaId,
              funcaoId,
              nome: membro.nome,
              email: membro.email || "",
              telefone: membro.telefone || "",
              status: "pendente",
              token,
            });

            membrosUsados.add(membro.id);
            adicionados++;

            // Atualizar contador de participações
            const participacoesAtuais = participacoesPorMembro.get(membro.nome) || 0;
            participacoesPorMembro.set(membro.nome, participacoesAtuais + 1);
          }

          // Verificar se função essencial foi preenchida
          if (funcao.essencial && adicionados === 0) {
            throw new Error(`Não foi possível preencher a função essencial: ${funcao.nome}`);
          }
        }
      }

      return { success: true, escalasIds };
    }),

  // Buscar estatísticas de participação
  obterEstatisticas: publicProcedure
    .input(z.object({
      userId: z.string(),
      equipeId: z.number().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return { membros: [], totalEscalas: 0 };

      // Construir filtros
      const filtros: any[] = [eq(escalas.userId, input.userId)];
      
      if (input.equipeId) {
        filtros.push(eq(escalas.equipeId, input.equipeId));
      }
      
      if (input.dataInicio) {
        filtros.push(gte(escalas.data, input.dataInicio));
      }
      
      if (input.dataFim) {
        filtros.push(lte(escalas.data, input.dataFim));
      }

      // Buscar todas as escalas do período
      const escalasResultado = await db.select()
        .from(escalas)
        .where(and(...filtros));

      const totalEscalas = escalasResultado.length;

      // Buscar estatísticas de participação por membro
      const estatisticas = await db.select({
        membroNome: participantesEscala.nome,
        totalParticipacoes: sql<number>`COUNT(*)`,
        confirmadas: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'confirmado' THEN 1 ELSE 0 END)`,
        pendentes: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'pendente' THEN 1 ELSE 0 END)`,
        ausencias: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'ausente' THEN 1 ELSE 0 END)`,
      })
      .from(participantesEscala)
      .innerJoin(escalas, eq(participantesEscala.escalaId, escalas.id))
      .where(and(...filtros))
      .groupBy(participantesEscala.nome)
      .orderBy(desc(sql`COUNT(*)`));

      // Calcular taxas de confirmação
      const membros = estatisticas.map((stat: any) => ({
        nome: stat.membroNome,
        totalParticipacoes: stat.totalParticipacoes,
        confirmadas: stat.confirmadas,
        pendentes: stat.pendentes,
        ausencias: stat.ausencias,
        taxaConfirmacao: stat.totalParticipacoes > 0 
          ? Math.round((stat.confirmadas / stat.totalParticipacoes) * 100)
          : 0,
      }));

      return { membros, totalEscalas };
    }),

  // Cancelar participação e solicitar substituição
  cancelarParticipacao: publicProcedure
    .input(z.object({
      participanteId: z.number(),
      motivo: z.string().optional(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Atualizar status para ausente
      await db.update(participantesEscala)
        .set({ 
          status: "ausente",
          observacoes: input.motivo || "Cancelado pelo participante"
        })
        .where(eq(participantesEscala.id, input.participanteId));

      return { success: true };
    }),

  // Sugerir substitutos disponíveis
  sugerirSubstitutos: publicProcedure
    .input(z.object({
      escalaId: z.number(),
      funcaoId: z.number(),
      equipeId: z.number(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) return [];

      const { membros } = await import("../../drizzle/schema");

      // Buscar escala para pegar a data
      const [escala] = await db.select()
        .from(escalas)
        .where(eq(escalas.id, input.escalaId));

      if (!escala) return [];

      // Buscar participantes já escalados nesta escala
      const participantesJaEscalados = await db.select()
        .from(participantesEscala)
        .where(eq(participantesEscala.escalaId, input.escalaId));

      const nomesJaEscalados = new Set(
        participantesJaEscalados.map((p: any) => p.nome)
      );

      // Buscar todos os membros da equipe
      const todosMembros = await db.select()
        .from(membros)
        .where(eq(membros.equipeId, input.equipeId));

      // Filtrar membros que não estão na escala
      const membrosDisponiveis = todosMembros.filter(
        (m: any) => !nomesJaEscalados.has(m.nome)
      );

      // Buscar histórico de participações para ordenar por menos participações
      const historicoParticipacoes = await db.select({
        membroNome: participantesEscala.nome,
        count: sql<number>`COUNT(*)`
      })
      .from(participantesEscala)
      .innerJoin(escalas, eq(participantesEscala.escalaId, escalas.id))
      .where(eq(escalas.equipeId, input.equipeId))
      .groupBy(participantesEscala.nome);

      const participacoesPorMembro = new Map<string, number>();
      historicoParticipacoes.forEach((h: any) => {
        participacoesPorMembro.set(h.membroNome, h.count);
      });

      // Ordenar por menor número de participações
      const substitutosSugeridos = membrosDisponiveis
        .map((m: any) => ({
          id: m.id,
          nome: m.nome,
          email: m.email,
          telefone: m.telefone,
          funcao: m.funcao,
          participacoes: participacoesPorMembro.get(m.nome) || 0,
        }))
        .sort((a, b) => a.participacoes - b.participacoes)
        .slice(0, 5); // Retornar top 5 substitutos

      return substitutosSugeridos;
    }),

  // Adicionar substituto à escala
  adicionarSubstituto: publicProcedure
    .input(z.object({
      escalaId: z.number(),
      funcaoId: z.number(),
      membroId: z.number(),
      membroNome: z.string(),
      membroEmail: z.string(),
      membroTelefone: z.string().optional(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Gerar token único
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);

      // Adicionar substituto como participante
      await db.insert(participantesEscala).values({
        escalaId: input.escalaId,
        funcaoId: input.funcaoId,
        nome: input.membroNome,
        email: input.membroEmail,
        telefone: input.membroTelefone || "",
        status: "pendente",
        token,
        observacoes: "Adicionado como substituto",
      });

      // Enviar notificação ao substituto
      const [escala] = await db.select()
        .from(escalas)
        .where(eq(escalas.id, input.escalaId));

      const [funcao] = await db.select()
        .from(funcoesEscala)
        .where(eq(funcoesEscala.id, input.funcaoId));

      if (escala && funcao && input.membroEmail) {
        const dataFormatada = new Date(escala.data).toLocaleDateString('pt-BR');
        const linkConfirmacao = `${process.env.VITE_OAUTH_PORTAL_URL || 'http://localhost:3000'}/confirmar/${token}`;

        try {
          await sendEmail({
            to: input.membroEmail,
            subject: `🆕 Você foi convocado como substituto: ${escala.titulo}`,
            html: templateEmailEscala(
              input.membroNome,
              escala.titulo,
              funcao.nome,
              dataFormatada,
              escala.hora || null,
              escala.local || null,
              linkConfirmacao
            ),
          });

          // Enviar WhatsApp se tiver telefone
          if (input.membroTelefone) {
            const telefoneFormatado = formatPhoneNumber(input.membroTelefone);
            const mensagemWhatsApp = templateWhatsAppConvite(
              input.membroNome,
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
        } catch (error) {
          console.error("Erro ao enviar notificação ao substituto:", error);
        }
      }

      return { success: true, token };
    }),

  // Obter dados para gráfico de evolução temporal
  obterDadosGraficoEvolucao: publicProcedure
    .input(z.object({
      equipeId: z.number().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select({
        data: escalas.data,
        total: sql<number>`COUNT(DISTINCT ${escalas.id})`,
        confirmados: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'confirmado' THEN 1 ELSE 0 END)`,
        pendentes: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'pendente' THEN 1 ELSE 0 END)`,
        ausentes: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'ausente' THEN 1 ELSE 0 END)`,
      })
      .from(escalas)
      .leftJoin(participantesEscala, eq(escalas.id, participantesEscala.escalaId))
      .groupBy(escalas.data)
      .orderBy(escalas.data);

      if (input.equipeId) {
        query = query.where(eq(escalas.equipeId, input.equipeId)) as any;
      }

      if (input.dataInicio) {
        query = query.where(sql`${escalas.data} >= ${input.dataInicio}`) as any;
      }

      if (input.dataFim) {
        query = query.where(sql`${escalas.data} <= ${input.dataFim}`) as any;
      }

      const resultados = await query;

      return resultados.map((r: any) => ({
        data: new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: Number(r.total),
        confirmados: Number(r.confirmados),
        pendentes: Number(r.pendentes),
        ausentes: Number(r.ausentes),
      }));
    }),

  // Obter dados para gráfico de comparação entre membros
  obterDadosGraficoComparacao: publicProcedure
    .input(z.object({
      equipeId: z.number().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      limite: z.number().default(10),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select({
        nome: participantesEscala.nome,
        total: sql<number>`COUNT(*)`,
        confirmados: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'confirmado' THEN 1 ELSE 0 END)`,
        pendentes: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'pendente' THEN 1 ELSE 0 END)`,
        ausentes: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'ausente' THEN 1 ELSE 0 END)`,
      })
      .from(participantesEscala)
      .leftJoin(escalas, eq(participantesEscala.escalaId, escalas.id))
      .groupBy(participantesEscala.nome)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(input.limite);

      if (input.equipeId) {
        query = query.where(eq(escalas.equipeId, input.equipeId)) as any;
      }

      if (input.dataInicio) {
        query = query.where(sql`${escalas.data} >= ${input.dataInicio}`) as any;
      }

      if (input.dataFim) {
        query = query.where(sql`${escalas.data} <= ${input.dataFim}`) as any;
      }

      const resultados = await query;

      return resultados.map((r: any) => ({
        nome: r.nome,
        total: Number(r.total),
        confirmados: Number(r.confirmados),
        pendentes: Number(r.pendentes),
        ausentes: Number(r.ausentes),
      }));
    }),

  // Obter dados para gráfico de distribuição por função
  obterDadosGraficoDistribuicao: publicProcedure
    .input(z.object({
      equipeId: z.number().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select({
        funcao: funcoesEscala.nome,
        total: sql<number>`COUNT(*)`,
      })
      .from(participantesEscala)
      .leftJoin(funcoesEscala, eq(participantesEscala.funcaoId, funcoesEscala.id))
      .leftJoin(escalas, eq(participantesEscala.escalaId, escalas.id))
      .groupBy(funcoesEscala.nome)
      .orderBy(sql`COUNT(*) DESC`);

      if (input.equipeId) {
        query = query.where(eq(escalas.equipeId, input.equipeId)) as any;
      }

      if (input.dataInicio) {
        query = query.where(sql`${escalas.data} >= ${input.dataInicio}`) as any;
      }

      if (input.dataFim) {
        query = query.where(sql`${escalas.data} <= ${input.dataFim}`) as any;
      }

      const resultados = await query;

      return resultados.map((r: any) => ({
        funcao: r.funcao || 'Sem função',
        total: Number(r.total),
      }));
    }),

  // Obter dados para heatmap de frequência
  obterDadosHeatmap: publicProcedure
    .input(z.object({
      equipeId: z.number().optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select({
        data: escalas.data,
      })
      .from(escalas);

      if (input.equipeId) {
        query = query.where(eq(escalas.equipeId, input.equipeId)) as any;
      }

      if (input.dataInicio) {
        query = query.where(sql`${escalas.data} >= ${input.dataInicio}`) as any;
      }

      if (input.dataFim) {
        query = query.where(sql`${escalas.data} <= ${input.dataFim}`) as any;
      }

      const resultados = await query;

      // Processar para contar por dia da semana
      const frequenciaPorDia = new Map<number, number>();
      resultados.forEach((r: any) => {
        const data = new Date(r.data);
        const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado
        frequenciaPorDia.set(diaSemana, (frequenciaPorDia.get(diaSemana) || 0) + 1);
      });

      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      return diasSemana.map((dia, index) => ({
        dia,
        total: frequenciaPorDia.get(index) || 0,
      }));
    }),

  // Exportar escalas em lote (retorna dados para o frontend gerar PDF/Excel)
  exportarEscalasEmLote: publicProcedure
    .input(z.object({
      escalaIds: z.array(z.number()),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const escalasExportadas = [];

      for (const escalaId of input.escalaIds) {
        const [escala] = await db.select()
          .from(escalas)
          .where(eq(escalas.id, escalaId));

        if (!escala) continue;

        const funcoes = await db.select()
          .from(funcoesEscala)
          .where(eq(funcoesEscala.escalaId, escalaId))
          .orderBy(funcoesEscala.ordem);

        const participantes = await db.select()
          .from(participantesEscala)
          .where(eq(participantesEscala.escalaId, escalaId));

        escalasExportadas.push({
          ...escala,
          funcoes,
          participantes,
        });
      }

      return escalasExportadas;
    }),

  // Gerar relatório mensal consolidado
  gerarRelatorioMensal: publicProcedure
    .input(z.object({
      mes: z.number().min(1).max(12),
      ano: z.number(),
      equipeId: z.number().optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calcular primeiro e último dia do mês
      const primeiroDia = new Date(input.ano, input.mes - 1, 1);
      const ultimoDia = new Date(input.ano, input.mes, 0);

      let escalasDoMes;
      
      if (input.equipeId) {
        escalasDoMes = await db.select()
          .from(escalas)
          .where(
            sql`${escalas.data} >= ${primeiroDia.toISOString().split('T')[0]} AND ${escalas.data} <= ${ultimoDia.toISOString().split('T')[0]} AND ${escalas.equipeId} = ${input.equipeId}`
          )
          .orderBy(escalas.data);
      } else {
        escalasDoMes = await db.select()
          .from(escalas)
          .where(
            sql`${escalas.data} >= ${primeiroDia.toISOString().split('T')[0]} AND ${escalas.data} <= ${ultimoDia.toISOString().split('T')[0]}`
          )
          .orderBy(escalas.data);
      }

      // Buscar participantes de cada escala
      const escalasCompletas = [];
      for (const escala of escalasDoMes) {
        const funcoes = await db.select()
          .from(funcoesEscala)
          .where(eq(funcoesEscala.escalaId, escala.id))
          .orderBy(funcoesEscala.ordem);

        const participantes = await db.select()
          .from(participantesEscala)
          .where(eq(participantesEscala.escalaId, escala.id));

        escalasCompletas.push({
          ...escala,
          funcoes,
          participantes,
        });
      }

      // Estatísticas do mês
      const totalEscalas = escalasDoMes.length;
      const totalParticipacoes = await db.select({
        total: sql<number>`COUNT(*)`,
        confirmados: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'confirmado' THEN 1 ELSE 0 END)`,
        pendentes: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'pendente' THEN 1 ELSE 0 END)`,
        ausentes: sql<number>`SUM(CASE WHEN ${participantesEscala.status} = 'ausente' THEN 1 ELSE 0 END)`,
      })
      .from(participantesEscala)
      .leftJoin(escalas, eq(participantesEscala.escalaId, escalas.id))
      .where(
        sql`${escalas.data} >= ${primeiroDia.toISOString().split('T')[0]} AND ${escalas.data} <= ${ultimoDia.toISOString().split('T')[0]}`
      );

      return {
        mes: input.mes,
        ano: input.ano,
        totalEscalas,
        estatisticas: totalParticipacoes[0] || { total: 0, confirmados: 0, pendentes: 0, ausentes: 0 },
        escalas: escalasCompletas,
      };
    }),

  // Verificar indisponibilidades de membros para uma data específica
  verificarIndisponibilidades: publicProcedure
    .input(z.object({
      equipeId: z.number(),
      data: z.string(), // formato YYYY-MM-DD
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar membros da equipe
      const { membros: membrosDaEquipe } = await import("../../drizzle/schema");
      const membros = await db.select()
        .from(membrosDaEquipe)
        .where(eq(membrosDaEquipe.equipeId, input.equipeId));

      // Buscar indisponibilidades que cobrem a data
      const { indisponibilidades } = await import("../../drizzle/schema");
      const indisponibilidadesNaData = await db.select()
        .from(indisponibilidades)
        .where(
          sql`${indisponibilidades.dataInicio} <= ${input.data} AND ${indisponibilidades.dataFim} >= ${input.data}`
        );

      // Mapear membros indisponíveis
      const membrosIndisponiveis = membros.filter((m: any) =>
        indisponibilidadesNaData.some((i: any) => i.membroId === m.id)
      ).map((m: any) => {
        const indisponibilidade = indisponibilidadesNaData.find((i: any) => i.membroId === m.id);
        return {
          id: m.id,
          nome: m.nome,
          funcao: m.funcao,
          motivo: indisponibilidade?.motivo || "Sem motivo informado",
          dataInicio: indisponibilidade?.dataInicio,
          dataFim: indisponibilidade?.dataFim,
        };
      });

      return {
        totalMembros: membros.length,
        membrosIndisponiveis: membrosIndisponiveis.length,
        conflitos: membrosIndisponiveis,
      };
    }),

  // Gamificação: Calcular e atualizar pontuação de um membro
  calcularPontuacao: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar todas as participações do membro
      const participacoes = await db.select()
        .from(participantesEscala)
        .where(eq(participantesEscala.userId, input.userId));

      const participacoesTotal = participacoes.length;
      const participacoesConfirmadas = participacoes.filter((p: any) => p.status === 'confirmado').length;
      const participacoesRecusadas = participacoes.filter((p: any) => p.status === 'ausente').length;

      // Calcular pontos: 10 pontos por confirmação, -5 por recusa
      const pontos = (participacoesConfirmadas * 10) - (participacoesRecusadas * 5);

      // Atualizar ou criar registro de pontuação
      const { pontuacoes } = await import("../../drizzle/schema");
      const pontuacaoExistente = await db.select()
        .from(pontuacoes)
        .where(eq(pontuacoes.userId, input.userId))
        .limit(1);

      if (pontuacaoExistente.length > 0) {
        await db.update(pontuacoes)
          .set({
            pontos,
            participacoesTotal,
            participacoesConfirmadas,
            participacoesRecusadas,
            updatedAt: new Date(),
          })
          .where(eq(pontuacoes.userId, input.userId));
      } else {
        await db.insert(pontuacoes).values({
          userId: input.userId,
          pontos,
          participacoesTotal,
          participacoesConfirmadas,
          participacoesRecusadas,
        });
      }

      // Verificar e conceder badges
      const { badges, usersBadges } = await import("../../drizzle/schema");
      const todasBadges = await db.select().from(badges);
      const badgesDoMembro = await db.select()
        .from(usersBadges)
        .where(eq(usersBadges.userId, input.userId));

      for (const badge of todasBadges) {
        const jaConquistou = badgesDoMembro.some((mb: any) => mb.badgeId === badge.id);
        if (jaConquistou) continue;

        let conquistou = false;
        if (badge.tipo === 'participacoes' && participacoesTotal >= badge.requisito) {
          conquistou = true;
        } else if (badge.tipo === 'confirmacoes' && participacoesConfirmadas >= badge.requisito) {
          conquistou = true;
        }

        if (conquistou) {
          await db.insert(usersBadges).values({
            userId: input.userId,
            badgeId: badge.id,
            conquistadoEm: new Date(),
          });
        }
      }

      return { pontos, participacoesTotal, participacoesConfirmadas, participacoesRecusadas };
    }),

  // Gamificação: Obter ranking de membros por pontos
  obterRanking: publicProcedure
    .input(z.object({
      equipeId: z.number().optional(),
      limite: z.number().optional().default(10),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { pontuacoes } = await import("../../drizzle/schema");
      const { membros: membrosDaEquipe } = await import("../../drizzle/schema");

      let query = db.select({
        membroId: pontuacoes.membroId,
        pontos: pontuacoes.pontos,
        participacoesTotal: pontuacoes.participacoesTotal,
        participacoesConfirmadas: pontuacoes.participacoesConfirmadas,
        participacoesRecusadas: pontuacoes.participacoesRecusadas,
        nome: membrosDaEquipe.nome,
        funcao: membrosDaEquipe.funcao,
      })
      .from(pontuacoes)
      .leftJoin(membrosDaEquipe, eq(pontuacoes.membroId, membrosDaEquipe.id))
      .orderBy(sql`${pontuacoes.pontos} DESC`)
      .limit(input.limite);

      if (input.equipeId) {
        query = query.where(eq(membrosDaEquipe.equipeId, input.equipeId)) as any;
      }

      const ranking = await query;

      return ranking.map((r: any, index: number) => ({
        posicao: index + 1,
        ...r,
      }));
    }),

  // Gamificação: Listar badges conquistados por um membro
  listarBadgesMembro: publicProcedure
    .input(z.object({
      membroId: z.number(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { membrosBadges, badges } = await import("../../drizzle/schema");

      const badgesConquistados = await db.select({
        badgeId: badges.id,
        nome: badges.nome,
        descricao: badges.descricao,
        icone: badges.icone,
        cor: badges.cor,
        conquistadoEm: membrosBadges.conquistadoEm,
      })
      .from(membrosBadges)
      .leftJoin(badges, eq(membrosBadges.badgeId, badges.id))
      .where(eq(membrosBadges.membroId, input.membroId))
      .orderBy(sql`${membrosBadges.conquistadoEm} DESC`);

      return badgesConquistados;
    }),

  // Gamificação: Criar meta para equipe
  criarMetaEquipe: publicProcedure
    .input(z.object({
      equipeId: z.number(),
      titulo: z.string(),
      descricao: z.string().optional(),
      objetivo: z.number(),
      tipo: z.enum(['participacoes', 'escalas', 'confirmacoes']),
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { metasEquipe } = await import("../../drizzle/schema");

      const [novaMeta] = await db.insert(metasEquipe).values({
        equipeId: input.equipeId,
        titulo: input.titulo,
        descricao: input.descricao,
        objetivo: input.objetivo,
        progresso: 0,
        tipo: input.tipo,
        dataInicio: input.dataInicio,
        dataFim: input.dataFim,
        status: 'ativa',
      });

      return novaMeta;
    }),

  // Gamificação: Listar metas da equipe
  listarMetasEquipe: publicProcedure
    .input(z.object({
      equipeId: z.number(),
      status: z.enum(['ativa', 'concluida', 'cancelada']).optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { metasEquipe } = await import("../../drizzle/schema");

      let query = db.select()
        .from(metasEquipe)
        .where(eq(metasEquipe.equipeId, input.equipeId))
        .orderBy(sql`${metasEquipe.createdAt} DESC`);

      if (input.status) {
        query = query.where(eq(metasEquipe.status, input.status)) as any;
      }

      const metas = await query;

      return metas.map((m: any) => ({
        ...m,
        percentual: Math.round((m.progresso / m.objetivo) * 100),
      }));
    }),

  // Gamificação: Atualizar progresso de meta
  atualizarProgressoMeta: publicProcedure
    .input(z.object({
      metaId: z.number(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { metasEquipe } = await import("../../drizzle/schema");

      // Buscar meta
      const [meta] = await db.select()
        .from(metasEquipe)
        .where(eq(metasEquipe.id, input.metaId))
        .limit(1);

      if (!meta) throw new Error("Meta não encontrada");

      // Calcular progresso baseado no tipo
      let progresso = 0;
      if (meta.tipo === 'participacoes') {
        const participacoes = await db.select({ total: sql<number>`COUNT(*)` })
          .from(participantesEscala)
          .leftJoin(escalas, eq(participantesEscala.escalaId, escalas.id))
          .where(
            sql`${escalas.data} >= ${meta.dataInicio} AND ${escalas.data} <= ${meta.dataFim}`
          );
        progresso = participacoes[0]?.total || 0;
      } else if (meta.tipo === 'escalas') {
        const escalasCount = await db.select({ total: sql<number>`COUNT(*)` })
          .from(escalas)
          .where(
            sql`${escalas.equipeId} = ${meta.equipeId} AND ${escalas.data} >= ${meta.dataInicio} AND ${escalas.data} <= ${meta.dataFim}`
          );
        progresso = escalasCount[0]?.total || 0;
      } else if (meta.tipo === 'confirmacoes') {
        const confirmacoes = await db.select({ total: sql<number>`COUNT(*)` })
          .from(participantesEscala)
          .leftJoin(escalas, eq(participantesEscala.escalaId, escalas.id))
          .where(
            sql`${participantesEscala.status} = 'confirmado' AND ${escalas.data} >= ${meta.dataInicio} AND ${escalas.data} <= ${meta.dataFim}`
          );
        progresso = confirmacoes[0]?.total || 0;
      }

      // Atualizar progresso e status
      const novoStatus = progresso >= meta.objetivo ? 'concluida' : 'ativa';
      await db.update(metasEquipe)
        .set({ progresso, status: novoStatus })
        .where(eq(metasEquipe.id, input.metaId));

      return { progresso, objetivo: meta.objetivo, percentual: Math.round((progresso / meta.objetivo) * 100), status: novoStatus };
    }),

  // Arquivamento: Arquivar escala manualmente
  arquivarEscala: publicProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(escalas)
        .set({ arquivada: 1 })
        .where(eq(escalas.id, input.escalaId));

      return { success: true, message: "Escala arquivada com sucesso" };
    }),

  // Arquivamento: Desarquivar escala
  desarquivarEscala: publicProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(escalas)
        .set({ arquivada: 0 })
        .where(eq(escalas.id, input.escalaId));

      return { success: true, message: "Escala desarquivada com sucesso" };
    }),

  // Google Calendar: Gerar link para adicionar ao calendário
  gerarLinkGoogleCalendar: publicProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .query(async ({ input }: { input: any }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar escala
      const [escala] = await db.select()
        .from(escalas)
        .where(eq(escalas.id, input.escalaId))
        .limit(1);

      if (!escala) throw new Error("Escala não encontrada");

      // Buscar participantes
      const participantes = await db.select()
        .from(participantesEscala)
        .where(eq(participantesEscala.escalaId, input.escalaId));

      // Montar descrição com participantes
      let descricao = escala.descricao || "";
      if (participantes.length > 0) {
        descricao += "\n\nParticipantes:\n";
        participantes.forEach((p: any) => {
          descricao += `- ${p.nome}\n`;
        });
      }

      // Formatar data e hora para o Google Calendar
      const dataEscala = new Date(escala.data);
      const horaInicio = escala.hora || "09:00";
      const [horas, minutos] = horaInicio.split(":");
      dataEscala.setHours(parseInt(horas), parseInt(minutos));

      // Data fim (1 hora depois)
      const dataFim = new Date(dataEscala);
      dataFim.setHours(dataFim.getHours() + 1);

      // Formatar datas no formato Google Calendar (YYYYMMDDTHHmmss)
      const formatarData = (data: Date) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");
        const hora = String(data.getHours()).padStart(2, "0");
        const min = String(data.getMinutes()).padStart(2, "0");
        return `${ano}${mes}${dia}T${hora}${min}00`;
      };

      const dataInicioFormatada = formatarData(dataEscala);
      const dataFimFormatada = formatarData(dataFim);

      // Montar URL do Google Calendar
      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: escala.titulo,
        dates: `${dataInicioFormatada}/${dataFimFormatada}`,
        details: descricao,
        location: escala.local || "",
      });

      const linkGoogleCalendar = `https://calendar.google.com/calendar/render?${params.toString()}`;

      return { link: linkGoogleCalendar };
    }),
});
