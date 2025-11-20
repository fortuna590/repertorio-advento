import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../db";

export const notificationsRouter = router({
  // Listar todas as notificações
  getAll: publicProcedure.query(async () => {
    return await getNotifications();
  }),

  // Contar notificações não lidas
  getUnreadCount: publicProcedure.query(async () => {
    return await getUnreadNotificationCount();
  }),

  // Marcar notificação como lida
  markAsRead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markNotificationAsRead(input.id);
      return { success: true };
    }),

  // Marcar todas como lidas
  markAllAsRead: publicProcedure.mutation(async () => {
    await markAllNotificationsAsRead();
    return { success: true };
  }),
});
