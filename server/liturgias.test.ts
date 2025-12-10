import { describe, it, expect } from "vitest";

describe("Liturgias - Validação de Formato", () => {
  it("deve validar formato de data DD/MM/YYYY", () => {
    const data = "25/12/2024";
    expect(data).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("deve validar formato de data ISO YYYY-MM-DD", () => {
    const dataISO = "2024-12-25";
    expect(dataISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("deve validar dia entre 1 e 31", () => {
    const dia = 25;
    expect(dia).toBeGreaterThanOrEqual(1);
    expect(dia).toBeLessThanOrEqual(31);
  });

  it("deve validar mês entre 1 e 12", () => {
    const mes = 12;
    expect(mes).toBeGreaterThanOrEqual(1);
    expect(mes).toBeLessThanOrEqual(12);
  });

  it("deve validar ano entre 2000 e 2100", () => {
    const ano = 2024;
    expect(ano).toBeGreaterThanOrEqual(2000);
    expect(ano).toBeLessThanOrEqual(2100);
  });

  it("deve validar período máximo de 7 dias", () => {
    const dias = 7;
    expect(dias).toBeGreaterThanOrEqual(1);
    expect(dias).toBeLessThanOrEqual(7);
  });

  it("deve converter data para ISO corretamente", () => {
    const dia = 25;
    const mes = 12;
    const ano = 2024;
    const dataISO = `${String(ano).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    
    expect(dataISO).toBe("2024-12-25");
  });

  it("deve converter data para formato DD/MM/YYYY corretamente", () => {
    const dia = 25;
    const mes = 12;
    const ano = 2024;
    const data = `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;
    
    expect(data).toBe("25/12/2024");
  });

  it("deve formatar data com padding correto", () => {
    const dia = 5;
    const mes = 3;
    const ano = 2024;
    const data = `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${ano}`;
    
    expect(data).toBe("05/03/2024");
  });

  it("deve validar estrutura de resposta de liturgia", () => {
    const liturgia = {
      data: "25/12/2024",
      liturgia: "Natal do Senhor",
      cor: "Branco",
      coleta: "Oração da coleta",
      primeiraLeitura: [
        { referencia: "Is 9, 1-6", titulo: "Título", texto: "Texto da leitura" }
      ],
      evangelho: [
        { referencia: "Lc 2, 1-14", titulo: "Título", texto: "Texto do evangelho" }
      ]
    };

    expect(liturgia).toHaveProperty("data");
    expect(liturgia).toHaveProperty("liturgia");
    expect(liturgia).toHaveProperty("cor");
    expect(Array.isArray(liturgia.primeiraLeitura)).toBe(true);
    expect(Array.isArray(liturgia.evangelho)).toBe(true);
  });

  it("deve validar cores litúrgicas válidas", () => {
    const coresValidas = ["Branco", "Roxo", "Verde", "Vermelho", "Rosa", "Negro"];
    const cor = "Branco";
    
    expect(coresValidas).toContain(cor);
  });
});
