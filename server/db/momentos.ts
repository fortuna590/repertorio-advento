import { db } from ".";
import { momentos, tiposRepertorio, Momento, TipoRepertorio, InsertMomento, InsertTipoRepertorio } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ─── Tipos de Repertório ──────────────────────────────────────────────────────

export async function listarTiposRepertorio(): Promise<TipoRepertorio[]> {
  return db.select().from(tiposRepertorio).where(eq(tiposRepertorio.ativo, true)).orderBy(tiposRepertorio.ordem);
}

export async function criarTipoRepertorio(data: InsertTipoRepertorio): Promise<TipoRepertorio> {
  const result = await db.insert(tiposRepertorio).values(data);
  const id = Number(result.insertId);
  return db.select().from(tiposRepertorio).where(eq(tiposRepertorio.id, id)).then(r => r[0]);
}

export async function atualizarTipoRepertorio(id: number, data: Partial<InsertTipoRepertorio>): Promise<void> {
  await db.update(tiposRepertorio).set(data).where(eq(tiposRepertorio.id, id));
}

export async function deletarTipoRepertorio(id: number): Promise<void> {
  await db.update(tiposRepertorio).set({ ativo: false }).where(eq(tiposRepertorio.id, id));
}

// ─── Momentos ─────────────────────────────────────────────────────────────────

export async function listarMomentosPorTipo(tipoRepertorioId: number): Promise<Momento[]> {
  return db
    .select()
    .from(momentos)
    .where(and(eq(momentos.tipoRepertorioId, tipoRepertorioId), eq(momentos.ativo, true)))
    .orderBy(momentos.ordem);
}

export async function listarTodosMomentos(): Promise<Momento[]> {
  return db.select().from(momentos).where(eq(momentos.ativo, true)).orderBy(momentos.tipoRepertorioId, momentos.ordem);
}

export async function criarMomento(data: InsertMomento): Promise<Momento> {
  const result = await db.insert(momentos).values(data);
  const id = Number(result.insertId);
  return db.select().from(momentos).where(eq(momentos.id, id)).then(r => r[0]);
}

export async function atualizarMomento(id: number, data: Partial<InsertMomento>): Promise<void> {
  await db.update(momentos).set(data).where(eq(momentos.id, id));
}

export async function deletarMomento(id: number): Promise<void> {
  await db.update(momentos).set({ ativo: false }).where(eq(momentos.id, id));
}

export async function buscarMomentoPorId(id: number): Promise<Momento | undefined> {
  return db.select().from(momentos).where(eq(momentos.id, id)).then(r => r[0]);
}
