/**
 * Template de email para notificação de mudança de permissões/role
 */

interface RoleChangeEmailData {
  userName: string;
  oldRole: string;
  newRole: string;
  changedBy: string;
  changedAt: Date;
}

const roleNames: Record<string, string> = {
  admin: 'Administrador',
  moderator: 'Moderador',
  user: 'Usuário',
};

const roleDescriptions: Record<string, string> = {
  admin: 'Acesso completo ao sistema, incluindo gerenciamento de usuários, logs de auditoria e todas as funcionalidades administrativas.',
  moderator: 'Acesso a escalas, repertórios, blog, depoimentos, estatísticas e suspensão de usuários (com justificativa obrigatória).',
  user: 'Acesso padrão às funcionalidades do sistema, incluindo criação de escalas, participação em escalas e gerenciamento de repertórios pessoais.',
};

export function generateRoleChangeEmail(data: RoleChangeEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { userName, oldRole, newRole, changedBy, changedAt } = data;
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(changedAt);

  const oldRoleName = roleNames[oldRole] || oldRole;
  const newRoleName = roleNames[newRole] || newRole;
  const newRoleDescription = roleDescriptions[newRole] || 'Permissões atualizadas.';

  const isPromotion = (oldRole === 'user' && newRole === 'moderator') || 
                      (oldRole === 'user' && newRole === 'admin') ||
                      (oldRole === 'moderator' && newRole === 'admin');

  const subject = `${isPromotion ? '🎉' : '🔄'} Suas permissões no LouvaMais foram atualizadas`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Permissões Atualizadas - LouvaMais</title>
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
                ${isPromotion ? '🎉' : '🔄'} Permissões Atualizadas
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
                ${isPromotion ? 'Parabéns! ' : ''}Suas permissões no <strong>LouvaMais</strong> foram atualizadas.
              </p>

              <!-- Card de mudança de role -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px; color: #1e40af; font-size: 14px; font-weight: bold;">
                      MUDANÇA DE PERMISSÕES
                    </p>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #1e3a8a; font-size: 15px;">
                          <strong>Permissão anterior:</strong> ${oldRoleName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #1e3a8a; font-size: 15px;">
                          <strong>Nova permissão:</strong> <span style="color: #9333ea; font-weight: bold;">${newRoleName}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Descrição da nova role -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #faf5ff; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #7c3aed; font-size: 14px; font-weight: bold;">
                      O QUE VOCÊ PODE FAZER AGORA:
                    </p>
                    <p style="margin: 0; color: #5b21b6; font-size: 14px; line-height: 1.6;">
                      ${newRoleDescription}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Detalhes -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    <strong>Alterado por:</strong> ${changedBy}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    <strong>Data:</strong> ${formattedDate}
                  </td>
                </tr>
              </table>

              ${isPromotion ? `
              <p style="margin: 30px 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Agradecemos sua dedicação e confiança! Esperamos que aproveite suas novas responsabilidades para ajudar a comunidade LouvaMais a crescer.
              </p>
              ` : `
              <p style="margin: 30px 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Suas permissões foram ajustadas. Você pode continuar utilizando o sistema com suas novas configurações de acesso.
              </p>
              `}

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
                Se tiver alguma dúvida sobre suas novas permissões, entre em contato conosco através do email <a href="mailto:louvamais590@gmail.com" style="color: #9333ea; text-decoration: none; font-weight: bold;">louvamais590@gmail.com</a>.
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
PERMISSÕES ATUALIZADAS - LOUVAMAIS

Olá, ${userName}

${isPromotion ? 'Parabéns! ' : ''}Suas permissões no LouvaMais foram atualizadas.

MUDANÇA DE PERMISSÕES:
- Permissão anterior: ${oldRoleName}
- Nova permissão: ${newRoleName}

O QUE VOCÊ PODE FAZER AGORA:
${newRoleDescription}

Detalhes:
- Alterado por: ${changedBy}
- Data: ${formattedDate}

${isPromotion 
  ? 'Agradecemos sua dedicação e confiança! Esperamos que aproveite suas novas responsabilidades para ajudar a comunidade LouvaMais a crescer.' 
  : 'Suas permissões foram ajustadas. Você pode continuar utilizando o sistema com suas novas configurações de acesso.'}

Acesse: ${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://louvamais.com'}

Se tiver alguma dúvida sobre suas novas permissões, entre em contato conosco através do email louvamais590@gmail.com.

Atenciosamente,
Equipe LouvaMais

---
Este é um email automático. Por favor, não responda.
© ${new Date().getFullYear()} LouvaMais - Todos os direitos reservados
  `.trim();

  return { subject, html, text };
}
