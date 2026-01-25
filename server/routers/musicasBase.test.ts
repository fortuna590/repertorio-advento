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

  it("deve rejeitar edição de música por usuário não-admin", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", role: "user" } as any,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.musicasBase.editar({
        id: 1,
        titulo: "Música Editada",
      })
    ).rejects.toThrow("Apenas administradores podem editar músicas");
  });

  it("deve rejeitar remoção de música por usuário não-admin", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", role: "user" } as any,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.musicasBase.remover({ id: 1 })
    ).rejects.toThrow("Apenas administradores podem remover músicas");
  });

  it("deve rejeitar reordenação por usuário não-admin", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, openId: "test", role: "user" } as any,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.musicasBase.reordenar({
        musicas: [
          { id: 1, ordem: 2 },
          { id: 2, ordem: 1 },
        ],
      })
    ).rejects.toThrow("Apenas administradores podem reordenar músicas");
  });
});
