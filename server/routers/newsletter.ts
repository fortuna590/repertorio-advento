import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { sendEmail, templateEmailNewsletter } from "../_core/email";

export const newsletterRouter = router({
  // Inscrever na newsletter
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        nome: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("📧 Nova inscrição na newsletter:", {
        email: input.email,
        nome: input.nome || "Não informado",
        data: new Date().toISOString(),
      });

      // Enviar notificação para o admin
      await sendEmail({
        to: 'louvamais590@gmail.com',
        subject: `Nova inscrição na newsletter - ${input.nome || input.email}`,
        html: templateEmailNewsletter(input.nome || 'Não informado', input.email)
      });

      // Enviar email de boas-vindas para o inscrito
      const emailBoasVindas = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bem-vindo à Newsletter LouvaMais!</h1>
            </div>
            <div class="content">
              <p>Olá ${input.nome || 'amigo(a)'},</p>
              <p>Obrigado por se inscrever na newsletter do <strong>Repertório Católico</strong>!</p>
              <p>Você receberá novidades sobre:</p>
              <ul>
                <li>✨ Novos repertórios litúrgicos</li>
                <li>🎵 Músicas católicas selecionadas</li>
                <li>📚 Conteúdos educacionais sobre liturgia</li>
                <li>🎁 Ofertas exclusivas e materiais gratuitos</li>
              </ul>
              <p style="text-align: center;">
                <a href="https://repertorio-advento.manus.space" class="button">Acessar Repertório</a>
              </p>
              <p>Para a maior glória de Deus! ✨</p>
            </div>
            <div class="footer">
              <p><strong>LouvaMais - Church Solutions</strong></p>
              <p>
                <a href="https://instagram.com/louvamais.solutions" style="color: #7c3aed;">Instagram</a> | 
                <a href="https://wa.me/5518996890414" style="color: #7c3aed;">WhatsApp</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: input.email,
        subject: 'Bem-vindo à Newsletter LouvaMais! 🎵',
        html: emailBoasVindas
      });

      return {
        success: true,
        message: "Inscrição realizada com sucesso! Verifique seu email.",
      };
    }),
});
