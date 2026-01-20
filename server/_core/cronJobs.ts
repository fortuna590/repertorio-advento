import cron from 'node-cron';
import { getDb } from '../db';
import { escalas, participantesEscala, funcoesEscala } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmail, templateEmailLembreteEscala } from './email';
import { sendWhatsApp, templateWhatsAppLembrete, formatPhoneNumber } from './whatsapp';

/**
 * Serviço de Cron Jobs
 * Executa tarefas agendadas automaticamente
 */

let cronJobsInitialized = false;

/**
 * Envia lembretes para escalas que acontecerão nas próximas 24 horas
 */
async function enviarLembretesAutomaticos() {
  console.log('[Cron] Iniciando envio de lembretes automáticos...');
  
  try {
    const db = await getDb();
    if (!db) {
      console.error('[Cron] Database not available');
      return;
    }

    // Data de amanhã
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const amanhaStr = amanha.toISOString().split('T')[0];

    // Buscar escalas de amanhã
    const escalasAmanha = await db.select()
      .from(escalas)
      .where(eq(escalas.data, amanhaStr as any));

    console.log(`[Cron] Encontradas ${escalasAmanha.length} escalas para ${amanhaStr}`);

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
          console.log(`[Cron] ✅ Lembrete enviado para ${participante.email}`);

          // Enviar WhatsApp se tiver telefone
          if (participante.telefone) {
            const telefoneFormatado = formatPhoneNumber(participante.telefone);
            const mensagemWhatsApp = templateWhatsAppLembrete(
              participante.nome,
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
            console.log(`[Cron] ✅ WhatsApp enviado para ${participante.telefone}`);
          }
        } catch (error) {
          console.error(`[Cron] ❌ Erro ao enviar para ${participante.email}:`, error);
          erros++;
        }
      }
    }

    console.log(`[Cron] Concluído: ${emailsEnviados} enviados, ${erros} erros`);
  } catch (error) {
    console.error('[Cron] Erro:', error);
  }
}

/**
 * Inicializa os cron jobs
 */
export function initCronJobs() {
  if (cronJobsInitialized) {
    console.log('[Cron] Já inicializado');
    return;
  }

  console.log('[Cron] Inicializando...');

  // Executar todos os dias às 9h (horário de Brasília)
  cron.schedule('0 0 9 * * *', async () => {
    console.log('[Cron] Executando lembretes (9h)');
    await enviarLembretesAutomaticos();
  }, {
    timezone: 'America/Sao_Paulo'
  });

  console.log('[Cron] ✅ Configurado para 9h diariamente');
  cronJobsInitialized = true;
}
