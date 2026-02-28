export const COOKIE_NAME = "app_session_id";

// Momentos fixos e imutáveis da Santa Missa — MVP LouvaMais
export const MOMENTOS_FIXOS = [
  { id: 'ENTRADA', label: 'Entrada' },
  { id: 'ATO_PENITENCIAL', label: 'Ato Penitencial' },
  { id: 'GLORIA', label: 'Glória' },
  { id: 'SALMO', label: 'Salmo' },
  { id: 'ACLAMACAO', label: 'Aclamação ao Evangelho' },
  { id: 'OFERTORIO', label: 'Ofertório' },
  { id: 'SANTO', label: 'Santo' },
  { id: 'COMUNHAO', label: 'Comunhão' },
  { id: 'FINAL', label: 'Final' },
] as const;

export type MomentoFixoId = typeof MOMENTOS_FIXOS[number]['id'];
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
