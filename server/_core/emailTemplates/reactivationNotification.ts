/**
 * Template de email para notificação de reativação de conta
 */

interface ReactivationEmailData {
  userName: string;
  reactivatedBy: string;
  reactivatedAt: Date;
}

export function generateReactivationEmail(data: ReactivationEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { userName, reactivatedBy, reactivatedAt } = data;
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(reactivatedAt);

  const subject = '✅ Sua conta no LouvaMais foi reativada';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conta Reativada - LouvaMais</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header com gradiente roxo/rosa -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ✅ Conta Reativada
              </h1>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Olá, <strong>${userName}</strong>
              </p>

              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Ótimas notícias! Sua conta no <strong>LouvaMais</strong> foi reativada com sucesso. 🎉
              </p>

              <!-- Card de sucesso -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #166534; font-size: 14px; font-weight: bold;">
                      ✓ ACESSO LIBERADO
                    </p>
                    <p style="margin: 0; color: #14532d; font-size: 15px; line-height: 1.5;">
                      Você já pode fazer login e utilizar todos os recursos do sistema normalmente.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Detalhes -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    <strong>Reativada por:</strong> ${reactivatedBy}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    <strong>Data:</strong> ${formattedDate}
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Agradecemos sua compreensão durante o período de suspensão. Esperamos que continue aproveitando nossos recursos para organizar seu ministério de música.
              </p>

              <!-- Botão de acesso -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://louvamais.com'}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Acessar LouvaMais
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Se tiver alguma dúvida, entre em contato conosco através do email <a href="mailto:louvamais590@gmail.com" style="color: #9333ea; text-decoration: none; font-weight: bold;">louvamais590@gmail.com</a>.
              </p>

              <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Atenciosamente,<br>
                <strong style="color: #9333ea;">Equipe LouvaMais</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Este é um email automático. Por favor, não responda.
              </p>
              <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} LouvaMais - Todos os direitos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
CONTA REATIVADA - LOUVAMAIS

Olá, ${userName}

Ótimas notícias! Sua conta no LouvaMais foi reativada com sucesso. 🎉

✓ ACESSO LIBERADO
Você já pode fazer login e utilizar todos os recursos do sistema normalmente.

Detalhes:
- Reativada por: ${reactivatedBy}
- Data: ${formattedDate}

Agradecemos sua compreensão durante o período de suspensão. Esperamos que continue aproveitando nossos recursos para organizar seu ministério de música.

Acesse: ${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://louvamais.com'}

Se tiver alguma dúvida, entre em contato conosco através do email louvamais590@gmail.com.

Atenciosamente,
Equipe LouvaMais

---
Este é um email automático. Por favor, não responda.
© ${new Date().getFullYear()} LouvaMais - Todos os direitos reservados
  `.trim();

  return { subject, html, text };
}
