import { getDb } from "../db";
import { momentos, tiposRepertorio, Momento, TipoRepertorio, InsertMomento, InsertTipoRepertorio } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ─── Tipos de Repertório ──────────────────────────────────────────────────────

export async function listarTiposRepertorio(): Promise<TipoRepertorio[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tiposRepertorio).where(eq(tiposRepertorio.ativo, true)).orderBy(tiposRepertorio.ordem);
}

export async function criarTipoRepertorio(data: InsertTipoRepertorio): Promise<TipoRepertorio> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tiposRepertorio).values(data);
  const id = Number((result as any).insertId);
  const rows = await db.select().from(tiposRepertorio).where(eq(tiposRepertorio.id, id));
  return rows[0];
}

export async function atualizarTipoRepertorio(id: number, data: Partial<InsertTipoRepertorio>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tiposRepertorio).set(data).where(eq(tiposRepertorio.id, id));
}

export async function deletarTipoRepertorio(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tiposRepertorio).set({ ativo: false }).where(eq(tiposRepertorio.id, id));
}

// ─── Momentos ─────────────────────────────────────────────────────────────────

export async function listarMomentosPorTipo(tipoRepertorioId: number): Promise<Momento[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(momentos)
    .where(and(eq(momentos.tipoRepertorioId, tipoRepertorioId), eq(momentos.ativo, true)))
    .orderBy(momentos.ordem);
}

export async function listarTodosMomentos(): Promise<Momento[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(momentos).where(eq(momentos.ativo, true)).orderBy(momentos.tipoRepertorioId, momentos.ordem);
}

export async function criarMomento(data: InsertMomento): Promise<Momento> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(momentos).values(data);
  const id = Number((result as any).insertId);
  const rows = await db.select().from(momentos).where(eq(momentos.id, id));
  return rows[0];
}

export async function atualizarMomento(id: number, data: Partial<InsertMomento>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(momentos).set(data).where(eq(momentos.id, id));
}

export async function deletarMomento(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(momentos).set({ ativo: false }).where(eq(momentos.id, id));
}

export async function buscarMomentoPorId(id: number): Promise<Momento | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(momentos).where(eq(momentos.id, id));
  return rows[0];
}
