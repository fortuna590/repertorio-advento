import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// ─── Usuários ─────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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

// ─── Repertórios (admin) ──────────────────────────────────────────────────────
export const repertorios = mysqlTable("lm_repertorios", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tempoLiturgico: mysqlEnum("tempoLiturgico", [
    "ADVENTO",
    "NATAL",
    "QUARESMA",
    "PASCOA",
    "TEMPO_COMUM",
    "CELEBRACOES",
  ]).notNull().default("TEMPO_COMUM"),
  categoria: varchar("categoria", { length: 100 }).notNull().default("Missa Dominical"),
  descricao: text("descricao"),
  visivel: boolean("visivel").notNull().default(true),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 320 }),
  palavrasChave: text("palavrasChave"),
  ogImage: varchar("ogImage", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Repertorio = typeof repertorios.$inferSelect;
export type InsertRepertorio = typeof repertorios.$inferInsert;

// ─── Músicas dos Repertórios ──────────────────────────────────────────────────
export const musicas = mysqlTable("lm_musicas", {
  id: int("id").autoincrement().primaryKey(),
  repertorioId: int("repertorioId").notNull(),
  momento: mysqlEnum("momento", [
    "ENTRADA",
    "ATO_PENITENCIAL",
    "GLORIA",
    "SALMO",
    "ACLAMACAO",
    "OFERTORIO",
    "SANTO",
    "COMUNHAO",
    "FINAL",
    "OUTROS",
  ]).notNull().default("OUTROS"),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  artista: varchar("artista", { length: 255 }),
  tom: varchar("tom", { length: 10 }),
  youtube: varchar("youtube", { length: 512 }),
  cifra: varchar("cifra", { length: 512 }),
  letra: text("letra"),
  ordem: int("ordem").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Musica = typeof musicas.$inferSelect;
export type InsertMusica = typeof musicas.$inferInsert;

// ─── Artigos do Blog ──────────────────────────────────────────────────────────
export const artigos = mysqlTable("lm_artigos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  resumo: text("resumo"),
  conteudo: text("conteudo").notNull(),
  imagemCapa: varchar("imagemCapa", { length: 512 }),
  categoria: varchar("categoria", { length: 100 }).notNull().default("Liturgia"),
  tags: text("tags"),
  publicado: boolean("publicado").notNull().default(false),
  visualizacoes: int("visualizacoes").notNull().default(0),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 320 }),
  palavrasChave: text("palavrasChave"),
  ogImage: varchar("ogImage", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Artigo = typeof artigos.$inferSelect;
export type InsertArtigo = typeof artigos.$inferInsert;
// ─── Favoritos (usuário ♥ repertório) ────────────────────────────────────────
export const favoritos = mysqlTable("lm_favoritos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  repertorioId: int("repertorioId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Favorito = typeof favoritos.$inferSelect;
export type InsertFavorito = typeof favoritos.$inferInsert;
// ─── Repertórios de Usuário (privados) ───────────────────────────────────────
export const repertoriosUsuario = mysqlTable("lm_repertorios_usuario", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  compartilhado: boolean("compartilhado").notNull().default(false),
  shareToken: varchar("shareToken", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RepertorioUsuario = typeof repertoriosUsuario.$inferSelect;
export type InsertRepertorioUsuario = typeof repertoriosUsuario.$inferInsert;
// ─── Músicas dos Repertórios de Usuário ──────────────────────────────────────
export const musicasUsuario = mysqlTable("lm_musicas_usuario", {
  id: int("id").autoincrement().primaryKey(),
  repertorioId: int("repertorioId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  artista: varchar("artista", { length: 255 }),
  tom: varchar("tom", { length: 10 }),
  momento: mysqlEnum("momento_u", [
    "ENTRADA", "ATO_PENITENCIAL", "GLORIA", "SALMO", "ACLAMACAO",
    "OFERTORIO", "SANTO", "COMUNHAO", "FINAL", "OUTROS",
  ]).notNull().default("OUTROS"),
  youtube: varchar("youtube", { length: 512 }),
  cifra: varchar("cifra", { length: 512 }),
  letra: varchar("letra", { length: 512 }),
  ordem: int("ordem").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MusicaUsuario = typeof musicasUsuario.$inferSelect;
export type InsertMusicaUsuario = typeof musicasUsuario.$inferInsert;
