import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function useEscalasNotifications(userId?: number) {
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  
  // Verificar novas escalas a cada 30 segundos
  const { data: minhasEscalas } = trpc.escalas.minhasEscalas.useQuery(
    { userId: userId || 0 },
    { 
      enabled: !!userId,
      refetchInterval: 30000, // 30 segundos
    }
  );

  useEffect(() => {
    if (!minhasEscalas || minhasEscalas.length === 0) return;

    // Verificar se há escalas novas desde a última verificação
    const novasEscalas = minhasEscalas.filter((escala: any) => {
      const criadaEm = new Date(escala.createdAt);
      return criadaEm > lastCheck;
    });

    // Notificar sobre novas escalas
    novasEscalas.forEach((escala: any) => {
      const minhaParticipacao = escala.participantes?.find(
        (p: any) => p.userId === userId
      );
      
      if (minhaParticipacao) {
        toast.info(`Nova escala: ${escala.titulo}`, {
          description: `Você foi adicionado como ${minhaParticipacao.funcao?.nome}`,
          duration: 5000,
        });
      }
    });

    // Atualizar timestamp da última verificação
    if (novasEscalas.length > 0) {
      setLastCheck(new Date());
    }
  }, [minhasEscalas, userId, lastCheck]);

  return {
    totalEscalas: minhasEscalas?.length || 0,
    escalasNaoConfirmadas: minhasEscalas?.filter((e: any) => {
      const minhaParticipacao = e.participantes?.find((p: any) => p.userId === userId);
      return minhaParticipacao?.status === "pendente";
    }).length || 0,
  };
}
