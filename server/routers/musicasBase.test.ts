import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";

describe("Router de Músicas Base", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  it("deve listar músicas adicionais de um repertório", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.musicasBase.listar({
      repertorioId: "advento",
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("deve listar músicas adicionais de um momento específico", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.musicasBase.listar({
      repertorioId: "advento",
      momentoId: "entrada",
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("deve rejeitar adição de música por usuário não-admin", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", role: "user" } as any,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.musicasBase.adicionar({
        repertorioId: "advento",
        momentoId: "entrada",
        titulo: "Música Teste",
      })
    ).rejects.toThrow("Apenas administradores podem adicionar músicas");
  });
});
