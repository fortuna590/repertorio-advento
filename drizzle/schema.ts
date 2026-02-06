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
  role: mysqlEnum("role", ["user", "moderator", "admin"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "suspended"]).default("active").notNull(), // Status da conta
  suspensionReason: text("suspensionReason"), // Motivo da suspensão (obrigatório ao suspender)
  adminNotes: text("adminNotes"), // Notas administrativas sobre o usuário
  paroquia: varchar("paroquia", { length: 255 }), // Paróquia ou ministério do usuário
  foto: varchar("foto", { length: 500 }), // URL da foto de perfil
  bio: text("bio"), // Biografia/descrição do usuário
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de logs de auditoria para rastrear ações administrativas
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Quem executou a ação
  userName: varchar("userName", { length: 255 }).notNull(), // Nome do usuário que executou
  userRole: mysqlEnum("userRole", ["admin", "moderator"]).notNull(), // Role do usuário que executou
  action: varchar("action", { length: 100 }).notNull(), // Tipo de ação (excluir, suspender, ativar, alterar_role)
  targetType: varchar("targetType", { length: 50 }).notNull(), // Tipo de alvo (user, escala, repertorio)
  targetId: int("targetId").notNull(), // ID do alvo da ação
  targetName: varchar("targetName", { length: 255 }), // Nome do alvo (para referência)
  details: text("details"), // Detalhes adicionais em JSON (valores antigos/novos, justificativa)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

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
  userId: int("userId").references(() => users.id), // Referência ao usuário logado
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  notas: text("notas"), // Notas/observações do repertório
  musicas: text("musicas").notNull(), // JSON array com IDs das músicas selecionadas
  ordemMusicas: text("ordemMusicas"), // JSON array com ordem personalizada das músicas
  emailUsuario: varchar("emailUsuario", { length: 320 }),
  nomeUsuario: varchar("nomeUsuario", { length: 255 }),
  shareId: varchar("shareId", { length: 36 }), // UUID para compartilhamento público
  isPublic: int("isPublic").default(0).notNull(), // 0 = privado, 1 = público
  dataCelebracao: timestamp("dataCelebracao"), // Data da celebração/missa
  visualizacoes: int("visualizacoes").default(0).notNull(), // Contador de visualizações
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Repertorio = typeof repertorios.$inferSelect;
export type InsertRepertorio = typeof repertorios.$inferInsert;

/**
 * Tabela para repertórios personalizados dos usuários (novo sistema)
 */
export const repertoriosPersonalizados = mysqlTable("repertoriosPersonalizados", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tags: text("tags"), // JSON array com tags/categorias (ex: ["Missa Dominical", "Casamento"])
  shareId: varchar("shareId", { length: 36 }), // UUID para compartilhamento público
  isPublic: int("isPublic").default(0).notNull(), // 0 = privado, 1 = público
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RepertorioPersonalizado = typeof repertoriosPersonalizados.$inferSelect;
export type InsertRepertorioPersonalizado = typeof repertoriosPersonalizados.$inferInsert;

/**
 * Tabela para músicas dos repertórios personalizados
 */
export const musicasRepertorioPersonalizado = mysqlTable("musicasRepertorioPersonalizado", {
  id: int("id").autoincrement().primaryKey(),
  repertorioId: int("repertorioId").notNull().references(() => repertoriosPersonalizados.id, { onDelete: "cascade", onUpdate: "no action" }),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  artista: varchar("artista", { length: 255 }),
  tom: varchar("tom", { length: 10 }), // Ex: C, Dm, F#, etc.
  linkCifra: varchar("linkCifra", { length: 500 }),
  linkYoutube: varchar("linkYoutube", { length: 500 }),
  momento: varchar("momento", { length: 100 }).notNull(), // Entrada, Glória, Aclamação, Ofertório, Santo, Cordeiro, Comunhão, Final, Outro
  ordem: int("ordem").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MusicaRepertorioPersonalizado = typeof musicasRepertorioPersonalizado.$inferSelect;
export type InsertMusicaRepertorioPersonalizado = typeof musicasRepertorioPersonalizado.$inferInsert;

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
  compartilhamentos: int("compartilhamentos").default(0).notNull(),
  // SEO fields
  metaDescricao: varchar("metaDescricao", { length: 160 }), // Meta description para Google
  metaKeywords: varchar("metaKeywords", { length: 255 }), // Meta keywords para SEO
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

/**
 * Tabela para músicas favoritas dos usuários
 */
export const musicasFavoritas = mysqlTable("musicasFavoritas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  musicaId: varchar("musicaId", { length: 100 }).notNull(), // ID da música no JSON
  musicaTitulo: varchar("musicaTitulo", { length: 255 }).notNull(),
  musicaArtista: varchar("musicaArtista", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MusicaFavorita = typeof musicasFavoritas.$inferSelect;
export type InsertMusicaFavorita = typeof musicasFavoritas.$inferInsert;

/**
 * Tabela para músicas favoritas de repertórios admin
 */
export const musicasAdminFavoritas = mysqlTable("musicasAdminFavoritas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  musicaRepertorioId: int("musicaRepertorioId").notNull().references(() => musicasRepertorio.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MusicaAdminFavorita = typeof musicasAdminFavoritas.$inferSelect;
export type InsertMusicaAdminFavorita = typeof musicasAdminFavoritas.$inferInsert;

/**
 * Tabela para preferências de usuário (newsletter, notificações)
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Newsletter
  newsletterEnabled: int("newsletterEnabled").default(1).notNull(), // 0 = desativado, 1 = ativado
  newsletterFrequency: mysqlEnum("newsletterFrequency", ["weekly", "monthly", "never"]).default("monthly").notNull(),
  
  // Notificações
  notifyNewSongs: int("notifyNewSongs").default(1).notNull(),
  notifyNewArticles: int("notifyNewArticles").default(1).notNull(),
  notifyLiturgicalEvents: int("notifyLiturgicalEvents").default(1).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Tabela para histórico de acessos a músicas (para sugestões personalizadas)
 */
export const musicHistory = mysqlTable("musicHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  musicaId: varchar("musicaId", { length: 100 }).notNull(),
  musicaTitulo: varchar("musicaTitulo", { length: 255 }).notNull(),
  momentoId: varchar("momentoId", { length: 100 }).notNull(),
  accessedAt: timestamp("accessedAt").defaultNow().notNull(),
});

export type MusicHistory = typeof musicHistory.$inferSelect;
export type InsertMusicHistory = typeof musicHistory.$inferInsert;

/**
 * Tabela para repertórios administrativos (criados pelo admin)
 */
export const repertoriosAdmin = mysqlTable("repertoriosAdmin", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  tempoLiturgico: varchar("tempoLiturgico", { length: 100 }).default("Personalizado"),
  corPrimaria: varchar("corPrimaria", { length: 7 }).default("#7c3aed").notNull(),
  corSecundaria: varchar("corSecundaria", { length: 7 }).default("#d946ef").notNull(),
  corFundo: varchar("corFundo", { length: 7 }).default("#1e1b4b").notNull(),
  corTexto: varchar("corTexto", { length: 7 }).default("#ffffff").notNull(),
  imagemCapa: varchar("imagemCapa", { length: 500 }),
  publicado: int("publicado").default(1).notNull(),
  visualizacoes: int("visualizacoes").default(0).notNull(),
  compartilhamentos: int("compartilhamentos").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RepertorioAdmin = typeof repertoriosAdmin.$inferSelect;
export type InsertRepertorioAdmin = typeof repertoriosAdmin.$inferInsert;

/**
 * Tabela para momentos da missa (configuráveis por repertório)
 */
export const momentosMissa = mysqlTable("momentosMissa", {
  id: int("id").autoincrement().primaryKey(),
  repertorioId: int("repertorioId").notNull().references(() => repertoriosAdmin.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  ordem: int("ordem").notNull(),
  icone: varchar("icone", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MomentoMissa = typeof momentosMissa.$inferSelect;
export type InsertMomentoMissa = typeof momentosMissa.$inferInsert;

/**
 * Tabela para músicas associadas a repertórios
 */
export const musicasRepertorio = mysqlTable("musicasRepertorio", {
  id: int("id").autoincrement().primaryKey(),
  repertorioId: int("repertorioId").notNull().references(() => repertoriosAdmin.id),
  momentoId: int("momentoId").notNull().references(() => momentosMissa.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  artista: varchar("artista", { length: 255 }),
  descricao: text("descricao"),
  linkYoutube: varchar("linkYoutube", { length: 500 }),
  linkCifra: varchar("linkCifra", { length: 500 }),
  ordem: int("ordem").notNull(),
  cliquesYoutube: int("cliquesYoutube").default(0).notNull(),
  cliquesCifra: int("cliquesCifra").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MusicaRepertorio = typeof musicasRepertorio.$inferSelect;
export type InsertMusicaRepertorio = typeof musicasRepertorio.$inferInsert;

/**
 * Tabela para músicas adicionais aos repertórios base (Advento, Quaresma, etc.)
 */
export const musicasRepertorioBase = mysqlTable("musicasRepertorioBase", {
  id: int("id").autoincrement().primaryKey(),
  repertorioId: varchar("repertorioId", { length: 100 }).notNull(), // ID do repertório (ex: "advento")
  momentoId: varchar("momentoId", { length: 100 }).notNull(), // ID do momento (ex: "entrada")
  titulo: varchar("titulo", { length: 255 }).notNull(),
  artista: varchar("artista", { length: 255 }),
  youtube: varchar("youtube", { length: 500 }),
  cifra: varchar("cifra", { length: 500 }),
  observacao: text("observacao"),
  ordem: int("ordem").default(999), // Ordem de exibição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MusicaRepertorioBase = typeof musicasRepertorioBase.$inferSelect;
export type InsertMusicaRepertorioBase = typeof musicasRepertorioBase.$inferInsert;

/**
 * Tabela para escalas multiuso (músicos, reuniões, grupo de oração)
 */
export const escalas = mysqlTable("escalas", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  data: date("data").notNull(),
  hora: varchar("hora", { length: 10 }),
  local: varchar("local", { length: 255 }),
  tipo: varchar("tipo", { length: 50 }).notNull(), // "musicos", "reuniao", "grupo_oracao", "personalizado"
  template: varchar("template", { length: 50 }), // Nome do template usado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Escala = typeof escalas.$inferSelect;
export type InsertEscala = typeof escalas.$inferInsert;

/**
 * Tabela para funções/momentos de uma escala
 */
export const funcoesEscala = mysqlTable("funcoesEscala", {
  id: int("id").autoincrement().primaryKey(),
  escalaId: int("escalaId").notNull().references(() => escalas.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(), // Ex: "Violão", "Acolhida", "Secretário"
  descricao: text("descricao"),
  ordem: int("ordem").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FuncaoEscala = typeof funcoesEscala.$inferSelect;
export type InsertFuncaoEscala = typeof funcoesEscala.$inferInsert;

/**
 * Tabela para participantes alocados em funções
 */
export const participantesEscala = mysqlTable("participantesEscala", {
  id: int("id").autoincrement().primaryKey(),
  escalaId: int("escalaId").notNull().references(() => escalas.id, { onDelete: "cascade" }),
  funcaoId: int("funcaoId").notNull().references(() => funcoesEscala.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id), // Referência ao usuário cadastrado
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  status: varchar("status", { length: 20 }).default("pendente").notNull(), // "confirmado", "pendente", "ausente"
  observacoes: text("observacoes"),
  token: varchar("token", { length: 64 }).unique(), // Token único para confirmação rápida
  arquivado: int("arquivado").default(0).notNull(), // 0 = não arquivado, 1 = arquivado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParticipanteEscala = typeof participantesEscala.$inferSelect;
export type InsertParticipanteEscala = typeof participantesEscala.$inferInsert;

/**
 * Tabela para histórico de alterações em escalas
 */
export const historicoEscalas = mysqlTable("historicoEscalas", {
  id: int("id").autoincrement().primaryKey(),
  escalaId: int("escalaId").notNull().references(() => escalas.id, { onDelete: "cascade" }),
  userId: int("userId").references(() => users.id), // Quem fez a alteração
  userName: varchar("userName", { length: 255 }), // Nome do usuário que fez a alteração
  tipoAcao: mysqlEnum("tipoAcao", [
    "criacao",
    "edicao",
    "adicao_participante",
    "remocao_participante",
    "alteracao_status",
    "edicao_participante",
    "duplicacao"
  ]).notNull(),
  descricao: text("descricao").notNull(), // Descrição legível da ação
  dadosAnteriores: text("dadosAnteriores"), // JSON com dados antes da alteração
  dadosNovos: text("dadosNovos"), // JSON com dados após a alteração
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoEscala = typeof historicoEscalas.$inferSelect;
export type InsertHistoricoEscala = typeof historicoEscalas.$inferInsert;

/**
 * Tabela para templates de escalas personalizados
 */
export const templatesEscalas = mysqlTable("templatesEscalas", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(), // Dono do template
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: varchar("tipo", { length: 50 }).notNull(), // "musicos", "reuniao", "grupo_oracao", "personalizado"
  funcoes: text("funcoes").notNull(), // JSON array com as funções [{nome, descricao, ordem}]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TemplateEscala = typeof templatesEscalas.$inferSelect;
export type InsertTemplateEscala = typeof templatesEscalas.$inferInsert;

/**
 * Tabela para histórico de alterações em músicas dos repertórios base
 */
export const historicoMusicasBase = mysqlTable("historicoMusicasBase", {
  id: int("id").autoincrement().primaryKey(),
  musicaId: int("musicaId"), // ID da música (null se foi deletada)
  repertorioId: varchar("repertorioId", { length: 100 }).notNull(),
  momentoId: varchar("momentoId", { length: 100 }).notNull(),
  acao: mysqlEnum("acao", ["adicionar", "editar", "remover", "reordenar"]).notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  usuarioNome: varchar("usuarioNome", { length: 255 }),
  dadosAntigos: text("dadosAntigos"), // JSON com dados antes da alteração
  dadosNovos: text("dadosNovos"), // JSON com dados após a alteração
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoMusicaBase = typeof historicoMusicasBase.$inferSelect;
export type InsertHistoricoMusicaBase = typeof historicoMusicasBase.$inferInsert;
