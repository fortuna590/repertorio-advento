import { date, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela para rastrear cliques em links de músicas
 */
export const clicks = mysqlTable("clicks", {
  id: int("id").autoincrement().primaryKey(),
  musicaId: varchar("musicaId", { length: 100 }).notNull(),
  musicaTitulo: varchar("musicaTitulo", { length: 255 }).notNull(),
  musicaArtista: varchar("musicaArtista", { length: 255 }).notNull(),
  momentoId: varchar("momentoId", { length: 100 }).notNull(),
  momentoTitulo: varchar("momentoTitulo", { length: 255 }).notNull(),
  linkType: mysqlEnum("linkType", ["youtube", "cifra"]).notNull(),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
});

export type Click = typeof clicks.$inferSelect;
export type InsertClick = typeof clicks.$inferInsert;

/**
 * Tabela para notificações do sistema
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["donation", "contact", "newsletter", "general"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON com dados adicionais (valor doação, email, etc)
  isRead: int("isRead").default(0).notNull(), // 0 = não lida, 1 = lida
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Tabela para repertórios personalizados salvos pelos usuários
 */
export const repertorios = mysqlTable("repertorios", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  musicas: text("musicas").notNull(), // JSON array com IDs das músicas selecionadas
  emailUsuario: varchar("emailUsuario", { length: 320 }),
  nomeUsuario: varchar("nomeUsuario", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Repertorio = typeof repertorios.$inferSelect;
export type InsertRepertorio = typeof repertorios.$inferInsert;

/**
 * Tabela para artigos do blog
 */
export const artigos = mysqlTable("artigos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  resumo: text("resumo").notNull(),
  conteudo: text("conteudo").notNull(),
  imagemCapa: varchar("imagemCapa", { length: 500 }),
  categoria: varchar("categoria", { length: 100 }),
  tags: text("tags"), // JSON array de tags
  autorNome: varchar("autorNome", { length: 255 }),
  publicado: int("publicado").default(1).notNull(), // 0 = rascunho, 1 = publicado
  visualizacoes: int("visualizacoes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Artigo = typeof artigos.$inferSelect;
export type InsertArtigo = typeof artigos.$inferInsert;

/**
 * Tabela para produtos da loja (Mercado Livre e Amazon)
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  preco: int("preco").notNull(), // Preço em centavos (ex: 8990 = R$ 89,90)
  moeda: varchar("moeda", { length: 10 }).default("BRL").notNull(),
  plataforma: mysqlEnum("plataforma", ["mercado_livre", "amazon"]).notNull(),
  produtoId: varchar("produtoId", { length: 100 }).notNull(), // ID do Mercado Livre ou ASIN do Amazon
  linkAfiliado: varchar("linkAfiliado", { length: 500 }).notNull(),
  imagem: varchar("imagem", { length: 500 }),
  disponivel: int("disponivel").default(1).notNull(), // 0 = indisponível, 1 = disponível
  parcelaMaxima: int("parcelaMaxima").default(1).notNull(),
  valorParcela: int("valorParcela").default(0).notNull(),
  temJuros: int("temJuros").default(0).notNull(),
  freteGratis: int("freteGratis").default(0).notNull(),
  valorFrete: int("valorFrete").default(0).notNull(),
  desconto: int("desconto").default(0).notNull(),
  precoOriginal: int("precoOriginal").default(0).notNull(),
  cupom: varchar("cupom", { length: 100 }),
  valorCupom: int("valorCupom").default(0).notNull(),
  ultimaAtualizacao: timestamp("ultimaAtualizacao").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Tabela para depoimentos de usuários
 */
export const depoimentos = mysqlTable("depoimentos", {
  id: int("id").autoincrement().primaryKey(),
  nomeAutor: varchar("nomeAutor", { length: 255 }).notNull(),
  emailAutor: varchar("emailAutor", { length: 320 }).notNull(),
  organizacao: varchar("organizacao", { length: 255 }), // Paróquia, ministério, etc
  mensagem: text("mensagem").notNull(),
  rating: int("rating").notNull(), // 1-5 estrelas
  aprovado: int("aprovado").default(0).notNull(), // 0 = pendente, 1 = aprovado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Depoimento = typeof depoimentos.$inferSelect;
export type InsertDepoimento = typeof depoimentos.$inferInsert;


/**
 * Tabela para cache de liturgias diárias da CNBB
 */
export const liturgias = mysqlTable("liturgias", {
  id: int("id").autoincrement().primaryKey(),
  data: varchar("data", { length: 10 }).notNull().unique(), // Formato DD/MM/YYYY
  dataISO: date("dataISO").notNull().unique(), // Formato YYYY-MM-DD para queries
  liturgia: varchar("liturgia", { length: 255 }).notNull(), // Nome da liturgia
  cor: varchar("cor", { length: 50 }).notNull(), // Cor litúrgica
  
  // Orações
  coleta: text("coleta"),
  oferendas: text("oferendas"),
  comunhao: text("comunhao"),
  extras: text("extras"), // JSON array com orações extras
  
  // Leituras (armazenadas como JSON)
  primeiraLeitura: text("primeiraLeitura"), // JSON array
  segundaLeitura: text("segundaLeitura"), // JSON array
  salmo: text("salmo"), // JSON array
  evangelho: text("evangelho"), // JSON array
  
  // Metadata
  apiResponse: text("apiResponse"), // Resposta completa da API (backup)
  ultimaAtualizacao: timestamp("ultimaAtualizacao").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Liturgia = typeof liturgias.$inferSelect;
export type InsertLiturgia = typeof liturgias.$inferInsert;

/**
 * Tabela para favoritos de liturgias dos usuários
 */
export const liturgiaFavoritos = mysqlTable("liturgiaFavoritos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  liturgiaId: int("liturgiaId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LiturgiaFavorito = typeof liturgiaFavoritos.$inferSelect;
export type InsertLiturgiaFavorito = typeof liturgiaFavoritos.$inferInsert;
