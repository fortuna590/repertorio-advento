import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { randomUUID } from "crypto";

// Email do superadmin
const SUPERADMIN_EMAIL = "louvamais590@gmail.com";

export function registerLocalAuthRoutes(app: Express) {
  // ─── Registro ────────────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
        return;
      }

      const emailLower = email.toLowerCase().trim();

      // Verificar se e-mail já existe
      const existing = await db.getUserByEmail(emailLower);
      if (existing) {
        res.status(409).json({ error: "Este e-mail já está cadastrado." });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const openId = `local_${randomUUID()}`;

      // Superadmin automático
      const role = emailLower === SUPERADMIN_EMAIL ? "admin" : "user";

      await db.createLocalUser({
        openId,
        name: name.trim(),
        email: emailLower,
        passwordHash,
        loginMethod: "email",
        role: role as "user" | "admin",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByEmail(emailLower);
      if (!user) {
        res.status(500).json({ error: "Erro ao criar usuário." });
        return;
      }

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("[LocalAuth] Register failed", error);
      res.status(500).json({ error: "Erro interno ao registrar." });
    }
  });

  // ─── Login ───────────────────────────────────────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "E-mail e senha são obrigatórios." });
        return;
      }

      const emailLower = email.toLowerCase().trim();
      const user = await db.getUserByEmail(emailLower);

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "E-mail ou senha incorretos." });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        res.status(401).json({ error: "E-mail ou senha incorretos." });
        return;
      }

      if (user.status === "suspended") {
        res.status(403).json({ error: "Sua conta foi suspensa. Entre em contato com o administrador." });
        return;
      }

      // Atualizar lastSignedIn
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("[LocalAuth] Login failed", error);
      res.status(500).json({ error: "Erro interno ao fazer login." });
    }
  });

  // ─── Logout ──────────────────────────────────────────────────────────────────
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });
}
