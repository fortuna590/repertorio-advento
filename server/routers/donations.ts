import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export const donationsRouter = router({
  // Criar sessão de checkout para doação
  createCheckout: publicProcedure
    .input(
      z.object({
        amount: z.number().min(5).max(100000), // R$ 5 a R$ 1000 (em centavos)
        donorName: z.string().optional(),
        donorEmail: z.string().email().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const origin = ctx.req.headers.origin || "http://localhost:3000";
        
        // Criar sessão de checkout do Stripe
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "brl",
                product_data: {
                  name: "Doação para LouvaMais",
                  description: input.message || "Apoio ao projeto LouvaMais - Church Solutions",
                  images: ["https://placehold.co/400x400/FF8C00/FFFFFF?text=LouvaMais"],
                },
                unit_amount: input.amount,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${origin}/doacao/sucesso?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/doacao`,
          customer_email: input.donorEmail,
          metadata: {
            type: "donation",
            donor_name: input.donorName || "Anônimo",
            donor_email: input.donorEmail || "",
            message: input.message || "",
          },
          allow_promotion_codes: true,
        });

        return {
          checkoutUrl: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        console.error("Erro ao criar checkout:", error);
        throw new Error("Erro ao processar doação");
      }
    }),

  // Verificar status da doação
  checkDonationStatus: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        
        return {
          status: session.payment_status,
          amount: session.amount_total,
          currency: session.currency,
          donorEmail: session.customer_email,
          metadata: session.metadata,
        };
      } catch (error) {
        console.error("Erro ao verificar doação:", error);
        throw new Error("Erro ao verificar status da doação");
      }
    }),
});
