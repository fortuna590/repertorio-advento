import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { escalas, participantesEscala } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, inArray } from "drizzle-orm";
import { 
  gerarArquivoICS, 
  gerarArquivoICSMultiplo, 
  parseDataHora, 
  calcularDataFim 
} from "../_core/icsGenerator";

export const escalasExportRouter = router({
  // Exportar uma única escala para Google Calendar
  exportarUnica: publicProcedure
    .input(z.object({
      escalaId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [escala] = await db
        .select()
        .from(escalas)
        .where(eq(escalas.id, input.escalaId));

      if (!escala) {
        throw new Error("Escala não encontrada");
      }

      // Buscar participantes
      const participantes = await db
        .select()
        .from(participantesEscala)
        .where(eq(participantesEscala.escalaId, input.escalaId));

      const dataInicio = parseDataHora(escala.data.toString(), escala.hora || undefined);
      const dataFim = calcularDataFim(dataInicio);

      const icsContent = gerarArquivoICS({
        titulo: escala.titulo,
        descricao: escala.descricao || undefined,
        local: escala.local || undefined,
        dataInicio,
        dataFim,
        participantes: participantes.map(p => p.nome),
      });

      return {
        success: true,
        icsContent,
        filename: `escala-${escala.id}-${escala.titulo.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`,
      };
    }),

  // Exportar múltiplas escalas em lote para Google Calendar
  exportarEmLote: publicProcedure
    .input(z.object({
      escalaIds: z.array(z.number()),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (input.escalaIds.length === 0) {
        throw new Error("Nenhuma escala selecionada");
      }

      // Buscar todas as escalas selecionadas
      const escalasData = await db
        .select()
        .from(escalas)
        .where(inArray(escalas.id, input.escalaIds));

      if (escalasData.length === 0) {
        throw new Error("Nenhuma escala encontrada");
      }

      // Buscar participantes de todas as escalas
      const participantesData = await db
        .select()
        .from(participantesEscala)
        .where(inArray(participantesEscala.escalaId, input.escalaIds));

      // Mapear participantes por escala
      const participantesPorEscala = participantesData.reduce((acc, p) => {
        if (!acc[p.escalaId]) {
          acc[p.escalaId] = [];
        }
        acc[p.escalaId].push(p.nome);
        return acc;
      }, {} as Record<number, string[]>);

      // Gerar eventos para o arquivo ICS
      const eventos = escalasData.map(escala => {
        const dataInicio = parseDataHora(escala.data.toString(), escala.hora || undefined);
        const dataFim = calcularDataFim(dataInicio);

        return {
          titulo: escala.titulo,
          descricao: escala.descricao || undefined,
          local: escala.local || undefined,
          dataInicio,
          dataFim,
          participantes: participantesPorEscala[escala.id] || [],
        };
      });

      const icsContent = gerarArquivoICSMultiplo(eventos);

      return {
        success: true,
        icsContent,
        filename: `escalas-louvamais-${new Date().toISOString().split('T')[0]}.ics`,
        totalEscalas: escalasData.length,
      };
    }),
});
