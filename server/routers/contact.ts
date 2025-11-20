import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createNotification } from "../db";

export const contactRouter = router({
  sendEmail: publicProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        email: z.string().email(),
        telefone: z.string().optional(),
        paroquia: z.string().optional(),
        mensagem: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      // Por enquanto, apenas simular o envio
      // Em produção, você pode usar um serviço de email gratuito como:
      // - Resend (https://resend.com) - 3000 emails/mês grátis
      // - SendGrid - 100 emails/dia grátis
      // - Mailgun - 5000 emails/mês grátis
      
      console.log("📧 Nova mensagem de contato recebida:");
      console.log("Nome:", input.nome);
      console.log("Email:", input.email);
      console.log("Telefone:", input.telefone || "Não informado");
      console.log("Paróquia:", input.paroquia || "Não informada");
      console.log("Mensagem:", input.mensagem);
      console.log("---");
      
      // Criar notificação de nova mensagem de contato
      await createNotification({
        type: "contact",
        title: "Nova mensagem de contato",
        message: `${input.nome} (${input.email}) enviou uma mensagem`,
        data: JSON.stringify({
          nome: input.nome,
          email: input.email,
          telefone: input.telefone,
          paroquia: input.paroquia,
          mensagem: input.mensagem,
        }),
      });
      
      // TODO: Implementar envio real de email
      // Exemplo com Resend (gratuito):
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: 'contato@louvamais.com',
      //   to: 'louvamais590@gmail.com',
      //   subject: `Novo contato de ${input.nome}`,
      //   html: `
      //     <h2>Nova mensagem de contato</h2>
      //     <p><strong>Nome:</strong> ${input.nome}</p>
      //     <p><strong>Email:</strong> ${input.email}</p>
      //     <p><strong>Telefone:</strong> ${input.telefone || 'Não informado'}</p>
      //     <p><strong>Paróquia:</strong> ${input.paroquia || 'Não informada'}</p>
      //     <p><strong>Mensagem:</strong></p>
      //     <p>${input.mensagem}</p>
      //   `,
      // });
      
      return { success: true };
    }),
});
