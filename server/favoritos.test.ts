import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, musicasFavoritas } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Favoritos Router", () => {
  let testUser: any;
  let caller: any;

  beforeEach(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        openId: `test-favoritos-${Date.now()}`,
        name: "Test User Favoritos",
        email: `test-favoritos-${Date.now()}@example.com`,
        role: "user",
      })
      .$returningId();

    testUser = { id: user.id, openId: `test-favoritos-${Date.now()}`, role: "user" };

    // Create caller with authenticated user
    caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });
  });

  it("deve adicionar música aos favoritos", async () => {
    const result = await caller.favoritos.add({
      musicaId: "entrada-1",
      musicaTitulo: "Vem, Senhor Jesus",
      musicaArtista: "Ministério Adoração e Vida",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("adicionada aos favoritos");
  });

  it("deve retornar erro ao adicionar favorito sem autenticação", async () => {
    const unauthCaller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      unauthCaller.favoritos.add({
        musicaId: "entrada-1",
        musicaTitulo: "Vem, Senhor Jesus",
        musicaArtista: "Ministério Adoração e Vida",
      })
    ).rejects.toThrow("Usuário não autenticado");
  });

  it("não deve duplicar favoritos", async () => {
    await caller.favoritos.add({
      musicaId: "entrada-2",
      musicaTitulo: "Maranata",
      musicaArtista: "Comunidade Católica Shalom",
    });

    const result = await caller.favoritos.add({
      musicaId: "entrada-2",
      musicaTitulo: "Maranata",
      musicaArtista: "Comunidade Católica Shalom",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("já está nos favoritos");
  });

  it("deve listar favoritos do usuário", async () => {
    await caller.favoritos.add({
      musicaId: "entrada-3",
      musicaTitulo: "Preparai o Caminho",
      musicaArtista: "Comunidade Católica Shalom",
    });

    await caller.favoritos.add({
      musicaId: "entrada-4",
      musicaTitulo: "Vem, Vem, Senhor",
      musicaArtista: "Ministério Adoração e Vida",
    });

    const favoritos = await caller.favoritos.list();

    expect(favoritos).toHaveLength(2);
    expect(favoritos[0].titulo).toBeDefined();
    expect(favoritos[0].artista).toBeDefined();
  });

  it("deve retornar lista vazia para usuário não autenticado", async () => {
    const unauthCaller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const favoritos = await unauthCaller.favoritos.list();
    expect(favoritos).toEqual([]);
  });

  it("deve verificar se música está nos favoritos", async () => {
    await caller.favoritos.add({
      musicaId: "entrada-5",
      musicaTitulo: "Desperta, Jerusalém",
      musicaArtista: "Comunidade Católica Shalom",
    });

    const isFavorite = await caller.favoritos.isFavorite({
      musicaId: "Desperta, Jerusalém", // Usando título como identificador
    });

    expect(isFavorite).toBe(true);
  });

  it("deve retornar false para música não favoritada", async () => {
    const isFavorite = await caller.favoritos.isFavorite({
      musicaId: "entrada-999",
    });

    expect(isFavorite).toBe(false);
  });

  it("deve remover música dos favoritos", async () => {
    await caller.favoritos.add({
      musicaId: "entrada-6",
      musicaTitulo: "Vem, Senhor, Não Tardes",
      musicaArtista: "Ministério Adoração e Vida",
    });

    const result = await caller.favoritos.remove({
      musicaId: "entrada-6",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("removida dos favoritos");

    const isFavorite = await caller.favoritos.isFavorite({
      musicaId: "entrada-6",
    });

    expect(isFavorite).toBe(false);
  });

  it("deve retornar erro ao remover favorito sem autenticação", async () => {
    const unauthCaller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      unauthCaller.favoritos.remove({
        musicaId: "entrada-1",
      })
    ).rejects.toThrow("Usuário não autenticado");
  });

  it("deve retornar favoritos com timestamps válidos", async () => {
    await caller.favoritos.add({
      musicaId: "entrada-7",
      musicaTitulo: "Música com Timestamp",
      musicaArtista: "Artista Teste",
    });

    const favoritos = await caller.favoritos.list();
    const favoritoAdicionado = favoritos.find(f => f.titulo === "Música com Timestamp");

    expect(favoritoAdicionado).toBeDefined();
    expect(favoritoAdicionado?.createdAt).toBeDefined();
    expect(favoritoAdicionado?.createdAt).toBeInstanceOf(Date);
  });
});
