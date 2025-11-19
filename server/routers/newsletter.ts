import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

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
      // Por enquanto, apenas registra no console
      // Para implementação real, você pode:
      // 1. Salvar no banco de dados
      // 2. Integrar com serviço de email marketing (Mailchimp, SendGrid, etc.)
      
      console.log("📧 Nova inscrição na newsletter:", {
        email: input.email,
        nome: input.nome || "Não informado",
        data: new Date().toISOString(),
      });

      // Simular envio de email de confirmação
      console.log(`✉️ Email de confirmação enviado para: ${input.email}`);
      
      // TODO: Implementar integração real com serviço de email
      // Exemplo com Resend (gratuito até 3000 emails/mês):
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: 'LouvaMais <noreply@louvamais.com>',
      //   to: input.email,
      //   subject: 'Bem-vindo à Newsletter LouvaMais!',
      //   html: '<p>Obrigado por se inscrever!</p>'
      // });

      return {
        success: true,
        message: "Inscrição realizada com sucesso! Verifique seu email.",
      };
    }),
});
