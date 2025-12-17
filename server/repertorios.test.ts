import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, repertorios } from "../drizzle/schema";

describe("Repertorios Router", () => {
  let testUser: any;
  let caller: any;

  beforeEach(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        openId: `test-repertorios-${Date.now()}`,
        name: "Test User Repertorios",
        email: `test-repertorios-${Date.now()}@example.com`,
        role: "user",
      })
      .$returningId();

    testUser = { id: user.id, openId: `test-repertorios-${Date.now()}`, role: "user", email: `test-repertorios-${Date.now()}@example.com`, name: "Test User Repertorios" };

    // Create caller with authenticated user
    caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });
  });

  it("deve criar novo repertório", async () => {
    const result = await caller.repertorios.create({
      nome: "Missa de Advento",
      descricao: "Repertório para 1º Domingo do Advento",
      musicas: ["entrada-1", "salmo-1", "comunhao-1"],
    });

    expect(result.success).toBe(true);
    expect(result.repertorioId).toBeDefined();
    expect(result.message).toContain("criado com sucesso");
  });

  it("deve listar repertórios do usuário logado", async () => {
    await caller.repertorios.create({
      nome: "Repertório 1",
      musicas: ["entrada-1", "salmo-1"],
    });

    await caller.repertorios.create({
      nome: "Repertório 2",
      musicas: ["entrada-2", "salmo-2"],
    });

    const meusRepertorios = await caller.repertorios.listMeus();

    expect(meusRepertorios).toHaveLength(2);
    expect(meusRepertorios[0].nome).toBeDefined();
    expect(meusRepertorios[0].musicas).toBeInstanceOf(Array);
  });

  it("deve retornar lista vazia para usuário não autenticado", async () => {
    const unauthCaller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const repertorios = await unauthCaller.repertorios.listMeus();
    expect(repertorios).toEqual([]);
  });

  it("deve obter repertório por ID", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório Teste",
      musicas: ["entrada-1"],
    });

    const repertorio = await caller.repertorios.getById({ id: created.repertorioId });

    expect(repertorio.nome).toBe("Repertório Teste");
    expect(repertorio.musicas).toEqual(["entrada-1"]);
  });

  it("deve atualizar ordem das músicas", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório Ordem",
      musicas: ["entrada-1", "salmo-1", "comunhao-1"],
    });

    const novaOrdem = ["comunhao-1", "entrada-1", "salmo-1"];
    const result = await caller.repertorios.updateOrdem({
      id: created.repertorioId,
      ordemMusicas: novaOrdem,
    });

    expect(result.success).toBe(true);

    const repertorio = await caller.repertorios.getById({ id: created.repertorioId });
    expect(repertorio.ordemMusicas).toEqual(novaOrdem);
  });

  it("deve ativar compartilhamento público", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório Público",
      musicas: ["entrada-1"],
    });

    const result = await caller.repertorios.toggleShare({ id: created.repertorioId });

    expect(result.success).toBe(true);
    expect(result.isPublic).toBe(true);
    expect(result.shareId).toBeDefined();
  });

  it("deve obter repertório público por shareId", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório Compartilhado",
      musicas: ["entrada-1"],
    });

    const shareResult = await caller.repertorios.toggleShare({ id: created.repertorioId });

    // Qualquer usuário (ou não autenticado) pode acessar por shareId
    const unauthCaller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const repertorio = await unauthCaller.repertorios.getByShareId({
      shareId: shareResult.shareId!,
    });

    expect(repertorio.nome).toBe("Repertório Compartilhado");
    expect(repertorio.isPublic).toBe(1);
  });

  it("não deve acessar repertório privado por shareId", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório Privado",
      musicas: ["entrada-1"],
    });

    // Ativar e desativar compartilhamento
    const shareResult = await caller.repertorios.toggleShare({ id: created.repertorioId });
    await caller.repertorios.toggleShare({ id: created.repertorioId }); // Tornar privado novamente

    const unauthCaller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      unauthCaller.repertorios.getByShareId({ shareId: shareResult.shareId! })
    ).rejects.toThrow("não encontrado ou não é público");
  });

  it("deve duplicar repertório", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório Original",
      descricao: "Descrição original",
      musicas: ["entrada-1", "salmo-1"],
    });

    const result = await caller.repertorios.duplicate({
      id: created.repertorioId,
      novoNome: "Repertório Duplicado",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.id).not.toBe(created.repertorioId);

    const duplicado = await caller.repertorios.getById({ id: result.id });
    expect(duplicado.nome).toBe("Repertório Duplicado");
    expect(duplicado.musicas).toEqual(["entrada-1", "salmo-1"]);
  });

  it("deve atualizar notas do repertório", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório Notas",
      musicas: ["entrada-1"],
    });

    const result = await caller.repertorios.updateNotas({
      id: created.repertorioId,
      notas: "Estas são as novas observações do repertório",
    });

    expect(result.success).toBe(true);

    const repertorio = await caller.repertorios.getById({ id: created.repertorioId });
    expect(repertorio.notas).toBe("Estas são as novas observações do repertório");
  });

  it("deve deletar repertório", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório para Deletar",
      musicas: ["entrada-1"],
    });

    const result = await caller.repertorios.delete({ id: created.repertorioId });
    expect(result.success).toBe(true);

    await expect(caller.repertorios.getById({ id: created.repertorioId })).rejects.toThrow(
      "não encontrado"
    );
  });

  it("não deve permitir editar repertório de outro usuário", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório do Usuário 1",
      musicas: ["entrada-1"],
    });

    expect(created.repertorioId).toBeDefined();

    // Criar outro usuário
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [user2] = await db
      .insert(users)
      .values({
        openId: `test-user2-${Date.now()}`,
        name: "Test User 2",
        email: `test-user2-${Date.now()}@example.com`,
        role: "user",
      })
      .$returningId();

    const caller2 = appRouter.createCaller({
      user: { id: user2.id, openId: `test-user2-${Date.now()}`, role: "user" },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller2.repertorios.updateOrdem({
        id: created.repertorioId,
        ordemMusicas: ["entrada-2"],
      })
    ).rejects.toThrow("não tem permissão");
  });

  it("deve permitir duplicar repertório público de outro usuário", async () => {
    const created = await caller.repertorios.create({
      nome: "Repertório Público Original",
      musicas: ["entrada-1", "salmo-1"],
    });

    expect(created.repertorioId).toBeDefined();

    // Tornar público
    await caller.repertorios.toggleShare({ id: created.repertorioId });

    // Criar outro usuário
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [user2] = await db
      .insert(users)
      .values({
        openId: `test-user2-${Date.now()}`,
        name: "Test User 2",
        email: `test-user2-${Date.now()}@example.com`,
        role: "user",
      })
      .$returningId();

    const caller2 = appRouter.createCaller({
      user: { id: user2.id, openId: `test-user2-${Date.now()}`, role: "user", email: `test-user2-${Date.now()}@example.com`, name: "Test User 2" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller2.repertorios.duplicate({ id: created.repertorioId });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();

    const duplicado = await caller2.repertorios.getById({ id: result.id });
    expect(duplicado.userId).toBe(user2.id);
    expect(duplicado.musicas).toEqual(["entrada-1", "salmo-1"]);
  });
});
