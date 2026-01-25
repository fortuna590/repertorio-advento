import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { repertoriosAdmin } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Sistema de Visibilidade de Repertórios", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testRepertorioId: number;

  beforeAll(async () => {
    db = await getDb();
    
    // Limpar repertório de teste anterior (se existir)
    await db!.delete(repertoriosAdmin).where(eq(repertoriosAdmin.slug, "teste-visibilidade"));
    
    // Criar repertório de teste
    const result = await db!.insert(repertoriosAdmin).values({
      nome: "Teste Visibilidade",
      slug: "teste-visibilidade",
      descricao: "Repertório para testar visibilidade",
      tempoLiturgico: "Teste",
      corPrimaria: "#000000",
      corSecundaria: "#000000",
      corFundo: "#000000",
      corTexto: "#ffffff",
      publicado: 1,
    });
    
    testRepertorioId = Number(result[0].insertId);
  });

  it("deve listar apenas repertórios publicados para público", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.repertorio.list();
    
    expect(Array.isArray(result)).toBe(true);
    // Todos os repertórios retornados devem estar publicados
    result.forEach((rep: any) => {
      expect(rep.publicado).toBe(1);
    });
  });

  it("deve listar todos os repertórios (incluindo ocultos) quando solicitado", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.repertorio.list({ incluirOcultos: true });
    
    expect(Array.isArray(result)).toBe(true);
    // Deve incluir repertórios publicados e não publicados
    expect(result.length).toBeGreaterThan(0);
  });

  it("deve alternar visibilidade de repertório (admin)", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    // Buscar estado inicial
    const inicial = await db!
      .select()
      .from(repertoriosAdmin)
      .where(eq(repertoriosAdmin.id, testRepertorioId));
    
    const estadoInicial = inicial[0].publicado;

    // Alternar visibilidade
    const resultado = await caller.repertorio.toggleVisibilidade({
      id: testRepertorioId,
    });

    expect(resultado.success).toBe(true);
    expect(resultado.publicado).toBe(estadoInicial === 1 ? 0 : 1);

    // Verificar no banco
    const atualizado = await db!
      .select()
      .from(repertoriosAdmin)
      .where(eq(repertoriosAdmin.id, testRepertorioId));
    
    expect(atualizado[0].publicado).toBe(resultado.publicado);

    // Restaurar estado inicial
    await caller.repertorio.toggleVisibilidade({
      id: testRepertorioId,
    });
  });

  it("deve rejeitar toggle de visibilidade por usuário não autenticado", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.repertorio.toggleVisibilidade({
        id: testRepertorioId,
      })
    ).rejects.toThrow();
  });

  it("repertório oculto não deve aparecer na listagem pública", async () => {
    const callerAdmin = appRouter.createCaller({
      user: { id: 1, openId: "test", role: "admin" } as any,
      req: {} as any,
      res: {} as any,
    });

    const callerPublic = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    // Ocultar repertório
    await callerAdmin.repertorio.toggleVisibilidade({
      id: testRepertorioId,
    });

    // Verificar que não aparece na listagem pública
    const publicList = await callerPublic.repertorio.list();
    const encontrado = publicList.find((r: any) => r.id === testRepertorioId);
    expect(encontrado).toBeUndefined();

    // Verificar que aparece na listagem admin
    const adminList = await callerPublic.repertorio.list({ incluirOcultos: true });
    const encontradoAdmin = adminList.find((r: any) => r.id === testRepertorioId);
    expect(encontradoAdmin).toBeDefined();

    // Restaurar visibilidade
    await callerAdmin.repertorio.toggleVisibilidade({
      id: testRepertorioId,
    });
  });
});
