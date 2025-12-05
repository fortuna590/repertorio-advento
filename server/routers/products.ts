import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getAllProducts, getProductById, clearAndSeedProducts } from "../db";

export const productsRouter = router({
  getAll: publicProcedure.query(async () => {
    return await getAllProducts();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getProductById(input.id);
    }),

  seed: publicProcedure.mutation(async () => {
    await clearAndSeedProducts();
    return { success: true, message: 'Produtos adicionados com sucesso!' };
  }),
});
