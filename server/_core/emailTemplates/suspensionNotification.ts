/**
 * Template de email para notificação de suspensão de conta
 */

interface SuspensionEmailData {
  userName: string;
  reason: string;
  suspendedBy: string;
  suspendedAt: Date;
}

export function generateSuspensionEmail(data: SuspensionEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { userName, reason, suspendedBy, suspendedAt } = data;
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(suspendedAt);

  const subject = '🔒 Sua conta no LouvaMais foi suspensa';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conta Suspensa - LouvaMais</title>
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
                🔒 Conta Suspensa
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
                Informamos que sua conta no <strong>LouvaMais</strong> foi suspensa temporariamente.
              </p>

              <!-- Card de informações -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #991b1b; font-size: 14px; font-weight: bold;">
                      MOTIVO DA SUSPENSÃO:
                    </p>
                    <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.5;">
                      ${reason}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Detalhes -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    <strong>Suspensa por:</strong> ${suspendedBy}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    <strong>Data:</strong> ${formattedDate}
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Durante o período de suspensão, você não poderá acessar sua conta nem utilizar os recursos do sistema.
              </p>

              <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Se você acredita que esta suspensão foi um erro ou deseja mais informações, entre em contato conosco através do email <a href="mailto:louvamais590@gmail.com" style="color: #9333ea; text-decoration: none; font-weight: bold;">louvamais590@gmail.com</a>.
              </p>

              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
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
CONTA SUSPENSA - LOUVAMAIS

Olá, ${userName}

Informamos que sua conta no LouvaMais foi suspensa temporariamente.

MOTIVO DA SUSPENSÃO:
${reason}

Detalhes:
- Suspensa por: ${suspendedBy}
- Data: ${formattedDate}

Durante o período de suspensão, você não poderá acessar sua conta nem utilizar os recursos do sistema.

Se você acredita que esta suspensão foi um erro ou deseja mais informações, entre em contato conosco através do email louvamais590@gmail.com.

Atenciosamente,
Equipe LouvaMais

---
Este é um email automático. Por favor, não responda.
© ${new Date().getFullYear()} LouvaMais - Todos os direitos reservados
  `.trim();

  return { subject, html, text };
}
