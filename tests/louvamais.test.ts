import { describe, it, expect } from "vitest";

// ─── Testes de utilitários de slug ────────────────────────────────────────────
function gerarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

describe("gerarSlug", () => {
  it("converte título simples em slug", () => {
    expect(gerarSlug("Repertório para Missa")).toBe("repertorio-para-missa");
  });

  it("remove acentos e caracteres especiais", () => {
    expect(gerarSlug("Advento: Tempo de Espera")).toBe("advento-tempo-de-espera");
  });

  it("substitui múltiplos espaços por um único hífen", () => {
    expect(gerarSlug("Tempo   Comum")).toBe("tempo-comum");
  });

  it("converte para minúsculas", () => {
    expect(gerarSlug("QUARESMA")).toBe("quaresma");
  });

  it("remove traços duplicados", () => {
    expect(gerarSlug("Páscoa -- Ressurreição")).toBe("pascoa-ressureicao");
  });
});

// ─── Testes de validação de tempos litúrgicos ─────────────────────────────────
const TEMPOS_VALIDOS = ["ADVENTO", "NATAL", "QUARESMA", "PASCOA", "TEMPO_COMUM", "CELEBRACOES"] as const;
type TempoLiturgico = typeof TEMPOS_VALIDOS[number];

function isTempoValido(tempo: string): tempo is TempoLiturgico {
  return TEMPOS_VALIDOS.includes(tempo as TempoLiturgico);
}

describe("validação de tempos litúrgicos", () => {
  it("aceita ADVENTO como válido", () => {
    expect(isTempoValido("ADVENTO")).toBe(true);
  });

  it("aceita QUARESMA como válido", () => {
    expect(isTempoValido("QUARESMA")).toBe(true);
  });

  it("rejeita tempo inválido", () => {
    expect(isTempoValido("CARNAVAL")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(isTempoValido("")).toBe(false);
  });

  it("todos os 6 tempos são válidos", () => {
    expect(TEMPOS_VALIDOS.every(isTempoValido)).toBe(true);
  });
});

// ─── Testes de validação de momentos da missa ─────────────────────────────────
const MOMENTOS_VALIDOS = [
  "ENTRADA", "ATO_PENITENCIAL", "GLORIA", "SALMO", "ACLAMACAO",
  "OFERTORIO", "SANTO", "COMUNHAO", "FINAL", "OUTROS"
] as const;

function isMomentoValido(momento: string): boolean {
  return MOMENTOS_VALIDOS.includes(momento as typeof MOMENTOS_VALIDOS[number]);
}

describe("validação de momentos da missa", () => {
  it("aceita ENTRADA como válido", () => {
    expect(isMomentoValido("ENTRADA")).toBe(true);
  });

  it("aceita COMUNHAO como válido", () => {
    expect(isMomentoValido("COMUNHAO")).toBe(true);
  });

  it("rejeita momento inválido", () => {
    expect(isMomentoValido("PREGACAO")).toBe(false);
  });

  it("todos os 10 momentos são válidos", () => {
    expect(MOMENTOS_VALIDOS.every(isMomentoValido)).toBe(true);
  });
});

// ─── Testes de formatação de tags ─────────────────────────────────────────────
function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return tags.split(",").map(t => t.trim()).filter(Boolean);
  }
}

describe("parseTags", () => {
  it("parseia JSON array de tags", () => {
    expect(parseTags('["Advento","Liturgia"]')).toEqual(["Advento", "Liturgia"]);
  });

  it("retorna array vazio para null", () => {
    expect(parseTags(null)).toEqual([]);
  });

  it("retorna array vazio para string vazia", () => {
    expect(parseTags("")).toEqual([]);
  });

  it("parseia string separada por vírgulas como fallback", () => {
    expect(parseTags("Advento, Natal, Quaresma")).toEqual(["Advento", "Natal", "Quaresma"]);
  });
});

// ─── Testes de estrutura de repertório ───────────────────────────────────────
interface RepertorioBase {
  titulo: string;
  slug: string;
  tempoLiturgico: TempoLiturgico;
  categoria: string;
  descricao?: string | null;
  visivel: boolean;
}

function validarRepertorio(r: Partial<RepertorioBase>): { valido: boolean; erros: string[] } {
  const erros: string[] = [];
  if (!r.titulo || r.titulo.trim().length < 3) erros.push("Título muito curto");
  if (!r.slug || !/^[a-z0-9-]+$/.test(r.slug)) erros.push("Slug inválido");
  if (!r.tempoLiturgico || !isTempoValido(r.tempoLiturgico)) erros.push("Tempo litúrgico inválido");
  if (!r.categoria || r.categoria.trim().length < 2) erros.push("Categoria inválida");
  return { valido: erros.length === 0, erros };
}

describe("validarRepertorio", () => {
  it("valida repertório completo e correto", () => {
    const r: RepertorioBase = {
      titulo: "Repertório para Missa – Advento",
      slug: "repertorio-missa-advento",
      tempoLiturgico: "ADVENTO",
      categoria: "Missa Dominical",
      visivel: true,
    };
    expect(validarRepertorio(r).valido).toBe(true);
    expect(validarRepertorio(r).erros).toHaveLength(0);
  });

  it("rejeita repertório sem título", () => {
    const r = { slug: "sem-titulo", tempoLiturgico: "ADVENTO" as TempoLiturgico, categoria: "Missa", visivel: true };
    expect(validarRepertorio(r).valido).toBe(false);
    expect(validarRepertorio(r).erros).toContain("Título muito curto");
  });

  it("rejeita slug com caracteres inválidos", () => {
    const r = { titulo: "Teste", slug: "Slug Inválido!", tempoLiturgico: "ADVENTO" as TempoLiturgico, categoria: "Missa", visivel: true };
    expect(validarRepertorio(r).valido).toBe(false);
    expect(validarRepertorio(r).erros).toContain("Slug inválido");
  });

  it("rejeita tempo litúrgico inválido", () => {
    const r = { titulo: "Teste", slug: "teste", tempoLiturgico: "INVALIDO" as TempoLiturgico, categoria: "Missa", visivel: true };
    expect(validarRepertorio(r).valido).toBe(false);
  });
});
