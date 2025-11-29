import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createNotification } from "../db";
import { sendEmail, templateEmailContato } from "../_core/email";

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
      
      // Enviar email real usando Resend
      const mensagemCompleta = `
Nome: ${input.nome}
Email: ${input.email}
Telefone: ${input.telefone || 'Não informado'}
Paróquia: ${input.paroquia || 'Não informada'}

Mensagem:
${input.mensagem}
      `;
      
      const emailResult = await sendEmail({
        to: 'louvamais590@gmail.com',
        subject: `Nova mensagem de contato - ${input.nome}`,
        html: templateEmailContato(input.nome, input.email, mensagemCompleta),
        replyTo: input.email
      });
      
      if (!emailResult.success) {
        console.error('❌ Erro ao enviar email de contato:', emailResult.error);
      }
      
      return { 
        success: true,
        emailSent: emailResult.success 
      };
    }),
});
