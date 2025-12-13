import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getLiturgia, getLiturgiaByDateISO, upsertLiturgia } from "../db";

// API da Liturgia Diária
const LITURGIA_API_URL = "https://liturgia.up.railway.app/v2";

interface LiturgiaResponse {
  data: string;
  liturgia: string;
  cor: string;
  oracoes: {
    coleta?: string;
    oferendas?: string;
    comunhao?: string;
    extras?: Array<{ titulo: string; texto: string }>;
  };
  leituras: {
    primeiraLeitura?: Array<{ referencia: string; titulo: string; texto: string }>;
    segundaLeitura?: Array<{ referencia: string; titulo: string; texto: string }>;
    salmo?: Array<{ referencia: string; titulo: string; texto: string }>;
    evangelho?: Array<{ referencia: string; titulo: string; texto: string }>;
  };
}

/**
 * Converter data de DD/MM/YYYY para YYYY-MM-DD
 */
function convertDataToISO(data: string): string {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Converter data de YYYY-MM-DD para DD/MM/YYYY
 */
function convertISOToData(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

/**
 * Buscar liturgia da API externa
 */
async function fetchLiturgiaFromAPI(dia: number, mes: number, ano: number): Promise<LiturgiaResponse | null> {
  try {
    // Formato: YYYY-MM-DD
    const dataFormatada = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const url = `${LITURGIA_API_URL}/${dataFormatada}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`[Liturgia API] Failed to fetch: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Verificar se é um erro
    if (data.erro) {
      console.warn(`[Liturgia API] Error: ${data.erro}`);
      return null;
    }
    
    return data as LiturgiaResponse;
  } catch (error) {
    console.error("[Liturgia API] Fetch error:", error);
    return null;
  }
}

export const liturgiasRouter = router({
  /**
   * Obter liturgia de um dia específico
   */
  getByDate: publicProcedure
    .input(z.object({
      dia: z.number().min(1).max(31),
      mes: z.number().min(1).max(12),
      ano: z.number().min(2000).max(2100).optional(),
    }))
    .query(async ({ input }: { input: { dia: number; mes: number; ano?: number } }) => {
      const { dia, mes, ano = new Date().getFullYear() } = input;
      
      // Converter para formato ISO
      const dataISO = `${String(ano).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const data = `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;
      
      try {
        // Verificar se já existe no banco
        let liturgia = await getLiturgiaByDateISO(dataISO);
        
        if (!liturgia) {
          // Buscar da API
          const apiResponse = await fetchLiturgiaFromAPI(dia, mes, ano);
          
          if (!apiResponse) {
            return {
              success: false,
              error: "Liturgia não encontrada",
              data: null,
            };
          }
          
          // Salvar no banco
          const insertData = {
            data: apiResponse.data,
            dataISO: dataISO as any,
            liturgia: apiResponse.liturgia,
            cor: apiResponse.cor,
            coleta: apiResponse.oracoes?.coleta || null,
            oferendas: apiResponse.oracoes?.oferendas || null,
            comunhao: apiResponse.oracoes?.comunhao || null,
            extras: apiResponse.oracoes?.extras ? JSON.stringify(apiResponse.oracoes.extras) : null,
            primeiraLeitura: apiResponse.leituras?.primeiraLeitura ? JSON.stringify(apiResponse.leituras.primeiraLeitura) : null,
            segundaLeitura: apiResponse.leituras?.segundaLeitura ? JSON.stringify(apiResponse.leituras.segundaLeitura) : null,
            salmo: apiResponse.leituras?.salmo ? JSON.stringify(apiResponse.leituras.salmo) : null,
            evangelho: apiResponse.leituras?.evangelho ? JSON.stringify(apiResponse.leituras.evangelho) : null,
            apiResponse: JSON.stringify(apiResponse),
          };
          
          const savedLiturgia = await upsertLiturgia(insertData);
          if (savedLiturgia) {
            liturgia = savedLiturgia;
          }
        }
        
        // Parsear JSONs
        if (liturgia) {
          return {
            success: true,
            data: {
              ...liturgia,
              extras: liturgia.extras ? JSON.parse(liturgia.extras) : [],
              primeiraLeitura: liturgia.primeiraLeitura ? JSON.parse(liturgia.primeiraLeitura) : [],
              segundaLeitura: liturgia.segundaLeitura ? JSON.parse(liturgia.segundaLeitura) : [],
              salmo: liturgia.salmo ? JSON.parse(liturgia.salmo) : [],
              evangelho: liturgia.evangelho ? JSON.parse(liturgia.evangelho) : [],
            },
          };
        }
        
        return {
          success: false,
          error: "Erro ao salvar liturgia",
          data: null,
        };
      } catch (error) {
        console.error("[Liturgia] Error:", error);
        return {
          success: false,
          error: "Erro ao buscar liturgia",
          data: null,
        };
      }
    }),

  /**
   * Obter liturgia de hoje
   */
  getToday: publicProcedure.query(async () => {
    const today = new Date();
    const dia = today.getDate();
    const mes = today.getMonth() + 1;
    const ano = today.getFullYear();
    
    return await fetchLiturgiaFromAPI(dia, mes, ano);
  }),

  /**
   * Obter liturgias de um período (próximos N dias)
   */
  getPeriod: publicProcedure
    .input(z.object({
      dias: z.number().min(1).max(7).default(7),
    }))
    .query(async ({ input }: { input: { dias: number } }) => {
      const { dias } = input;
      const today = new Date();
      const liturgias = [];
      
      for (let i = 0; i < dias; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        const dia = date.getDate();
        const mes = date.getMonth() + 1;
        const ano = date.getFullYear();
        
        try {
          const liturgia = await fetchLiturgiaFromAPI(dia, mes, ano);
          if (liturgia) {
            liturgias.push(liturgia);
          }
        } catch (error) {
          console.error(`[Liturgia] Error fetching ${dia}/${mes}/${ano}:`, error);
        }
      }
      
      return {
        success: true,
        count: liturgias.length,
        data: liturgias,
      };
    }),
});
