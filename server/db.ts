import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, repertorios, musicas, artigos } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _db = drizzle(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Usuários ─────────────────────────────────────────────────────────────────
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0] ?? null;
}

export async function upsertUser(data: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date;
}) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserByOpenId(data.openId);
  if (existing) {
    await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.openId, data.openId));
  } else {
    await db.insert(users).values({
      openId: data.openId,
      name: data.name ?? null,
      email: data.email ?? null,
      loginMethod: data.loginMethod ?? null,
    });
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listarUsuarios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Repertórios ──────────────────────────────────────────────────────────────
export async function listarRepertorios(apenasVisiveis = true) {
  const db = await getDb();
  if (!db) return [];
  if (apenasVisiveis) {
    return db.select().from(repertorios).where(eq(repertorios.visivel, true)).orderBy(desc(repertorios.createdAt));
  }
  return db.select().from(repertorios).orderBy(desc(repertorios.createdAt));
}

export async function buscarRepertorioPorSlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(repertorios).where(eq(repertorios.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function buscarRepertorioPorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(repertorios).where(eq(repertorios.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function criarRepertorio(data: typeof repertorios.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(repertorios).values(data);
  return buscarRepertorioPorId((result as any)[0].insertId);
}

export async function atualizarRepertorio(id: number, data: Partial<typeof repertorios.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(repertorios).set({ ...data, updatedAt: new Date() }).where(eq(repertorios.id, id));
  return buscarRepertorioPorId(id);
}

export async function excluirRepertorio(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(repertorios).where(eq(repertorios.id, id));
}

// ─── Músicas ──────────────────────────────────────────────────────────────────
export async function listarMusicasPorRepertorio(repertorioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(musicas).where(eq(musicas.repertorioId, repertorioId)).orderBy(musicas.momento, musicas.ordem);
}

export async function criarMusica(data: typeof musicas.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(musicas).values(data);
}

export async function atualizarMusica(id: number, data: Partial<typeof musicas.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(musicas).set(data).where(eq(musicas.id, id));
}

export async function excluirMusica(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(musicas).where(eq(musicas.id, id));
}

export async function excluirMusicasDoRepertorio(repertorioId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(musicas).where(eq(musicas.repertorioId, repertorioId));
}

// ─── Artigos ──────────────────────────────────────────────────────────────────
export async function listarArtigos(apenasPublicados = true) {
  const db = await getDb();
  if (!db) return [];
  if (apenasPublicados) {
    return db.select().from(artigos).where(eq(artigos.publicado, true)).orderBy(desc(artigos.createdAt));
  }
  return db.select().from(artigos).orderBy(desc(artigos.createdAt));
}

export async function buscarArtigoPorSlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(artigos).where(eq(artigos.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function buscarArtigoPorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(artigos).where(eq(artigos.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function criarArtigo(data: typeof artigos.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(artigos).values(data);
  return buscarArtigoPorId((result as any)[0].insertId);
}

export async function atualizarArtigo(id: number, data: Partial<typeof artigos.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(artigos).set({ ...data, updatedAt: new Date() }).where(eq(artigos.id, id));
  return buscarArtigoPorId(id);
}

export async function excluirArtigo(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(artigos).where(eq(artigos.id, id));
}

export async function incrementarVisualizacoesArtigo(id: number) {
  const db = await getDb();
  if (!db) return;
  const artigo = await buscarArtigoPorId(id);
  if (artigo) {
    await db.update(artigos).set({ visualizacoes: artigo.visualizacoes + 1 }).where(eq(artigos.id, id));
  }
}

// ─── Favoritos ────────────────────────────────────────────────────────────────
import { favoritos, repertoriosUsuario, musicasUsuario } from "../drizzle/schema";
import { and } from "drizzle-orm";

export async function listarFavoritosUsuario(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(favoritos).where(eq(favoritos.userId, userId)).orderBy(desc(favoritos.createdAt));
}

export async function adicionarFavorito(userId: number, repertorioId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.insert(favoritos).values({ userId, repertorioId });
  } catch { /* já existe */ }
  return { userId, repertorioId };
}

export async function removerFavorito(userId: number, repertorioId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(favoritos).where(and(eq(favoritos.userId, userId), eq(favoritos.repertorioId, repertorioId)));
}

export async function verificarFavorito(userId: number, repertorioId: number) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select().from(favoritos).where(and(eq(favoritos.userId, userId), eq(favoritos.repertorioId, repertorioId))).limit(1);
  return rows.length > 0;
}

// ─── Repertórios de Usuário ───────────────────────────────────────────────────
export async function listarRepertoriosUsuario(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(repertoriosUsuario).where(eq(repertoriosUsuario.userId, userId)).orderBy(desc(repertoriosUsuario.createdAt));
}

export async function buscarRepertorioUsuarioPorId(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(repertoriosUsuario).where(eq(repertoriosUsuario.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function criarRepertorioUsuario(data: typeof repertoriosUsuario.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(repertoriosUsuario).values(data);
  return buscarRepertorioUsuarioPorId((result as any)[0].insertId);
}

export async function atualizarRepertorioUsuario(id: number, data: Partial<typeof repertoriosUsuario.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(repertoriosUsuario).set({ ...data, updatedAt: new Date() }).where(eq(repertoriosUsuario.id, id));
  return buscarRepertorioUsuarioPorId(id);
}

export async function excluirRepertorioUsuario(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(musicasUsuario).where(eq(musicasUsuario.repertorioId, id));
  await db.delete(repertoriosUsuario).where(eq(repertoriosUsuario.id, id));
}

export async function listarMusicasUsuario(repertorioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(musicasUsuario).where(eq(musicasUsuario.repertorioId, repertorioId)).orderBy(musicasUsuario.ordem);
}

export async function criarMusicaUsuario(data: typeof musicasUsuario.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(musicasUsuario).values(data);
  const rows = await db.select().from(musicasUsuario).where(eq(musicasUsuario.id, (result as any)[0].insertId)).limit(1);
  return rows[0] ?? null;
}

export async function excluirMusicaUsuario(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(musicasUsuario).where(eq(musicasUsuario.id, id));
}
