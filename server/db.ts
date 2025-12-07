import { eq, desc, gte, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clicks, InsertClick, notifications, InsertNotification, Notification, artigos, repertorios, products, Product, InsertProduct, depoimentos, Depoimento, InsertDepoimento } from "../drizzle/schema";
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

/**
 * Obter estatu00edsticas com peru00edodo de tempo
 */
export async function getClickStatsByPeriod(days: number = 7) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get click stats: database not available");
    return { totalClicks: 0, clicksByType: [], clicksByMomento: [], clicksByMusica: [], topMusicas: [], topMomentos: [] };
  }

  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    const allClicks = await db.select().from(clicks).where(
      gte(clicks.clickedAt, dateFrom)
    );
    
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
    
    // Cliques por mu00fasica
    const clicksByMusica = allClicks.reduce((acc, click) => {
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
      clicksByMusica: clicksByMusica.slice(0, 20),
      topMusicas: clicksByMusica.slice(0, 10),
      topMomentos: clicksByMomento.slice(0, 10)
    };
  } catch (error) {
    console.error("[Database] Failed to get click stats by period:", error);
    throw error;
  }
}

/**
 * Obter estatu00edsticas gerais do site
 */
export async function getSiteStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get site stats: database not available");
    return {
      totalMusicas: 29,
      totalVisualizacoes: 0,
      totalDownloads: 0,
      totalMinisterios: 0,
      totalArtigos: 0,
      crescimentoMensal: 0
    };
  }

  try {
    // Total de cliques (visualizações)
    const allClicks = await db.select().from(clicks);
    const totalVisualizacoes = allClicks.length;

    // Total de downloads (repertórios criados)
    const allRepertorios = await db.select().from(repertorios);
    const totalDownloads = allRepertorios.length;

    // Total de ministérios (usuários únicos que criaram repertórios)
    const uniqueMinisterios = new Set(allRepertorios.map(r => r.emailUsuario).filter(Boolean)).size;

    // Total de artigos publicados
    const allArtigos = await db.select().from(artigos);
    const totalArtigos = allArtigos.filter(a => a.publicado === 1).length;

    // Calcular crescimento mensal (cliques este mês vs mês anterior)
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const clicksThisMonth = allClicks.filter(c => new Date(c.clickedAt) >= currentMonth).length;
    const clicksPreviousMonth = allClicks.filter(c => {
      const date = new Date(c.clickedAt);
      return date >= previousMonth && date < currentMonth;
    }).length;

    const crescimentoMensal = clicksPreviousMonth > 0 
      ? Math.round(((clicksThisMonth - clicksPreviousMonth) / clicksPreviousMonth) * 100)
      : 0;

    return {
      totalMusicas: 29, // Fixo: 29 músicas do Advento
      totalVisualizacoes: totalVisualizacoes,
      totalDownloads: totalDownloads,
      totalMinisterios: uniqueMinisterios,
      totalArtigos: totalArtigos,
      crescimentoMensal: crescimentoMensal
    };
  } catch (error) {
    console.error("[Database] Failed to get site stats:", error);
    return {
      totalMusicas: 29,
      totalVisualizacoes: 0,
      totalDownloads: 0,
      totalMinisterios: 0,
      totalArtigos: 0,
      crescimentoMensal: 0
    };
  }
}

/**
 * Criar uma nova notificação
 */
export async function createNotification(notification: InsertNotification): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create notification: database not available");
    return;
  }

  try {
    await db.insert(notifications).values(notification);
    console.log(`[Notification] Created: ${notification.title}`);
  } catch (error) {
    console.error("[Database] Failed to create notification:", error);
    throw error;
  }
}

/**
 * Listar todas as notificações (não lidas primeiro)
 */
export async function getNotifications(): Promise<Notification[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get notifications: database not available");
    return [];
  }

  try {
    const allNotifications = await db.select().from(notifications);
    // Ordenar: não lidas primeiro, depois por data (mais recente primeiro)
    return allNotifications.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead - b.isRead; // 0 (não lida) vem antes de 1 (lida)
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error("[Database] Failed to get notifications:", error);
    return [];
  }
}

/**
 * Contar notificações não lidas
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot count unread notifications: database not available");
    return 0;
  }

  try {
    const allNotifications = await db.select().from(notifications);
    return allNotifications.filter(n => n.isRead === 0).length;
  } catch (error) {
    console.error("[Database] Failed to count unread notifications:", error);
    return 0;
  }
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark notification as read: database not available");
    return;
  }

  try {
    await db.update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.id, id));
  } catch (error) {
    console.error("[Database] Failed to mark notification as read:", error);
    throw error;
  }
}

/**
 * Marcar todas as notificações como lidas
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark all notifications as read: database not available");
    return;
  }

  try {
    await db.update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.isRead, 0));
  } catch (error) {
    console.error("[Database] Failed to mark all notifications as read:", error);
    throw error;
  }
}

/**
 * Criar um novo repertório personalizado
 */
export async function createRepertorio(repertorio: { nome: string; descricao?: string; musicas: string; emailUsuario?: string; nomeUsuario?: string }): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create repertorio: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(repertorios).values(repertorio);
    const insertId = Number(result[0].insertId);
    console.log(`[Repertorio] Created: ${repertorio.nome} (ID: ${insertId})`);
    return insertId;
  } catch (error) {
    console.error("[Database] Failed to create repertorio:", error);
    throw error;
  }
}

/**
 * Obter um repertório por ID
 */
export async function getRepertorioById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get repertorio: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(repertorios).where(eq(repertorios.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get repertorio:", error);
    return undefined;
  }
}

/**
 * Listar todos os repertórios (mais recentes primeiro)
 */
export async function getAllRepertorios() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get repertorios: database not available");
    return [];
  }

  try {
    const allRepertorios = await db.select().from(repertorios);
    return allRepertorios.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("[Database] Failed to get repertorios:", error);
    return [];
  }
}

/**
 * Atualizar um repertório
 */
export async function updateRepertorio(id: number, updates: { nome?: string; descricao?: string; musicas?: string }): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update repertorio: database not available");
    return;
  }

  try {
    await db.update(repertorios)
      .set(updates)
      .where(eq(repertorios.id, id));
    console.log(`[Repertorio] Updated: ID ${id}`);
  } catch (error) {
    console.error("[Database] Failed to update repertorio:", error);
    throw error;
  }
}

/**
 * Deletar um repertório
 */
export async function deleteRepertorio(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete repertorio: database not available");
    return;
  }

  try {
    await db.delete(repertorios).where(eq(repertorios.id, id));
    console.log(`[Repertorio] Deleted: ID ${id}`);
  } catch (error) {
    console.error("[Database] Failed to delete repertorio:", error);
    throw error;
  }
}

/**
 * Criar um novo artigo
 */
export async function createArtigo(artigo: { titulo: string; slug: string; resumo: string; conteudo: string; imagemCapa?: string; categoria?: string; tags?: string; autorNome?: string; publicado?: number }): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create artigo: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(artigos).values(artigo);
    const insertId = Number(result[0].insertId);
    console.log(`[Artigo] Created: ${artigo.titulo} (ID: ${insertId})`);
    return insertId;
  } catch (error) {
    console.error("[Database] Failed to create artigo:", error);
    throw error;
  }
}

/**
 * Obter um artigo por slug
 */
export async function getArtigoBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get artigo: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(artigos).where(eq(artigos.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get artigo:", error);
    return undefined;
  }
}

/**
 * Obter um artigo por ID
 */
export async function getArtigoById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get artigo: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(artigos).where(eq(artigos.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get artigo:", error);
    return undefined;
  }
}

/**
 * Listar todos os artigos publicados (mais recentes primeiro)
 */
export async function getAllArtigos(includeRascunhos = false) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get artigos: database not available");
    return [];
  }

  try {
    let allArtigos = await db.select().from(artigos);
    
    if (!includeRascunhos) {
      allArtigos = allArtigos.filter(a => a.publicado === 1);
    }
    
    return allArtigos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("[Database] Failed to get artigos:", error);
    return [];
  }
}

/**
 * Atualizar um artigo
 */
export async function updateArtigo(id: number, updates: { titulo?: string; slug?: string; resumo?: string; conteudo?: string; imagemCapa?: string; categoria?: string; tags?: string; autorNome?: string; publicado?: number }): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update artigo: database not available");
    return;
  }

  try {
    await db.update(artigos)
      .set(updates)
      .where(eq(artigos.id, id));
    console.log(`[Artigo] Updated: ID ${id}`);
  } catch (error) {
    console.error("[Database] Failed to update artigo:", error);
    throw error;
  }
}

/**
 * Deletar um artigo
 */
export async function deleteArtigo(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete artigo: database not available");
    return;
  }

  try {
    await db.delete(artigos).where(eq(artigos.id, id));
    console.log(`[Artigo] Deleted: ID ${id}`);
  } catch (error) {
    console.error("[Database] Failed to delete artigo:", error);
    throw error;
  }
}

/**
 * Incrementar visualizações de um artigo
 */
export async function incrementArtigoViews(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment artigo views: database not available");
    return;
  }

  try {
    const artigo = await getArtigoById(id);
    if (artigo) {
      await db.update(artigos)
        .set({ visualizacoes: artigo.visualizacoes + 1 })
        .where(eq(artigos.id, id));
    }
  } catch (error) {
    console.error("[Database] Failed to increment artigo views:", error);
    throw error;
  }
}


// ============ PRODUTOS ============

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get products: database not available");
    return [];
  }

  try {
    return await db.select().from(products).where(eq(products.disponivel, 1));
  } catch (error) {
    console.error("[Database] Failed to get products:", error);
    return [];
  }
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get product: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get product:", error);
    return undefined;
  }
}

export async function clearAndSeedProducts(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed products: database not available");
    return;
  }

  try {
    // Limpar produtos existentes
    await db.delete(products);

    // Adicionar novos produtos
    const newProducts: InsertProduct[] = [
      {
        nome: 'Catecismo da Igreja Católica',
        descricao: 'Compêndio oficial da doutrina católica - Nova Edição Tamanho Grande',
        preco: 5899,
        precoOriginal: 7887,
        desconto: 25,
        moeda: 'BRL',
        plataforma: 'mercado_livre',
        produtoId: '5NTWJH-B1NV',
        linkAfiliado: 'https://mercadolivre.com/sec/1L32bE3',
        disponivel: 1,
        parcelaMaxima: 12,
        valorParcela: 581,
        temJuros: 0,
        freteGratis: 1,
        valorFrete: 0,
        cupom: 'R$ 5 OFF',
        valorCupom: 500,
      },
      {
        nome: 'Missal Romano - Tradução Da 3ª Edição Típica',
        descricao: 'Missal Solene para celebração da Santa Missa',
        preco: 57989,
        moeda: 'BRL',
        plataforma: 'mercado_livre',
        produtoId: '5NTWJH-XHZD',
        linkAfiliado: 'https://mercadolivre.com/sec/2uS2z1T',
        disponivel: 1,
        parcelaMaxima: 12,
        valorParcela: 4832,
        temJuros: 0,
        freteGratis: 1,
        valorFrete: 0,
      },
      {
        nome: 'Constituição Sacrosanctum Concilium',
        descricao: 'Documento do Concílio Vaticano II sobre a Sagrada Liturgia',
        preco: 2000,
        moeda: 'BRL',
        plataforma: 'mercado_livre',
        produtoId: '1ibn8j6',
        linkAfiliado: 'https://mercadolivre.com/sec/1ibn8j6',
        disponivel: 1,
        parcelaMaxima: 1,
        valorParcela: 2000,
        temJuros: 0,
        freteGratis: 1,
        valorFrete: 0,
      },
      {
        nome: 'O Segredo dos Ritos',
        descricao: 'Ritualidade e sacramentalidade da liturgia cristã - 216 páginas',
        preco: 3040,
        moeda: 'BRL',
        plataforma: 'amazon',
        produtoId: '8535628673',
        linkAfiliado: 'https://amzn.to/3Y5inXF',
        disponivel: 1,
        parcelaMaxima: 1,
        valorParcela: 3040,
        temJuros: 0,
        freteGratis: 1,
        valorFrete: 0,
      },
      {
        nome: 'Cristo, Festa Da Igreja - O Ano Litúrgico',
        descricao: 'Estudo do ano litúrgico e celebração de Cristo - 506 páginas',
        preco: 5077,
        moeda: 'BRL',
        plataforma: 'amazon',
        produtoId: '8573110392',
        linkAfiliado: 'https://amzn.to/4pOmXFQ',
        disponivel: 1,
        parcelaMaxima: 1,
        valorParcela: 5077,
        temJuros: 0,
        freteGratis: 1,
        valorFrete: 0,
      },
      {
        nome: 'No Espírito E Na Verdade - Volume 2',
        descricao: 'Introdução Antropológica à Liturgia - 448 páginas',
        preco: 0,
        moeda: 'BRL',
        plataforma: 'amazon',
        produtoId: '8532616852',
        linkAfiliado: 'https://amzn.to/48QMOaf',
        disponivel: 0,
        parcelaMaxima: 1,
        valorParcela: 0,
        temJuros: 0,
        freteGratis: 1,
        valorFrete: 0,
      },
    ];

    for (const product of newProducts) {
      await db.insert(products).values(product);
    }

    console.log('[Database] ✅ Produtos adicionados com sucesso!');
  } catch (error) {
    console.error('[Database] ❌ Erro ao adicionar produtos:', error);
    throw error;
  }
}

export async function createProduct(product: InsertProduct): Promise<Product | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create product: database not available");
    return null;
  }

  try {
    const result = await db.insert(products).values(product);
    const id = result[0].insertId;
    return await getProductById(Number(id)) || null;
  } catch (error) {
    console.error("[Database] Failed to create product:", error);
    throw error;
  }
}

export async function updateProduct(id: number, updates: Partial<InsertProduct>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update product: database not available");
    return;
  }

  try {
    await db.update(products).set(updates).where(eq(products.id, id));
  } catch (error) {
    console.error("[Database] Failed to update product:", error);
    throw error;
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete product: database not available");
    return;
  }

  try {
    await db.delete(products).where(eq(products.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete product:", error);
    throw error;
  }
}
