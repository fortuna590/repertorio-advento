import { Resend } from "resend";
import { ENV } from "./env";

const resend = new Resend(ENV.resendApiKey);

export interface ReminderEmailData {
  to: string;
  escalaTitle: string;
  escalaDate: string;
  escalaTime: string;
  escalaLocal: string;
  participantName: string;
  participantRole: string;
}

export async function sendEscalaReminder(data: ReminderEmailData): Promise<boolean> {
  try {
    const { to, escalaTitle, escalaDate, escalaTime, escalaLocal, participantName, participantRole } = data;

    await resend.emails.send({
      from: "LouvaMais <noreply@louvamais.com>",
      to,
      subject: `Lembrete: ${escalaTitle} - ${escalaDate}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .info-box {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #7c3aed;
              }
              .info-item {
                margin: 10px 0;
              }
              .label {
                font-weight: bold;
                color: #7c3aed;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎵 Lembrete de Escala</h1>
              <p>LouvaMais - Organização Litúrgica</p>
            </div>
            <div class="content">
              <p>Olá, <strong>${participantName}</strong>!</p>
              <p>Este é um lembrete sobre sua participação na escala:</p>
              
              <div class="info-box">
                <div class="info-item">
                  <span class="label">📋 Escala:</span> ${escalaTitle}
                </div>
                <div class="info-item">
                  <span class="label">📅 Data:</span> ${escalaDate}
                </div>
                <div class="info-item">
                  <span class="label">🕐 Horário:</span> ${escalaTime}
                </div>
                <div class="info-item">
                  <span class="label">📍 Local:</span> ${escalaLocal}
                </div>
                <div class="info-item">
                  <span class="label">🎤 Sua Função:</span> ${participantRole}
                </div>
              </div>
              
              <p>Por favor, confirme sua presença e chegue com antecedência.</p>
              <p>Em caso de imprevistos, avise o coordenador o quanto antes.</p>
              
              <p>Que Deus abençoe seu ministério! 🙏</p>
            </div>
            <div class="footer">
              <p>LouvaMais - Organização Litúrgica</p>
              <p>Este é um email automático, não responda.</p>
            </div>
          </body>
        </html>
      `,
    });

    return true;
  } catch (error) {
    console.error("[Email Reminder] Erro ao enviar:", error);
    return false;
  }
}
