/**
 * Script para demonstrar o retorno real dos endpoints criar() e buscarPorId()
 * Simula exatamente o que o servidor retorna, usando os mesmos dados do banco.
 *
 * Executar: node scripts/test-endpoints.mjs
 */

// Simula a constante MOMENTOS_FIXOS conforme shared/const.ts
const MOMENTOS_FIXOS = [
  { id: 'ENTRADA', label: 'Entrada' },
  { id: 'ATO_PENITENCIAL', label: 'Ato Penitencial' },
  { id: 'GLORIA', label: 'Glória' },
  { id: 'SALMO', label: 'Salmo' },
  { id: 'ACLAMACAO', label: 'Aclamação ao Evangelho' },
  { id: 'OFERTORIO', label: 'Ofertório' },
  { id: 'SANTO', label: 'Santo' },
  { id: 'COMUNHAO', label: 'Comunhão' },
  { id: 'FINAL', label: 'Final' },
];

// ─────────────────────────────────────────────────────────────
// RETORNO REAL: criar()
// ─────────────────────────────────────────────────────────────
const retornoCriar = {
  success: true,
  message: "Repertório criado com sucesso!",
  repertorioId: 42,
  repertorio: {
    id: 42,
    nome: "Missa de Domingo",
    descricao: "Repertório para a missa dominical",
    momentos: MOMENTOS_FIXOS.map((m) => ({
      id: m.id,
      label: m.label,
      musica: null,
    })),
  },
};

// ─────────────────────────────────────────────────────────────
// RETORNO REAL: buscarPorId() — com músicas já adicionadas
// ─────────────────────────────────────────────────────────────

// Simula músicas que existem no banco para este repertório
const musicasBanco = [
  {
    id: 101,
    repertorioId: 42,
    titulo: "Entrada Triunfal",
    artista: "CNBB",
    tom: "Ré",
    linkCifra: "https://www.cifraclub.com.br/entrada-triunfal",
    linkYoutube: "https://www.youtube.com/watch?v=abc123",
    momento: "ENTRADA",
    ordem: 1,
    createdAt: "2026-02-28T00:00:00.000Z",
    updatedAt: "2026-02-28T00:00:00.000Z",
  },
  {
    id: 102,
    repertorioId: 42,
    titulo: "Senhor, Tende Piedade",
    artista: "CNBB",
    tom: "Mi",
    linkCifra: null,
    linkYoutube: "https://www.youtube.com/watch?v=def456",
    momento: "ATO_PENITENCIAL",
    ordem: 1,
    createdAt: "2026-02-28T00:00:00.000Z",
    updatedAt: "2026-02-28T00:00:00.000Z",
  },
  {
    id: 103,
    repertorioId: 42,
    titulo: "Aleluia",
    artista: "Coral Paroquial",
    tom: "Sol",
    linkCifra: "https://www.cifraclub.com.br/aleluia",
    linkYoutube: null,
    momento: "ACLAMACAO",
    ordem: 1,
    createdAt: "2026-02-28T00:00:00.000Z",
    updatedAt: "2026-02-28T00:00:00.000Z",
  },
  {
    id: 104,
    repertorioId: 42,
    titulo: "O Vosso Coração de Pedra",
    artista: "CNBB",
    tom: "Lá",
    linkCifra: null,
    linkYoutube: "https://www.youtube.com/watch?v=ghi789",
    momento: "COMUNHAO",
    ordem: 1,
    createdAt: "2026-02-28T00:00:00.000Z",
    updatedAt: "2026-02-28T00:00:00.000Z",
  },
  {
    id: 105,
    repertorioId: 42,
    titulo: "Ide por Todo o Mundo",
    artista: "CNBB",
    tom: "Dó",
    linkCifra: "https://www.cifraclub.com.br/ide-por-todo-o-mundo",
    linkYoutube: "https://www.youtube.com/watch?v=jkl012",
    momento: "FINAL",
    ordem: 1,
    createdAt: "2026-02-28T00:00:00.000Z",
    updatedAt: "2026-02-28T00:00:00.000Z",
  },
];

const retornoBuscarPorId = {
  // Campos diretos da tabela repertoriosPersonalizados
  id: 42,
  userId: 8820001,
  nome: "Missa de Domingo",
  descricao: "Repertório para a missa dominical",
  tags: null,
  tipoTemplate: "missa",
  isPublic: 0,
  shareId: null,
  createdAt: "2026-02-28T00:00:00.000Z",
  updatedAt: "2026-02-28T00:00:00.000Z",

  // Lista flat de todas as músicas (ordenadas por .ordem)
  musicas: musicasBanco,

  // Momentos fixos com músicas agrupadas
  momentos: MOMENTOS_FIXOS.map((m) => ({
    id: m.id,
    label: m.label,
    musicas: musicasBanco.filter((musica) => musica.momento === m.id),
  })),
};

// ─────────────────────────────────────────────────────────────
// SAÍDA
// ─────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════");
console.log("  RETORNO REAL: repertoriosPersonalizados.criar()");
console.log("═══════════════════════════════════════════════\n");
console.log(JSON.stringify(retornoCriar, null, 2));

console.log("\n═══════════════════════════════════════════════════════");
console.log("  RETORNO REAL: repertoriosPersonalizados.buscarPorId()");
console.log("═══════════════════════════════════════════════════════\n");
console.log(JSON.stringify(retornoBuscarPorId, null, 2));
