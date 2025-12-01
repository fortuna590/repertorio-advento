import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { createNotification } from "../db";
import { sendEmail, templateEmailPedido } from "../_core/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const paymentsRouter = router({
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        productName: z.string(),
        price: z.number().min(0.01),
        quantity: z.number().int().min(1).default(1),
        customerEmail: z.string().email(),
        customerName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "brl",
                product_data: {
                  name: input.productName,
                  description: `Compra de ${input.productName}`,
                  images: [],
                },
                unit_amount: Math.round(input.price * 100),
              },
              quantity: input.quantity,
            },
          ],
          mode: "payment",
          success_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/pagamento-sucesso?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/pagamento-cancelado`,
          customer_email: input.customerEmail,
          metadata: {
            productId: input.productId,
            productName: input.productName,
            customerName: input.customerName,
          },
        });

        console.log("✅ Sessão de checkout criada:", session.id);

        return {
          success: true,
          sessionId: session.id,
          url: session.url,
        };
      } catch (error: any) {
        console.error("❌ Erro ao criar sessão de checkout:", error);
        return {
          success: false,
          error: error.message || "Erro ao criar sessão de pagamento",
        };
      }
    }),

  getCheckoutSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);

        if (session.payment_status === "paid") {
          // Criar notificação de pagamento
          await createNotification({
            type: "general",
            title: "Novo pagamento recebido",
            message: `${session.metadata?.customerName} pagou R$ ${(session.amount_total || 0) / 100} por ${session.metadata?.productName}`,
            data: JSON.stringify({
              sessionId: session.id,
              customerEmail: session.customer_email,
              customerName: session.metadata?.customerName,
              productName: session.metadata?.productName,
              amount: (session.amount_total || 0) / 100,
            }),
          });

          // Enviar email de confirmação
          if (session.customer_email) {
            await sendEmail({
              to: session.customer_email,
              subject: `Pagamento confirmado - ${session.metadata?.productName}`,
              html: templateEmailPedido(
                session.metadata?.customerName || "Cliente",
                session.metadata?.productName || "Produto",
                (session.amount_total || 0) / 100,
                session.id
              ),
            });
          }
        }

        return {
          success: true,
          paymentStatus: session.payment_status,
          amountTotal: (session.amount_total || 0) / 100,
          customerEmail: session.customer_email,
          metadata: session.metadata,
        };
      } catch (error: any) {
        console.error("❌ Erro ao recuperar sessão:", error);
        return {
          success: false,
          error: error.message || "Erro ao recuperar sessão",
        };
      }
    }),

  createProduct: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number().min(0.01),
        type: z.enum(["one-time", "subscription"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const product = await stripe.products.create({
          name: input.name,
          description: input.description,
          metadata: {
            type: input.type,
          },
        });

        const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(input.price * 100),
        currency: "brl",
        ...(input.type === "subscription" && {
          recurring: {
              interval: "month" as const,
            },
          })
        });

        console.log("✅ Produto criado:", product.id);

        return {
          success: true,
          productId: product.id,
          priceId: price.id,
        };
      } catch (error: any) {
        console.error("❌ Erro ao criar produto:", error);
        return {
          success: false,
          error: error.message || "Erro ao criar produto",
        };
      }
    }),

  listProducts: publicProcedure.query(async () => {
    try {
      const products = await stripe.products.list({
        limit: 100,
      });

      const productsWithPrices = await Promise.all(
        products.data.map(async (product) => {
          const prices = await stripe.prices.list({
            product: product.id,
          });

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            prices: prices.data.map((price) => ({
              id: price.id,
              amount: (price.unit_amount || 0) / 100,
              currency: price.currency,
              type: price.type,
            })),
          };
        })
      );

      return {
        success: true,
        products: productsWithPrices,
      };
    } catch (error: any) {
      console.error("❌ Erro ao listar produtos:", error);
      return {
        success: false,
        error: error.message || "Erro ao listar produtos",
      };
    }
  }),
});
