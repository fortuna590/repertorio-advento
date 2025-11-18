import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clicks, InsertClick } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Registrar um clique em link de música
 */
export async function registerClick(click: InsertClick): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot register click: database not available");
    return;
  }

  try {
    await db.insert(clicks).values(click);
  } catch (error) {
    console.error("[Database] Failed to register click:", error);
    throw error;
  }
}

/**
 * Obter estatísticas de cliques
 */
export async function getClickStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get click stats: database not available");
    return { totalClicks: 0, clicksByType: [], clicksByMomento: [], clicksByMusica: [] };
  }

  try {
    const allClicks = await db.select().from(clicks);
    
    // Total de cliques
    const totalClicks = allClicks.length;
    
    // Cliques por tipo (YouTube vs Cifra)
    const clicksByType = allClicks.reduce((acc, click) => {
      const existing = acc.find(item => item.type === click.linkType);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ type: click.linkType, count: 1 });
      }
      return acc;
    }, [] as Array<{ type: string; count: number }>);
    
    // Cliques por momento da missa
    const clicksByMomento = allClicks.reduce((acc, click) => {
      const existing = acc.find(item => item.momentoId === click.momentoId);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ 
          momentoId: click.momentoId, 
          momentoTitulo: click.momentoTitulo,
          count: 1 
        });
      }
      return acc;
    }, [] as Array<{ momentoId: string; momentoTitulo: string; count: number }>);
    
    // Cliques por música
    const clicksByMusica = allClicks.reduce((acc, click) => {
      const key = `${click.musicaId}-${click.linkType}`;
      const existing = acc.find(item => 
        item.musicaId === click.musicaId && item.linkType === click.linkType
      );
      if (existing) {
        existing.count++;
      } else {
        acc.push({ 
          musicaId: click.musicaId,
          musicaTitulo: click.musicaTitulo,
          musicaArtista: click.musicaArtista,
          momentoTitulo: click.momentoTitulo,
          linkType: click.linkType,
          count: 1 
        });
      }
      return acc;
    }, [] as Array<{ 
      musicaId: string; 
      musicaTitulo: string; 
      musicaArtista: string;
      momentoTitulo: string;
      linkType: string;
      count: number 
    }>);
    
    // Ordenar por contagem (maior para menor)
    clicksByType.sort((a, b) => b.count - a.count);
    clicksByMomento.sort((a, b) => b.count - a.count);
    clicksByMusica.sort((a, b) => b.count - a.count);
    
    return {
      totalClicks,
      clicksByType,
      clicksByMomento,
      clicksByMusica: clicksByMusica.slice(0, 20) // Top 20 músicas
    };
  } catch (error) {
    console.error("[Database] Failed to get click stats:", error);
    throw error;
  }
}
