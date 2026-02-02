/**
 * Templates de email para notificações administrativas
 */

/**
 * Template de email para suspensão de conta
 */
export function templateEmailSuspensao(
  nomeUsuario: string,
  motivo: string,
  adminNome: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .reason-box { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc2626; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .contact-info { background: #e0e7ff; padding: 15px; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Conta Suspensa</h1>
          <p>LouvaMais - Sistema de Gestão</p>
        </div>
        <div class="content">
          <p>Olá <strong>${nomeUsuario}</strong>,</p>
          
          <div class="warning-box">
            <p style="margin: 0;"><strong>⚠️ Sua conta foi suspensa temporariamente.</strong></p>
          </div>
          
          <p>Informamos que sua conta no sistema LouvaMais foi suspensa por um administrador.</p>
          
          <div class="reason-box">
            <p style="margin: 0 0 5px 0;"><strong>📋 Motivo da suspensão:</strong></p>
            <p style="margin: 0; color: #666;">${motivo}</p>
          </div>
          
          <p><strong>👤 Ação realizada por:</strong> ${adminNome}</p>
          
          <div class="contact-info">
            <p style="margin: 0 0 10px 0;"><strong>💬 Precisa de ajuda?</strong></p>
            <p style="margin: 0;">Se você acredita que isso foi um erro ou deseja mais informações, entre em contato conosco:</p>
            <p style="margin: 10px 0 0 0;">
              📧 Email: <a href="mailto:louvamais590@gmail.com" style="color: #7c3aed;">louvamais590@gmail.com</a><br>
              📱 WhatsApp: <a href="https://wa.me/5518996890414" style="color: #7c3aed;">+55 18 99689-0414</a>
            </p>
          </div>
        </div>
        <div class="footer">
          <p><strong>LouvaMais - Church Solutions</strong></p>
          <p>Sistema de Gestão de Escalas e Repertórios Litúrgicos</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template de email para reativação de conta
 */
export function templateEmailReativacao(
  nomeUsuario: string,
  adminNome: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Conta Reativada</h1>
          <p>LouvaMais - Sistema de Gestão</p>
        </div>
        <div class="content">
          <p>Olá <strong>${nomeUsuario}</strong>,</p>
          
          <div class="success-box">
            <p style="margin: 0;"><strong>🎉 Sua conta foi reativada com sucesso!</strong></p>
          </div>
          
          <p>Temos boas notícias! Sua conta no sistema LouvaMais foi reativada e você já pode acessar todas as funcionalidades novamente.</p>
          
          <p><strong>👤 Ação realizada por:</strong> ${adminNome}</p>
          
          <div style="text-align: center;">
            <a href="${process.env.VITE_APP_URL || 'https://louvamais.com'}" class="cta-button">
              🚀 Acessar o Sistema
            </a>
          </div>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <strong>💡 Lembrete:</strong> Você pode gerenciar escalas, repertórios e participar de todas as atividades da sua comunidade.
          </p>
          
          <p>Seja bem-vindo(a) de volta! 🙏</p>
        </div>
        <div class="footer">
          <p><strong>LouvaMais - Church Solutions</strong></p>
          <p>Sistema de Gestão de Escalas e Repertórios Litúrgicos</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template de email para alteração de permissões
 */
export function templateEmailAlteracaoPermissoes(
  nomeUsuario: string,
  novaRole: string,
  adminNome: string
): string {
  const roleLabels: Record<string, { nome: string; descricao: string; emoji: string }> = {
    admin: {
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema, incluindo gerenciamento de usuários, logs de auditoria e todas as funcionalidades.',
      emoji: '👑'
    },
    moderator: {
      nome: 'Moderador',
      descricao: 'Acesso a escalas, repertórios, blog, depoimentos e estatísticas. Pode suspender usuários mas não pode excluí-los ou alterar permissões.',
      emoji: '🛡️'
    },
    user: {
      nome: 'Usuário',
      descricao: 'Acesso padrão às funcionalidades do sistema: criar e participar de escalas, gerenciar repertórios e visualizar conteúdo.',
      emoji: '👤'
    }
  };

  const roleInfo = roleLabels[novaRole] || roleLabels.user;

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
        .info-box { background: #ede9fe; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .role-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #7c3aed; }
        .permissions-list { background: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 15px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Permissões Atualizadas</h1>
          <p>LouvaMais - Sistema de Gestão</p>
        </div>
        <div class="content">
          <p>Olá <strong>${nomeUsuario}</strong>,</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>📢 Suas permissões no sistema foram atualizadas.</strong></p>
          </div>
          
          <div class="role-box">
            <h2 style="margin: 0 0 10px 0; color: #7c3aed;">${roleInfo.emoji} Nova Função: ${roleInfo.nome}</h2>
            <p style="margin: 0; color: #666;">${roleInfo.descricao}</p>
          </div>
          
          <p><strong>👤 Alteração realizada por:</strong> ${adminNome}</p>
          
          <div style="text-align: center;">
            <a href="${process.env.VITE_APP_URL || 'https://louvamais.com'}" class="cta-button">
              🚀 Acessar o Sistema
            </a>
          </div>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <strong>💡 Dica:</strong> Faça logout e login novamente para garantir que todas as novas permissões sejam aplicadas corretamente.
          </p>
        </div>
        <div class="footer">
          <p><strong>LouvaMais - Church Solutions</strong></p>
          <p>Sistema de Gestão de Escalas e Repertórios Litúrgicos</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
