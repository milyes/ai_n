import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertApiKeySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/vpn/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const status = await storage.getVpnStatus(req.user.id);
    res.json(status || { status: "disconnected" });
  });

  app.post("/api/vpn/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { status, bandwidth } = req.body;
    const updated = await storage.updateVpnStatus(req.user.id, status, bandwidth);
    res.json(updated);
  });

  app.get("/api/keys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const keys = await storage.getApiKeys(req.user.id);
    res.json(keys);
  });

  app.post("/api/keys", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertApiKeySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }
    const key = await storage.createApiKey(req.user.id, parsed.data.name);
    res.json(key);
  });

  app.delete("/api/keys/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deactivateApiKey(parseInt(req.params.id));
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}
