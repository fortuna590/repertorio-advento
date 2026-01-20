/**
 * Helper para envio de mensagens WhatsApp via Evolution API
 * 
 * Configuração necessária:
 * - WHATSAPP_API_URL: URL da API Evolution (ex: https://api.evolution.com.br)
 * - WHATSAPP_API_KEY: Chave de autenticação da API
 * - WHATSAPP_INSTANCE: Nome da instância do WhatsApp
 * 
 * Documentação: https://doc.evolution-api.com/
 */

interface SendWhatsAppParams {
  to: string; // Número com DDI (ex: 5511999999999)
  message: string;
}

/**
 * Envia mensagem de texto via WhatsApp
 */
export async function sendWhatsApp({ to, message }: SendWhatsAppParams): Promise<boolean> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const instance = process.env.WHATSAPP_INSTANCE;

  // Se não configurado, apenas loga e retorna sucesso (modo desenvolvimento)
  if (!apiUrl || !apiKey || !instance) {
    console.log('[WhatsApp] Não configurado. Mensagem que seria enviada:');
    console.log(`[WhatsApp] Para: ${to}`);
    console.log(`[WhatsApp] Mensagem: ${message}`);
    return true;
  }

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: to,
        text: message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[WhatsApp] Erro ao enviar:', error);
      return false;
    }

    console.log(`[WhatsApp] ✅ Mensagem enviada para ${to}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Erro:', error);
    return false;
  }
}

/**
 * Template de mensagem de convite para escala
 */
export function templateWhatsAppConvite(
  nome: string,
  tituloEscala: string,
  funcao: string,
  data: string,
  hora: string | null,
  local: string | null,
  linkConfirmacao: string
): string {
  let mensagem = `🎵 *Olá, ${nome}!*\n\n`;
  mensagem += `Você foi convidado(a) para participar da escala:\n\n`;
  mensagem += `📋 *${tituloEscala}*\n`;
  mensagem += `🎤 Função: *${funcao}*\n`;
  mensagem += `📅 Data: ${data}\n`;
  
  if (hora) {
    mensagem += `🕐 Horário: ${hora}\n`;
  }
  
  if (local) {
    mensagem += `📍 Local: ${local}\n`;
  }
  
  mensagem += `\n✅ *Confirme sua presença clicando no link:*\n`;
  mensagem += `${linkConfirmacao}\n\n`;
  mensagem += `_Enviado pelo Sistema de Escalas LouvaMais_`;
  
  return mensagem;
}

/**
 * Template de mensagem de lembrete de escala
 */
export function templateWhatsAppLembrete(
  nome: string,
  tituloEscala: string,
  funcao: string,
  data: string,
  hora: string | null,
  local: string | null,
  linkConfirmacao: string
): string {
  let mensagem = `⏰ *Lembrete de Escala*\n\n`;
  mensagem += `Olá, ${nome}!\n\n`;
  mensagem += `Lembrando que amanhã você tem escala:\n\n`;
  mensagem += `📋 *${tituloEscala}*\n`;
  mensagem += `🎤 Função: *${funcao}*\n`;
  mensagem += `📅 Data: ${data}\n`;
  
  if (hora) {
    mensagem += `🕐 Horário: ${hora}\n`;
  }
  
  if (local) {
    mensagem += `📍 Local: ${local}\n`;
  }
  
  mensagem += `\n⚠️ *Você ainda não confirmou sua presença!*\n`;
  mensagem += `Confirme agora: ${linkConfirmacao}\n\n`;
  mensagem += `_Enviado pelo Sistema de Escalas LouvaMais_`;
  
  return mensagem;
}

/**
 * Formata número de telefone para padrão internacional
 * Remove caracteres especiais e adiciona DDI se necessário
 */
export function formatPhoneNumber(phone: string): string {
  // Remove tudo que não é número
  let cleaned = phone.replace(/\D/g, '');
  
  // Se não tem DDI (55), adiciona
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
}
