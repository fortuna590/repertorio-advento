import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('⚠️  RESEND_API_KEY não configurada. Emails serão apenas logados no console.');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Envia email usando Resend.com
 * Se RESEND_API_KEY não estiver configurada, apenas loga no console
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'LouvaMais <noreply@louvamais.com>',
  replyTo = 'louvamais590@gmail.com' // Email de contato para respostas
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  
  // Se não tiver API key configurada, apenas loga
  if (!resend) {
    console.log('📧 [EMAIL SIMULADO]');
    console.log('Para:', to);
    console.log('Assunto:', subject);
    console.log('De:', from);
    console.log('Reply-To:', replyTo);
    console.log('HTML:', html);
    console.log('---');
    
    return { 
      success: true, 
      messageId: 'simulated-' + Date.now() 
    };
  }

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo
    });

    console.log('✅ Email enviado com sucesso:', result.data?.id);
    
    return { 
      success: true, 
      messageId: result.data?.id 
    };
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error);
    
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido ao enviar email' 
    };
  }
}

/**
 * Template de email para contato
 */
export function templateEmailContato(nome: string, email: string, mensagem: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
        .value { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #7c3aed; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Nova Mensagem de Contato</h1>
          <p>Repertório Católico - LouvaMais</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">👤 Nome:</div>
            <div class="value">${nome}</div>
          </div>
          <div class="field">
            <div class="label">📧 Email:</div>
            <div class="value">${email}</div>
          </div>
          <div class="field">
            <div class="label">💬 Mensagem:</div>
            <div class="value">${mensagem.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          <p>LouvaMais - Church Solutions | Repertório Católico</p>
          <p>Este email foi enviado automaticamente pelo formulário de contato</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template de email para newsletter
 */
export function templateEmailNewsletter(nome: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #7c3aed; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Nova Inscrição na Newsletter</h1>
          <p>Repertório Católico - LouvaMais</p>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Nome:</span> ${nome || 'Não informado'}
          </div>
          <div class="field">
            <span class="label">Email:</span> ${email}
          </div>
        </div>
        <div class="footer">
          <p>LouvaMais - Church Solutions | Repertório Católico</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template de email para envio de repertório personalizado
 */
export function templateEmailRepertorio(nomeDestinatario: string, musicasSelecionadas: any[]): string {
  const listaMusicas = musicasSelecionadas.map((musica, index) => `
    <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #7c3aed;">
      <h3 style="margin: 0 0 10px 0; color: #7c3aed;">${index + 1}. ${musica.titulo}</h3>
      <p style="margin: 5px 0; color: #666;"><strong>Artista:</strong> ${musica.artista}</p>
      <p style="margin: 5px 0; color: #666;"><strong>Momento:</strong> ${musica.momento}</p>
      ${musica.youtube ? `<p style="margin: 5px 0;"><a href="${musica.youtube}" style="color: #7c3aed;">🎵 YouTube</a></p>` : ''}
      ${musica.cifra ? `<p style="margin: 5px 0;"><a href="${musica.cifra}" style="color: #7c3aed;">🎸 Cifra</a></p>` : ''}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f3f4f6; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 Seu Repertório Personalizado</h1>
          <p>Repertório Católico - LouvaMais</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-bottom: 25px;">Olá ${nomeDestinatario},</p>
          <p style="margin-bottom: 25px;">Aqui está o repertório personalizado que você montou com ${musicasSelecionadas.length} música(s):</p>
          
          ${listaMusicas}
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <strong>💡 Dica:</strong> Você pode acessar todos os links clicando diretamente nas músicas acima!
          </p>
        </div>
        <div class="footer">
          <p><strong>LouvaMais - Church Solutions</strong></p>
          <p>Repertório Católico | Para a maior glória de Deus ✨</p>
          <p style="margin-top: 15px;">
            <a href="https://instagram.com/louvamais.solutions" style="color: #7c3aed; text-decoration: none;">📱 Instagram</a> | 
            <a href="https://wa.me/5518996890414" style="color: #7c3aed; text-decoration: none;">💬 WhatsApp</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}


/**
 * Template de email para confirmação de pedido
 */
export function templateEmailPedido(nome: string, produtoNome: string, valor: number, pedidoId: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
        .value { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #7c3aed; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .price { font-size: 24px; font-weight: bold; color: #7c3aed; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Pagamento Confirmado!</h1>
          <p>Repertório Católico - LouvaMais</p>
        </div>
        <div class="content">
          <p>Olá ${nome},</p>
          <p>Seu pagamento foi processado com sucesso! Obrigado pela compra.</p>
          
          <div class="field">
            <div class="label">📦 Produto:</div>
            <div class="value">${produtoNome}</div>
          </div>
          
          <div class="field">
            <div class="label">💰 Valor:</div>
            <div class="value price">R$ ${valor.toFixed(2)}</div>
          </div>
          
          <div class="field">
            <div class="label">🔖 ID do Pedido:</div>
            <div class="value">${pedidoId}</div>
          </div>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <strong>📧 Próximos passos:</strong> Você receberá em breve um email com as instruções de acesso ao produto.
          </p>
        </div>
        <div class="footer">
          <p>LouvaMais - Church Solutions | Repertório Católico</p>
          <p>Para a maior glória de Deus ✨</p>
        </div>
      </div>
    </body>
    </html>
  `;
}


/**
 * Template de email para notificação de escala
 */
export function templateEmailEscala(
  nomeParticipante: string,
  tituloEscala: string,
  funcao: string,
  data: string,
  hora: string | null,
  local: string | null,
  descricao: string | null
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
        .value { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #7c3aed; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .highlight { font-size: 20px; font-weight: bold; color: #7c3aed; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Você foi escalado!</h1>
          <p>Repertório Católico - LouvaMais</p>
        </div>
        <div class="content">
          <p>Olá ${nomeParticipante},</p>
          <p>Você foi adicionado à seguinte escala:</p>
          
          <div class="field">
            <div class="label">📋 Escala:</div>
            <div class="value highlight">${tituloEscala}</div>
          </div>
          
          <div class="field">
            <div class="label">👤 Sua Função:</div>
            <div class="value highlight">${funcao}</div>
          </div>
          
          <div class="field">
            <div class="label">📆 Data:</div>
            <div class="value">${data}</div>
          </div>
          
          ${hora ? `
          <div class="field">
            <div class="label">🕐 Horário:</div>
            <div class="value">${hora}</div>
          </div>
          ` : ''}
          
          ${local ? `
          <div class="field">
            <div class="label">📍 Local:</div>
            <div class="value">${local}</div>
          </div>
          ` : ''}
          
          ${descricao ? `
          <div class="field">
            <div class="label">📝 Observações:</div>
            <div class="value">${descricao.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <strong>💡 Importante:</strong> Por favor, confirme sua presença acessando o sistema.
          </p>
        </div>
        <div class="footer">
          <p>LouvaMais - Church Solutions | Repertório Católico</p>
          <p>Para a maior glória de Deus ✨</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template de email para atualização de status
 */
export function templateEmailStatusEscala(
  nomeParticipante: string,
  tituloEscala: string,
  funcao: string,
  novoStatus: string
): string {
  const statusEmoji = novoStatus === 'confirmado' ? '✅' : novoStatus === 'ausente' ? '❌' : '⏳';
  const statusTexto = novoStatus === 'confirmado' ? 'Confirmado' : novoStatus === 'ausente' ? 'Ausente' : 'Pendente';
  const statusCor = novoStatus === 'confirmado' ? '#10b981' : novoStatus === 'ausente' ? '#ef4444' : '#f59e0b';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
        .value { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #7c3aed; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .status { font-size: 24px; font-weight: bold; color: ${statusCor}; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusEmoji} Status Atualizado</h1>
          <p>Repertório Católico - LouvaMais</p>
        </div>
        <div class="content">
          <p>Olá ${nomeParticipante},</p>
          <p>O status da sua participação foi atualizado:</p>
          
          <div class="field">
            <div class="label">📋 Escala:</div>
            <div class="value">${tituloEscala}</div>
          </div>
          
          <div class="field">
            <div class="label">👤 Função:</div>
            <div class="value">${funcao}</div>
          </div>
          
          <div class="field">
            <div class="label">📊 Novo Status:</div>
            <div class="value status">${statusEmoji} ${statusTexto}</div>
          </div>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            ${novoStatus === 'confirmado' ? '<strong>✅ Obrigado por confirmar sua presença!</strong>' : ''}
            ${novoStatus === 'ausente' ? '<strong>❌ Registramos sua ausência.</strong>' : ''}
            ${novoStatus === 'pendente' ? '<strong>⏳ Aguardamos sua confirmação.</strong>' : ''}
          </p>
        </div>
        <div class="footer">
          <p>LouvaMais - Church Solutions | Repertório Católico</p>
          <p>Para a maior glória de Deus ✨</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template de email de lembrete de escala (24h antes)
 */
export function templateEmailLembreteEscala(
  nomeParticipante: string,
  tituloEscala: string,
  funcao: string,
  data: string,
  hora: string | null,
  local: string | null,
  linkConfirmacao: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .field { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #7c3aed; }
        .label { font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
        .value { color: #4b5563; }
        .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">⏰ Lembrete de Escala</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Sua escala é amanhã!</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-bottom: 20px;">Olá, <strong>${nomeParticipante}</strong>!</p>
          
          <div class="alert">
            <strong>⚠️ Lembrete:</strong> Sua escala está agendada para <strong>amanhã</strong>!
          </div>
          
          <div class="field">
            <div class="label">🎵 Escala:</div>
            <div class="value">${tituloEscala}</div>
          </div>
          
          <div class="field">
            <div class="label">🎭 Função:</div>
            <div class="value">${funcao}</div>
          </div>
          
          <div class="field">
            <div class="label">📅 Data:</div>
            <div class="value">${data}</div>
          </div>
          
          ${hora ? `
          <div class="field">
            <div class="label">⏰ Horário:</div>
            <div class="value">${hora}</div>
          </div>
          ` : ''}
          
          ${local ? `
          <div class="field">
            <div class="label">📍 Local:</div>
            <div class="value">${local}</div>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 15px;"><strong>Por favor, confirme sua presença:</strong></p>
            <a href="${linkConfirmacao}" class="button">
              ✅ Confirmar Presença
            </a>
          </div>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280;">
            Contamos com você! 🙏
          </p>
        </div>
        <div class="footer">
          <p>LouvaMais - Church Solutions | Repertório Católico</p>
          <p>Para a maior glória de Deus ✨</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
