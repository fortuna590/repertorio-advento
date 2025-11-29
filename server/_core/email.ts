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
  from = 'LouvaMais <noreply@louvamais.com.br>',
  replyTo = 'louvamais590@gmail.com'
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
